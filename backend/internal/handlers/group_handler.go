package handlers

import (
	"mini-meeting/internal/handlers/dto"
	"mini-meeting/internal/models"
	"mini-meeting/internal/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type GroupHandler struct {
	service *services.GroupService
}

func NewGroupHandler(service *services.GroupService) *GroupHandler {
	return &GroupHandler{service: service}
}

// CreateGroup creates a new group.
// POST /api/v1/groups
func (h *GroupHandler) CreateGroup(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req dto.CreateGroupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name is required"})
	}

	group, err := h.service.CreateGroup(userID, req.Name, req.Description)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	group.Members = nil
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Group created successfully",
		"data":    dto.ToGroupResponse(group),
	})
}

// ListMyGroups lists all groups the authenticated user belongs to.
// GET /api/v1/groups
func (h *GroupHandler) ListMyGroups(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groups, err := h.service.ListMyGroups(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]dto.GroupResponse, len(groups))
	for i, g := range groups {
		responses[i] = dto.ToGroupResponse(&g)
	}

	return c.JSON(fiber.Map{"data": responses})
}

// GetGroup retrieves a group by ID (requester must be a member).
// GET /api/v1/groups/:id
func (h *GroupHandler) GetGroup(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	group, err := h.service.GetGroup(groupID, userID)
	if err != nil {
		return groupError(c, err)
	}

	group.Members = nil
	return c.JSON(fiber.Map{"data": dto.ToGroupResponse(group)})
}

// UpdateGroup updates a group's details (admin only).
// PATCH /api/v1/groups/:id
func (h *GroupHandler) UpdateGroup(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	var req dto.UpdateGroupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	group, err := h.service.UpdateGroup(groupID, userID, req.Name, req.Description)
	if err != nil {
		return groupError(c, err)
	}

	group.Members = nil
	return c.JSON(fiber.Map{
		"message": "Group updated successfully",
		"data":    dto.ToGroupResponse(group),
	})
}

// DeleteGroup deletes a group (owner only).
// DELETE /api/v1/groups/:id
func (h *GroupHandler) DeleteGroup(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	if err := h.service.DeleteGroup(groupID, userID); err != nil {
		return groupError(c, err)
	}

	return c.JSON(fiber.Map{"message": "Group deleted successfully"})
}

// GetMembers returns all members of a group (requester must be a member).
// GET /api/v1/groups/:id/members
func (h *GroupHandler) GetMembers(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	members, err := h.service.GetMembers(groupID, userID)
	if err != nil {
		return groupError(c, err)
	}

	responses := make([]dto.GroupMemberResponse, len(members))
	for i, m := range members {
		responses[i] = dto.ToGroupMemberResponse(&m)
	}

	return c.JSON(fiber.Map{"data": responses})
}

// UpdateMemberRole changes a member's role (admin only).
// PATCH /api/v1/groups/:id/members/:userId
func (h *GroupHandler) UpdateMemberRole(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	targetUserID, err := parseID(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var req dto.UpdateMemberRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Role == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Role is required"})
	}

	member, err := h.service.UpdateMemberRole(groupID, userID, targetUserID, models.GroupRole(req.Role))
	if err != nil {
		return groupError(c, err)
	}

	return c.JSON(fiber.Map{
		"message": "Member role updated successfully",
		"data":    dto.ToGroupMemberResponse(member),
	})
}

// RemoveMember removes a member from the group (admin or moderator).
// DELETE /api/v1/groups/:id/members/:userId
func (h *GroupHandler) RemoveMember(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	targetUserID, err := parseID(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	if err := h.service.RemoveMember(groupID, userID, targetUserID); err != nil {
		return groupError(c, err)
	}

	return c.JSON(fiber.Map{"message": "Member removed successfully"})
}

// LeaveGroup lets the authenticated user leave a group.
// DELETE /api/v1/groups/:id/leave
func (h *GroupHandler) LeaveGroup(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	if err := h.service.LeaveGroup(groupID, userID); err != nil {
		return groupError(c, err)
	}

	return c.JSON(fiber.Map{"message": "Left group successfully"})
}

// --- helpers ---

func parseID(s string) (uint, error) {
	id, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

func groupError(c *fiber.Ctx, err error) error {
	switch err {
	case services.ErrGroupNotFound, services.ErrMemberNotFound:
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	case services.ErrNotGroupMember:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case services.ErrNotGroupAdmin, services.ErrNotGroupOwner, services.ErrInsufficientPerms:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case services.ErrCannotRemoveOwner, services.ErrCannotDowngradeOwner:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case services.ErrInvalidRole, services.ErrAlreadyMember:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
}
