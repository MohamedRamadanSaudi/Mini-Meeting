package models

import "time"

type InvitationStatus string

const (
	InvitationStatusPending  InvitationStatus = "pending"
	InvitationStatusAccepted InvitationStatus = "accepted"
	InvitationStatusExpired  InvitationStatus = "expired"
)

type GroupInvitation struct {
	ID         uint             `gorm:"primaryKey" json:"id"`
	GroupID    uint             `gorm:"not null;index" json:"group_id"`
	InvitedBy  uint             `gorm:"not null" json:"invited_by"`
	Email      string           `gorm:"not null;size:255" json:"email"`
	Token      string           `gorm:"unique;not null;size:64" json:"-"`
	Status     InvitationStatus `gorm:"not null;default:'pending'" json:"status"`
	ExpiresAt  time.Time        `json:"expires_at"`
	AcceptedAt *time.Time       `json:"accepted_at,omitempty"`
	CreatedAt  time.Time        `json:"created_at"`

	// Relations
	Group   Group `gorm:"foreignKey:GroupID" json:"group,omitempty"`
	Inviter User  `gorm:"foreignKey:InvitedBy" json:"inviter,omitempty"`
}
