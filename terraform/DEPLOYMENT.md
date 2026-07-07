# Impostor App - Complete Terraform Deployment Guide

Deploy Impostor to AWS EC2 with automated infrastructure via Terraform.

## Architecture

- **Compute:** EC2 t3.micro in eu-north-1
- **Container Registry:** AWS ECR (pre-built images)
- **Networking:** VPC, Security Group, Elastic IP
- **Storage:** SQLite database on instance
- **SSL:** Let's Encrypt via Certbot
- **Domain:** blind-clue.xyz (configure your own)

## Deployment Flow

```
1. PRE_DEPLOY: Build & push Docker images to ECR
   ↓
2. Terraform: Deploy infrastructure (VPC, EC2, IAM)
   ↓
3. POST_DEPLOY: Setup DNS & SSL certificate
   ↓
4. Verify: App running at https://your-domain.com
```

## Prerequisites

### Local Machine
- Terraform >= 1.8
- Docker
- AWS CLI
- Git

### AWS Account
- AWS credentials configured
- EC2 key pair created
- Sufficient quota (EC2, ECR, VPC)

## Setup

### 1. Install Tools

**Terraform:**
```bash
# macOS
brew install terraform

# Linux
sudo apt-get install terraform

# Or download: https://releases.hashicorp.com/terraform/
```

**AWS CLI:**
```bash
# macOS
brew install awscli

# Linux
sudo apt-get install awscli

# Or: https://aws.amazon.com/cli/
```

**Docker:**
```bash
# macOS: Docker Desktop
# Linux: https://docs.docker.com/engine/install/ubuntu/
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter: Access Key, Secret Key, Region (eu-north-1), Output (json)

# Or environment variables:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_DEFAULT_REGION="eu-north-1"

# Verify
aws sts get-caller-identity
```

### 3. Update terraform.tfvars

```bash
cd /home/patryk/projects/impostor/terraform

# Edit terraform.tfvars
domain        = "blind-clue.xyz"           # Your domain
key_pair_name = "impostor-pem"             # EC2 key pair name
aws_region    = "eu-north-1"               # Your region
instance_type = "t3.micro"                 # Instance size
```

## Deployment Steps

### Step 1: Pre-Deploy (Build Images)

See [PRE_DEPLOY.md](./PRE_DEPLOY.md)

```bash
cd /home/patryk/projects/impostor

# Build and push Docker images to ECR
# Takes ~20-30 minutes total
```

Summary:
```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.eu-north-1.amazonaws.com

aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin $REGISTRY

docker build -f packages/backend/Dockerfile.prod -t $REGISTRY/impostor-backend:latest .
docker push $REGISTRY/impostor-backend:latest

docker build -f packages/frontend/Dockerfile.prod -t $REGISTRY/impostor-frontend:latest .
docker push $REGISTRY/impostor-frontend:latest
```

### Step 2: Terraform Deploy

```bash
cd /home/patryk/projects/impostor/terraform

# Initialize
terraform init

# Review plan
terraform plan

# Deploy
terraform apply
# Type 'yes' to confirm
# Takes ~5 minutes
```

After completion, save the outputs:
```bash
terraform output
```

### Step 3: Post-Deploy (DNS & SSL)

See [POST_DEPLOY.md](./POST_DEPLOY.md)

```bash
# 1. Point DNS
#    Update your domain's A record to the instance public IP
#    Wait 5-10 minutes for propagation

# 2. Run post-deploy script
./post-deploy.sh blind-clue.xyz <instance-public-ip>

# 3. Verify
curl https://blind-clue.xyz
```

## Verification

### Check Deployment

```bash
# Get instance IP
terraform output instance_public_ip

# SSH into instance
ssh -i impostor-pem.pem ubuntu@<ip>

# Check containers
docker-compose -f ~/impostor/docker-compose.prod.yml ps

# Check logs
docker-compose -f ~/impostor/docker-compose.prod.yml logs -f
```

### Test Application

```bash
# From local machine
curl https://blind-clue.xyz

# Or open in browser
https://blind-clue.xyz
```

Should see green lock 🔒 and no security warnings.

## File Structure

```
terraform/
├── main.tf                 # EC2, VPC, security groups
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── terraform.tfvars        # Your configuration
├── user-data.sh            # EC2 initialization script
├── post-deploy.sh          # Post-deployment helper
├── PRE_DEPLOY.md           # Image build guide
├── POST_DEPLOY.md          # Post-deploy guide
├── DEPLOYMENT.md           # This file
└── DEPLOYMENT_COMMANDS.md  # All commands reference
```

## Troubleshooting

### Terraform Errors

**"Invalid provider version"**
```bash
rm -rf .terraform .terraform.lock.hcl
terraform init
```

**"No valid credentials"**
```bash
aws configure
# or
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
```

### EC2 Issues

**Can't SSH**
```bash
# Verify key pair
ls -la impostor-pem.pem

# Check instance state
aws ec2 describe-instances --region eu-north-1 \
  --filters "Name=tag:Name,Values=impostor-server" \
  --query 'Reservations[0].Instances[0].State.Name'
```

**Docker containers not running**
```bash
ssh -i impostor-pem.pem ubuntu@<ip>

# Check logs
docker-compose -f ~/impostor/docker-compose.prod.yml logs

# Restart
docker-compose -f ~/impostor/docker-compose.prod.yml restart
```

### SSL Certificate Issues

**HTTPS shows warning**
- Clear browser cache
- Wait for DNS propagation
- Try incognito mode

**Certificate renewal**
```bash
ssh -i impostor-pem.pem ubuntu@<ip>
sudo certbot renew
```

## Cleanup

### Destroy All Resources

```bash
cd terraform

terraform destroy
# Type 'yes' to confirm
# Removes EC2, VPC, Security Groups, IAM roles
# Keeps ECR images (ECR repos not destroyed by default)
```

### Manual Cleanup

```bash
# Delete ECR images
aws ecr batch-delete-image --repository-name impostor-backend \
  --region eu-north-1 --image-ids imageTag=latest

aws ecr batch-delete-image --repository-name impostor-frontend \
  --region eu-north-1 --image-ids imageTag=latest

# Delete ECR repos
aws ecr delete-repository --repository-name impostor-backend --region eu-north-1
aws ecr delete-repository --repository-name impostor-frontend --region eu-north-1

# Clean Terraform state
cd terraform
rm -rf terraform.tfstate* .terraform .terraform.lock.hcl
```

## Environment Variables

Store credentials securely (don't commit):

```bash
# ~/.aws/credentials
[default]
aws_access_key_id = YOUR_KEY
aws_secret_access_key = YOUR_SECRET

# Or environment
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="eu-north-1"
```

## Production Considerations

### Current Setup (Dev)
- Self-signed certs → Let's Encrypt (manual setup)
- SQLite → Consider RDS for persistence
- Single instance → Consider load balancer
- Manual backups → Consider automated snapshots

### To Improve

1. **State Management**
   ```bash
   # Move state to S3 + DynamoDB
   terraform {
     backend "s3" {
       bucket = "your-bucket"
       key    = "impostor/terraform.tfstate"
       dynamodb_table = "terraform-lock"
       region = "eu-north-1"
     }
   }
   ```

2. **Auto-scaling**
   - Use Auto Scaling Groups
   - Add CloudWatch alarms
   - Setup SNS notifications

3. **Database**
   - Migrate from SQLite to RDS
   - Enable automated backups
   - Multi-AZ deployment

4. **Monitoring**
   - CloudWatch logs
   - Application Performance Monitoring
   - Error tracking

## Support

See [DEPLOYMENT_COMMANDS.md](./DEPLOYMENT_COMMANDS.md) for all CLI commands.

For more help:
- Terraform: https://www.terraform.io/docs
- AWS: https://docs.aws.amazon.com/
- Certbot: https://certbot.eff.org/

