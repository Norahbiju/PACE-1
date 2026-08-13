# PACE PROFILE Infrastructure

This folder provisions the DynamoDB table, EC2 instance, IAM role, security group, and bootstrap setup for the monolithic Next.js app.

Approved defaults:

- EC2 uses the public IP assigned at launch.
- No Elastic IP is created by default.
- SSH is not used.
- Port `22` is not opened.
- EC2 deploys through AWS Systems Manager Run Command.
- App is proxied through Nginx on port `80`.

## One-time GitHub OIDC Setup

Run this from a machine that already has AWS CLI authenticated with permission to create IAM roles and OIDC providers:

```powershell
.\create-github-oidc-role.ps1 -AwsRegion us-east-1
```

The script prints the IAM role ARN. Add it to GitHub Secrets as:

```text
AWS_GITHUB_OIDC_ROLE_ARN
```

Common command examples:

```bash
terraform init
terraform plan
terraform apply
terraform destroy
```
