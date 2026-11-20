# MongoDB development database

Run from the repository root.

```sh
docker compose -f docker-compose.mongo.yml up -d
docker compose -f docker-compose.mongo.yml exec mongo mongosh chatapp
```

Connect with MongoDB Compass at `mongodb://127.0.0.1:27018/chatapp`.
This is a local development instance with the published port bound to loopback.
The init scripts create and seed the database when the named volume is first initialized.
Stop it with `docker compose -f docker-compose.mongo.yml down`.

| PostgreSQL | MongoDB |
| --- | --- |
| `users` | `users` |
| `conversations` | `conversations` |
| `conversation_participants` | `conversations.participants[]` |
| `messages` | `messages`, linked through `conversationId` |

The seed mirrors the PostgreSQL fixtures. Fixture IDs are deterministic ObjectIds.
The application must enforce reference integrity, participant uniqueness by user ID,
and equivalent delete behavior when it implements writes.

List Filip's conversations and show the latest messages in the exam group.

```js
const filip = db.users.findOne({ username: "filip" });
db.conversations.find({ "participants.userId": filip._id }, { title: 1 });

const group = db.conversations.findOne({ title: "Eksamensgruppe" });
db.messages.find({ conversationId: group._id })
  .sort({ createdAt: -1, _id: -1 })
  .limit(10);
```
