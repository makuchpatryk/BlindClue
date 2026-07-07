#!/bin/bash
set -e

exec > >(tee /var/log/user-data.log)
exec 2>&1

DOMAIN="${domain}"
APP_HOME="/home/ubuntu/impostor"
CERTS_DIR="/home/ubuntu/certs"

echo "Starting deployment for $DOMAIN..."

apt-get update
apt-get upgrade -y
apt-get install -y docker.io docker-compose curl wget certbot python3-certbot-nginx awscli

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

mkdir -p $APP_HOME $CERTS_DIR
chown -R ubuntu:ubuntu $APP_HOME $CERTS_DIR

# Create docker-compose.prod.yml
cat > $APP_HOME/docker-compose.prod.yml <<'DOCKER_EOF'
services:
  backend:
    image: ${aws_account_id}.dkr.ecr.eu-north-1.amazonaws.com/impostor-backend:latest
    container_name: impostor-backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      HOST: 0.0.0.0
      DATABASE_PATH: /app/data/impostor.db
      CORS_ORIGIN: ${vite_url}
    volumes:
      - impostor_data:/app/data
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: ${aws_account_id}.dkr.ecr.eu-north-1.amazonaws.com/impostor-frontend:latest
    container_name: impostor-frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /home/ubuntu/certs:/etc/nginx/ssl:ro
    depends_on:
      backend:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "https://localhost", "--insecure"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  impostor_data:
    driver: local
DOCKER_EOF

if [ ! -f "$APP_HOME/docker-compose.prod.yml" ]; then
  echo "ERROR: Failed to create docker-compose.prod.yml"
  exit 1
fi

# Create .env.prod
cat > $APP_HOME/.env.prod <<EOF
VITE_API_URL=${api_url}
VITE_SOCKET_URL=${socket_url}
VITE_URL=${vite_url}
EOF

if [ ! -f "$APP_HOME/.env.prod" ]; then
  echo "ERROR: Failed to create .env.prod"
  exit 1
fi

chown -R ubuntu:ubuntu $APP_HOME

# Get SSL certs
systemctl stop docker || true
sleep 2

certbot certonly --standalone --non-interactive --agree-tos --email admin@$DOMAIN -d $DOMAIN

cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERTS_DIR/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $CERTS_DIR/key.pem
chown -R ubuntu:ubuntu $CERTS_DIR

systemctl start docker
sleep 3

# Login to ECR + pull + run
cd $APP_HOME
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${aws_account_id}.dkr.ecr.${aws_region}.amazonaws.com

sudo -u ubuntu docker-compose -f docker-compose.prod.yml pull
sudo -u ubuntu docker-compose -f docker-compose.prod.yml up -d

# Certbot auto-renew
(crontab -u ubuntu -l 2>/dev/null || true; echo "0 3 * * * certbot renew --quiet && docker-compose -f $APP_HOME/docker-compose.prod.yml restart frontend") | crontab -u ubuntu -

# Write APP_HOME path for CI/CD reference
echo "APP_HOME=$APP_HOME" > /home/ubuntu/.app_home
chown ubuntu:ubuntu /home/ubuntu/.app_home

echo "Deployment complete!"
echo "Domain: $DOMAIN"
echo "App: $APP_HOME"
