.PHONY: help dev db-up db-down db-logs db-clean backend frontend install test kill kill-backend kill-frontend build build-backend build-frontend clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start full development environment (DB + Backend + Frontend)
	@echo "Starting development environment..."
	@make db-up
	@echo "\nWaiting for database to be ready..."
	@sleep 5
	@echo "\nStarting backend and frontend..."
	@echo "Run 'make backend' in one terminal and 'make frontend' in another"

db-up: ## Start database services (PostgreSQL + DBGate)
	cd backend && docker-compose up -d
	@echo "\n✓ Database services started"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - DBGate: http://localhost:3001"

db-down: ## Stop database services
	cd backend && docker-compose down

db-logs: ## Show database logs
	cd backend && docker-compose logs -f

db-clean: ## Stop services and remove volumes
	cd backend && docker-compose down -v
	@echo "✓ Database volumes removed"

backend: ## Run backend in development mode
	cd backend && go run cmd/server/main.go

frontend: ## Run frontend in development mode
	cd frontend && npm run dev

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd backend && go mod download
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ All dependencies installed"

test: ## Run all tests
	@echo "Running backend tests..."
	cd backend && go test ./...
	@echo "✓ Tests completed"

