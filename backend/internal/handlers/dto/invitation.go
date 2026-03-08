package dto

import (
	"mini-meeting/internal/models"
	"time"
)

// --- Request types ---

type SendInvitationRequest struct {
	Email string `json:"email"`
}

type AcceptInvitationRequest struct {
	Token string `json:"token"`
}

// --- Response types ---

type InvitationResponse struct {
	ID        uint                    `json:"id"`
	GroupID   uint                    `json:"group_id"`
	InvitedBy uint                    `json:"invited_by"`
	Email     string                  `json:"email"`
	Status    models.InvitationStatus `json:"status"`
	ExpiresAt time.Time               `json:"expires_at"`
	CreatedAt time.Time               `json:"created_at"`
	Group     *GroupResponse          `json:"group,omitempty"`
	Inviter   *models.User            `json:"inviter,omitempty"`
}

// --- Converters ---

func ToInvitationResponse(inv *models.GroupInvitation) InvitationResponse {
	resp := InvitationResponse{
		ID:        inv.ID,
		GroupID:   inv.GroupID,
		InvitedBy: inv.InvitedBy,
		Email:     inv.Email,
		Status:    inv.Status,
		ExpiresAt: inv.ExpiresAt,
		CreatedAt: inv.CreatedAt,
	}
	if inv.Group.ID != 0 {
		g := ToGroupResponse(&inv.Group)
		resp.Group = &g
	}
	if inv.Inviter.ID != 0 {
		u := inv.Inviter
		resp.Inviter = &u
	}
	return resp
}
