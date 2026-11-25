# Exam Project (EK, winter 2026)

Shared codebase for Development Environments, Databases 2 and Fullstack. Each course is examined separately.

Scenario: own project. A chat app with users, 1:1 and group conversations, and messages.

## Getting started
Requirements: Docker Desktop, Node.js 22 (with its bundled npm 10), jq (`brew install jq`).

Everyone uses the same Node version as CI and Docker, so `package-lock.json` stays the same on every machine.
`.nvmrc` pins it, and `npm install` in `api/` refuses to run on another major version.
With [fnm](https://github.com/Schniz/fnm) (one-time setup, macOS/zsh):

```bash
brew install fnm
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc   # without this, fnm use fails
source ~/.zshrc
fnm use --install-if-missing                        # in the repo root, reads .nvmrc
```

After that, fnm switches to Node 22 every time you `cd` into the repo. Other projects keep their own version.

```bash
cp .env.example .env              # then set your own passwords in .env
docker compose up --build         # Postgres, migrations and API
```
- API: http://localhost:3000/health returns `{"status":"ok"}`
- Postgres: `localhost:5433`, database `chatapp`

Seed test data (20 users, 20 conversations, 45 messages). All test users have the password `password123`:
```bash
cd api
npm install
npm run seed
```

Run the API on your own computer instead of in Docker:
```bash
docker compose up -d db migrate   # only the database and migrations
cd api && npm run dev
```

## How it fits together
| Part | What | Why |
| --- | --- | --- |
| `db` | Postgres 17. `db/init/` creates roles on first start | Admin and app accounts with least privilege (DB2) |
| `migrate` | One-off container: TypeORM migrations as `chat_admin`, then exits | Schema is versioned in Git. Only this container has the admin password |
| `api` | NestJS API as `chat_app`, non-root container | The app can change data but never the schema |
| `web/` | Next.js web client, runs with `npm run dev` on port 3001 | Talks only to the API. See [web/README.md](web/README.md) |
| `mobile/` | React Native + Expo app, runs with `npm start` and Expo Go | Talks only to the API. See [mobile/README.md](mobile/README.md) |

## Checks on every pull request
`.github/workflows/ci.yml` runs five jobs. All must pass before merge.
1. **API:** lint, typecheck, unit and integration tests, build.
2. **Database:** creates the roles, runs migrations, seeds, checks for drift between entities and migrations, checks that `chat_app` cannot drop tables, and reverts and re-runs the migrations.
3. **Web:** lint, typecheck, build.
4. **Mobile:** lint, typecheck, `expo-doctor`.
5. **Docker:** builds the image and checks it runs as non-root.

## AI setup
The group uses a shared Claude Code setup. Start with [docs/ai-setup.md](docs/ai-setup.md).

| Where | Notes |
| --- | --- |
| `CLAUDE.md` | Rules and commands Claude follows in every session |
| `.claude/` | Settings, hooks, skills and agents. See [.claude/README.md](.claude/README.md) |
| `.claude/hooks/` | See [.claude/hooks/README.md](.claude/hooks/README.md) |
| `.claude/skills/` | See [.claude/skills/README.md](.claude/skills/README.md) |
| `.mcp.json` | Shared MCP servers. See [docs/ai-setup.md](docs/ai-setup.md) |
| `db/init/` | Database roles. See [db/init/README.md](db/init/README.md) |
