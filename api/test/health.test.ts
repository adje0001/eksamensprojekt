import request from 'supertest';
import { createApp } from '../src/app';

// These tests run without a database. They only exercise the Express app.
describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(createApp()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('does not reveal the server technology', async () => {
    const res = await request(createApp()).get('/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('unknown routes', () => {
  it('returns 404 with a JSON error', async () => {
    const res = await request(createApp()).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'not found' });
  });
});
