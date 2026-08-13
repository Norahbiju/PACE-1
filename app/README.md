# PACE PROFILE App

This folder contains the monolithic Next.js frontend and backend.

## Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run seed
```

## Environment

Copy `.env.example` to `.env.local` for local development.

Required for DynamoDB-backed operation:

- `AWS_REGION`
- `DYNAMODB_TABLE_NAME`

Optional:

- `USE_SAMPLE_DATA=true` to force the built-in 50 employee sample set.

Without AWS environment variables, API routes fall back to sample data so the UI can still load locally.
