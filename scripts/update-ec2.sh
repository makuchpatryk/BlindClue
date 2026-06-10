#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/home/ubuntu/impostor"

echo -e "${YELLOW}Pulling latest changes and restarting containers...${NC}"

cd "$APP_DIR"

# Load environment variables
if [ -f .env.prod ]; then
  echo -e "${YELLOW}[1/4] Loaded environment variables from .env.prod${NC}"
else
  echo -e "${RED}✗ .env.prod not found in $APP_DIR${NC}"
  exit 1
fi

# Pull latest code
echo -e "${YELLOW}[2/4] Pulling latest from main...${NC}"
sudo -u ubuntu git pull origin main

# Rebuild and restart
echo -e "${YELLOW}[3/4] Building containers...${NC}"
docker compose --env-file .env.prod -f docker-compose.prod.yml build

echo -e "${YELLOW}[4/4] Restarting services...${NC}"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

sleep 3

if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
  echo -e "${GREEN}✓ Update complete. Services running.${NC}"
  docker compose -f docker-compose.prod.yml ps
else
  echo -e "${RED}✗ Services failed to restart${NC}"
  docker compose -f docker-compose.prod.yml logs
  exit 1
fi
