package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func setupGroupRoutes(api fiber.Router, groupHandler *handlers.GroupHandler, cfg *config.Config) {
	groups := api.Group("/groups", middleware.AuthMiddleware(cfg))

	groups.Post("/", groupHandler.CreateGroup)
	groups.Get("/", groupHandler.ListMyGroups)
	groups.Get("/:id", groupHandler.GetGroup)
	groups.Patch("/:id", groupHandler.UpdateGroup)
	groups.Delete("/:id", groupHandler.DeleteGroup)

	groups.Get("/:id/members", groupHandler.GetMembers)
	groups.Patch("/:id/members/:userId", groupHandler.UpdateMemberRole)
	groups.Delete("/:id/members/:userId", groupHandler.RemoveMember)
	groups.Delete("/:id/leave", groupHandler.LeaveGroup)
}
