package repositories

import (
	"mini-meeting/internal/models"

	"gorm.io/gorm"
)

type InvitationRepository struct {
	db *gorm.DB
}

func NewInvitationRepository(db *gorm.DB) *InvitationRepository {
	return &InvitationRepository{db: db}
}

func (r *InvitationRepository) CreateInvitation(inv *models.GroupInvitation) error {
	return r.db.Create(inv).Error
}

func (r *InvitationRepository) FindByToken(token string) (*models.GroupInvitation, error) {
	var inv models.GroupInvitation
	err := r.db.
		Preload("Group").
		Preload("Inviter").
		Where("token = ?", token).
		First(&inv).Error
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *InvitationRepository) FindPendingByGroupAndEmail(groupID uint, email string) (*models.GroupInvitation, error) {
	var inv models.GroupInvitation
	err := r.db.
		Where("group_id = ? AND email = ? AND status = ?", groupID, email, models.InvitationStatusPending).
		First(&inv).Error
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *InvitationRepository) UpdateStatus(inv *models.GroupInvitation) error {
	return r.db.Save(inv).Error
}

func (r *InvitationRepository) FindByGroupID(groupID uint) ([]models.GroupInvitation, error) {
	var invitations []models.GroupInvitation
	err := r.db.
		Preload("Inviter").
		Where("group_id = ?", groupID).
		Order("created_at DESC").
		Find(&invitations).Error
	return invitations, err
}
