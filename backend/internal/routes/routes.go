package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(
	app *fiber.App,
	userHandler *handlers.UserHandler,
	authHandler *handlers.AuthHandler,
	meetingHandler *handlers.MeetingHandler,
	livekitHandler *handlers.LiveKitHandler,
	lobbyHandler *handlers.LobbyHandler,
	lobbyWSHandler *handlers.LobbyWSHandler,
	summarizerHandler *handlers.SummarizerHandler,
	groupHandler *handlers.GroupHandler,
	cfg *config.Config,
) {
	api := app.Group("/api/v1")

	setupAuthRoutes(api, authHandler)
	setupUserRoutes(api, userHandler, cfg)
	setupMeetingRoutes(api, meetingHandler, summarizerHandler, cfg)
	setupLiveKitRoutes(api, livekitHandler, cfg)
	setupLobbyRoutes(app, api, lobbyHandler, lobbyWSHandler)
	setupGroupRoutes(api, groupHandler, cfg)
}
