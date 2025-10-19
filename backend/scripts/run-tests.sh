#!/bin/bash

# Script to run tests for the Movix backend

set -e

echo "🧪 Running Movix Backend Tests"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to backend directory
cd "$(dirname "$0")/.."

echo ""
echo "${YELLOW}📦 Installing dependencies...${NC}"
go mod download

echo ""
echo "${YELLOW}🔍 Running unit tests...${NC}"
go test -v -race -coverprofile=coverage.out ./internal/services/... 2>&1 | tee test-output.log

# Check if tests passed
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ All tests passed!${NC}"
    
    echo ""
    echo "${YELLOW}📊 Test Coverage:${NC}"
    go tool cover -func=coverage.out | tail -n 1
    
    echo ""
    echo "${YELLOW}📈 Generating HTML coverage report...${NC}"
    go tool cover -html=coverage.out -o coverage.html
    echo "Coverage report saved to: coverage.html"
else
    echo ""
    echo "${RED}❌ Tests failed!${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}🔍 Running validators tests...${NC}"
go test -v ./internal/validators/...

echo ""
echo "${YELLOW}🔍 Running repositories tests...${NC}"
go test -v ./internal/repositories/...

echo ""
echo "${GREEN}✅ All test suites completed!${NC}"

