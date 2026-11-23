// Shared database settings for both data sources.
// Values come from environment variables. Locally they are read from the repo root .env file.
// In Docker and CI they are set by docker-compose / the workflow, and no .env file is needed.
import path from 'path';
import dotenv from 'dotenv';
import type { DataSourceOptions } from 'typeorm';
import { Conversation } from '../entities/Conversation';
import { ConversationParticipant } from '../entities/ConversationParticipant';
import { Message } from '../entities/Message';
import { User } from '../entities/User';

// api/src/db -> repo root (also works from api/dist/db after build)
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });

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
    migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
    // Never let TypeORM change the schema on its own. All schema changes go through migrations.
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
  };
}
