package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/database"
	"github.com/movix/backend/internal/database/seeds"
	"github.com/movix/backend/internal/router"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run seeds
	if err := seeds.SeedAll(database.GetDB()); err != nil {
		log.Printf("⚠️  Warning: Failed to run seeds: %v", err)
	}

	// Set Gin mode
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Setup router
	r := router.SetupRouter(database.GetDB(), cfg)

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	log.Printf("🚀 Server starting on %s", addr)
	log.Printf("📝 Environment: %s", cfg.Server.Env)
	log.Printf("🗄️  Database: %s@%s:%s/%s", cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
	log.Printf("🔐 JWT Secret: %s...", cfg.JWT.Secret[:10])
	log.Printf("⏰ JWT Expiration: %v", cfg.JWT.Expiration)

	// Graceful shutdown
	go func() {
		if err := r.Run(addr); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")
	log.Println("✅ Server stopped gracefully")
}

