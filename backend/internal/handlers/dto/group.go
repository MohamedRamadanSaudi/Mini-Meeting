package dto

import (
	"mini-meeting/internal/models"
	"time"
)

// --- Request types ---

type CreateGroupRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type UpdateGroupRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type UpdateMemberRoleRequest struct {
	Role models.GroupRole `json:"role"`
}

// --- Response types ---

type GroupMemberResponse struct {
	ID       uint             `json:"id"`
	GroupID  uint             `json:"group_id"`
	UserID   uint             `json:"user_id"`
	Role     models.GroupRole `json:"role"`
	JoinedAt time.Time        `json:"joined_at"`
	User     *models.User     `json:"user,omitempty"`
}

type GroupResponse struct {
	ID          uint                  `json:"id"`
	Name        string                `json:"name"`
	Description string                `json:"description"`
	OwnerID     uint                  `json:"owner_id"`
	MeetingID   uint                  `json:"meeting_id"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
	Members     []GroupMemberResponse `json:"members,omitempty"`
}

// --- Converters ---

func ToGroupMemberResponse(m *models.GroupMember) GroupMemberResponse {
	resp := GroupMemberResponse{
		ID:       m.ID,
		GroupID:  m.GroupID,
		UserID:   m.UserID,
		Role:     m.Role,
		JoinedAt: m.JoinedAt,
	}
	if m.User.ID != 0 {
		u := m.User
		resp.User = &u
	}
	return resp
}

func ToGroupResponse(g *models.Group) GroupResponse {
	resp := GroupResponse{
		ID:          g.ID,
		Name:        g.Name,
		Description: g.Description,
		OwnerID:     g.OwnerID,
		MeetingID:   g.MeetingID,
		CreatedAt:   g.CreatedAt,
		UpdatedAt:   g.UpdatedAt,
	}
	if len(g.Members) > 0 {
		resp.Members = make([]GroupMemberResponse, len(g.Members))
		for i, m := range g.Members {
			resp.Members[i] = ToGroupMemberResponse(&m)
		}
	}
	return resp
}
