// Data source used by the running API.
// Connects as chat_app: may only SELECT, INSERT, UPDATE and DELETE. No schema changes (least privilege).
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { baseOptions, requireEnv } from './config';

export const AppDataSource = new DataSource(
  baseOptions(process.env.DB_APP_USER ?? 'chat_app', requireEnv('DB_APP_PASSWORD')),
);
