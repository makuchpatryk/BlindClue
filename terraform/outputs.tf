output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.impostor.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.impostor.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.impostor.public_dns
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.impostor.id
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i /path/to/key.pem ubuntu@${aws_eip.impostor.public_ip}"
}

output "app_url" {
  description = "Application URL"
  value       = "https://${var.domain}"
}

output "post_deploy_instructions" {
  description = "Post-deployment setup instructions"
  value       = <<-EOT

    ===================================
    POST-DEPLOYMENT SETUP
    ===================================

    1. Point DNS:
       Update blind-clue.xyz A record to: ${aws_eip.impostor.public_ip}
       Wait 5-10 minutes for propagation

    2. Setup SSL certificate:
       cd terraform
       chmod +x post-deploy.sh
       ./post-deploy.sh blind-clue.xyz ${aws_eip.impostor.public_ip}

    3. Verify:
       curl https://blind-clue.xyz
       Or visit: https://blind-clue.xyz

    ===================================
  EOT
}

output "post_deploy_ssh" {
  description = "SSH command for manual setup (if needed)"
  value       = "ssh -i impostor-pem.pem ubuntu@${aws_eip.impostor.public_ip}"
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}
