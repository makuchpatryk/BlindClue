#!/bin/bash
set -e

# Post-deployment setup for Impostor app
# Run this AFTER pointing DNS to the instance IP

DOMAIN="${1:-blind-clue.xyz}"
INSTANCE_IP="${2:-}"

if [ -z "$INSTANCE_IP" ]; then
  echo "Usage: ./post-deploy.sh <domain> <instance-ip>"
  echo "Example: ./post-deploy.sh blind-clue.xyz 13.62.172.189"
  exit 1
fi

echo "========================================"
echo "Post-Deployment Setup"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Instance IP: $INSTANCE_IP"
echo ""

# Check DNS
echo "1. Verifying DNS resolution..."
RESOLVED_IP=$(dig +short $DOMAIN | tail -1)

if [ "$RESOLVED_IP" != "$INSTANCE_IP" ]; then
  echo "❌ ERROR: DNS not pointing to instance yet"
  echo "   Expected: $INSTANCE_IP"
  echo "   Got:      $RESOLVED_IP"
  echo ""
  echo "Please update your DNS A record:"
  echo "   Domain: $DOMAIN"
  echo "   Points to: $INSTANCE_IP"
  echo ""
  echo "Then wait 5-10 minutes for propagation and retry."
  exit 1
fi

echo "✓ DNS resolved correctly to $INSTANCE_IP"
echo ""

# SSH and run Certbot
echo "2. Getting SSL certificate from Let's Encrypt..."
echo "   (SSH into instance: $INSTANCE_IP)"
echo ""

KEY_FILE="impostor-pem.pem"
if [ ! -f "$KEY_FILE" ]; then
  echo "❌ ERROR: Cannot find $KEY_FILE"
  echo "   Make sure you're in the terraform directory"
  exit 1
fi

ssh -i "$KEY_FILE" ubuntu@"$INSTANCE_IP" bash << 'EOF'
set -e

DOMAIN="$1"

echo "Stopping Docker..."
sudo systemctl stop docker
sleep 2

echo "Getting certificate..."
sudo certbot certonly --standalone --non-interactive --agree-tos --email admin@$DOMAIN -d $DOMAIN

echo "Installing certificate..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /home/ubuntu/certs/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /home/ubuntu/certs/key.pem
sudo chown ubuntu:ubuntu /home/ubuntu/certs/*

echo "Starting Docker..."
sudo systemctl start docker
sleep 3

echo "Restarting frontend..."
cd ~/impostor
docker-compose -f docker-compose.prod.yml restart frontend

echo "✓ Certificate installed and frontend restarted"
EOF "$DOMAIN"

echo ""
echo "========================================"
echo "✓ Setup Complete!"
echo "========================================"
echo ""
echo "App is now running with valid SSL certificate at:"
echo "   https://$DOMAIN"
echo ""
echo "Test:"
echo "   curl https://$DOMAIN"
echo ""
echo "SSH:"
echo "   ssh -i $KEY_FILE ubuntu@$INSTANCE_IP"
echo ""
