// HTTP settings shared by main.ts and the integration tests, so tests run the app
// with the same configuration as production.
import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

export function configureApp(app: INestApplication): void {
  // Do not reveal that the server runs Express
  (app as NestExpressApplication).disable('x-powered-by');

  // Lets Docker stop the container cleanly (closes DB connections on SIGTERM)
  app.enableShutdownHooks();
}
