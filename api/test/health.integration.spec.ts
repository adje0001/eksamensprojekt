import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HealthModule } from '../src/health/health.module.js';
import { configureApp } from '../src/setup.js';

// Integration test: a real Nest app over HTTP with Supertest.
// It imports HealthModule only, so it needs no database.
describe('GET /health (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [HealthModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 and status ok', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('does not reveal the server technology', async () => {
    const res = await request(app.getHttpServer()).get('/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('returns 404 with a JSON error for unknown routes', async () => {
    const res = await request(app.getHttpServer()).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ statusCode: 404, error: 'Not Found' });
  });
});
