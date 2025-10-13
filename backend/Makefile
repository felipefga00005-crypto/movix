.PHONY: help run build test clean install dev migrate seed

help: ## Mostra esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Instala as dependências
	go mod download
	go mod tidy

run: ## Executa o servidor
	go run cmd/server/main.go

dev: ## Executa o servidor em modo desenvolvimento com hot reload (requer air)
	air

build: ## Compila o projeto
	go build -o bin/server cmd/server/main.go

test: ## Executa os testes
	go test -v ./...

clean: ## Limpa os arquivos compilados
	rm -rf bin/
	go clean

docker-up: ## Sobe o container do PostgreSQL
	docker-compose up -d

docker-down: ## Para o container do PostgreSQL
	docker-compose down

docker-logs: ## Mostra os logs do PostgreSQL
	docker-compose logs -f postgres

migrate: ## Executa as migrations (GORM AutoMigrate)
	@echo "Migrations são executadas automaticamente pelo GORM"

seed: ## Popula o banco com dados de exemplo
	go run cmd/seed/main.go

