# PACE PROFILE Agent Guide

## Application Context

PACE PROFILE is a monolithic Next.js application for filtering and reviewing employee skill profiles. The application lives in the root `app/` folder and serves the frontend and backend together as one deployable stack.

The app must run as a single Node.js service on EC2 and use DynamoDB as the database. Data is seeded from the uploaded Excel workbooks, with deterministic generation for a 50 employee sample set and duplicate prevention during DynamoDB writes.

## Required Project Shape

- `app/`: Next.js application, including frontend UI, API routes, scripts, and app assets.
- `infra/`: Terraform, EC2 bootstrap, and service setup scripts.
- `.github/workflows/`: workflow dispatch automation for Terraform, seeding, and deployment.
- `.github/instructions/`: approved component-specific instructions.
- `implementation.md`: approved implementation plan and decision log.

## Guardrails

- Keep the application monolithic: frontend and backend remain inside the same Next.js app.
- Do not split the backend into a separate service.
- Use DynamoDB for persisted employee data.
- Keep the UST emblem in the topbar and the heading text exactly `PACE PROFILE`.
- Preserve workbook schema compatibility for the uploaded Excel files.
- Seed scripts must avoid duplicate DynamoDB entries.
- Default dashboard state shows all employees with all filters disabled.
- Dashboard rows must remain alphabetically sorted by employee name.
- Pagination must show 20 employees per page.
- Employee detail must open in an 80% viewport modal and close from the close button or outside click.
- If behavior, styling, or architecture changes, update this file and the relevant file under `.github/instructions/`.

## Instruction Loading

Before modifying a component area, read the related instruction file:

- Topbar: `.github/instructions/topbar.instruction.md`
- Sidebar: `.github/instructions/side.instruction.md`
- Filters: `.github/instructions/filter.instruction.md`
- Dashboard: `.github/instructions/dashboard.instructions.md`

Use these files as the approved source of truth for component behavior and constraints.

## Infrastructure Expectations

- Terraform should expose the application via the EC2 public IP assigned at launch.
- Do not create an Elastic IP by default.
- Do not use SSH for deployment.
- Do not require an EC2 SSH key pair or GitHub SSH private key secret.
- GitHub Actions must authenticate to AWS with GitHub OIDC and an IAM role.
- EC2 deployment must use AWS Systems Manager Run Command.
- GitHub Actions must support manual workflow dispatch for Terraform plan/apply/destroy, DynamoDB seeding, and EC2 deployment.

## Data Expectations

- `MASTER_Custom_DevOps_Skills.xlsx` is the source for skill/category/rating references.
- `PACE DevOps Skills Baseline Profile(1-1).xlsx` is the source for the baseline employee profile schema.
- Preserve original imported profile values in a traceable source profile structure.
- Skill labels such as `Not used`, `Beginner`, `Working`, `Advanced`, `Expert`, and `Mastery` must be preserved.
