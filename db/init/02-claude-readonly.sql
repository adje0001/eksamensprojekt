-- DEV ONLY. Runs after 01-roles.sh when the dev Postgres container starts with an empty volume.
-- Read-only role used by the Postgres MCP server in Claude Code.
-- Never run this on the production database.
CREATE ROLE claude_ro LOGIN PASSWORD 'dev_only_change_me';
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO claude_ro', current_database());
END
$$;
GRANT USAGE ON SCHEMA public TO claude_ro;

-- Tables created later by migrations (owned by chat_admin) are readable, nothing more.
ALTER DEFAULT PRIVILEGES FOR ROLE chat_admin IN SCHEMA public GRANT SELECT ON TABLES TO claude_ro;
