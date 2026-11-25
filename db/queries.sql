-- Example queries for the chat feature (PostgreSQL)
-- Run after `npm run migration:run` and `npm run seed` (in api/). Run one query at a time (cursor on it + Cmd/Ctrl + Enter).


-- 1. Show a conversation: the newest messages with the sender's name
--    LEFT JOIN so messages from deleted users (sender_id = NULL) are still shown
SELECT m.id,
       COALESCE(u.first_name || ' ' || u.last_name, 'Slettet bruger') AS sender,
       m.body,
       m.created_at
FROM messages m
LEFT JOIN users u ON u.id = m.sender_id
WHERE m.conversation_id = 13
ORDER BY m.created_at DESC
LIMIT 50;


-- 2. "My conversations": all conversations user 1 is part of,
--    with the latest message time, newest activity first
SELECT c.id,
       COALESCE(c.title, '1:1-chat') AS title,
       c.is_group,
       MAX(m.created_at) AS last_message_at
FROM conversation_participants p
JOIN conversations c ON c.id = p.conversation_id
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE p.user_id = 1
GROUP BY c.id
ORDER BY last_message_at DESC NULLS LAST;


-- 3. Participants in a group chat
SELECT u.first_name, u.last_name, p.joined_at
FROM conversation_participants p
JOIN users u ON u.id = p.user_id
WHERE p.conversation_id = 14
ORDER BY p.joined_at;


-- 4. Statistics: number of messages per user (users with 0 messages included)
SELECT u.first_name, u.last_name, COUNT(m.id) AS messages_sent
FROM users u
LEFT JOIN messages m ON m.sender_id = u.id
GROUP BY u.id
ORDER BY messages_sent DESC;


-- 5. Transaction: create a new group chat with participants and a first message.
--    Either everything is saved, or nothing is (if one line fails).
BEGIN;

WITH new_conv AS (
    INSERT INTO conversations (title, is_group, created_by)
    VALUES ('Ny gruppe', true, 1)
    RETURNING id
),
add_people AS (
    INSERT INTO conversation_participants (conversation_id, user_id)
    SELECT id, unnest(ARRAY[1, 2, 3]) FROM new_conv
)
INSERT INTO messages (conversation_id, sender_id, body)
SELECT id, 1, 'Velkommen til gruppen!' FROM new_conv;

COMMIT;


-- 6. Index proof with EXPLAIN ANALYZE
--    With only 45 messages Postgres reads the whole table (Seq Scan), because
--    that is faster than using an index on a tiny table. So we first add
--    100,000 test messages, so the difference becomes visible.

-- 6a. Add 100,000 test messages spread over the 20 conversations
INSERT INTO messages (conversation_id, sender_id, body, created_at)
SELECT c, p.user_id, 'Testbesked ' || g, now() - (g || ' minutes')::interval
FROM generate_series(1, 100000) AS g
CROSS JOIN LATERAL (SELECT (g % 20) + 1 AS c) AS conv
CROSS JOIN LATERAL (
    SELECT user_id FROM conversation_participants
    WHERE conversation_id = conv.c
    ORDER BY user_id LIMIT 1
) AS p;
ANALYZE messages;   -- update Postgres' statistics about the table

-- 6b. WITH index: look for "Index Scan using idx_messages_conversation_created"
EXPLAIN ANALYZE
SELECT * FROM messages
WHERE conversation_id = 13
ORDER BY created_at DESC
LIMIT 50;

-- 6c. WITHOUT index: drop it, run the same query, look for "Seq Scan" and a higher time
DROP INDEX idx_messages_conversation_created;

EXPLAIN ANALYZE
SELECT * FROM messages
WHERE conversation_id = 13
ORDER BY created_at DESC
LIMIT 50;

-- 6d. Put the index back
CREATE INDEX idx_messages_conversation_created
    ON messages (conversation_id, created_at DESC);

-- 6e. Clean up: run seed.sql again to get back to the normal test data
