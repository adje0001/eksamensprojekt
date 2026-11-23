// Data source used only by the TypeORM CLI (migrations) and the seed script.
// Connects as chat_admin, which owns the schema. The running API never uses this.
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { baseOptions, requireEnv } from './config.js';

const AdminDataSource = new DataSource(
  baseOptions(process.env.DB_ADMIN_USER ?? 'chat_admin', requireEnv('DB_ADMIN_PASSWORD')),
);

// The TypeORM CLI needs exactly one exported DataSource.
export default AdminDataSource;
