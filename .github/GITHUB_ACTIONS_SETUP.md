# GitHub Actions CI/CD Setup

Automated deployment workflow: Push code → Build images → Push to ECR → Deploy to EC2.

## Prerequisites

- GitHub repository (public or private)
- AWS account with IAM permissions
- EC2 instance deployed via Terraform

## Setup Steps

### Step 1: Create IAM Role for GitHub Actions

**Via AWS Console:**

1. Go to IAM → Roles → Create Role
2. Select "Custom trust policy"
3. Paste this policy (replace `YOUR-GITHUB-ORG` and `YOUR-REPO`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::719982590319:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:makuchpatryk/impostor:*"
        }
      }
    }
  ]
}
```

**Or via CLI:**

```bash
# Create OIDC provider (one-time)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# Create role
aws iam create-role --role-name github-actions-impostor \
  --assume-role-policy-document file://trust-policy.json
```

### Step 2: Attach Permissions to Role

Attach inline policy for ECR + EC2 access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:eu-north-1:719982590319:repository/impostor-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

**Via CLI:**

```bash
aws iam put-role-policy --role-name github-actions-impostor \
  --policy-name impostor-ecr-policy \
  --policy-document file://permissions.json
```

### Step 3: Add GitHub Secrets

Go to GitHub → Settings → Secrets and variables → Actions

**Add these secrets:**

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | `arn:aws:iam::719982590319:role/github-actions-impostor` |
| `AWS_ACCOUNT_ID` | `719982590319` |
| `EC2_SSH_KEY` | Contents of `impostor-pem.pem` (entire file) |

**Steps:**

1. Get role ARN:
   ```bash
   aws iam get-role --role-name github-actions-impostor \
     --query 'Role.Arn' --output text
   ```

2. Get SSH key content:
   ```bash
   cat impostor-pem.pem
   # Copy the entire content
   ```

3. Add to GitHub:
   - Click "New repository secret"
   - Name: `AWS_ROLE_ARN`
   - Value: (paste ARN)
   - Repeat for other secrets

### Step 4: Update Workflow File

The workflow is already set up in `.github/workflows/deploy.yml`

Verify these values match your setup:
```yaml
AWS_REGION: eu-north-1
AWS_ACCOUNT_ID: 719982590319
```

## Usage

### Manual Deploy (on demand)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "feat: update feature"
   git push origin main
   ```

2. **Trigger deployment manually**
   - Go to GitHub → Actions
   - Click "Build & Deploy to AWS ECR"
   - Click "Run workflow"
   - Select branch (usually main)
   - Click "Run workflow"

3. **Workflow runs:**
   - Builds backend + frontend images
   - Pushes to ECR
   - Deploys to EC2 instance

**Why manual?** Safer control — review changes before deploying.

## Workflow Details

### Build Stage

- Checks out code
- Builds backend Docker image
- Builds frontend Docker image
- Pushes to ECR (only on main push)

### Deploy Stage (main only)

- Gets EC2 instance IP
- SSHes into instance
- Logs into ECR
- Pulls latest images
- Restarts Docker containers
- Verifies deployment

## Troubleshooting

### Workflow fails with "Role not found"

**Error:** `InvalidParameterException: Invalid principal in policy`

**Fix:**
1. Verify IAM role exists: `aws iam get-role --role-name github-actions-impostor`
2. Verify OIDC provider: `aws iam list-open-id-connect-providers`
3. Update `AWS_ROLE_ARN` secret with correct ARN

### Docker build fails

**Error:** `failed to build: solve: rpc error`

**Fix:**
- Increase Docker build timeout in Actions settings
- Check Dockerfile syntax locally: `docker build -f packages/backend/Dockerfile.prod .`

### SSH deployment fails

**Error:** `Permission denied (publickey)`

**Fix:**
1. Verify EC2_SSH_KEY secret contains full PEM content
2. Check key pair matches instance: `ssh -i impostor-pem.pem ubuntu@<ip>`
3. Verify instance is running and has public IP

### ECR push fails

**Error:** `access denied`

**Fix:**
1. Verify AWS_ROLE_ARN has ECR permissions
2. Check ECR repositories exist:
   ```bash
   aws ecr describe-repositories --region eu-north-1
   ```
3. Re-create repositories if needed:
   ```bash
   aws ecr create-repository --repository-name impostor-backend --region eu-north-1
   aws ecr create-repository --repository-name impostor-frontend --region eu-north-1
   ```

## Monitoring

### View Workflow Runs

GitHub → Actions → "Build & Deploy to AWS ECR" → See all runs

### Check Logs

Click on workflow run → See step details and logs

### Debugging

Add debug output to workflow:
```yaml
- name: Debug
  run: |
    echo "Commit: ${{ github.sha }}"
    echo "Branch: ${{ github.ref }}"
    echo "Event: ${{ github.event_name }}"
```

## Cost Considerations

### GitHub Actions

- **Free tier:** 2,000 minutes/month on shared runners
- This project: ~5 min per deployment
- 200+ deployments/month before hitting limits

### AWS

- **ECR:** ~$0.10/GB storage/month
- **Data transfer:** Free (EC2 in same region)
- **EC2:** Standard t3.micro pricing

## Next: Monitoring & Notifications

Consider adding:

```yaml
- name: Slack Notification
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Impostor deployment: ${{ job.status }}"
      }
```

## Cleanup

To stop using GitHub Actions:

1. Delete `.github/workflows/deploy.yml`
2. Delete secrets from GitHub
3. Delete IAM role from AWS:
   ```bash
   aws iam delete-role-policy --role-name github-actions-impostor \
     --policy-name impostor-ecr-policy
   aws iam delete-role --role-name github-actions-impostor
   ```

