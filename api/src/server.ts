// Entry point: connect to the database as chat_app, then start the HTTP server.
import 'reflect-metadata';
import { createApp } from './app';
import { AppDataSource } from './db/data-source';

const port = Number(process.env.PORT ?? 3000);

async function main(): Promise<void> {
  await AppDataSource.initialize();
  console.log('Connected to the database as chat_app');

  const server = createApp().listen(port, () => {
    console.log(`API listening on port ${port}`);
  });

  // Close cleanly when Docker stops the container
  process.on('SIGTERM', () => {
    server.close(() => {
      void AppDataSource.destroy().then(() => process.exit(0));
    });
  });
}

main().catch((error) => {
  console.error('Failed to start the API:', error);
  process.exit(1);
});
