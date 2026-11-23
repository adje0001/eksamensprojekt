import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';

// Integration test: the full app over HTTP against the dev database (run `docker compose up -d db`
// and `npm run migration:run` first). Every test uses its own email, so tests do not depend on order.
const EMAIL_PREFIX = 'signup-test-';
let counter = 0;
const uniqueEmail = () => `${EMAIL_PREFIX}${Date.now()}-${counter++}@example.com`;

const validSignup = (email: string) => ({
  firstName: 'Anna',
  lastName: 'Jensen',
  email,
  password: 'Secret123!',
  confirmPassword: 'Secret123!',
});

describe('POST /auth/signup (integration)', () => {
  let app: INestApplication;
  let db: DataSource;

  const signup = (body: object) => request(app.getHttpServer()).post('/auth/signup').send(body);
  const countUsers = async (email: string) => {
    const [{ count }] = await db.query(
      'SELECT count(*)::int AS count FROM users WHERE email = $1',
      [email.toLowerCase()],
    );
    return count as number;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    db = app.get(DataSource);
  });

  afterAll(async () => {
    await db.query('DELETE FROM users WHERE email LIKE $1', [`${EMAIL_PREFIX}%`]);
    await app.close();
  });

  it('creates the user and returns it without any password fields', async () => {
    const email = uniqueEmail();
    const res = await signup(validSignup(email));

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(Number),
      firstName: 'Anna',
      lastName: 'Jensen',
      email,
    });
  });

  it('stores the password as a bcrypt hash', async () => {
    const email = uniqueEmail();
    await signup(validSignup(email));

    const [{ password_hash: hash }] = await db.query(
      'SELECT password_hash FROM users WHERE email = $1',
      [email],
    );
    expect(hash).toMatch(/^\$2b\$/);
    expect(hash).not.toBe('Secret123!');
    expect(await bcrypt.compare('Secret123!', hash)).toBe(true);
  });

  it('stores a new user with role user', async () => {
    const email = uniqueEmail();
    await signup(validSignup(email));

    const [{ role }] = await db.query('SELECT role FROM users WHERE email = $1', [email]);
    expect(role).toBe('user');
  });

  it('rejects mismatched passwords', async () => {
    const email = uniqueEmail();
    const res = await signup({ ...validSignup(email), confirmPassword: 'Different123!' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Passwords do not match');
    expect(await countUsers(email)).toBe(0);
  });

  it.each([
    ['empty first name', { firstName: '' }],
    ['missing last name', { lastName: undefined }],
    ['invalid email', { email: 'not-an-email' }],
    ['short password', { password: 'Short1!', confirmPassword: 'Short1!' }],
    // 37 × "ø" = 37 characters but 74 bytes, over bcrypt's 72-byte limit
    ['password over 72 bytes', { password: 'ø'.repeat(37), confirmPassword: 'ø'.repeat(37) }],
  ])('rejects invalid input: %s', async (_case, override) => {
    const email = uniqueEmail();
    const res = await signup({ ...validSignup(email), ...override });

    expect(res.status).toBe(400);
    expect(await countUsers(email)).toBe(0);
  });

  it('rejects an email that is already registered, ignoring case', async () => {
    const email = uniqueEmail();
    await signup(validSignup(email));

    const res = await signup(validSignup(email.toUpperCase()));

    expect(res.status).toBe(409);
    expect(await countUsers(email)).toBe(1);
  });

  it('denies signing up as admin', async () => {
    const email = uniqueEmail();
    const res = await signup({ ...validSignup(email), role: 'admin' });

    expect(res.status).toBe(400);
    expect(await countUsers(email)).toBe(0);
  });
});
