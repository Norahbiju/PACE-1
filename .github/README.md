# GitHub Automation

Manual workflows:

- `Terraform`: runs Terraform `plan`, `apply`, or `destroy`.
- `Seed DynamoDB`: loads 50 deterministic employee records without duplicate inserts.
- `Deploy EC2`: pulls the repo on EC2, installs dependencies, builds, and restarts the service.

## Required Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `EC2_SSH_PRIVATE_KEY`

## Required Variables

- `AWS_REGION`
- `EC2_KEY_NAME`
- `EC2_PUBLIC_IP`

## Recommended Variables

- `DYNAMODB_TABLE_NAME`
- `ALLOWED_SSH_CIDR`
- `EC2_USER`

Approved default for `ALLOWED_SSH_CIDR` is `0.0.0.0/0`.
