package main

import (
	"log"
	"net/http"

	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/router"
	"github.com/movix/backend/internal/seed"
)

func main() {
	// Load configuration
	cfg := config.Load()
	log.Printf("Starting Movix Server on port %s", cfg.Port)
	log.Printf("Environment: %s", cfg.Environment)

	// Connect to database
	log.Println("Connecting to database...")
	if err := database.Connect(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("✓ Database connected successfully")

	// Run migrations
	log.Println("Running database migrations...")
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Println("✓ Database migrations completed")

	// Run seed (only in development)
	if cfg.Environment == "development" {
		log.Println("Running database seed (development mode)...")
		if err := seed.Run(); err != nil {
			log.Printf("Warning: Seed failed: %v", err)
		} else {
			log.Println("✓ Database seed completed")
		}
	}

	// Setup router
	log.Println("Setting up routes...")
	r := router.SetupRouter(cfg)
	log.Println("✓ Routes configured")

	// Start server
	log.Printf("\n🚀 Server is running!")
	log.Printf("   - API: http://localhost:%s", cfg.Port)
	log.Printf("   - Health: http://localhost:%s/health", cfg.Port)
	log.Printf("\n📚 API Documentation:")
	log.Printf("   - POST   /api/v1/auth/login")
	log.Printf("   - GET    /api/v1/auth/me")
	log.Printf("   - GET    /api/v1/admin/empresas")
	log.Printf("   - POST   /api/v1/admin/empresas")
	log.Printf("   - And more...\n")

	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

