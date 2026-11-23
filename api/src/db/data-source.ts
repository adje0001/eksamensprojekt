// Database options used by the running API (AppModule).
// Connects as chat_app: may only SELECT, INSERT, UPDATE and DELETE. No schema changes (least privilege).
// Built in a function, so the password is only read when the app actually starts (not in tests).
import type { DataSourceOptions } from 'typeorm';
import { baseOptions, requireEnv } from './config.js';

export function appDbOptions(): DataSourceOptions {
  return baseOptions(process.env.DB_APP_USER ?? 'chat_app', requireEnv('DB_APP_PASSWORD'));
}
