package database

import (
	"fmt"
	"log"

	"mini-meeting/internal/config"
	"mini-meeting/internal/models"

	"github.com/golang-migrate/migrate/v4"
	migratepostgres "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(cfg *config.DatabaseConfig) error {
	dsn := cfg.DSN()

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

func Migrate() error {
	log.Println("Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.Meeting{},
		&models.Group{},
		&models.GroupMember{},
	)

	if err != nil {
		return fmt.Errorf("failed to create base tables: %w", err)
	}

	// Then run SQL migrations
	if err := runSQLMigrations(); err != nil {
		log.Printf("Warning: SQL migrations failed: %v", err)
	}

	log.Println("Database migrations completed")
	return nil
}

// Apply migration files from the migrations folder
func runSQLMigrations() error {
	// Get the underlying sql.DB from GORM
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	// Create postgres driver instance
	driver, err := migratepostgres.WithInstance(sqlDB, &migratepostgres.Config{})
	if err != nil {
		return fmt.Errorf("failed to create migration driver: %w", err)
	}

	// Create migrate instance
	// Use file:// protocol with absolute path or relative path from where the app runs
	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres", driver)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}

	// Run migrations
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("SQL migrations applied successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
