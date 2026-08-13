# GitHub Automation

Manual workflows:

- `Terraform`: runs Terraform `plan`, `apply`, or `destroy`.
- `Seed DynamoDB`: loads 50 deterministic employee records without duplicate inserts.
- `Deploy EC2`: uses AWS Systems Manager Run Command, pulls the repo on EC2, installs dependencies, builds, and restarts the service.

## Required Secret

- `AWS_GITHUB_OIDC_ROLE_ARN`

## Required Variables

- `AWS_REGION`

## Recommended Variables

- `DYNAMODB_TABLE_NAME`
- `EC2_INSTANCE_ID`, required after Terraform apply before running Deploy EC2

No AWS access key secrets are used. No SSH private key secret is used.

## Setup Order

1. Run `infra/create-github-oidc-role.ps1` locally with AWS CLI authenticated through an admin-capable profile or SSO session.
2. Add the printed role ARN to GitHub Secrets as `AWS_GITHUB_OIDC_ROLE_ARN`.
3. Add `AWS_REGION` to GitHub Variables.
4. Run the `Terraform` workflow with `plan`.
5. Run the `Terraform` workflow with `apply`.
6. Copy Terraform output `ec2_instance_id` into GitHub Variables as `EC2_INSTANCE_ID`.
7. Run `Seed DynamoDB`.
8. Run `Deploy EC2`.
