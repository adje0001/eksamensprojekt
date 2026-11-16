-- Core schema for the chat feature (PostgreSQL)

CREATE TABLE users (
    id             INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email          VARCHAR(254) NOT NULL UNIQUE,      -- 254 = max length of an email address
    username       VARCHAR(30)  NOT NULL UNIQUE,
    password_hash  CHAR(60)     NOT NULL,             -- a bcrypt hash is always exactly 60 characters
    role           VARCHAR(20)  NOT NULL DEFAULT 'user',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       VARCHAR(100),                         -- NULL for 1:1 chats (no title)
    is_group    BOOLEAN      NOT NULL DEFAULT false,
    created_by  INTEGER      REFERENCES users(id) ON DELETE SET NULL,   -- conversation stays if the creator is deleted
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE conversation_participants (
    conversation_id  INTEGER     NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id          INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id               BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id  INTEGER     NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id        INTEGER     REFERENCES users(id) ON DELETE SET NULL,  -- NULL = "deleted user"
    body             TEXT        NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes (PostgreSQL does not automatically index foreign keys)

-- Fetch messages in a conversation, newest first
CREATE INDEX idx_messages_conversation_created
    ON messages (conversation_id, created_at DESC);

-- Find the conversations a user is part of
CREATE INDEX idx_participants_user
    ON conversation_participants (user_id);
