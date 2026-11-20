const chat = db.getSiblingDB("chatapp");
const objectId = { bsonType: "objectId" };
const nullableId = { bsonType: ["objectId", "null"] };
const date = { bsonType: "date" };
const text = { bsonType: "string" };

function createCollection(name, properties) {
  chat.createCollection(name, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: Object.keys(properties),
        properties,
      },
    },
  });
}

createCollection("users", {
  email: { ...text, maxLength: 254 },
  username: { ...text, maxLength: 30 },
  passwordHash: text,
  role: { enum: ["user", "admin"] },
  createdAt: date,
});
createCollection("conversations", {
  title: { bsonType: ["string", "null"], maxLength: 100 },
  isGroup: { bsonType: "bool" },
  createdBy: nullableId,
  createdAt: date,
  participants: {
    bsonType: "array",
    items: {
      bsonType: "object",
      required: ["userId", "joinedAt"],
      properties: { userId: objectId, joinedAt: date },
    },
  },
});
createCollection("messages", {
  conversationId: objectId,
  senderId: nullableId,
  body: text,
  createdAt: date,
});

chat.users.createIndex({ email: 1 }, { unique: true });
chat.users.createIndex({ username: 1 }, { unique: true });
chat.conversations.createIndex({ "participants.userId": 1 });
chat.messages.createIndex({ conversationId: 1, createdAt: -1, _id: -1 });
