package handlers

import (
	"mini-meeting/internal/handlers/dto"
	"mini-meeting/internal/services"

	"github.com/gofiber/fiber/v2"
)

type InvitationHandler struct {
	service *services.InvitationService
}

func NewInvitationHandler(service *services.InvitationService) *InvitationHandler {
	return &InvitationHandler{service: service}
}

// SendInvitation creates and emails a new group invitation.
// POST /api/v1/groups/:id/invitations
func (h *InvitationHandler) SendInvitation(c *fiber.Ctx) error {
	callerID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	var req dto.SendInvitationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email is required"})
	}

	inv, err := h.service.SendInvitation(groupID, callerID, req.Email)
	if err != nil {
		return invitationError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Invitation sent successfully",
		"data":    dto.ToInvitationResponse(inv),
	})
}

// ListInvitations returns all invitations for a group (admin/moderator only).
// GET /api/v1/groups/:id/invitations
func (h *InvitationHandler) ListInvitations(c *fiber.Ctx) error {
	callerID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	invitations, err := h.service.ListInvitations(groupID, callerID)
	if err != nil {
		return invitationError(c, err)
	}

	responses := make([]dto.InvitationResponse, len(invitations))
	for i := range invitations {
		responses[i] = dto.ToInvitationResponse(&invitations[i])
	}

	return c.JSON(fiber.Map{"data": responses})
}

// CancelInvitation sets an invitation to expired (admin/moderator only).
// DELETE /api/v1/groups/:id/invitations/:invId
func (h *InvitationHandler) CancelInvitation(c *fiber.Ctx) error {
	callerID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	groupID, err := parseID(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid group ID"})
	}

	invID, err := parseID(c.Params("invId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid invitation ID"})
	}

	if err := h.service.CancelInvitation(groupID, invID, callerID); err != nil {
		return invitationError(c, err)
	}

	return c.JSON(fiber.Map{"message": "Invitation cancelled successfully"})
}

// GetInvitationInfo returns public info about an invitation by token.
// GET /api/v1/invitations/info?token=
func (h *InvitationHandler) GetInvitationInfo(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Token is required"})
	}

	inv, err := h.service.GetInvitationInfo(token)
	if err != nil {
		return invitationError(c, err)
	}

	return c.JSON(fiber.Map{"data": dto.ToInvitationResponse(inv)})
}

// AcceptInvitation adds the authenticated user to the group referenced by the token.
// POST /api/v1/invitations/accept
func (h *InvitationHandler) AcceptInvitation(c *fiber.Ctx) error {
	callerID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	callerEmail, ok := c.Locals("email").(string)
	if !ok || callerEmail == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req dto.AcceptInvitationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Token is required"})
	}

	if err := h.service.AcceptInvitation(req.Token, callerID, callerEmail); err != nil {
		return invitationError(c, err)
	}

	return c.JSON(fiber.Map{"message": "Invitation accepted successfully"})
}

// --- helpers ---

func invitationError(c *fiber.Ctx, err error) error {
	switch err {
	case services.ErrInvitationNotFound:
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	case services.ErrInvitationExpired:
		return c.Status(fiber.StatusGone).JSON(fiber.Map{"error": err.Error()})
	case services.ErrInvitationEmailMatch:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case services.ErrDuplicateInvitation:
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	case services.ErrGroupNotFound:
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	case services.ErrNotGroupMember:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case services.ErrNotGroupAdminOrMod:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case services.ErrAlreadyMember:
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
}
