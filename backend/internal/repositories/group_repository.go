package repositories

import (
	"mini-meeting/internal/models"

	"gorm.io/gorm"
)

type GroupRepository struct {
	db *gorm.DB
}

func NewGroupRepository(db *gorm.DB) *GroupRepository {
	return &GroupRepository{db: db}
}

func (r *GroupRepository) CreateGroup(group *models.Group) error {
	return r.db.Create(group).Error
}

func (r *GroupRepository) FindGroupByID(id uint) (*models.Group, error) {
	var group models.Group
	err := r.db.
		Preload("Owner").
		Preload("Meeting").
		Preload("Members").
		Preload("Members.User").
		First(&group, id).Error
	if err != nil {
		return nil, err
	}
	return &group, nil
}

func (r *GroupRepository) FindGroupsByUserID(userID uint) ([]models.Group, error) {
	var groups []models.Group
	err := r.db.
		Joins("JOIN group_members ON group_members.group_id = groups.id").
		Where("group_members.user_id = ?", userID).
		Preload("Owner").
		Preload("Meeting").
		Order("groups.created_at DESC").
		Find(&groups).Error
	return groups, err
}

func (r *GroupRepository) UpdateGroup(group *models.Group) error {
	return r.db.Save(group).Error
}

func (r *GroupRepository) DeleteGroup(id uint) error {
	return r.db.Delete(&models.Group{}, id).Error
}

func (r *GroupRepository) AddMember(member *models.GroupMember) error {
	return r.db.Create(member).Error
}

func (r *GroupRepository) FindMember(groupID, userID uint) (*models.GroupMember, error) {
	var member models.GroupMember
	err := r.db.
		Preload("User").
		Where("group_id = ? AND user_id = ?", groupID, userID).
		First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *GroupRepository) UpdateMemberRole(member *models.GroupMember) error {
	return r.db.Save(member).Error
}

func (r *GroupRepository) RemoveMember(groupID, userID uint) error {
	return r.db.Where("group_id = ? AND user_id = ?", groupID, userID).
		Delete(&models.GroupMember{}).Error
}

func (r *GroupRepository) FindAllMembers(groupID uint) ([]models.GroupMember, error) {
	var members []models.GroupMember
	err := r.db.
		Preload("User").
		Where("group_id = ?", groupID).
		Find(&members).Error
	return members, err
}

func (r *GroupRepository) IsMember(groupID, userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.GroupMember{}).
		Where("group_id = ? AND user_id = ?", groupID, userID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
