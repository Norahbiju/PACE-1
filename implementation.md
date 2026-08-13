# PACE PROFILE Implementation Plan

## Current Workspace Context

- Root workspace: `C:\Users\307435\Candidate Filter`
- Existing assets:
  - `ust-global-vector-logo-2022.svg` for the UST emblem
  - `MASTER_Custom_DevOps_Skills.xlsx`
  - `PACE DevOps Skills Baseline Profile(1-1).xlsx`
- The folder is not currently a Git checkout. The target repository is `https://github.com/Norahbiju/PACE-1.git`.
- The application will be built as a monolithic Next.js single page application inside the root `app` folder.
- Root-level documentation and automation folders will be created after approval:
  - `AGENTS.md`
  - `.github/instructions/`
  - `.github/workflows/`
  - `infra/`

## Goal

Build a single-stack Next.js application named PACE PROFILE that serves the frontend and backend together. The app will display employees in a paginated dashboard, support instant multi-select filtering backed by DynamoDB, expose employee 360 views in a large modal, and include infrastructure plus GitHub Actions workflows for EC2 deployment, Terraform lifecycle, and DynamoDB seeding without duplicates.

## Application Architecture

1. Create a Next.js app in `app/`.
2. Use the App Router with API routes in the same Next.js project.
3. Use DynamoDB as the persistent database.
4. Keep the frontend and backend deployed as one Node.js process on EC2.
5. Use server-side API routes for:
   - employee listing
   - filter metadata
   - employee detail
   - health check
6. Use client-side state to watch filters and fetch updated employee results immediately when filters change.
7. Use pagination with 20 employees per page.

## Proposed Tech Stack

- Next.js with TypeScript
- React client components for dashboard/filter interactions
- AWS SDK v3 for DynamoDB
- Terraform for AWS infrastructure
- GitHub Actions workflow dispatch for:
  - Terraform plan/apply/destroy
  - seed DynamoDB
  - deploy application to EC2
- CSS Modules or global CSS scoped through Next.js, keeping the UI simple and maintainable

## Data Model

### Uploaded Workbook Schemas

The uploaded Excel files are the source of truth for the seed/import schema. Python is not required to inspect or process them; implementation can parse `.xlsx` files directly from OpenXML/ZIP XML, or use a Node.js package such as `xlsx` inside the Next.js project.

`MASTER_Custom_DevOps_Skills.xlsx` contains:

- Sheet `Skills by Category`, range `A1:F144`
  - `Skill ID`
  - `Skill Name`
  - `Category`
  - `Skill Group`
  - `Rating Scale`
  - `Notes`
- Sheet `Categories Reference`, range `A1:C15`
  - `Category`
  - `Description`
  - `Skills Count`
- Sheet `Rating Scale Reference`, range `A1:C6`
  - `Rating`
  - `Description`
  - `Example`

`PACE DevOps Skills Baseline Profile(1-1).xlsx` contains:

- Sheet `Sheet1`
- Table `Table1`, range `A1:CR2`
- 96 columns:
  - `ID`
  - `Start time`
  - `Completion time`
  - `Email`
  - `Name`
  - `Last modified time`
  - `Enter your Employee ID`
  - `Have you worked with any skills in the Cloud category?`
  - `AWS CloudFormation`
  - `Chef`
  - `OpenStack`
  - `Puppet`
  - `Azure ARM Templates`
  - `Packer`
  - `Have you worked with any skills in the SCM category?`
  - `Git`
  - `GitHub`
  - `TFS/VTVS`
  - `Bitbucket`
  - `AWS CodeCommit`
  - `Azure Repos`
  - `Google Cloud Source Repositories`
  - `Have you worked with any skills in the Containerization category?`
  - `Kubernetes (Classic)`
  - `ECR/EKS (AWS)`
  - `ACS/AKS (Azure)`
  - `Mesos`
  - `GCE/GKE (Google)`
  - `Have you worked with any skills in the Build Management category?`
  - `Maven (Java)`
  - `MSBuild (.NET)`
  - `AWS CodeBuild`
  - `ANT`
  - `BuildMaster`
  - `UrbanCode Build`
  - `Build Concepts`
  - `Have you worked with any skills in the Continuous Integration category?`
  - `Maven (Java) CI`
  - `Jenkins`
  - `AWS CodePipeline`
  - `Azure DevOps`
  - `Bamboo`
  - `TeamCity`
  - `Google Cloud Build CI/CD`
  - `Have you worked with any skills in the Repo Management category?`
  - `Nexus`
  - `Artifactory`
  - `NuGet`
  - `Have you worked with any skills in the Testing & QA category?`
  - `Mockito`
  - `TestNG`
  - `Selenium`
  - `Cucumber`
  - `JUnit`
  - `JMeter`
  - `Statement 2`
  - `Have you worked with any skills in the Deployment Automation category?`
  - `AWS CodeDeploy`
  - `Octopus Deploy`
  - `Go`
  - `UrbanCode Deploy`
  - `Have you worked with any skills in the Monitoring & Analysis category?`
  - `Grafana`
  - `AWS CloudWatch / CloudTrail`
  - `Azure Monitor / Application Insights`
  - `New Relic`
  - `Nagios`
  - `Splunk`
  - `Graphite`
  - `Elasticsearch, Logstash, Kibana (ELK)`
  - `Have you worked with any skills in the Security category?`
  - `Application Security Concepts`
  - `CyberArk`
  - `AWS Secrets Manager`
  - `Azure Key Vault`
  - `GCP Secret Manager`
  - `Have you worked with any skills in the Consulting category?`
  - `Assessments`
  - `Due Diligence`
  - `Solution Design & Architecture`
  - `Process Mapping`
  - `Pre-Sales`
  - `Other Consulting Skills`
  - `Have you worked with any skills in the Programming category?`
  - `Java / J2EE`
  - `.NET / C# / C++`
  - `Groovy`
  - `Python`
  - `Other Programming Skills`
  - `Have you worked with any skills in the Backend category?`
  - `Databases`
  - `Other Backend Skills`
  - `Have you worked with any skills in the Scripting category?`
  - `PowerShell Scripting`
  - `Linux & Windows Shell Scripting`
  - `Other Scripting Skills`

The sample profile row uses proficiency values including:

- `Not used`
- `Beginner`
- `Working`
- `Advanced`
- `Expert`
- `Mastery`

Implementation should preserve these text values from the baseline profile and map them to numeric sort/filter levels only as a derived field.

### Employee Record

Each employee item in DynamoDB should support at least:

- `employeeId`
- `name`
- `role`
- `location`
- `yearsOfExperience`
- `certifications`
- `skills`
- `profileSummary`
- `projectExperience`
- `contact`
- `lastUpdatedAt`

### Skill Record Shape

Each skill should include:

- `category`
- `skill`
- `ratingLabel`, preserving the workbook value such as `Working`, `Expert`, or `Mastery`
- `ratingLevel`, derived for filtering/sorting when useful

The rating template will be derived from the uploaded Excel files. If the workbook only contains a small sample set, implementation will replicate realistic employees from the sample while keeping generated `employeeId` values deterministic to avoid duplicate seeding.

### Required Filter Categories

The filter tree will include:

- Cloud
- SCM
- Containerization
- Build Management
- Continuous Integration
- Repo Management
- Testing & QA
- Deployment Automation
- Monitoring & Analysis
- Security
- Consulting
- Programming
- Backend
- Scripting
- Years of experience
- Location
- Certifications

### Required Filter Values

Locations:

- Trivandrum
- Kochi
- Bangalore
- Hyderabad
- Pune
- Chennai
- US
- GB

Years of experience:

- 0 through 10+

Certifications:

- GH-200
- GH-100
- GH-600
- TERRAFORM
- CKA
- Empty/no certification

## UI Layout

### UI Reference Images

The implementation should consider both uploaded UI references:

- The full dashboard screenshot is the primary layout reference for topbar, sidebar, attached filter panel, scrollable results area, spacing, and overall SaaS dashboard feel.
- The small collapse/expand button image is the direct reference for the sidebar/filter collapse affordance. The implementation should recreate that interaction pattern: a compact vertical control at the sidebar/filter boundary, with a left arrow when expanded and a corresponding expand state when collapsed.

The UI should adapt the reference images to PACE PROFILE requirements instead of copying unrelated sample elements. The search bar, extra sidebar menu items, catalog tabs, and data-catalog branding from the screenshot must not be included.

### Topbar

- Fixed top horizontal bar.
- Background color: `#006e74`.
- Left side: UST emblem from root SVG asset.
- Center: heading `PACE PROFILE`.
- No search button.

### Sidebar

- Background color: `#000000`.
- Expanded by default.
- Contains only `Dashboard`.
- Includes collapse/expand control matching the attached visual direction.
- When Dashboard is selected, the filter panel is attached to the right side of the sidebar.

### Filter Panel

- Background color: `#fafafa`.
- Open by default.
- Scrollable.
- Collapsible with a button at the top-right edge near the sidebar/filter boundary.
- Shows active-filter indication even when collapsed.
- Contains expandable/collapsible categories and subcategories.
- Supports multi-select at every level.
- Parent category behavior:
  - Selecting a parent selects all its child filters.
  - Deselecting a child leaves the parent active only if at least one child remains selected.
  - Selecting one child activates the parent without selecting sibling children.
- Skill rating behavior:
  - Ratings remain hidden/disabled until the user expands the rating section for a selected skill.
  - Ratings can further narrow matching employees.
- Bottom reset button:
  - Opens confirmation modal.
  - Confirm resets all filters to disabled.
  - Cancel keeps current filters.

### Dashboard

- Background color: `#d7e0e3`.
- Default view is a table.
- Employees are sorted alphabetically by name.
- Each row shows at least:
  - employee name
  - company role
  - visible fields that correspond to available filters, following the filtering rule that users should only filter by data represented in the UI
- Results refresh immediately when filters change.
- Pagination shows 20 employees at a time.
- Main results area is scrollable.

### Employee 360 Modal

- Every employee row is clickable.
- Opens an 80% viewport modal.
- Modal is scrollable.
- Close button appears at top-right.
- Clicking outside the modal closes it.
- Displays full employee profile, skills, ratings, certifications, experience, location, and any available sample-data details.

## Filtering Behavior

1. On first load, all filters are disabled and all employees are visible.
2. Any filter change updates the client-side filter state.
3. The dashboard immediately calls the employee listing API with the new filters.
4. The API queries DynamoDB and returns matching employees.
5. Results replace the table contents in place.
6. Pagination resets to page 1 after filter changes.
7. Active filter count is visible.
8. Reset clears all filter state after confirmation.

## Backend API Plan

### `GET /api/health`

Returns application and DynamoDB connectivity status.

### `GET /api/filters`

Returns normalized filter tree:

- categories
- subcategories
- skill ratings
- locations
- years of experience
- certifications

### `GET /api/employees`

Query parameters:

- `page`
- `pageSize`
- `categories`
- `skills`
- `ratings`
- `locations`
- `experience`
- `certifications`

Returns:

- `items`
- `page`
- `pageSize`
- `total`
- `totalPages`
- `activeFilters`

### `GET /api/employees/[employeeId]`

Returns full employee 360 profile.

## DynamoDB Plan

### Tables

Use one main table:

- `pace-employees`

Recommended keys:

- Partition key: `employeeId`

Recommended attributes:

- `nameNormalized`
- `role`
- `location`
- `yearsOfExperience`
- `certifications`
- `skills`
- `searchFacets`

For the initial implementation, filtering can use scan plus filter logic because the dataset is expected to be moderate. If the dataset grows, add denormalized GSI patterns by location, category, skill, and certification.

### Duplicate Prevention

The seed workflow must:

1. Read and normalize Excel source data.
2. Generate stable employee IDs from source identity fields.
3. Check existing DynamoDB records by `employeeId`.
4. Insert only missing records.
5. Update changed records only if the normalized payload differs.
6. Print a summary:
   - inserted count
   - updated count
   - skipped duplicate count
   - failed count

## Seed Data Plan

1. Add a seed script under `app/scripts/`.
2. Read both uploaded Excel workbooks using Node.js tooling or direct OpenXML parsing; Python is not a dependency.
3. Use the exact schemas listed above as the import contract.
4. Normalize categories, skills, ratings, employee sample data, locations, years of experience, and certifications.
5. Preserve source workbook columns in a `sourceProfile` object for traceability.
6. Convert skill columns into structured employee skill records.
7. Map category yes/no columns to parent category availability.
8. Fill missing requested categories if absent from sample files.
9. Replicate additional sample employees deterministically from available sample data.
10. Keep generated data realistic and alphabetically sortable.
11. Validate no duplicate `employeeId` values before writing to DynamoDB.
12. Use GitHub OIDC role assumption in workflows; do not use long-lived AWS access-key secrets.

## Infrastructure Plan

Create root folder `infra/` containing:

- Terraform files for AWS resources
- EC2 bootstrap script
- application service setup script
- deployment notes

### Terraform Resources

Provision:

- EC2 instance
- Security group exposing:
  - HTTP app port, default `80`
  - no SSH port
  - no public app internal port
- IAM role/profile for EC2 to access DynamoDB and AWS Systems Manager
- DynamoDB table
- no Elastic IP by default

Terraform outputs:

- public IP
- public URL
- DynamoDB table name
- EC2 instance ID

### Bootstrap Script

The EC2 bootstrap should:

1. Install Node.js LTS.
2. Install Git.
3. Clone or pull the repo.
4. Install app dependencies.
5. Build the Next.js app.
6. Configure environment variables.
7. Run the app as a systemd service.
8. Expose the app through public IP.
9. Enable AWS Systems Manager agent for no-SSH deployment.

## GitHub Actions Plan

Create workflow dispatch files under `.github/workflows/` after approval.

### `terraform.yml`

Manual input:

- `action`: `plan`, `apply`, or `destroy`

Responsibilities:

- assume AWS IAM role through GitHub OIDC
- initialize Terraform
- run selected action
- expose Terraform outputs in workflow logs

### `seed-dynamodb.yml`

Manual workflow:

- install app dependencies
- assume AWS IAM role through GitHub OIDC
- run seed script
- verify duplicates are not inserted
- print seed summary

### `deploy-ec2.yml`

Manual workflow:

- assume AWS IAM role through GitHub OIDC
- trigger EC2 deployment through AWS Systems Manager Run Command
- pull latest code
- install dependencies
- build app
- restart systemd service
- print public URL

## Required GitHub Secrets And Variables

### Required Secret

- `AWS_GITHUB_OIDC_ROLE_ARN`

### Required Variables

- `AWS_REGION`
- `EC2_INSTANCE_ID`

### Recommended Variables

- `DYNAMODB_TABLE_NAME`
- `EC2_INSTANCE_TYPE`
- `APP_PORT`
- `NEXT_PUBLIC_APP_NAME`

### Optional Variables

- `TERRAFORM_STATE_BUCKET`
- `TERRAFORM_LOCK_TABLE`
- `EC2_AMI_ID`
- `USE_ELASTIC_IP`

## Documentation And Agent Instruction Plan

After this implementation plan is approved, create:

- `AGENTS.md`
- `.github/instructions/side.instruction.md`
- `.github/instructions/topbar.instruction.md`
- `.github/instructions/filter.instruction.md`
- `.github/instructions/dashboard.instructions.md`

### `AGENTS.md`

Will include:

- application context
- architectural guardrails
- folder expectations
- monolithic Next.js requirement
- DynamoDB requirement
- EC2/Terraform/GitHub Actions expectations
- instruction that future agents must load relevant `.github/instructions/*` files before modifying the related area
- instruction that `AGENTS.md` and relevant instruction files must be updated whenever the application behavior or guardrails change

### Component Instruction Files

Each instruction file will document approved behavior, restrictions, styling, and expected implementation patterns for its area:

- topbar
- sidebar
- filter panel
- dashboard

## Implementation Phases After Approval

### Phase 1: Repository And App Setup

1. Confirm whether to clone `PACE-1` into the workspace or initialize from the current folder.
2. Create `app/` Next.js project.
3. Add TypeScript, linting, and base scripts.
4. Move/copy UST SVG into the app public assets.

### Phase 2: Documentation Guardrails

1. Create `AGENTS.md`.
2. Create `.github/instructions/` files.
3. Cross-link instruction files from `AGENTS.md`.

### Phase 3: UI Shell

1. Build topbar.
2. Build sidebar.
3. Build collapsible filter panel.
4. Build dashboard table shell.
5. Match requested colors and attached layout direction.

### Phase 4: Filter Tree And State

1. Implement expandable/collapsible category tree.
2. Implement parent/child multi-select behavior.
3. Implement skill rating expansion behavior.
4. Implement active filter count.
5. Implement reset confirmation.

### Phase 5: Backend APIs

1. Add DynamoDB client.
2. Add filter metadata API.
3. Add employees list API.
4. Add employee detail API.
5. Add health API.

### Phase 6: Data Seeding

1. Parse Excel files.
2. Normalize skills and employees.
3. Generate additional sample employees.
4. Add duplicate prevention.
5. Add local and GitHub Action seed commands.

### Phase 7: Employee 360 Modal

1. Make employee rows clickable.
2. Add 80% viewport modal.
3. Add outside-click close.
4. Add scrollable full profile details.

### Phase 8: Infrastructure

1. Add Terraform.
2. Add bootstrap scripts.
3. Add systemd service setup.
4. Add Terraform outputs for public IP and URL.

### Phase 9: GitHub Actions

1. Add Terraform workflow dispatch.
2. Add DynamoDB seed workflow dispatch.
3. Add EC2 deploy workflow dispatch.

### Phase 10: Verification

1. Run local build.
2. Run lint/type checks.
3. Verify first-load state has all filters disabled.
4. Verify employee list is alphabetically sorted.
5. Verify pagination shows 20 employees.
6. Verify filter changes refresh results immediately.
7. Verify reset confirmation.
8. Verify modal close button and outside-click close.
9. Verify Terraform plan.
10. Verify seed duplicate prevention logic.

## Open Decisions For Approval

Approved decisions:

1. Build locally first, then connect to the GitHub repository and push later.
2. Use the EC2 public IP assigned at launch. Do not create an Elastic IP by default.
3. SSH has been removed from the deployment path. GitHub Actions will use AWS OIDC and SSM Run Command instead of SSH.
4. Generate sample data targeting 50 employees.

Implementation note: no SSH private key, EC2 key pair, or `ALLOWED_SSH_CIDR` variable is required after the OIDC/SSM change.

## Approval Gate

Implementation will not begin until this plan is approved. After approval, the first implementation step will be creating the documentation guardrails and project structure exactly as described above.
