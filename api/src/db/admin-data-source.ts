import path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { baseOptions, requireEnv } from './config.js';

const AdminDataSource = new DataSource({
  ...baseOptions(process.env.DB_ADMIN_USER ?? 'chat_admin', requireEnv('DB_ADMIN_PASSWORD')),
  migrations: [path.join(import.meta.dirname, '../migrations/*.{ts,js}')],
});

// The TypeORM CLI needs exactly one exported DataSource.
export default AdminDataSource;
