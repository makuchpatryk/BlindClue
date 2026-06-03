# Deployment Scripts

Helper scripts for deploying Impostor to EC2.

## Scripts

### `deploy-ec2.sh`

Automated initial deployment to EC2. Installs Docker, clones repo, builds containers, and starts services.

**Usage:**

```bash
# On local machine, copy script to EC2 and run
scp -i your-key.pem scripts/deploy-ec2.sh ubuntu@your-ec2-ip:/tmp/
ssh -i your-key.pem ubuntu@your-ec2-ip
sudo bash /tmp/deploy-ec2.sh

# Or run in one line
curl -sSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/deploy-ec2.sh | sudo bash
```

**What it does:**

1. Updates system packages
2. Installs Docker and docker compose
3. Clones (or pulls) the repository
4. Creates backend `.env` file with production config
5. Builds Docker containers
6. Starts services on ports 80 (frontend) and 3000 (backend)

**Options:**

```bash
sudo bash deploy-ec2.sh [REPO_URL] [DOMAIN]
```

- `REPO_URL`: Git repository URL (default: GitHub HTTPS)
- `DOMAIN`: Domain or IP for API calls (auto-detected if not provided)

### `update-ec2.sh`

Quick update and restart after code changes.

**Usage:**

```bash
cd /home/ubuntu/impostor
sudo bash scripts/update-ec2.sh
```

**What it does:**

1. Pulls latest code from main branch
2. Rebuilds Docker containers
3. Restarts services
4. Verifies services are running

### `fix-imports.mjs`

Utility script to fix ES module imports after TypeScript compilation (auto-run by build scripts).

---

## Manual Commands

If scripts fail, use docker compose directly:

```bash
# Build
docker compose -f docker compose.prod.yml build

# Start
docker compose -f docker compose.prod.yml up -d

# View logs
docker compose -f docker compose.prod.yml logs -f

# Restart
docker compose -f docker compose.prod.yml restart

# Stop
docker compose -f docker compose.prod.yml down

# Check status
docker compose -f docker compose.prod.yml ps
```

---

## Environment Variables

### For docker compose.prod.yml

Set before running docker compose:

```bash
export VITE_URL="https://yourdomain.com"
export VITE_URL="https://yourdomain.com"
export CORS_ORIGIN="https://yourdomain.com"

docker compose -f docker compose.prod.yml build
docker compose -f docker compose.prod.yml up -d
```

Or create `.env.prod` and use:

```bash
source .env.prod
docker compose -f docker compose.prod.yml up -d
```

---

## Troubleshooting

### Script permission denied

```bash
chmod +x scripts/deploy-ec2.sh scripts/update-ec2.sh
```

### Docker not found

Ensure Docker installed:

```bash
docker --version
docker compose --version
```

### Containers won't start

Check logs:

```bash
docker compose -f docker compose.prod.yml logs
```

Common issues:
- Port already in use
- Database permission error
- Out of memory on t3.micro

See [EC2_DEPLOYMENT_GUIDE.md](../EC2_DEPLOYMENT_GUIDE.md) for more help.
