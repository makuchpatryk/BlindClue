# Docker Deployment Guide

## Local Testing

Build and run locally before EC2 push:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down
```

Frontend: http://localhost:8080
Backend: http://localhost:3000

---

## EC2 Setup

### 1. Launch EC2 Instance

- **AMI**: Ubuntu 24.04 LTS
- **Instance Type**: t3.micro (free tier) or t3.small
- **Storage**: 20GB gp3
- **Security Group Rules**:
  - Port 80 (HTTP, frontend)
  - Port 443 (HTTPS, optional - use Certbot + nginx)
  - Port 22 (SSH, restrict to your IP)

### 2. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 git

# Add user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clone & Deploy

```bash
git clone <your-repo> impostor
cd impostor

# For EC2: change docker-compose.yml port mapping back to 80
# Change: "8080:80" → "80:80" in frontend service

# Create .env for backend (if needed)
cp packages/backend/.env.example packages/backend/.env
# Edit if necessary: NODE_ENV=production, etc.

# Build and start
docker-compose up -d --build

# Verify
docker-compose ps
docker-compose logs backend
```

### 4. Data Persistence

SQLite database stored in named volume `impostor_data`. Survives container restarts.

To backup:
```bash
docker run --rm -v impostor_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/impostor_db_backup.tar.gz -C /data .
```

### 5. Optional: HTTPS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf to use cert, restart frontend container
```

---

## Troubleshooting

**Backend not starting**: `docker-compose logs backend`

**Frontend can't reach backend**: Check nginx.conf proxy, backend container name matches service name

**SQLite locked**: No multiple write access. Single backend instance OK.

**Out of memory**: EC2 t3.micro may struggle with build. Build on local → push image to Docker Hub → pull on EC2.

---

## Production Checklist

- [ ] Environment variables set (`NODE_ENV=production`)
- [ ] SQLite volume mounted and writable
- [ ] Ports 80, 443 (if HTTPS) open in security group
- [ ] SSH key secure
- [ ] Backup strategy for SQLite data
- [ ] Monitoring/logs setup (CloudWatch, etc.)
- [ ] Domain + SSL (if needed)
