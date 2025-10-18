package router

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/movix/backend/internal/config"
	"github.com/movix/backend/internal/handlers"
	authMiddleware "github.com/movix/backend/internal/middleware"
)

// SetupRouter configures and returns the main router
func SetupRouter(cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()

	// Global middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Initialize handlers
	setupHandler := handlers.NewSetupHandler(cfg)
	authHandler := handlers.NewAuthHandler(cfg)
	signupHandler := handlers.NewSignupHandler(cfg)
	empresaHandler := handlers.NewEmpresaHandler(cfg)
	moduloHandler := handlers.NewModuloHandler(cfg)
	cnpjHandler := handlers.NewCNPJHandler(cfg)

	// Health check
	r.Get("/health", handlers.HealthCheck)

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Setup routes (always public)
		r.Get("/setup/status", setupHandler.CheckSetup)
		r.Post("/setup", setupHandler.CreateInitialAdmin)

		// Public routes
		setupPublicRoutes(r, authHandler, signupHandler)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.AuthMiddleware(cfg))

			// Auth routes
			setupAuthRoutes(r, authHandler)

			// Super Admin routes
			setupSuperAdminRoutes(r, empresaHandler, moduloHandler, cnpjHandler, signupHandler)

			// Admin routes (to be implemented)
			// setupAdminRoutes(r, ...)

			// User routes (to be implemented)
			// setupUserRoutes(r, ...)
		})
	})

	return r
}

// setupPublicRoutes configures public routes (no authentication required)
func setupPublicRoutes(r chi.Router, authHandler *handlers.AuthHandler, signupHandler *handlers.SignupHandler) {
	r.Post("/auth/login", authHandler.Login)

	// Signup and password reset
	r.Get("/auth/invites/{token}", signupHandler.GetInvite)
	r.Post("/auth/invites/accept", signupHandler.AcceptInvite)
	r.Post("/auth/password-reset/request", signupHandler.RequestPasswordReset)
	r.Post("/auth/password-reset/confirm", signupHandler.ResetPassword)
}

// setupAuthRoutes configures authenticated user routes
func setupAuthRoutes(r chi.Router, authHandler *handlers.AuthHandler) {
	r.Get("/auth/me", authHandler.Me)
	r.Post("/auth/logout", authHandler.Logout)
	r.Post("/auth/refresh", authHandler.RefreshToken)
}

// setupSuperAdminRoutes configures Super Admin routes
func setupSuperAdminRoutes(
	r chi.Router,
	empresaHandler *handlers.EmpresaHandler,
	moduloHandler *handlers.ModuloHandler,
	cnpjHandler *handlers.CNPJHandler,
	signupHandler *handlers.SignupHandler,
) {
	r.Route("/admin", func(r chi.Router) {
		// User invites
		r.Post("/invites", signupHandler.CreateInvite)
		// Empresas
		r.Route("/empresas", func(r chi.Router) {
			r.Get("/", empresaHandler.ListEmpresas)
			r.Post("/", empresaHandler.CreateEmpresa)

			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", empresaHandler.GetEmpresa)
				r.Put("/", empresaHandler.UpdateEmpresa)
				r.Delete("/", empresaHandler.DeleteEmpresa)

				// Empresa Módulos
				r.Get("/modulos", empresaHandler.GetEmpresaModulos)
				r.Post("/modulos", empresaHandler.ActivateModulo)
				r.Delete("/modulos/{modulo_id}", empresaHandler.DeactivateModulo)

				// Empresa CNPJs
				r.Get("/cnpjs", cnpjHandler.GetEmpresaCNPJs)
				r.Post("/cnpjs", cnpjHandler.CreateCNPJ)
			})
		})

		// Módulos
		r.Route("/modulos", func(r chi.Router) {
			r.Get("/", moduloHandler.ListModulos)
			r.Post("/", moduloHandler.CreateModulo)
		})

		// CNPJs
		r.Route("/cnpjs/{id}", func(r chi.Router) {
			r.Put("/", cnpjHandler.UpdateCNPJ)
			r.Delete("/", cnpjHandler.DeleteCNPJ)
		})
	})
}

// setupAdminRoutes configures Admin routes (to be implemented)
func setupAdminRoutes(r chi.Router) {
	r.Route("/empresa", func(r chi.Router) {
		// Usuarios
		// r.Get("/usuarios", usuarioHandler.ListUsuarios)
		// r.Post("/usuarios", usuarioHandler.CreateUsuario)
		// etc...
	})
}

// setupUserRoutes configures User routes (to be implemented)
func setupUserRoutes(r chi.Router) {
	r.Route("/user", func(r chi.Router) {
		// r.Get("/modulos", userHandler.GetModulos)
		// r.Get("/cnpjs", userHandler.GetCNPJs)
		// etc...
	})
}

