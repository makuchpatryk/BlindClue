# Pre-Deployment: Build & Push Docker Images to ECR

Before running `terraform apply`, build and push Docker images to AWS ECR.

## Prerequisites

- AWS credentials configured (`aws configure` or env vars)
- Docker installed locally
- Project at `/home/patryk/projects/impostor`

## Step 1: Get AWS Account ID

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo $ACCOUNT
# Output: 719982590319
```

## Step 2: Setup ECR Registry Variable

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.eu-north-1.amazonaws.com

echo $REGISTRY
# Output: 719982590319.dkr.ecr.eu-north-1.amazonaws.com
```

## Step 3: Login to ECR

```bash
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin $REGISTRY
# Output: Login Succeeded
```

## Step 4: Build Backend Image

```bash
cd /home/patryk/projects/impostor

docker build -f packages/backend/Dockerfile.prod -t $REGISTRY/impostor-backend:latest .

# Takes ~2-3 minutes
```

## Step 5: Push Backend Image

```bash
docker push $REGISTRY/impostor-backend:latest

# Takes ~1-2 minutes
```

## Step 6: Build Frontend Image

```bash
docker build -f packages/frontend/Dockerfile.prod -t $REGISTRY/impostor-frontend:latest .

# Takes ~5-10 minutes (compiles Vue/Vite)
```

## Step 7: Push Frontend Image

```bash
docker push $REGISTRY/impostor-frontend:latest

# Takes ~2-3 minutes
```

## Step 8: Verify Images in ECR

```bash
aws ecr describe-images --repository-name impostor-backend --region eu-north-1
aws ecr describe-images --repository-name impostor-frontend --region eu-north-1

# Should show latest tag with recent push date
```

## All-in-One Script

If you want to run all steps at once:

```bash
#!/bin/bash

cd /home/patryk/projects/impostor

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY=$ACCOUNT.dkr.ecr.eu-north-1.amazonaws.com

echo "Logging in to ECR..."
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin $REGISTRY

echo "Building backend..."
docker build -f packages/backend/Dockerfile.prod -t $REGISTRY/impostor-backend:latest .

echo "Pushing backend..."
docker push $REGISTRY/impostor-backend:latest

echo "Building frontend..."
docker build -f packages/frontend/Dockerfile.prod -t $REGISTRY/impostor-frontend:latest .

echo "Pushing frontend..."
docker push $REGISTRY/impostor-frontend:latest

echo "✓ Done! Images ready in ECR"

# Verify
aws ecr describe-images --repository-name impostor-backend --region eu-north-1 --query 'imageDetails[0].imagePushedAt'
aws ecr describe-images --repository-name impostor-frontend --region eu-north-1 --query 'imageDetails[0].imagePushedAt'
```

## Next: Terraform Deployment

Once images are pushed:

```bash
cd terraform

terraform init
terraform plan
terraform apply
```

Then follow [POST_DEPLOY.md](./POST_DEPLOY.md) to setup SSL.

## Troubleshooting

### "Could not authenticate"
```bash
# Reconfigure AWS
aws configure

# Or set env vars
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
```

### "Repository does not exist"
ECR repos are created by Terraform. If they don't exist:

```bash
aws ecr create-repository --repository-name impostor-backend --region eu-north-1
aws ecr create-repository --repository-name impostor-frontend --region eu-north-1
```

### Build Takes Too Long
Frontend builds can take 10+ minutes on slow connections. This is normal (Vue/Vite compilation).

To speed up:
- Use a faster internet connection
- Build in parallel (different terminals)
- Pre-stage dependencies locally before building

### Docker "No Space Left"
Clear Docker cache if running low on disk:

```bash
docker system prune -a
docker volume prune
```

## Image Information

After build, images contain:

**Backend:** Node.js + Fastify + SQLite driver + Socket.io
- Size: ~200-300 MB

**Frontend:** Nginx + Vue 3 compiled assets
- Size: ~100-150 MB

Both use Ubuntu 22.04 base image.

