# Post-Deployment Setup

After `terraform apply` completes, follow these steps to finish setting up the Impostor app.

## Step 1: Get Instance IP

```bash
terraform output instance_public_ip
```

Save this IP — you'll need it for DNS.

## Step 2: Point DNS to Instance

Update your domain registrar (DNS settings for `blind-clue.xyz`):

- **Type:** A Record
- **Name:** blind-clue.xyz
- **Value:** [instance public IP from Step 1]
- **TTL:** 3600 (or default)

**Wait 5-10 minutes for DNS propagation.** You can verify with:

```bash
dig blind-clue.xyz
# Should show your instance IP
```

## Step 3: Setup SSL Certificate

Once DNS is pointing to the instance:

```bash
cd terraform

chmod +x post-deploy.sh

./post-deploy.sh blind-clue.xyz <instance-ip>
```

Replace `<instance-ip>` with the IP from Step 1.

The script will:
1. Verify DNS resolution
2. SSH into the instance
3. Stop Docker temporarily
4. Get a certificate from Let's Encrypt via Certbot
5. Install the certificate
6. Restart Docker with the new certificate
7. Verify everything is running

## Step 4: Verify

Test the app:

```bash
curl https://blind-clue.xyz
# Should return HTML (no SSL warnings)
```

Or open in browser:
```
https://blind-clue.xyz
```

Should show a green lock 🔒 (secure connection).

## Manual Setup (if script fails)

If the `post-deploy.sh` script fails, you can do it manually:

```bash
# SSH into instance
ssh -i impostor-pem.pem ubuntu@<instance-ip>

# Stop Docker
sudo systemctl stop docker
sleep 2

# Get certificate
sudo certbot certonly --standalone --non-interactive --agree-tos \
  --email admin@blind-clue.xyz -d blind-clue.xyz

# Copy certificates
sudo cp /etc/letsencrypt/live/blind-clue.xyz/fullchain.pem /home/ubuntu/certs/cert.pem
sudo cp /etc/letsencrypt/live/blind-clue.xyz/privkey.pem /home/ubuntu/certs/key.pem
sudo chown ubuntu:ubuntu /home/ubuntu/certs/*

# Start Docker
sudo systemctl start docker
sleep 3

# Restart frontend to load new certs
cd ~/impostor
docker-compose -f docker-compose.prod.yml restart frontend

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Troubleshooting

### DNS Not Resolving
```bash
# Check current DNS
dig blind-clue.xyz

# Check expected IP
terraform output instance_public_ip

# If mismatch, wait longer (DNS propagation takes time)
```

### Certbot "Port 80 Already in Use"
```bash
# Stop competing services
sudo systemctl stop nginx
sudo killall -9 nginx

# Retry Certbot
sudo certbot certonly --standalone -d blind-clue.xyz
```

### Container Won't Start After Cert Change
```bash
# Check logs
docker-compose -f ~/impostor/docker-compose.prod.yml logs frontend

# Check if certs exist
ls -la /home/ubuntu/certs/

# Restart frontend
docker-compose -f ~/impostor/docker-compose.prod.yml restart frontend
```

### SSL Certificate Warnings in Browser
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private window
- Wait for DNS propagation (5-10 min)
- Check certificate details (click lock icon → certificate)

## Certificate Renewal

Certbot auto-renewal is configured via cron (runs daily at 3 AM UTC):

```bash
# Check cron job
crontab -u ubuntu -l

# Manual renewal
sudo certbot renew --force-renewal
```

## What's Deployed

After post-deployment setup completes:

- **EC2 Instance:** t3.micro running Ubuntu 22.04
- **Docker Containers:** Backend (Node.js) + Frontend (Nginx)
- **Database:** SQLite on instance (`/home/ubuntu/impostor/impostor.db`)
- **SSL:** Let's Encrypt certificate for blind-clue.xyz
- **URL:** https://blind-clue.xyz

## Next Steps

- Monitor logs: `ssh ... docker-compose logs -f`
- Backup database regularly
- Update DNS records if instance IP changes (Elastic IP prevents this)
- Configure Certbot auto-renewal in production

