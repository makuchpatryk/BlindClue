terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.50.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

# ECR repositories
resource "aws_ecr_repository" "backend" {
  name                 = "impostor-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = {
    Name = "impostor-backend"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "impostor-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = {
    Name = "impostor-frontend"
  }
}

# IAM role for EC2 to pull from ECR
resource "aws_iam_role" "ec2_ecr_role" {
  name = "impostor-ec2-ecr-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ec2_ecr_policy" {
  name = "impostor-ec2-ecr-policy"
  role = aws_iam_role.ec2_ecr_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "impostor-ec2-profile"
  role = aws_iam_role.ec2_ecr_role.name
}

resource "aws_vpc" "impostor" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "impostor-vpc"
  }
}

resource "aws_subnet" "impostor" {
  vpc_id            = aws_vpc.impostor.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "impostor-subnet"
  }
}

resource "aws_internet_gateway" "impostor" {
  vpc_id = aws_vpc.impostor.id

  tags = {
    Name = "impostor-igw"
  }
}

resource "aws_route_table" "impostor" {
  vpc_id = aws_vpc.impostor.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.impostor.id
  }

  tags = {
    Name = "impostor-rt"
  }
}

resource "aws_route_table_association" "impostor" {
  subnet_id      = aws_subnet.impostor.id
  route_table_id = aws_route_table.impostor.id
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "impostor" {
  name        = "impostor-sg"
  description = "Security group for Impostor app"
  vpc_id      = aws_vpc.impostor.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_cidr_blocks
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "impostor-sg"
  }
}

resource "aws_instance" "impostor" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.impostor.id
  vpc_security_group_ids = [aws_security_group.impostor.id]
  key_name               = var.key_pair_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
  }

  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    domain         = var.domain
    api_url        = "https://${var.domain}"
    socket_url     = "wss://${var.domain}"
    vite_url       = "https://${var.domain}"
    aws_region     = var.aws_region
    aws_account_id = data.aws_caller_identity.current.account_id
  }))

  associate_public_ip_address = true

  tags = {
    Name = "impostor-server"
  }

  depends_on = [aws_security_group.impostor]
}

resource "aws_eip" "impostor" {
  instance = aws_instance.impostor.id
  domain   = "vpc"

  tags = {
    Name = "impostor-eip"
  }

  depends_on = [aws_instance.impostor]
}