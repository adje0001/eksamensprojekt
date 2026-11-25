// Shared database settings for both data sources.
// Values come from environment variables. Locally they are read from the repo root .env file.
// In Docker and CI they are set by docker-compose / the workflow, and no .env file is needed.
import path from 'path';
import dotenv from 'dotenv';
import type { DataSourceOptions } from 'typeorm';
import { Conversation } from '../conversations/entities/conversation.entity.js';
import { ConversationParticipant } from '../conversations/entities/conversation-participant.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { User } from '../users/entities/user.entity.js';

// api/src/db -> repo root (also works from api/dist/db after build)
dotenv.config({ path: path.resolve(import.meta.dirname, '../../../.env'), quiet: true });

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function baseOptions(user: string, password: string): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    database: process.env.DB_NAME ?? 'chatapp',
    username: user,
    password,
    entities: [User, Conversation, ConversationParticipant, Message],
    migrations: [path.join(import.meta.dirname, '../migrations/*.{ts,js}')],
    // Never let TypeORM change the schema on its own. All schema changes go through migrations.
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
  };
}
