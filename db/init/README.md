# db/init

Scripts here run once, the first time the Postgres container starts with an empty volume. `docker-compose.yml` mounts the folder into `/docker-entrypoint-initdb.d`. Files run in alphabetical order.

**No tables are created here.** Tables come from TypeORM migrations in `api/src/migrations/`, run as `chat_admin`.

## 01-roles.sh
Creates the two roles the system runs with. Passwords come from `.env` via docker-compose, never from the script.

| Role | Used by | Rights |
| --- | --- | --- |
| `chat_admin` | Migrations and seed | Owns the database and the `public` schema |
| `chat_app` | The running API | SELECT, INSERT, UPDATE, DELETE. No CREATE, DROP, ALTER or TRUNCATE |

- `ALTER DEFAULT PRIVILEGES FOR ROLE chat_admin` means every table a migration creates gives `chat_app` data rights automatically. No GRANT per table.
- `REVOKE CREATE ON SCHEMA public FROM PUBLIC`: nobody else can create tables.
- It is a `.sh` file, not `.sql`, so it can read the passwords from environment variables.
- CI runs the same script against its own Postgres, so the roles are tested on every PR.

## 02-claude-readonly.sql
- Creates `claude_ro`, a read-only role for the Postgres MCP server in Claude Code.
- It can connect and SELECT. It cannot insert, update, delete or change the schema.
- **Dev only.** Never run this file in production.

## Re-running
Init scripts only run on an empty volume. To re-run: `docker compose down -v` (this deletes dev data), then `docker compose up`.

## Least privilege in practice (DB2)
```bash
# As chat_app: works
psql -h localhost -p 5433 -U chat_app -d chatapp -c "SELECT count(*) FROM users"
# As chat_app: denied
psql -h localhost -p 5433 -U chat_app -d chatapp -c "DROP TABLE messages"
```
