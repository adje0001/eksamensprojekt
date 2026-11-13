# Exam Project (EK, winter 2026)

Shared codebase for three separately examined courses: Development Environments (DE), Databases 2 (DB2) and Fullstack. Reports and code comments are in English.

Scenario: TBD (HolidayHouse, Toxic Chemical Industrie A/S, MyDRTV or own project). Update this line when chosen.

## Stack
- Client: React Native + Expo (TypeScript)
- API: Node.js + Express + TypeScript
- Database: PostgreSQL + TypeORM
- Containers: Docker + Docker Compose (dev), Hetzner VPS Ubuntu (prod)
- Version control: GitHub + GitHub Flow
- CI: GitHub Actions, lint + test on every PR
- Tests: Jest + Supertest (API), Playwright or Maestro (E2E)
- Lint: ESLint
- Project management: GitHub Projects (Kanban), user stories, MoSCoW

## Commands
Fill in as the project grows.
- Start dev: `docker compose up`
- Lint: `npm run lint`
- Test: `npm test`
- New migration: `npm run migration:generate -- <Name>`
- Run migrations: `npm run migration:run`
- Seed: `npm run seed`

## Rules
- Never commit directly to `main`. Work on `feature/<name>`, `fix/<name>` or `chore/<name>` and open a PR.
- Every feature ships with tests. New routes need a happy-path test and a denied-access test.
- Database changes go through TypeORM migrations. Never use `synchronize: true`.
- Seed data: at least 20 realistic rows per entity, with relationships (DB2 requirement).
- Use parameterised queries only. Never build SQL with string interpolation.
- Wrap multi-step writes that must succeed together in `dataSource.transaction()`.
- Add an index (`@Index()`) on columns used for filtering.
- Secrets live in `.env` (git-ignored) locally and in GitHub Secrets in CI. Never hardcode or log them.
- Containers run as a non-root user (`USER` in every Dockerfile).
- Do not expose the Postgres port publicly in production compose files.
- Keep changes small and explainable. Every group member must be able to explain the code at an individual oral exam.

## Database roles
- Admin/owner role: runs migrations only.
- App role: SELECT/INSERT/UPDATE/DELETE on app tables. No DDL.
- `claude_ro`: read-only, dev database only. Used by the Postgres MCP server.

## Docs
- `docs/ai-setup.md`: how this Claude Code setup works and how to use it.
