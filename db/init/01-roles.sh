#!/bin/bash
# 01-roles.sh: creates the database roles. Runs once when the Postgres container starts with an empty volume.
# Tables are NOT created here. They are created by TypeORM migrations, run as chat_admin.
#
# chat_admin: owns the database and schema. Used only for migrations and seeding.
# chat_app:   used by the running API. Only SELECT, INSERT, UPDATE, DELETE. No schema changes.
#
# Passwords come from environment variables (set in docker-compose from .env), never from this file.
set -euo pipefail

: "${DB_ADMIN_PASSWORD:?DB_ADMIN_PASSWORD must be set}"
: "${DB_APP_PASSWORD:?DB_APP_PASSWORD must be set}"

psql -v ON_ERROR_STOP=1 --single-transaction \
  --username "${POSTGRES_USER:-postgres}" --dbname "${POSTGRES_DB:-chatapp}" \
  -v admin_pw="$DB_ADMIN_PASSWORD" -v app_pw="$DB_APP_PASSWORD" <<'SQL'
-- Admin account: owns the database and the schema, so it can run migrations
CREATE ROLE chat_admin WITH LOGIN PASSWORD :'admin_pw';
SELECT format('ALTER DATABASE %I OWNER TO chat_admin', current_database()) \gexec
ALTER SCHEMA public OWNER TO chat_admin;

-- App account: may connect and use the schema, nothing more by default
CREATE ROLE chat_app WITH LOGIN PASSWORD :'app_pw';
SELECT format('GRANT CONNECT ON DATABASE %I TO chat_app', current_database()) \gexec
GRANT USAGE ON SCHEMA public TO chat_app;

-- Every table chat_admin creates later (via migrations) automatically gives chat_app
-- data access only: no CREATE, DROP, ALTER or TRUNCATE
ALTER DEFAULT PRIVILEGES FOR ROLE chat_admin IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO chat_app;
ALTER DEFAULT PRIVILEGES FOR ROLE chat_admin IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO chat_app;

-- Nobody else may create tables in the schema
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL

echo "01-roles.sh: created chat_admin and chat_app"
