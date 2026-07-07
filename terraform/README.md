# Impostor App - Terraform AWS Deployment

Deploy Impostor to AWS EC2 with Docker, Certbot SSL, and automated Let's Encrypt renewal.

## Prerequisites

1. **AWS Account** with credentials configured
   ```bash
   aws configure
   ```

2. **Terraform installed** (v1.0+)
   ```bash
   terraform version
   ```

3. **EC2 Key Pair created in AWS**
   ```bash
   aws ec2 create-key-pair --key-name impostor-key --region us-east-1 > impostor-key.pem
   chmod 400 impostor-key.pem
   ```

4. **GitHub repository** pushed and public (or use deploy key)

5. **Domain DNS records** pointing to the instance (after deployment, see outputs)

## Setup

### 1. Update terraform.tfvars

Edit `terraform.tfvars` with your values:
- `domain` = your domain (e.g., blind-clue.xyz)
- `key_pair_name` = AWS key pair name from step 3
- `github_repo` = your repo URL
- `aws_region` = desired region (default: us-east-1)

### 2. Initialize Terraform

```bash
cd terraform
terraform init
```

### 3. Review Plan

```bash
terraform plan
```

Shows what will be created (EC2, security group, elastic IP).

### 4. Deploy

```bash
terraform apply
```

Review output, type `yes` to confirm.

**Deployment takes 5-10 minutes** (cert generation + Docker build).

## After Deploy

### Get Instance Info

```bash
terraform output instance_public_ip
terraform output ssh_command
```

### Verify Deployment

SSH into instance:
```bash
ssh -i impostor-key.pem ubuntu@<IP>
```

Check logs:
```bash
tail -f /var/log/user-data.log
docker-compose -f ~/impostor/docker-compose.prod.yml logs -f
```

### Point DNS to Instance

Update your domain DNS records to point to the elastic IP:
```bash
terraform output instance_public_ip
```

Visit `https://blind-clue.xyz` after DNS propagates (5-30 min).

## SSL Certificates

Managed by **Certbot** (Let's Encrypt):
- **Location**: `/home/ubuntu/certs/`
- **Auto-renewal**: Cron job runs daily at 3 AM UTC
- **Manual renewal**: `sudo certbot renew`

## Troubleshooting
where 
### Check user-data logs
```bash
ssh -i impostor-key.pem ubuntu@<IP> tail -f /var/log/user-data.log
```

### Docker Compose issues
```bash
ssh -i impostor-key.pem ubuntu@<IP>
cd ~/impostor
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
```

### Certbot issues
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## Destroy

Remove all resources:
```bash
terraform destroy
```

Type `yes` to confirm.

## Files

- `main.tf` — EC2, security groups, EIP
- `variables.tf` — Input variables
- `outputs.tf` — Output values
- `terraform.tfvars` — Your configuration
- `user-data.sh` — EC2 provisioning script
- `terraform.tfstate` — Local state (don't commit)

## Next Steps (Production)

For team/multi-dev deployments:
1. Store state in S3 + DynamoDB lock
2. Use GitHub Actions for automated deploys
3. Add CloudWatch monitoring
4. Consider RDS for database persistence
