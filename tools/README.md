# Development Tools

This directory contains development and setup tools for the Rodrise School Management System.

## Available Tools

### 1. create-test-user.ts
Creates a test admin user for development purposes.

**Usage:**
```bash
npx tsx tools/create-test-user.ts
```

**Default credentials:**
- Email: admin@rodrise.com
- Password: admin123

### 2. seed-data.ts
Seeds the database with initial data including schools, classes, fee types, etc.

**Usage:**
```bash
npx tsx tools/seed-data.ts
```

## Prerequisites

Before running these tools, make sure:
1. Your database is set up and running
2. Environment variables are configured in `.env`
3. Prisma client is generated (`npx prisma generate`)

## Notes

- These tools are for development purposes only
- They should not be run in production
- The tools directory is excluded from deployment builds
