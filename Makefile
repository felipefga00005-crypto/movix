.PHONY: help dev db-up db-down db-logs db-clean backend frontend install test kill kill-backend kill-frontend build build-backend build-frontend clean status

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

kill-backend: ## Kill backend server
	@echo "🛑 Stopping backend server..."
	@-lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	@-pkill -f "go run cmd/server/main.go" 2>/dev/null || true
	@-pkill -f "backend/main" 2>/dev/null || true
	@echo "✅ Backend stopped"

kill-frontend: ## Kill frontend server
	@echo "🛑 Stopping frontend server..."
	@-lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@-pkill -f "next dev" 2>/dev/null || true
	@-pkill -f "node.*next" 2>/dev/null || true
	@echo "✅ Frontend stopped"

kill: kill-backend kill-frontend ## Kill both backend and frontend servers
	@echo "✅ All servers stopped"

build-backend: ## Build backend
	@echo "🔨 Building backend..."
	cd backend && go build -o main cmd/server/main.go
	@echo "✅ Backend built successfully!"

build-frontend: ## Build frontend
	@echo "🔨 Building frontend..."
	cd frontend && npm run build
	@echo "✅ Frontend built successfully!"

build: build-backend build-frontend ## Build both backend and frontend
	@echo "✅ All builds completed!"

clean: ## Clean build artifacts
	@echo "🧹 Cleaning build artifacts..."
	@rm -f backend/main
	@rm -rf frontend/.next
	@rm -rf frontend/out
	@echo "✅ Clean completed!"

status: ## Check status of services
	@echo "📊 Checking services status..."
	@echo ""
	@echo "🐳 Docker Containers:"
	@docker ps --filter "name=movix" --format "  ✅ {{.Names}} ({{.Status}})" 2>/dev/null || echo "  ❌ No containers running"
	@echo ""
	@echo "🔧 Backend (port 8080):"
	@-lsof -i :8080 2>/dev/null | grep LISTEN | head -1 || echo "  ❌ Not running"
	@echo ""
	@echo "⚛️  Frontend (port 3000):"
	@-lsof -i :3000 2>/dev/null | grep LISTEN | head -1 || echo "  ❌ Not running"
	@echo ""
	@echo "🗄️  PostgreSQL (port 5432):"
	@-docker ps --filter "name=movix_postgres" --format "  ✅ {{.Names}} ({{.Status}})" 2>/dev/null || echo "  ❌ Not running"
	@echo ""
	@echo "🔍 DBGate (port 3001):"
	@-docker ps --filter "name=movix_dbgate" --format "  ✅ {{.Names}} ({{.Status}})" 2>/dev/null || echo "  ❌ Not running"

