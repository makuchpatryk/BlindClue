# HTTPS Setup Guide (Certbot + Let's Encrypt)

## Prerequisites

- Domain name pointing to EC2 instance IP
- EC2 instance with port 80 open (for Certbot validation)

## Step 1: Install Certbot

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

## Step 2: Stop Docker Containers (nginx)

Since nginx runs in Docker on port 80, stop it temporarily for Certbot.

```bash
cd /home/ubuntu/impostor
docker compose -f docker compose.prod.yml down
```

## Step 3: Obtain SSL Certificate

Replace `yourdomain.com` with your actual domain.

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

Certificate files will be in:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

## Step 4: Update nginx.conf for HTTPS

Create/update nginx.conf with SSL config:

```nginx
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  
  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;

  # SSL certificates (mounted from host)
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Security headers
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  root /usr/share/nginx/html;

  # SPA: route all requests to index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy to backend
  location /api {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Socket.io proxy
  location /socket.io {
    proxy_pass http://backend:3000/socket.io;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Step 5: Update docker compose.prod.yml

Mount SSL certificates as volumes in frontend service:

```yaml
frontend:
  # ... existing config ...
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
  ports:
    - "80:80"
    - "443:443"
```

## Step 6: Restart Containers

```bash
cd /home/ubuntu/impostor
docker compose -f docker compose.prod.yml up -d
```

## Step 7: Auto-Renewal

Certbot auto-renewal runs via systemd timer:

```bash
# Check renewal status
sudo certbot renew --dry-run

# View timer
sudo systemctl list-timers | grep certbot
```

## Step 8: Update Frontend API URLs

Update `docker compose.prod.yml` frontend service with:

```yaml
args:
  VITE_URL: https://yourdomain.com
  VITE_URL: https://yourdomain.com
```

Then rebuild and restart:

```bash
docker compose -f docker compose.prod.yml build
docker compose -f docker compose.prod.yml up -d
```

## Verification

```bash
curl -I https://yourdomain.com
```

Should return 200 with SSL headers.

## Troubleshooting

**Certbot fails: Port 80 already in use**
- Make sure containers are stopped: `docker compose -f docker compose.prod.yml down`

**Certificate renewal fails**
- Check logs: `sudo journalctl -u certbot.timer -n 50`
- Manual renewal: `sudo certbot renew --force-renewal`

**Mixed content warning**
- Ensure `VITE_URL` and `VITE_URL` use `https://` not `http://`
