-- Database roles (PostgreSQL)
-- Run AFTER schema.sql, as the superuser (postgres).
-- Change the passwords before using this outside your own computer.

BEGIN;   -- all or nothing: if one line fails, no half-made roles are left behind

-- Admin account: owns the database and may change the schema (migrations)
CREATE ROLE chat_admin WITH LOGIN PASSWORD 'change_me_admin';
ALTER DATABASE chatapp OWNER TO chat_admin;
ALTER SCHEMA public OWNER TO chat_admin;
ALTER TABLE users                     OWNER TO chat_admin;
ALTER TABLE conversations             OWNER TO chat_admin;
ALTER TABLE conversation_participants OWNER TO chat_admin;
ALTER TABLE messages                  OWNER TO chat_admin;

-- App account: used by the Express backend, may only read and write data
CREATE ROLE chat_app WITH LOGIN PASSWORD 'change_me_app';

-- Allow it to connect and see the tables in the schema
GRANT CONNECT ON DATABASE chatapp TO chat_app;
GRANT USAGE ON SCHEMA public TO chat_app;

-- Only data operations; no CREATE, DROP, ALTER or TRUNCATE
GRANT SELECT, INSERT, UPDATE, DELETE
    ON users, conversations, conversation_participants, messages
    TO chat_app;

-- Needed so the app can INSERT rows with auto-generated ids
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO chat_app;

-- Stop everyone else (PUBLIC) from creating tables in the schema
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

COMMIT;
