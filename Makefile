.PHONY: help dev build up down logs clean seed backend-dev frontend-dev

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start all services in development mode
	docker-compose up

build: ## Build all Docker images
	docker-compose build

up: ## Start all services in detached mode
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

clean: ## Stop services and remove volumes
	docker-compose down -v

backend-dev: ## Run backend in development mode (local)
	cd backend && go run cmd/server/main.go

frontend-dev: ## Run frontend in development mode (local)
	cd frontend && npm run dev

install-backend: ## Install backend dependencies
	cd backend && go mod download

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

test-backend: ## Run backend tests
	cd backend && go test ./...

