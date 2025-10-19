.PHONY: help run build test clean docker-up docker-down migrate-up migrate-down migrate-create migrate-force

# Variables
APP_NAME=movix-api
MAIN_PATH=./cmd/api
BINARY_PATH=./bin/$(APP_NAME)
MIGRATE=migrate
MIGRATIONS_PATH=./internal/database/migrations
DB_URL=postgresql://movix:movix123@localhost:5432/movix_db?sslmode=disable

# Colors for output
GREEN=\033[0;32m
YELLOW=\033[0;33m
RED=\033[0;31m
NC=\033[0m # No Color

## help: Show this help message
help:
	@echo '$(GREEN)Usage:$(NC)'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

## run: Run the application
run:
	@echo "$(GREEN)Running application...$(NC)"
	@go run $(MAIN_PATH)/main.go

## build: Build the application
build:
	@echo "$(GREEN)Building application...$(NC)"
	@mkdir -p ./bin
	@go build -o $(BINARY_PATH) $(MAIN_PATH)/main.go
	@echo "$(GREEN)✅ Build complete: $(BINARY_PATH)$(NC)"

## test: Run tests
test:
	@echo "$(GREEN)Running tests...$(NC)"
	@go test -v -cover ./...

## test-coverage: Run tests with coverage report
test-coverage:
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)✅ Coverage report generated: coverage.html$(NC)"

## clean: Clean build artifacts
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	@rm -rf ./bin
	@rm -f coverage.out coverage.html
	@echo "$(GREEN)✅ Clean complete$(NC)"

## docker-up: Start Docker containers
docker-up:
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Docker containers started$(NC)"

## docker-down: Stop Docker containers
docker-down:
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Docker containers stopped$(NC)"

## docker-logs: Show Docker logs
docker-logs:
	@docker-compose logs -f

## docker-restart: Restart Docker containers
docker-restart: docker-down docker-up

## migrate-install: Install golang-migrate tool
migrate-install:
	@echo "$(GREEN)Installing golang-migrate...$(NC)"
	@go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "$(GREEN)✅ golang-migrate installed$(NC)"

## migrate-create: Create a new migration (usage: make migrate-create name=create_users_table)
migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "$(RED)Error: name is required. Usage: make migrate-create name=create_users_table$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Creating migration: $(name)$(NC)"
	@$(MIGRATE) create -ext sql -dir $(MIGRATIONS_PATH) -seq $(name)
	@echo "$(GREEN)✅ Migration created$(NC)"

## migrate-up: Run all pending migrations
migrate-up:
	@echo "$(GREEN)Running migrations...$(NC)"
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_URL)" up
	@echo "$(GREEN)✅ Migrations complete$(NC)"

## migrate-down: Rollback last migration
migrate-down:
	@echo "$(YELLOW)Rolling back last migration...$(NC)"
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_URL)" down 1
	@echo "$(GREEN)✅ Rollback complete$(NC)"

## migrate-down-all: Rollback all migrations
migrate-down-all:
	@echo "$(RED)Rolling back ALL migrations...$(NC)"
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_URL)" down -all
	@echo "$(GREEN)✅ All migrations rolled back$(NC)"

## migrate-force: Force migration version (usage: make migrate-force version=1)
migrate-force:
	@if [ -z "$(version)" ]; then \
		echo "$(RED)Error: version is required. Usage: make migrate-force version=1$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Forcing migration version to $(version)$(NC)"
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_URL)" force $(version)
	@echo "$(GREEN)✅ Migration version forced$(NC)"

## migrate-version: Show current migration version
migrate-version:
	@$(MIGRATE) -path $(MIGRATIONS_PATH) -database "$(DB_URL)" version

## tidy: Tidy go modules
tidy:
	@echo "$(GREEN)Tidying go modules...$(NC)"
	@go mod tidy
	@echo "$(GREEN)✅ Modules tidied$(NC)"

## fmt: Format code
fmt:
	@echo "$(GREEN)Formatting code...$(NC)"
	@go fmt ./...
	@echo "$(GREEN)✅ Code formatted$(NC)"

## lint: Run linter
lint:
	@echo "$(GREEN)Running linter...$(NC)"
	@golangci-lint run ./...

## dev: Start development environment (Docker + Run)
dev: docker-up
	@sleep 3
	@make run

## setup: Initial setup (install tools, start docker, run migrations)
setup: migrate-install docker-up
	@sleep 5
	@make migrate-up
	@echo "$(GREEN)✅ Setup complete! Run 'make run' to start the application$(NC)"

