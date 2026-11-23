# Exam Project (EK, winter 2026)

Shared codebase for three separately examined courses: Development Environments (DE), Databases 2 (DB2) and Fullstack. Reports and code comments are in English.

Scenario: own project. A chat app with users, 1:1 and group conversations, and messages.

## Stack
- Client: React Native + Expo (TypeScript). Not started yet.
- API: Node.js 22 + Express 5 + TypeScript, in `api/`
- Database: PostgreSQL 17 + TypeORM. Alternative design: MongoDB in `db/mongo/`
- Containers: Docker + Docker Compose (dev), Hetzner VPS Ubuntu (prod)
- Version control: GitHub + GitHub Flow
- CI: GitHub Actions (`.github/workflows/ci.yml`): lint, typecheck, test, build, migrations, Docker build
- Tests: Jest + Supertest (API), Playwright or Maestro (E2E)
- Lint: ESLint
- Project management: GitHub Projects (Kanban), user stories, MoSCoW

## Layout
- `api/src/app.ts`: Express app without DB (imported by tests)
- `api/src/server.ts`: connects to the DB, starts the server
- `api/src/entities/`: TypeORM entities
- `api/src/migrations/`: TypeORM migrations. The source of truth for the schema
- `api/src/db/`: data sources (app and admin), seed script
- `api/test/`: Jest tests
- `db/init/`: runs once in the Postgres container. Creates roles only, never tables
- `db/seed/seed.sql`: test data
- `db/queries.sql`, `db/mongo/`: DB2 example queries and the MongoDB alternative design

## Commands
Run npm commands inside `api/`. The DB must run first (`docker compose up -d db`).
- Everything in Docker: `docker compose up --build` (from repo root)
- API on your own computer: `npm run dev`
- Lint / typecheck / test / build: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`
- New migration from entity changes: `npm run migration:generate -- src/migrations/<Name>`
- Run / revert / list migrations: `npm run migration:run`, `npm run migration:revert`, `npm run migration:show`
- Seed: `npm run seed`

## Rules
- Never commit directly to `main`. Work on `feature/<name>`, `fix/<name>` or `chore/<name>` and open a PR.
- Every feature ships with tests. New routes need a happy-path test and a denied-access test.
- The schema lives in TypeORM migrations only. Never use `synchronize: true`. Never add tables in `db/init/`.
- Never edit a migration that has been merged to main. Write a new one.
- Entities and migrations must match. CI fails on drift.
- Seed data: at least 20 realistic rows per entity, with relationships (DB2 requirement).
- Use parameterised queries only. Never build SQL with string interpolation.
- Wrap multi-step writes that must succeed together in `dataSource.transaction()`.
- Add an index on columns used for filtering. DESC or other special indexes go in the migration by hand, with `@Index(name, { synchronize: false })` on the entity.
- Never return `password_hash` in API responses.
- Secrets live in `.env` (git-ignored) locally and in GitHub Secrets in CI. Never hardcode or log them.
- Containers run as a non-root user (`USER` in every Dockerfile).
- Do not expose the Postgres port publicly in production compose files.
- Keep changes small and explainable. Every group member must be able to explain the code at an individual oral exam.

## Database roles
- `chat_admin`: owns the schema. Used only by migrations and the seed (`api/src/db/admin-data-source.ts`).
- `chat_app`: used by the running API (`api/src/db/data-source.ts`). Data only, no DDL. Gets rights on new tables automatically via default privileges.
- `claude_ro`: read-only, dev database only. Used by the Postgres MCP server.

## Docs
- `docs/ai-setup.md`: how this Claude Code setup works and how to use it.
- `db/init/README.md`: database roles and init scripts.
