# PACE PROFILE Infrastructure

This folder provisions the DynamoDB table, EC2 instance, IAM role, security group, and bootstrap setup for the monolithic Next.js app.

Approved defaults:

- EC2 uses the public IP assigned at launch.
- No Elastic IP is created by default.
- SSH defaults to `0.0.0.0/0` through `allowed_ssh_cidr`.
- App is proxied through Nginx on port `80`.

Required Terraform variable:

- `ec2_key_name`

Common command examples:

```bash
terraform init
terraform plan -var="ec2_key_name=YOUR_KEY"
terraform apply -var="ec2_key_name=YOUR_KEY"
terraform destroy -var="ec2_key_name=YOUR_KEY"
```
