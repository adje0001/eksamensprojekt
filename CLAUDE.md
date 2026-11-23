# Exam Project (EK, winter 2026)

Shared codebase for three separately examined courses: Development Environments (DE), Databases 2 (DB2) and Fullstack. Reports and code comments are in English.

Scenario: own project. A chat app with users, 1:1 and group conversations, and messages.

## Stack

- Client: React Native + Expo (TypeScript). Not started yet.
- API: NestJS 12 (MVC) + TypeScript 6, ESM, in `api/`. Required by the Fullstack course
- Web: Next.js. Required by the Fullstack course. Not started yet
- Database: PostgreSQL 17 + TypeORM. Alternative design: MongoDB in `db/mongo/`
- Containers: Docker + Docker Compose (dev), Hetzner VPS Ubuntu (prod)
- Version control: GitHub + GitHub Flow
- CI: GitHub Actions (`.github/workflows/ci.yml`): lint, typecheck, test, build, migrations, Docker build
- Tests: Jest + Supertest (API), Playwright or Maestro (E2E)
- Lint: ESLint
- Project management: GitHub Projects (Kanban), user stories, MoSCoW

## Layout

- `api/src/main.ts`: starts the Nest app. `api/src/setup.ts`: HTTP settings shared with tests
- `api/src/app.module.ts`: root module, imports every feature module and the DB connection
- `api/src/<feature>/`: one folder per feature: `<feature>.module.ts`, `.controller.ts`, `.service.ts`, `<name>.entity.ts`, `dto/`, and `.spec.ts` unit tests next to the code
- `api/src/migrations/`: TypeORM migrations. The source of truth for the schema
- `api/src/db/`: DB config, app options (chat_app), admin data source (chat_admin, CLI only), seed script
- `api/test/`: integration tests (`*.integration.spec.ts`, Nest app over HTTP with Supertest)
- `db/init/`: runs once in the Postgres container. Creates roles only, never tables
- `db/seed/seed.sql`: test data
- `db/queries.sql`, `db/mongo/`: DB2 example queries and the MongoDB alternative design

## Commands

Run npm commands inside `api/`. The DB must run first (`docker compose up -d db`).

- Everything in Docker: `docker compose up --build` (from repo root)
- API on your own computer: `npm run dev` (nest start --watch)
- New Nest feature: `npx nest g resource <name>` (then add the `.js` suffixes and tests)
- Lint / format / typecheck / build: `npm run lint`, `npm run format`, `npm run typecheck`, `npm run build`
- Tests: `npm test` (all), `npm run test:unit`, `npm run test:integration`
- New migration from entity changes: `npm run migration:generate -- src/migrations/<Name>`
- Run / revert / list migrations: `npm run migration:run`, `npm run migration:revert`, `npm run migration:show`
- Seed: `npm run seed`

## NestJS conventions (match what the course teaches)

- ESM project (`"type": "module"`): relative imports end in `.js`, e.g. `import { UsersService } from './users.service.js'`.
- MVC: controllers handle HTTP only, services hold the logic, entities model the data. Controllers never talk to the DB directly.
- Validate input with DTOs and class-validator. Never trust `req.body` directly.
- Register entities in the feature module with `TypeOrmModule.forFeature()` and add new entities to `api/src/db/config.ts`.

## Keep it simple

Applies to all code: TypeScript, SQL, Docker, YAML and shell.

- Write the simplest code that solves the task and is efficient enough. No overengineering.
- No abstractions, helpers, generics or design patterns "for later". Add them when a second real use appears.
- Prefer the framework's built-in way (NestJS, TypeORM, Next.js, Expo) over custom solutions or extra libraries.
- Short functions, clear names, few comments. A comment explains why, not what.
- Do not add a dependency if a few lines of code do the job.
- If a simpler solution is possible, say so and choose it.
- Apply DRY to real duplication: extract shared code when the same logic appears a second time, not before.

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
