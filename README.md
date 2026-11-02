<div align="center">

![Node](https://img.shields.io/badge/bun-runtime-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![pnpm](https://img.shields.io/badge/pnpm-workspace-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![TypeScript](https://img.shields.io/badge/typescript-6.x-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)

mini-crm — a Turborepo monorepo.

[Architecture](#architecture) • [Getting Started](#getting-started) • [Scripts](#scripts) • [Deployment](#deployment)

</div>

## Architecture

`mini-crm` is a `pnpm` + Turborepo monorepo split into three deployable apps (`web`, `api`, `worker`) and a set of shared packages they consume:

- `web` is the React SPA. It talks to `api` over HTTP and never talks to the database or Redis directly.
- `api` is the NestJS HTTP layer. It delegates business logic to `packages/core`, checks permissions via `packages/auth`, and reads/writes through `packages/database` (Drizzle).
- `worker` runs the async side: BullMQ job processors defined in `packages/jobs`. It shares `packages/database` and `packages/infra` with `api`, so nothing is duplicated between the two runtimes.
- Everything cross-cutting (domain types, shared errors, route path constants, permission rules) lives in its own package under `packages/`, so `web`, `api`, and `worker` share a single source of truth instead of drifting.

```text
.
├── apps/
│   ├── web/                 # Frontend (Vite + React + shadcn/ui)
│   ├── api/                 # HTTP backend (NestJS)
│   └── worker/               # Async processing (BullMQ)
├── packages/
│   ├── auth/                 # Roles/resources permission matrix
│   ├── contracts/             # Shared types and errors across apps
│   ├── core/                   # Domain logic
│   ├── database/                # Drizzle schema and client (PostgreSQL)
│   ├── infra/                    # Technical integrations (Redis)
│   ├── jobs/                      # Shared queues and job definitions
│   ├── routes/                     # Shared API route path constants
│   └── config/
│       ├── tsconfig/                # TS presets (app/package/web)
│       ├── eslint/                   # Shared ESLint presets
│       ├── prettier/                  # Shared Prettier preset
│       └── vitest/                     # Vitest presets (node/web)
├── compose.yml                # Local infra (Postgres, Redis)
├── ecosystem.config.js         # PM2 process definitions (api, worker)
├── package.json                 # Root scripts and devDependencies
├── pnpm-workspace.yaml            # Workspace glob declarations
├── turbo.json                      # Turborepo pipeline config
├── prettier.config.cjs              # Root Prettier config
├── .editorconfig                     # Editor baseline (indent, charset, EOL)
├── .prettierignore
├── .gitignore
└── .env
```

### Stack

| Layer | Technologies |
| --- | --- |
| Workspace | pnpm, Turborepo |
| Frontend | React 19, Vite, TailwindCSS, TanStack Router, TanStack Query, shadcn/ui |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Queue | Redis, BullMQ |
| Quality | ESLint, Prettier, Vitest, TypeScript |

## Getting Started

### Prerequisites

| Requirement | Version |
| --- | --- |
| pnpm | 10+ |
| Docker | latest |
| Docker Compose | latest |

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` at the repo root and fill in the values:

```bash
cp .env.example .env
```

### 3. Start local infrastructure

```bash
docker compose up -d
```

Services:
- PostgreSQL at `127.0.0.1:5485`
- Redis at `127.0.0.1:6358`

### 4. Prepare database

```bash
pnpm --filter @mini-crm/database db:generate initial
pnpm --filter @mini-crm/database db:migrate
pnpm --filter @mini-crm/database db:seed
```

`apps/api`'s test suite (`pnpm test`) also needs this step done first — its e2e
tests sign in as the seeded demo user against a live database, they don't
mock it.

### 5. Start development

```bash
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:4353
- API docs (Swagger): http://localhost:4353/api-docs

## Authentication

Email/password sign-in, backed by a JWT stored in an httpOnly cookie.

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@mini-crm.com | demo1234 |
| USER | user@mini-crm.com | demo1234 |

## Scripts

### Root scripts

```bash
pnpm dev              # Run all apps in watch mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all code
pnpm check-types      # TypeScript type checking
pnpm test             # Run all tests
pnpm format           # Format all code
pnpm format:check     # Check formatting
pnpm run deploy       # Pull, install, migrate, build, and reload via PM2
```

### Database scripts

```bash
pnpm --filter @mini-crm/database db:generate <migration-name>   # Generate a migration
pnpm --filter @mini-crm/database db:migrate     # Apply migrations (dev)
pnpm --filter @mini-crm/database db:deploy       # Apply migrations (production)
pnpm --filter @mini-crm/database db:studio        # Open Drizzle Studio
pnpm --filter @mini-crm/database db:seed          # Seed demo users
```

### Full local validation

```bash
pnpm run lint
pnpm run check-types
pnpm run test
pnpm run format:check
pnpm install --frozen-lockfile
```

## Deployment

The current deployment flow is orchestrated by the root `deploy` script:

1. `git pull`
2. `pnpm install`
3. `packages/database: db:deploy`
4. `pnpm build`
5. PM2 `startOrReload` (`api`, `worker`)

```bash
pnpm run deploy
```
