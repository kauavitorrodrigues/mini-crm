<div align="center">

mini-crm — a small CRM (contacts, deals, sales funnel). pnpm + Turborepo monorepo.

[Architecture](#architecture) • [Getting Started](#getting-started) • [Scripts](#scripts) • [Deployment](#deployment)

</div>

**Local-only rule:** academic project that runs 100% locally, with no third-party services (no analytics, e-mail, external storage, CDNs or remote fonts; fonts are bundled via npm) and no file uploads.
The only infrastructure is the local PostgreSQL from `compose.yml`.

## Architecture

Two apps and a set of shared packages (`web → api → core → database`):

- `apps/web`: React SPA (Vite, TanStack Router/Query, shadcn/ui).
- `apps/api`: NestJS HTTP API. Session is a JWT in an httpOnly cookie; every route needs a session except `POST /auth/signin` and `GET /health/ping`.
- `packages/core`: domain logic (repository + service per feature).
- `packages/database`: Drizzle schema, migrations and seed (PostgreSQL).
- `packages/contracts`: shared types and errors. `packages/routes`: API path constants. `packages/config/*`: tooling presets.

More detail in [`docs/architecture`](docs/architecture/README.md); API in [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md).

| Layer     | Technologies                                                            |
| --------- | ----------------------------------------------------------------------- |
| Workspace | pnpm, Turborepo                                                         |
| Frontend  | React 19, Vite, TailwindCSS, TanStack Router, TanStack Query, shadcn/ui |
| Backend   | NestJS, TypeScript                                                      |
| Database  | PostgreSQL, Drizzle ORM                                                 |
| Quality   | ESLint, Prettier, Vitest, GitHub Actions                                |

## Getting Started

Requirements: pnpm 12+, Docker with Compose.

```bash
pnpm install
cp .env.example .env            # then set JWT_SECRET (openssl rand -base64 48) and SEED_USER_*
docker compose up -d            # PostgreSQL on 127.0.0.1:5485
pnpm --filter @mini-crm/database db:migrate
pnpm --filter @mini-crm/database db:seed
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:4353 (Swagger at `/api-docs`, health at `/health/ping`)

Sign in with `SEED_USER_EMAIL` / `SEED_USER_PASSWORD` from your `.env`. There is no public signup or password recovery. The seed is idempotent and creates the user and the four funnel stages (Novo lead, Em negociação, Proposta enviada, Fechamento).

## Scripts

```bash
pnpm dev              # Run all apps in watch mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint
pnpm check-types      # TypeScript type checking
pnpm test             # Tests (need the database migrated and seeded)
pnpm format:check     # Check formatting (pnpm format to fix)
pnpm run deploy       # Pull, install, migrate, build, reload via PM2
```

```bash
pnpm --filter @mini-crm/database db:generate <name>   # Generate a migration
pnpm --filter @mini-crm/database db:migrate           # Apply migrations (dev)
pnpm --filter @mini-crm/database db:deploy            # Apply migrations (production)
pnpm --filter @mini-crm/database db:seed              # Seed user and stages
pnpm --filter @mini-crm/database db:studio            # Drizzle Studio
```

## CI

`.github/workflows/ci.yml` runs on push and pull requests: `pnpm install --frozen-lockfile`, `check-types`, `lint`, `format:check`, migrate + seed against a Postgres service, `test`, `build`.

## Deployment

`pnpm run deploy` does: `git pull`, `pnpm install`, `db:deploy`, `pnpm build`, PM2 `startOrReload` of the API (`ecosystem.config.js`). The web build (`apps/web/dist`) is static and must be served separately (any static host or reverse proxy), with `VITE_BASE_API_URL` pointing to the API at build time.
