-- DEV ONLY. Mounted into the Postgres container via docker-entrypoint-initdb.d.
-- Read-only role used by the Postgres MCP server in Claude Code.
-- Never run this on the production database.
CREATE ROLE claude_ro LOGIN PASSWORD 'dev_only_change_me';
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO claude_ro', current_database());
END
$$;
GRANT USAGE ON SCHEMA public TO claude_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_ro;
-- Tables created later by migrations (run as the same owner) are readable too.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO claude_ro;
