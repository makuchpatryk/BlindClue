# Quick Setup Checklist

## Before Terraform

### 1. Push code to GitHub
```bash
cd /home/patryk/projects/impostor
git remote add origin https://github.com/yourusername/impostor.git
git branch -M main
git push -u origin main
```
Update `yourusername` with your GitHub username.

### 2. Create AWS EC2 Key Pair
```bash
aws ec2 create-key-pair --key-name impostor-key --region us-east-1 > impostor-key.pem
chmod 400 impostor-key.pem
```

### 3. Update Domain DNS (optional, after deploy)
Once Terraform outputs the elastic IP, add DNS record:
- **Type**: A
- **Name**: blind-clue.xyz (or subdomain)
- **Value**: <elastic-ip-from-terraform>

Wait for DNS propagation (~5-30 min).

## Deploy with Terraform

### 1. Update terraform.tfvars
```bash
cd terraform
# Edit these values:
domain       = "blind-clue.xyz"
key_pair_name = "impostor-key"
github_repo  = "https://github.com/yourusername/impostor.git"
aws_region   = "us-east-1"
```

### 2. Initialize
```bash
terraform init
```

### 3. Plan
```bash
terraform plan
```
Review output. Should create: 1 EC2, 1 security group, 1 elastic IP.

### 4. Apply
```bash
terraform apply
```
Type `yes` to confirm. **Takes 5-10 minutes.**

### 5. Verify
```bash
terraform output instance_public_ip
terraform output app_url
```

## Post-Deploy

### 1. Check logs
```bash
IP=$(terraform output -raw instance_public_ip)
ssh -i ../impostor-key.pem ubuntu@$IP tail -f /var/log/user-data.log
```
Wait until "Deployment complete!" appears.

### 2. Visit app
```bash
https://blind-clue.xyz
```
(After DNS propagates, or use IP directly for testing)

### 3. SSH into server
```bash
ssh -i ../impostor-key.pem ubuntu@$IP
docker-compose -f ~/impostor/docker-compose.prod.yml ps
```

## Troubleshooting

**Certbot failed?** Manual fix:
```bash
ssh -i ../impostor-key.pem ubuntu@$IP
sudo certbot certonly --standalone -d blind-clue.xyz
sudo cp /etc/letsencrypt/live/blind-clue.xyz/fullchain.pem /home/ubuntu/certs/cert.pem
sudo cp /etc/letsencrypt/live/blind-clue.xyz/privkey.pem /home/ubuntu/certs/key.pem
docker-compose -f ~/impostor/docker-compose.prod.yml restart frontend
```

**Docker build failed?** Check RAM (t3.small has 2GB, frontend build can be slow):
```bash
ssh -i ../impostor-key.pem ubuntu@$IP docker system df
```

**App not running?** Check services:
```bash
ssh -i ../impostor-key.pem ubuntu@$IP
docker-compose -f ~/impostor/docker-compose.prod.yml logs backend
docker-compose -f ~/impostor/docker-compose.prod.yml logs frontend
```

## Cleanup

Destroy all AWS resources:
```bash
terraform destroy
```
Type `yes` to confirm.

## Notes

- State stored locally (terraform.tfstate) — don't commit
- Elastic IP persists to keep IP stable
- Certbot renews certs daily at 3 AM UTC
- SSH open to 0.0.0.0/0 — restrict in production via `ssh_cidr_blocks`
