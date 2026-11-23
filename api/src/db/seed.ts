// Seeds the dev database with test data from db/seed/seed.sql.
// Usage: npm run seed (after npm run migration:run).
// Runs as chat_admin, because the seed uses TRUNCATE to start from a clean state.
import fs from 'fs';
import path from 'path';
import AdminDataSource from './admin-data-source';

const seedFile = path.resolve(__dirname, '../../../db/seed/seed.sql');

async function main(): Promise<void> {
  const sql = fs.readFileSync(seedFile, 'utf8');
  await AdminDataSource.initialize();
  try {
    // seed.sql has its own BEGIN/COMMIT, so it is all or nothing.
    await AdminDataSource.query(sql);
    const [{ count }] = await AdminDataSource.query('SELECT count(*)::int AS count FROM users');
    console.log(`Seed done. Users in database: ${count}`);
  } finally {
    await AdminDataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
