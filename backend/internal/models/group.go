package models

import "time"

type GroupRole string

const (
	GroupRoleAdmin     GroupRole = "admin"
	GroupRoleModerator GroupRole = "moderator"
	GroupRoleMember    GroupRole = "member"
)

type Group struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null;size:100" json:"name"`
	Description string    `gorm:"size:500" json:"description"`
	OwnerID     uint      `gorm:"not null" json:"owner_id"`
	MeetingID   uint      `gorm:"not null" json:"meeting_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Owner   User          `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Meeting Meeting       `gorm:"foreignKey:MeetingID" json:"meeting,omitempty"`
	Members []GroupMember `gorm:"foreignKey:GroupID" json:"members,omitempty"`
}

type GroupMember struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	GroupID  uint      `gorm:"not null;index" json:"group_id"`
	UserID   uint      `gorm:"not null;index" json:"user_id"`
	Role     GroupRole `gorm:"not null;default:'member'" json:"role"`
	JoinedAt time.Time `json:"joined_at"`

	// Relations
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
