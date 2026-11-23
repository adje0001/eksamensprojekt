// Builds the Express app without starting it or connecting to the database.
// Tests import this file and call the routes with Supertest. server.ts starts it for real.
import express, { type ErrorRequestHandler } from 'express';
import { healthRouter } from './routes/health';

export function createApp() {
  const app = express();

  // Do not reveal that the server runs Express
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', healthRouter);

  // Unknown route
  app.use((_req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  // Last-resort error handler: log the error, never send stack traces to the client
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  };
  app.use(errorHandler);

  return app;
}
