# Impostor App - Terraform + ECR Deployment Commands

Complete command reference for deploying Impostor to AWS EC2 with Terraform and ECR.

## Prerequisites

### 1. Install Terraform
**Linux:**
```bash
TERRAFORM_VERSION=1.9.7
cd /tmp
wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip
unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip
sudo mv terraform /usr/local/bin/
terraform version
```

### 2. Install AWS CLI
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

### 3. Configure AWS Credentials
```bash
# Option A: Interactive
aws configure

# Option B: Environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="eu-north-1"

# Verify
aws sts get-caller-identity
```

## AWS Account Setup

### Get Account ID
```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo $ACCOUNT
```

### Create EC2 Key Pair
```bash
aws ec2 create-key-pair --key-name impostor-pem --region eu-north-1 > impostor-pem.pem
chmod 400 impostor-pem.pem
```

### List Available Key Pairs
```bash
aws ec2 describe-key-pairs --region eu-north-1
```

## ECR Setup

### Create ECR Repositories
```bash
aws ecr create-repository --repository-name impostor-backend --region eu-north-1
aws ecr create-repository --repository-name impostor-frontend --region eu-north-1
```

### Login to ECR
```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.eu-north-1.amazonaws.com

aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin $REGISTRY
```

## Build & Push Docker Images

### Navigate to Project Root
```bash
cd /home/patryk/projects/impostor
```

### Build Backend Image
```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.eu-north-1.amazonaws.com

docker build -f packages/backend/Dockerfile.prod -t $REGISTRY/impostor-backend:latest .
docker push $REGISTRY/impostor-backend:latest
```

### Build Frontend Image
```bash
docker build -f packages/frontend/Dockerfile.prod -t $REGISTRY/impostor-frontend:latest .
docker push $REGISTRY/impostor-frontend:latest
```

## Update docker-compose.prod.yml

Replace `build:` sections with `image:` entries:

```yaml
services:
  backend:
    image: 719982590319.dkr.ecr.eu-north-1.amazonaws.com/impostor-backend:latest
    container_name: impostor-backend
    # ... rest of config (no build: section)

  frontend:
    image: 719982590319.dkr.ecr.eu-north-1.amazonaws.com/impostor-frontend:latest
    container_name: impostor-frontend
    # ... rest of config (no build: section)
```

## Terraform Deployment

### Navigate to Terraform Directory
```bash
cd /home/patryk/projects/impostor/terraform
```

### Initialize Terraform
```bash
terraform init
```

### Verify Configuration
```bash
terraform validate
```

### Review Deployment Plan
```bash
terraform plan
```

### Deploy Infrastructure
```bash
terraform apply
# Type 'yes' to confirm
```

### Get Instance IP
```bash
terraform output instance_public_ip
IP=$(terraform output -raw instance_public_ip)
echo $IP
```

### Get All Outputs
```bash
terraform output
```

## Instance Verification

### SSH into Instance
```bash
ssh -i ../impostor-pem.pem ubuntu@$IP

# Or use the ssh_command output
terraform output ssh_command
```

### Check Deployment Logs (on instance)
```bash
tail -f /var/log/user-data.log
```

### List Docker Containers
```bash
docker-compose -f ~/impostor/docker-compose.prod.yml ps
```

### Check Container Logs
```bash
docker-compose -f ~/impostor/docker-compose.prod.yml logs -f backend
docker-compose -f ~/impostor/docker-compose.prod.yml logs -f frontend
```

## SSL Certificate Setup

### Option A: Let's Encrypt (requires DNS pointing to instance)

**1. Point DNS:**
- Update blind-clue.xyz A record to instance public IP
- Wait 5-10 minutes for propagation

**2. Get Certificate:**
```bash
ssh -i ../impostor-pem.pem ubuntu@$IP

sudo systemctl stop nginx
sudo certbot certonly --standalone --non-interactive --agree-tos --email admin@blind-clue.xyz -d blind-clue.xyz

sudo cp /etc/letsencrypt/live/blind-clue.xyz/fullchain.pem /home/ubuntu/certs/cert.pem
sudo cp /etc/letsencrypt/live/blind-clue.xyz/privkey.pem /home/ubuntu/certs/key.pem
sudo chown -R ubuntu:ubuntu /home/ubuntu/certs
```

### Option B: Self-Signed Certificate (temporary)
```bash
ssh -i ../impostor-pem.pem ubuntu@$IP

sudo mkdir -p /home/ubuntu/certs

sudo openssl req -x509 -newkey rsa:2048 -keyout /home/ubuntu/certs/key.pem -out /home/ubuntu/certs/cert.pem -days 365 -nodes \
  -subj "/CN=blind-clue.xyz"

sudo chown ubuntu:ubuntu /home/ubuntu/certs/*
```

## Docker Deployment (on instance)

### Login to ECR
```bash
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 719982590319.dkr.ecr.eu-north-1.amazonaws.com
```

### Pull Images
```bash
cd ~/impostor
docker-compose -f docker-compose.prod.yml pull
```

### Start Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Check Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart backend
```

## Testing

### Test HTTPS (from local machine)
```bash
IP=$(cd /home/patryk/projects/impostor/terraform && terraform output -raw instance_public_ip)

curl -k https://$IP
curl -k https://blind-clue.xyz
```

### Test HTTP (from instance)
```bash
ssh -i ../impostor-pem.pem ubuntu@$IP

curl http://localhost:3000/health  # Backend
curl -k https://localhost          # Frontend
```

## Cleanup & Destroy

### Destroy All Resources
```bash
cd /home/patryk/projects/impostor/terraform

terraform destroy
# Type 'yes' to confirm
```

### Clean Terraform State
```bash
rm -rf terraform.tfstate*
rm -rf .terraform
rm -rf .terraform.lock.hcl
```

### Delete EC2 Instance (manual)
```bash
aws ec2 terminate-instances --instance-ids <instance-id> --region eu-north-1
```

### Delete ECR Repositories
```bash
aws ecr batch-delete-image --repository-name impostor-backend --region eu-north-1 --image-ids imageTag=latest
aws ecr batch-delete-image --repository-name impostor-frontend --region eu-north-1 --image-ids imageTag=latest

aws ecr delete-repository --repository-name impostor-backend --region eu-north-1
aws ecr delete-repository --repository-name impostor-frontend --region eu-north-1
```

## Troubleshooting

### SSH Connection Denied
```bash
# Verify PEM file
head -1 impostor-pem.pem  # Should show: -----BEGIN RSA PRIVATE KEY-----

# Check instance state
aws ec2 describe-instances --region eu-north-1 --filters "Name=tag:Name,Values=impostor-server" --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]'

# Verify security group allows port 22
aws ec2 describe-security-groups --region eu-north-1 --filters "Name=tag:Name,Values=impostor-sg"
```

### Docker Pull Fails (No Auth)
```bash
# Re-login to ECR
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 719982590319.dkr.ecr.eu-north-1.amazonaws.com
```

### Container Won't Start
```bash
# Check logs
docker-compose -f ~/impostor/docker-compose.prod.yml logs

# Check if ports are in use
sudo netstat -tlnp | grep LISTEN

# Stop and restart
docker-compose -f ~/impostor/docker-compose.prod.yml down
docker-compose -f ~/impostor/docker-compose.prod.yml up -d
```

### Certbot Port 80 Already in Use
```bash
# Stop nginx/other services
sudo systemctl stop nginx
sudo killall nginx

# Retry Certbot
sudo certbot certonly --standalone --non-interactive --agree-tos --email admin@blind-clue.xyz -d blind-clue.xyz
```

## Environment Information

- **Region:** eu-north-1
- **Instance Type:** t3.micro
- **Domain:** blind-clue.xyz
- **Key Pair:** impostor-pem
- **Account ID:** 719982590319
- **Backend Port:** 3000
- **Frontend Ports:** 80, 443

