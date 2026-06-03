#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Impostor Game - EC2 Deployment Script${NC}"
echo "======================================="

# Check if running as root (required for docker)
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Must run as root${NC}"
  exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}[1/6] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Step 2: Install dependencies
echo -e "${YELLOW}[2/6] Installing Docker and dependencies...${NC}"
apt-get install -y docker.io docker-compose-v2 git wget curl

# Step 3: Add user to docker group
echo -e "${YELLOW}[3/6] Configuring Docker...${NC}"
usermod -aG docker ubuntu || true
newgrp docker || true

# Step 4: Clone repository
REPO_URL="${1:-git@github.com:makuchpatryk/BlindClue.git}"
APP_DIR="/home/ubuntu/impostor"

echo -e "${YELLOW}[4/6] Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
  echo "Directory exists. Pulling latest changes..."
  cd "$APP_DIR"
  sudo -u ubuntu git pull origin main
else
  sudo -u ubuntu git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# Step 5: Create .env files
echo -e "${YELLOW}[5/6] Setting up environment...${NC}"

# Get EC2 IP
EC2_IP=$(hostname -I | awk '{print $1}')
EC2_URL="${EC2_URL:-http://$EC2_IP}"

# Backend .env
BACKEND_ENV="$APP_DIR/packages/backend/.env"
if [ ! -f "$BACKEND_ENV" ]; then
  cat > "$BACKEND_ENV" << EOF
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_PATH=/app/data/impostor.db
CORS_ORIGIN=$EC2_URL
EOF
  echo "✓ Created backend .env file"
fi

# Set environment variables for docker compose
export VITE_URL="$EC2_URL"

# Step 6: Deploy with docker-compose
echo -e "${YELLOW}[6/6] Building and starting containers...${NC}"
cd "$APP_DIR"

# For EC2, use production compose file with port 80
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Verify deployment
sleep 5
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}=======================================${NC}"

if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
  echo -e "${GREEN}✓ Services are running${NC}"
  echo ""
  echo "Frontend:  http://$(hostname -I | awk '{print $1}')"
  echo "Backend:   http://$(hostname -I | awk '{print $1}'):3000"
  echo ""
  echo "View logs:"
  echo "  docker compose -f docker-compose.prod.yml logs -f backend"
  echo "  docker compose -f docker-compose.prod.yml logs -f frontend"
else
  echo -e "${RED}✗ Services failed to start${NC}"
  echo "Check logs:"
  docker compose -f docker-compose.prod.yml logs
  exit 1
fi
