# EC2 Deployment Guide

Complete guide for deploying Impostor to AWS EC2.

---

## Pre-Deployment Checklist

Before deploying to EC2:

- [ ] Code committed and pushed to `main`
- [ ] Local tests pass: `pnpm test`
- [ ] Code validation passes: `pnpm validate`
- [ ] Local docker build works: `docker compose build`
- [ ] Local test deployment works: `docker compose up -d` (port 8080)
- [ ] Can create/join games locally

---

## AWS EC2 Setup

### Launch Instance

- **AMI**: Ubuntu 24.04 LTS
- **Instance Type**: t3.micro (free tier) or t3.small (recommended)
- **Storage**: 20GB gp3
- **Security Group Rules**:
  - Port 22 (SSH) — restrict to your IP
  - Port 80 (HTTP) — open to world
  - Port 443 (HTTPS) — open to world (if using HTTPS)
- **Key Pair**: Generate and save securely

---

## Quick Start (Automated)

### One-Command Deployment

SSH into EC2 and run:

```bash
curl -sSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/deploy-ec2.sh | sudo bash
```

Script will:
- Update system packages
- Install Docker & docker-compose
- Clone repository
- Create backend `.env`
- Build containers
- Start services (port 80 frontend, port 3000 backend)

Wait 2-3 minutes for containers to start, then access:
- **Frontend**: `http://your-ec2-ip`
- **Backend API**: `http://your-ec2-ip:3000`

Verify with:
```bash
curl http://your-ec2-ip/health
docker compose -f docker-compose.prod.yml ps
```

---

## Manual Deployment

### 1. SSH into EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Install Docker

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Clone Repository

```bash
git clone https://github.com/YOUR_REPO.git impostor
cd impostor
```

### 4. Configure Environment

Create `.env.prod` from template:

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod`:

```bash
VITE_URL="http://your-ec2-ip-or-domain.com"
CORS_ORIGIN="${VITE_URL}"
VITE_API_URL="${VITE_URL}"
VITE_SOCKET_URL="${VITE_URL}"
```

Or set inline:

```bash
export VITE_URL="http://your-ec2-ip"
```

### 5. Build & Deploy

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Wait for containers to start:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

### 6. Verify Services

```bash
# Check containers running
docker compose -f docker-compose.prod.yml ps

# Backend health check
curl http://localhost:3000/health

# Frontend accessible
curl http://localhost/
```

---

## Post-Deployment Checklist

- [ ] Frontend loads: `http://your-ec2-ip`
- [ ] Backend responds: `curl http://your-ec2-ip:3000/health`
- [ ] Can create game (check for CORS errors)
- [ ] Can join game
- [ ] WebSocket works (descriptions sync in real-time)
- [ ] Database persists across container restart:
  - [ ] Create a game
  - [ ] Restart backend: `docker compose -f docker-compose.prod.yml restart backend`
  - [ ] Verify game still exists

---

## Configuration

### Environment Variables

**VITE_URL** (required)
- Frontend & backend base URL
- Example: `http://your-ec2-ip` or `https://yourdomain.com`
- Used for CORS_ORIGIN and API URLs

**CORS_ORIGIN** (backend)
- Where frontend runs (for CORS policy)
- Auto-set to VITE_URL

**VITE_API_URL** (frontend)
- Backend API endpoint
- Auto-set to VITE_URL

**VITE_SOCKET_URL** (frontend)
- WebSocket endpoint
- Auto-set to VITE_URL

All variables sourced from `VITE_URL` for simplicity.

### Backend .env File

Located in `packages/backend/.env`:

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_PATH=/app/data/impostor.db
CORS_ORIGIN=http://your-ec2-ip
```

### Port Configuration

**Local (docker-compose.yml)**
- Frontend: `8080:80` → Access at `http://localhost:8080`
- Backend: `3000:3000` → Access at `http://localhost:3000`

**EC2 (docker-compose.prod.yml)**
- Frontend: `80:80` → Access at `http://your-ec2-ip`
- Backend: `3000:3000` → Internal, proxied through nginx

---

## Database

### Location

SQLite database stored in named volume `impostor_data`:
- Path in container: `/app/data/impostor.db`
- Auto-initialized and seeded on first start

### Backup

Manual backup:

```bash
docker run --rm -v impostor_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/impostor_db_backup.tar.gz -C /data .
```

Restore:

```bash
docker run --rm -v impostor_data:/data -v $(pwd):/restore \
  alpine tar xzf /restore/impostor_db_backup.tar.gz -C /data
```

### Direct Access

Query database:

```bash
docker exec impostor-backend sqlite3 /app/data/impostor.db ".tables"
docker exec impostor-backend sqlite3 /app/data/impostor.db "SELECT * FROM words LIMIT 5;"
```

---

## Daily Operations

### View Logs

```bash
# Backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# Frontend logs
docker compose -f docker-compose.prod.yml logs -f frontend

# All services
docker compose -f docker-compose.prod.yml logs -f
```

### Update Code

```bash
cd ~/impostor
sudo bash scripts/update-ec2.sh
```

Manual update:

```bash
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Restart Services

```bash
docker compose -f docker-compose.prod.yml restart
```

### Stop Services

```bash
docker compose -f docker-compose.prod.yml down
```

### Check Status

```bash
docker compose -f docker-compose.prod.yml ps
```

---

## HTTPS Setup (Optional)

See [HTTPS_SETUP.md](./HTTPS_SETUP.md) for SSL/TLS with Let's Encrypt.

Quick summary:
1. Install Certbot: `sudo apt-get install certbot`
2. Obtain certificate: `sudo certbot certonly --standalone -d yourdomain.com`
3. Update nginx config with SSL paths
4. Update `VITE_URL` to use `https://`
5. Rebuild and restart containers

---

## Troubleshooting

### Containers won't start

```bash
docker compose -f docker-compose.prod.yml logs
```

**Common issues:**
- Port already in use: `sudo lsof -i :80` or `:3000`
- Database permission error: Check volume ownership
- Out of memory on t3.micro: Build locally, push to Docker Hub, pull on EC2

### Frontend can't reach backend

1. Backend running? `curl http://localhost:3000/health`
2. Check CORS_ORIGIN in backend `.env`
3. Check VITE_URL matches EC2 IP/domain
4. Check nginx proxy config

### Database locked

SQLite doesn't support concurrent writes. Single backend instance is fine. If multiple containers, use managed database (RDS) instead.

### Health check fails

Containers auto-restart if health check fails. Check logs:

```bash
docker compose -f docker-compose.prod.yml logs backend
```

Health checks:
- Backend: GET `/health` → `{"status":"ok"}`
- Frontend: HTTP 200 on port 80

---

## Performance

### t3.micro (Free Tier)

- Handles ~50 concurrent users
- May struggle during builds
- **Tip**: Build locally, push to Docker Hub, pull on EC2

Memory:

```bash
free -m
```

If low, stop containers and build locally.

### t3.small (Recommended)

- Handles ~200+ concurrent users
- Smooth builds
- Better cold-start performance

### Scaling for > 200 Users

- Upgrade instance size
- Consider managed database (RDS) instead of SQLite
- Use CDN (CloudFront) for frontend static assets
- Load balancer (ALB) if multiple backend instances

---

## Production Checklist

- [ ] Domain configured (A record points to EC2)
- [ ] VITE_URL set correctly
- [ ] CORS_ORIGIN matches VITE_URL
- [ ] Services running & healthy
- [ ] Database initialized with seed data
- [ ] Logs accessible via `docker compose logs`
- [ ] Update script tested
- [ ] (Optional) HTTPS certificates installed
- [ ] (Optional) Auto-renewal configured
- [ ] (Optional) Backup strategy in place

---

## Health Check Commands

```bash
# Frontend
curl -I http://your-ec2-ip
# Should return HTTP 200

# Backend
curl http://your-ec2-ip:3000/health
# Should return {"status":"ok"}

# Docker services
docker compose -f docker-compose.prod.yml ps
# Should show all services as "Up"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy (automated) | `sudo bash scripts/deploy-ec2.sh` |
| Update code | `sudo bash scripts/update-ec2.sh` |
| View logs | `docker compose -f docker-compose.prod.yml logs -f` |
| Restart | `docker compose -f docker-compose.prod.yml restart` |
| Stop | `docker compose -f docker-compose.prod.yml down` |
| Status | `docker compose -f docker-compose.prod.yml ps` |
| SSH | `ssh -i your-key.pem ubuntu@your-ec2-ip` |
| Backup DB | `docker run --rm -v impostor_data:/data -v $(pwd):/backup alpine tar czf /backup/impostor_db_backup.tar.gz -C /data .` |

---

## Support

**Logs**: `docker compose -f docker-compose.prod.yml logs`
**Health**: `curl http://your-ec2-ip:3000/health`
**Processes**: `docker ps`
**Scripts**: See `scripts/README.md`

---

## Done

Your Impostor game is live on EC2:

- **Frontend**: http://your-ec2-ip
- **Backend**: http://your-ec2-ip:3000
- **Health**: http://your-ec2-ip:3000/health
