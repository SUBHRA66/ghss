# GHSS

GHSS is a modular, microservice-based application built as a monorepo.

The project is organized into independent backend services, frontend applications, shared packages, and supporting scripts.

---

## Architecture

GHSS follows a microservice-oriented architecture.

```text
                         NGINX
                           │
              ┌────────────┴────────────┐
              │                         │
         Static Files              API Requests
              │                         │
              ▼                         ▼
        React Applications        NestJS Services
                                      │
                                      ▼
                               @ghss/database
                                      │
                                      ▼
                                  Prisma ORM
                                      │
                                      ▼
                                PostgreSQL
                                  database
                                    ghss
```

NGINX acts as the entry point for the application.

It is responsible for:

* Serving frontend static files
* Routing API requests to the appropriate backend service
* Acting as the external gateway for the different applications and services

---

## Repository Structure

```text
ghss/
│
├── apps/
│   ├── auth/                 # Authentication frontend
│   ├── dashboard/            # Main dashboard frontend
│   └── ...                   # Other React applications
│
├── services/
│   ├── auth/                 # Authentication backend
│   ├── users/                # User-related backend
│   ├── students/             # Student-related backend
│   └── ...                   # Other NestJS services
│
├── packages/
│   └── database/              # Centralized database layer
│
├── static/                    # Generated frontend static files
│
├── scripts/                   # Project automation and utility scripts
│
├── .env.example               # Environment variable template
├── .gitignore
├── package.json
└── package-lock.json
```

---

# Backend

The backend consists of multiple independent NestJS applications.

Each service is a separate application and can be developed, built, and run independently.

For example:

```text
services/
├── auth/
├── users/
└── students/
```

Although the services are separate applications, they share common infrastructure where appropriate.

---

# Database

GHSS uses a **single PostgreSQL database**.

```text
PostgreSQL
└── ghss
```

The database layer is centralized in:

```text
packages/database/
```

This package contains the project's Prisma schema, migrations, and shared Prisma/NestJS integration.

```text
packages/database/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── index.ts
│   ├── prisma.service.ts
│   └── prisma.module.ts
│
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## Prisma

Prisma is used as the ORM between the NestJS services and PostgreSQL.

```text
NestJS Service
      │
      ▼
@ghss/database
      │
      ▼
Prisma Client
      │
      ▼
PostgreSQL
```

The Prisma schema is located at:

```text
packages/database/prisma/schema.prisma
```

The migration history is located at:

```text
packages/database/prisma/migrations/
```

### Important

Prisma migrations are part of the source code and **must be committed to Git**.

They allow the database structure to be reproduced on another development machine.

---

# Development Environment

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL

Check the versions:

```bash
node --version
npm --version
psql --version
```

---

# Initial Setup

After cloning the repository:

```bash
git clone <repository-url>
cd ghss
```

Install all project dependencies:

```bash
npm install
```

GHSS uses npm workspaces to manage the monorepo.

The workspace includes:

```text
services/*
apps/*
packages/*
```

---

## Environment Variables

The project uses environment variables for configuration and secrets.

Create a local `.env` file from the provided example:

```bash
cp .env.example .env
```

Configure the PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ghss"
```

### Never commit `.env`

The actual `.env` file contains local credentials and must remain untracked.

Only `.env.example` should be committed.

---

# PostgreSQL Setup

Create the development database:

```bash
sudo -u postgres createdb ghss
```

Make sure PostgreSQL is running before using Prisma.

For example:

```bash
sudo systemctl start postgresql
```

Check its status:

```bash
sudo systemctl status postgresql
```

---

# Prisma Setup

The database package contains the Prisma configuration.

Move into the database package:

```bash
cd packages/database
```

Check Prisma:

```bash
npx prisma --version
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply existing migrations:

```bash
npx prisma migrate dev
```

Check migration status:

```bash
npx prisma migrate status
```

---

# Database Development Workflow

The normal workflow for changing the database is:

```text
Modify schema.prisma
        │
        ▼
Create migration
        │
        ▼
Apply migration
        │
        ▼
Generate Prisma Client
```

For example:

```bash
cd packages/database

npx prisma migrate dev --name add_student
npx prisma generate
```

The generated migration should be committed to Git.

---

# Working on Another Machine

The database itself is not stored in Git.

Instead, Git stores:

```text
schema.prisma
migrations/
```

On another development machine:

```text
Clone repository
       │
       ▼
npm install
       │
       ▼
Create PostgreSQL database
       │
       ▼
Configure .env
       │
       ▼
Run Prisma migrations
       │
       ▼
Database structure recreated
```

Example:

```bash
git clone <repository-url>
cd ghss

npm install

cp .env.example .env
# Configure DATABASE_URL

sudo -u postgres createdb ghss

cd packages/database
npx prisma migrate dev
npx prisma generate
```

This recreates the database **structure** from the migration history.

Development data is handled separately through the project's seed mechanism, which will be added later.

---

# Shared Database Package

The centralized database package is published internally as:

```text
@ghss/database
```

A NestJS service can consume it:

```ts
import { PrismaModule } from '@ghss/database';
```

The package exposes the shared database infrastructure while the NestJS services remain independent applications.

Conceptually:

```text
                 @ghss/database
                  /     |      \
                 /      |       \
                ▼       ▼        ▼
              Auth    Users    Students
                \       |        /
                 \      |       /
                  ▼     ▼      ▼
                     PostgreSQL
                         ghss
```

---

# Running Services

Each NestJS service can be run independently.

For example:

```bash
cd services/auth
npm run start:dev
```

Alternatively, from the project root:

```bash
npm run start:dev -w services/auth
```

The same pattern applies to other services.

---

# Running Frontend Applications

Frontend applications are located under:

```text
apps/
```

Each application is an independent React application.

The production builds are ultimately placed under:

```text
static/
```

and served by NGINX.

---

# Git Guidelines

The following should be committed:

```text
schema.prisma
prisma/migrations/
package.json
package-lock.json
TypeScript source
NestJS source
React source
configuration files
.env.example
```

The following should **not** be committed:

```text
node_modules/
dist/
build/
.env
*.log
coverage/
```

In particular:

> **Prisma migrations must be committed.**

They are required to reproduce the database structure on another machine.

---

# Current Technology Stack

| Component               | Technology     |
| ----------------------- | -------------- |
| Backend                 | NestJS         |
| Backend Runtime         | Node.js        |
| Frontend                | React          |
| Database                | PostgreSQL     |
| ORM                     | Prisma         |
| Package Manager         | npm            |
| Monorepo                | npm Workspaces |
| Reverse Proxy / Gateway | NGINX          |
| Language                | TypeScript     |

---

# Development Principles

GHSS follows a few architectural principles:

### Independent services

Each backend service is a separate NestJS application.

### Centralized database layer

The project uses a single PostgreSQL database with a centralized Prisma schema and database package.

### Logical data ownership

Although services use the same database infrastructure, domain responsibilities should remain separated between services.

### Reproducible development environments

Database structure is reproduced through version-controlled Prisma migrations rather than manually recreating tables.

### Secrets stay outside Git

Credentials and environment-specific configuration belong in `.env` or the deployment environment, not in source control.

---

# Project Status

The project is currently in the initial infrastructure and architecture setup phase.

Current foundations include:

* npm monorepo/workspaces
* NestJS backend services
* React applications
* PostgreSQL database
* Centralized Prisma database package
* Prisma migrations
* Shared `@ghss/database` package
* NGINX-based routing architecture

More application-specific services, database models, authentication, authorization, and frontend functionality will be added as development progresses.

