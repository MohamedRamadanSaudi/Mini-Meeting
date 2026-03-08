package services

import (
	"errors"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"time"

	"gorm.io/gorm"
)

var (
	ErrGroupNotFound        = errors.New("group not found")
	ErrNotGroupMember       = errors.New("you are not a member of this group")
	ErrNotGroupAdmin        = errors.New("only group admins can perform this action")
	ErrNotGroupOwner        = errors.New("only the group owner can perform this action")
	ErrCannotRemoveOwner    = errors.New("the group owner cannot be removed")
	ErrCannotDowngradeOwner = errors.New("the group owner's role cannot be changed")
	ErrInvalidRole          = errors.New("invalid role: must be admin, moderator, or member")
	ErrInsufficientPerms    = errors.New("insufficient permissions to remove this member")
	ErrAlreadyMember        = errors.New("user is already a member of this group")
	ErrMemberNotFound       = errors.New("member not found in this group")
)

type GroupService struct {
	repo           *repositories.GroupRepository
	meetingService *MeetingService
}

func NewGroupService(repo *repositories.GroupRepository, meetingService *MeetingService) *GroupService {
	return &GroupService{
		repo:           repo,
		meetingService: meetingService,
	}
}

func isValidRole(role models.GroupRole) bool {
	return role == models.GroupRoleAdmin ||
		role == models.GroupRoleModerator ||
		role == models.GroupRoleMember
}

// CreateGroup creates a new group with an auto-created meeting and adds the owner as admin.
func (s *GroupService) CreateGroup(ownerID uint, name, description string) (*models.Group, error) {
	meeting, err := s.meetingService.CreateMeeting(ownerID)
	if err != nil {
		return nil, err
	}

	group := &models.Group{
		Name:        name,
		Description: description,
		OwnerID:     ownerID,
		MeetingID:   meeting.ID,
	}

	if err := s.repo.CreateGroup(group); err != nil {
		return nil, err
	}

	member := &models.GroupMember{
		GroupID:  group.ID,
		UserID:   ownerID,
		Role:     models.GroupRoleAdmin,
		JoinedAt: time.Now(),
	}
	if err := s.repo.AddMember(member); err != nil {
		return nil, err
	}

	return s.repo.FindGroupByID(group.ID)
}

// GetGroup returns a group by ID after verifying the requester is a member.
func (s *GroupService) GetGroup(groupID, requesterID uint) (*models.Group, error) {
	group, err := s.repo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	isMember, err := s.repo.IsMember(groupID, requesterID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, ErrNotGroupMember
	}

	return group, nil
}

// UpdateGroup updates group name/description; only admins may do so.
func (s *GroupService) UpdateGroup(groupID, requesterID uint, name, description string) (*models.Group, error) {
	group, err := s.repo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	member, err := s.repo.FindMember(groupID, requesterID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotGroupMember
		}
		return nil, err
	}
	if member.Role != models.GroupRoleAdmin {
		return nil, ErrNotGroupAdmin
	}

	if name != "" {
		group.Name = name
	}
	if description != "" {
		group.Description = description
	}

	if err := s.repo.UpdateGroup(group); err != nil {
		return nil, err
	}

	return s.repo.FindGroupByID(group.ID)
}

// DeleteGroup deletes a group; only the owner may do so.
func (s *GroupService) DeleteGroup(groupID, requesterID uint) error {
	group, err := s.repo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGroupNotFound
		}
		return err
	}

	if group.OwnerID != requesterID {
		return ErrNotGroupOwner
	}

	return s.repo.DeleteGroup(groupID)
}

// ListMyGroups lists all groups where the user is a member.
func (s *GroupService) ListMyGroups(userID uint) ([]models.Group, error) {
	return s.repo.FindGroupsByUserID(userID)
}

// GetMembers returns all members of a group; requester must be a member.
func (s *GroupService) GetMembers(groupID, requesterID uint) ([]models.GroupMember, error) {
	isMember, err := s.repo.IsMember(groupID, requesterID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, ErrNotGroupMember
	}

	return s.repo.FindAllMembers(groupID)
}

// UpdateMemberRole changes a member's role; owner's role cannot be changed; only admins may update.
func (s *GroupService) UpdateMemberRole(groupID, requesterID, targetUserID uint, newRole models.GroupRole) (*models.GroupMember, error) {
	if !isValidRole(newRole) {
		return nil, ErrInvalidRole
	}

	group, err := s.repo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGroupNotFound
		}
		return nil, err
	}

	// Requester must be admin
	requester, err := s.repo.FindMember(groupID, requesterID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotGroupMember
		}
		return nil, err
	}
	if requester.Role != models.GroupRoleAdmin {
		return nil, ErrNotGroupAdmin
	}

	// Owner's role cannot be changed
	if group.OwnerID == targetUserID {
		return nil, ErrCannotDowngradeOwner
	}

	target, err := s.repo.FindMember(groupID, targetUserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMemberNotFound
		}
		return nil, err
	}

	target.Role = newRole
	if err := s.repo.UpdateMemberRole(target); err != nil {
		return nil, err
	}

	return s.repo.FindMember(groupID, targetUserID)
}

// RemoveMember removes a user from the group.
// Rules: owner cannot be removed; moderators can only remove members; admins can remove anyone except the owner.
func (s *GroupService) RemoveMember(groupID, requesterID, targetUserID uint) error {
	group, err := s.repo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGroupNotFound
		}
		return err
	}

	if group.OwnerID == targetUserID {
		return ErrCannotRemoveOwner
	}

	requester, err := s.repo.FindMember(groupID, requesterID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrNotGroupMember
		}
		return err
	}

	target, err := s.repo.FindMember(groupID, targetUserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrMemberNotFound
		}
		return err
	}

	// Moderators may only remove plain members
	if requester.Role == models.GroupRoleModerator && target.Role != models.GroupRoleMember {
		return ErrInsufficientPerms
	}

	// Plain members cannot remove anyone
	if requester.Role == models.GroupRoleMember {
		return ErrInsufficientPerms
	}

	return s.repo.RemoveMember(groupID, targetUserID)
}

// LeaveGroup removes the requester from the group; the owner cannot leave (must delete instead).
func (s *GroupService) LeaveGroup(groupID, requesterID uint) error {
	group, err := s.repo.FindGroupByID(groupID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGroupNotFound
		}
		return err
	}

	if group.OwnerID == requesterID {
		return errors.New("owner cannot leave the group; delete it instead")
	}

	isMember, err := s.repo.IsMember(groupID, requesterID)
	if err != nil {
		return err
	}
	if !isMember {
		return ErrNotGroupMember
	}

	return s.repo.RemoveMember(groupID, requesterID)
}
