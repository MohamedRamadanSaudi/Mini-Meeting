package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"time"

	"gorm.io/gorm"
)

var (
	ErrInvitationNotFound   = errors.New("invitation not found")
	ErrInvitationExpired    = errors.New("invitation has expired")
	ErrInvitationEmailMatch = errors.New("this invitation was sent to a different email address")
	ErrDuplicateInvitation  = errors.New("a pending invitation already exists for this email in the group")
	ErrNotGroupAdminOrMod   = errors.New("only group admins or moderators can perform this action")
)

type InvitationService struct {
	repo         *repositories.InvitationRepository
	groupRepo    *repositories.GroupRepository
	userService  *UserService
	emailService *EmailService
	frontendURL  string
}

func NewInvitationService(
	repo *repositories.InvitationRepository,
	groupRepo *repositories.GroupRepository,
	userService *UserService,
	emailService *EmailService,
	frontendURL string,
) *InvitationService {
	return &InvitationService{
		repo:         repo,
		groupRepo:    groupRepo,
		userService:  userService,
		emailService: emailService,
		frontendURL:  frontendURL,
	}
}

func isAdminOrModerator(role models.GroupRole) bool {
	return role == models.GroupRoleAdmin || role == models.GroupRoleModerator
}

// SendInvitation validates the caller's role, checks for duplicates, generates a token, and sends an email.
func (s *InvitationService) SendInvitation(groupID, callerID uint, toEmail string) (*models.GroupInvitation, error) {
	group, err := s.groupRepo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	caller, err := s.groupRepo.FindMember(groupID, callerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotGroupMember
		}
		return nil, err
	}
	if !isAdminOrModerator(caller.Role) {
		return nil, ErrNotGroupAdminOrMod
	}

	_, err = s.repo.FindPendingByGroupAndEmail(groupID, toEmail)
	if err == nil {
		return nil, ErrDuplicateInvitation
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, fmt.Errorf("failed to generate invitation token: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)

	inv := &models.GroupInvitation{
		GroupID:   groupID,
		InvitedBy: callerID,
		Email:     toEmail,
		Token:     token,
		Status:    models.InvitationStatusPending,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	if err := s.repo.CreateInvitation(inv); err != nil {
		return nil, err
	}

	inviter, err := s.userService.GetUserByID(callerID)
	if err != nil {
		inviter = &models.User{Name: "A team member"}
	}

	invitationURL := fmt.Sprintf("%s/groups/invite?token=%s", s.frontendURL, token)
	go s.emailService.SendGroupInvitationEmail(toEmail, inviter.Name, group.Name, invitationURL)

	return inv, nil
}

// AcceptInvitation validates the token, checks expiry, enforces email match, and adds the user to the group.
func (s *InvitationService) AcceptInvitation(token string, callerID uint, callerEmail string) error {
	inv, err := s.repo.FindByToken(token)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrInvitationNotFound
		}
		return err
	}

	if inv.Status == models.InvitationStatusExpired || time.Now().After(inv.ExpiresAt) {
		if inv.Status != models.InvitationStatusExpired {
			inv.Status = models.InvitationStatusExpired
			_ = s.repo.UpdateStatus(inv)
		}
		return ErrInvitationExpired
	}

	if inv.Status != models.InvitationStatusPending {
		return ErrInvitationNotFound
	}

	if inv.Email != callerEmail {
		return ErrInvitationEmailMatch
	}

	isMember, err := s.groupRepo.IsMember(inv.GroupID, callerID)
	if err != nil {
		return err
	}
	if isMember {
		return ErrAlreadyMember
	}

	member := &models.GroupMember{
		GroupID:  inv.GroupID,
		UserID:   callerID,
		Role:     models.GroupRoleMember,
		JoinedAt: time.Now(),
	}
	if err := s.groupRepo.AddMember(member); err != nil {
		return err
	}

	now := time.Now()
	inv.Status = models.InvitationStatusAccepted
	inv.AcceptedAt = &now
	return s.repo.UpdateStatus(inv)
}

// ListInvitations returns all invitations for a group (admins and moderators only).
func (s *InvitationService) ListInvitations(groupID, callerID uint) ([]models.GroupInvitation, error) {
	_, err := s.groupRepo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	caller, err := s.groupRepo.FindMember(groupID, callerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotGroupMember
		}
		return nil, err
	}
	if !isAdminOrModerator(caller.Role) {
		return nil, ErrNotGroupAdminOrMod
	}

	return s.repo.FindByGroupID(groupID)
}

// CancelInvitation sets an invitation's status to expired (admins and moderators only).
func (s *InvitationService) CancelInvitation(groupID, invitationID, callerID uint) error {
	caller, err := s.groupRepo.FindMember(groupID, callerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrNotGroupMember
		}
		return err
	}
	if !isAdminOrModerator(caller.Role) {
		return ErrNotGroupAdminOrMod
	}

	invitations, err := s.repo.FindByGroupID(groupID)
	if err != nil {
		return err
	}

	var target *models.GroupInvitation
	for i := range invitations {
		if invitations[i].ID == invitationID {
			target = &invitations[i]
			break
		}
	}
	if target == nil {
		return ErrInvitationNotFound
	}

	target.Status = models.InvitationStatusExpired
	return s.repo.UpdateStatus(target)
}

// GetInvitationInfo returns public invitation info for the accept page (no auth required).
func (s *InvitationService) GetInvitationInfo(token string) (*models.GroupInvitation, error) {
	inv, err := s.repo.FindByToken(token)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvitationNotFound
		}
		return nil, err
	}

	if inv.Status == models.InvitationStatusExpired || time.Now().After(inv.ExpiresAt) {
		return nil, ErrInvitationExpired
	}

	if inv.Status != models.InvitationStatusPending {
		return nil, ErrInvitationNotFound
	}

	return inv, nil
}
