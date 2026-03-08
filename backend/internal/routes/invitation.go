package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func setupInvitationRoutes(api fiber.Router, invitationHandler *handlers.InvitationHandler, cfg *config.Config) {
	// Group-scoped invitation routes (admin/moderator only)
	groups := api.Group("/groups", middleware.AuthMiddleware(cfg))
	groups.Post("/:id/invitations", invitationHandler.SendInvitation)
	groups.Get("/:id/invitations", invitationHandler.ListInvitations)
	groups.Delete("/:id/invitations/:invId", invitationHandler.CancelInvitation)

	// Top-level invitation routes
	invitations := api.Group("/invitations")
	invitations.Get("/info", invitationHandler.GetInvitationInfo)
	invitations.Post("/accept", middleware.AuthMiddleware(cfg), invitationHandler.AcceptInvitation)
}
