# Impostor App - Complete End-to-End Deployment

Fresh deployment from scratch to fully working app. Follow step-by-step.

## Overview

```
Local: Build Docker images → Push to ECR
         ↓
AWS: Deploy infrastructure via Terraform
         ↓
Instance: Setup SSL certificate
         ↓
Result: App running at https://blind-clue.xyz
```

## Prerequisites

### Local Machine

- **Terraform >= 1.8**
  ```bash
  terraform version
  # If not installed: https://www.terraform.io/downloads
  ```

- **Docker**
  ```bash
  docker --version
  # If not installed: https://www.docker.com/products/docker-desktop
  ```

- **AWS CLI**
  ```bash
  aws --version
  # If not installed: https://aws.amazon.com/cli/
  ```

### AWS Account

- AWS account with admin access
- Credit card on file (small charges: ~$5-10/month)

## Step-by-Step Deployment

### Phase 1: AWS Setup (10 minutes)

#### 1.1 Configure AWS Credentials

```bash
aws configure
# Enter:
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: eu-north-1
# Default output format: json

# Verify
aws sts get-caller-identity
# Should show account ID and ARN
```

#### 1.2 Create EC2 Key Pair

```bash
aws ec2 create-key-pair --key-name impostor-pem --region eu-north-1 > impostor-pem.pem
chmod 400 impostor-pem.pem

# Verify
ls -la impostor-pem.pem
```

#### 1.3 Create IAM Role for GitHub Actions (optional, for CI/CD)

See `.github/GITHUB_ACTIONS_SETUP.md` for detailed steps.

Or skip for now — can add later.

### Phase 2: Build Docker Images (20-30 minutes)

#### 2.1 Navigate to Project

```bash
cd /home/patryk/projects/impostor
```

#### 2.2 Get AWS Account ID

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.eu-north-1.amazonaws.com

echo $REGISTRY
# Should output: 719982590319.dkr.ecr.eu-north-1.amazonaws.com
```

#### 2.3 Login to ECR

```bash
aws ecr get-login-password --region eu-north-1 | \
  docker login --username AWS --password-stdin $REGISTRY

# Should output: Login Succeeded
```

#### 2.4 Build Backend Image

```bash
docker build -f packages/backend/Dockerfile.prod \
  -t $REGISTRY/impostor-backend:latest .

# Takes ~2-3 minutes
```

#### 2.5 Push Backend

```bash
docker push $REGISTRY/impostor-backend:latest
# Takes ~1-2 minutes
```

#### 2.6 Build Frontend Image

```bash
docker build -f packages/frontend/Dockerfile.prod \
  -t $REGISTRY/impostor-frontend:latest .

# Takes ~5-10 minutes (compiles Vite)
```

#### 2.7 Push Frontend

```bash
docker push $REGISTRY/impostor-frontend:latest
# Takes ~2-3 minutes
```

#### 2.8 Verify Images in ECR

```bash
aws ecr describe-images --repository-name impostor-backend --region eu-north-1
aws ecr describe-images --repository-name impostor-frontend --region eu-north-1

# Should show latest tag with recent push date
```

### Phase 3: Deploy Infrastructure with Terraform (10 minutes)

#### 3.1 Navigate to Terraform

```bash
cd /home/patryk/projects/impostor/terraform
```

#### 3.2 Update Configuration

Edit `terraform.tfvars`:

```hcl
aws_region    = "eu-north-1"
domain        = "blind-clue.xyz"              # Change to your domain
key_pair_name = "impostor-pem"
instance_type = "t3.micro"
```

#### 3.3 Initialize Terraform

```bash
terraform init

# Downloads AWS provider
```

#### 3.4 Review Plan

```bash
terraform plan

# Shows what will be created (EC2, VPC, security groups, etc)
```

#### 3.5 Deploy

```bash
terraform apply

# Review output
# Type 'yes' to confirm
# Takes ~5 minutes
```

#### 3.6 Save Outputs

```bash
terraform output

# Save these:
# - instance_public_ip
# - app_url
# - post_deploy_instructions
```

### Phase 4: Post-Deployment Setup (15 minutes)

#### 4.1 Point DNS

Update your domain registrar (DNS settings):

- **Type:** A Record
- **Name:** blind-clue.xyz
- **Value:** (instance public IP from Phase 3)
- **TTL:** 3600

**Wait 5-10 minutes for DNS propagation.**

Verify:
```bash
dig blind-clue.xyz
# Should show your instance IP
```

#### 4.2 Setup SSL Certificate

From terraform directory:

```bash
chmod +x post-deploy.sh

./post-deploy.sh blind-clue.xyz <instance-public-ip>

# Automatically:
# - Verifies DNS
# - Gets Let's Encrypt certificate
# - Installs certificate
# - Restarts Docker
```

### Phase 5: Verify Deployment (5 minutes)

#### 5.1 Test HTTPS

```bash
curl https://blind-clue.xyz

# Or open in browser
https://blind-clue.xyz
```

Should show green lock 🔒 and no warnings.

#### 5.2 SSH into Instance (optional)

```bash
IP=$(terraform output -raw instance_public_ip)
ssh -i impostor-pem.pem ubuntu@$IP

# Check containers
docker-compose -f ~/impostor/docker-compose.prod.yml ps

# Check logs
docker-compose -f ~/impostor/docker-compose.prod.yml logs
```

## Deployment Complete ✓

App running at: **https://blind-clue.xyz**

## Next Steps

### Option 1: Setup GitHub Actions CI/CD

See `.github/GITHUB_ACTIONS_SETUP.md`

Enables: Push code → Auto-build → Auto-deploy

### Option 2: Monitor & Maintain

```bash
# SSH into instance
ssh -i impostor-pem.pem ubuntu@<ip>

# View logs
docker-compose -f ~/impostor/docker-compose.prod.yml logs -f

# Restart services
docker-compose -f ~/impostor/docker-compose.prod.yml restart
```

### Option 3: Cleanup (Destroy Everything)

```bash
cd terraform

# 1. Destroy all AWS resources
terraform destroy
# Type 'yes'

# 2. Clean local state
rm -rf terraform.tfstate* .terraform .terraform.lock.hcl

# 3. Remove GitHub secrets (if using Actions)
# GitHub → Settings → Secrets → Delete AWS secrets
```

## Troubleshooting

### Can't SSH to Instance

```bash
# Verify PEM file
head -1 impostor-pem.pem
# Should start with: -----BEGIN RSA PRIVATE KEY-----

# Check instance is running
aws ec2 describe-instances --region eu-north-1 \
  --filters "Name=tag:Name,Values=impostor-server" \
  --query 'Reservations[0].Instances[0].State.Name'
```

### Docker Images Not Found

```bash
# Verify images pushed to ECR
aws ecr describe-images --repository-name impostor-backend --region eu-north-1
aws ecr describe-images --repository-name impostor-frontend --region eu-north-1

# If missing, go back to Phase 2 (build images)
```

### SSL Certificate Issues

```bash
# SSH into instance
ssh -i impostor-pem.pem ubuntu@<ip>

# Check certs exist
ls -la /home/ubuntu/certs/

# Manually get cert
sudo systemctl stop docker
sudo certbot certonly --standalone -d blind-clue.xyz
sudo cp /etc/letsencrypt/live/blind-clue.xyz/fullchain.pem /home/ubuntu/certs/cert.pem
sudo cp /etc/letsencrypt/live/blind-clue.xyz/privkey.pem /home/ubuntu/certs/key.pem
sudo chown ubuntu:ubuntu /home/ubuntu/certs/*
sudo systemctl start docker
docker-compose -f ~/impostor/docker-compose.prod.yml restart frontend
```

## File Reference

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete deployment guide |
| `PRE_DEPLOY.md` | Docker image build & push |
| `POST_DEPLOY.md` | DNS & SSL setup |
| `DEPLOYMENT_COMMANDS.md` | All CLI commands reference |
| `.github/GITHUB_ACTIONS_SETUP.md` | GitHub Actions CI/CD |
| `.github/workflows/deploy.yml` | Auto-deploy workflow |

## Costs

**Monthly estimate:**
- EC2 t3.micro: ~$5-10
- ECR storage: ~$0.10-1
- Data transfer: ~$1-5
- **Total:** ~$10-20/month

**Free:**
- Key pairs
- VPC
- Security groups
- GitHub Actions (2000 min/month free)

## Key Takeaways

1. **State file matters** — `terraform destroy` uses state to clean up. Don't delete state with resources still running.

2. **Key pair is free** — Keep backup PEM file for future redeployment.

3. **DNS before certs** — Let's Encrypt requires domain to resolve before getting certificate.

4. **Images built locally** — Terraform pulls pre-built images from ECR, doesn't build during deploy.

5. **Manual deploy safest** — GitHub Actions triggers manually, prevents accidental deployments.

## Support

- **Terraform:** `terraform plan` before `apply` to review changes
- **AWS:** Use console to monitor resources, costs
- **Docker:** `docker logs` on instance for app debugging
- **SSL:** `sudo certbot certificates` to check cert status

---

**Questions?** See DEPLOYMENT_COMMANDS.md for all CLI reference.

**Ready to start?** Begin with Phase 1 above.
