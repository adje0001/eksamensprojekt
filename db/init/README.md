# db/init

SQL files here run once, the first time the dev Postgres container starts with an empty volume. Mount the folder in `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - ./db/init:/docker-entrypoint-initdb.d:ro
```

Files run in alphabetical order, hence the `01-` prefix.

## 01-claude-readonly.sql
- Creates `claude_ro`, a read-only role for the Postgres MCP server in Claude Code.
- It can connect and SELECT. It cannot insert, update, delete or change the schema.
- `ALTER DEFAULT PRIVILEGES` makes tables created later by migrations readable too.
- **Dev only.** Never mount this folder or run this file in production.
- Example of least privilege, which DB2 asks for with the app account.

## Re-running
Init scripts only run on an empty volume. To re-run: `docker compose down -v` (this deletes dev data), then `docker compose up`.
