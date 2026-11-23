import { Router } from 'express';

// GET /health: lets Docker, CI and the VPS check that the API is up.
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});
