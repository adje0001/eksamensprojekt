import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';

// Integration test: login, the JWT guard and /users/me against the dev database.
// Every test signs up its own users, so tests do not depend on order.
const EMAIL_PREFIX = 'jwt-test-';
const PASSWORD = 'Secret123!';
let counter = 0;
const uniqueEmail = () => `${EMAIL_PREFIX}${Date.now()}-${counter++}@example.com`;

describe('JWT auth (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let jwt: JwtService;

  const http = () => request(app.getHttpServer());

  // Creates a user through the real signup route and returns its id, email and a token
  const createUser = async (firstName: string) => {
    const email = uniqueEmail();
    const signup = await http()
      .post('/auth/signup')
      .send({ firstName, lastName: 'Test', email, password: PASSWORD, confirmPassword: PASSWORD });
    const login = await http().post('/auth/login').send({ email, password: PASSWORD });
    // Fail here with a clear message instead of later with an undefined id or token
    expect(signup.status).toBe(201);
    expect(login.status).toBe(200);
    return { id: signup.body.id as number, email, token: login.body.accessToken as string };
  };

  const findUser = async (id: number) => {
    const rows = await db.query('SELECT first_name, email FROM users WHERE id = $1', [id]);
    return rows[0] as { first_name: string; email: string } | undefined;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    db = app.get(DataSource);
    jwt = app.get(JwtService);
  });

  afterAll(async () => {
    await db.query('DELETE FROM users WHERE email LIKE $1', [`${EMAIL_PREFIX}%`]);
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('returns an access token for the user', async () => {
      const anna = await createUser('Anna');

      const res = await http().post('/auth/login').send({ email: anna.email, password: PASSWORD });

      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(['accessToken']);
      const payload = await jwt.verifyAsync(res.body.accessToken);
      expect(payload.sub).toBe(anna.id);
    });

    it('gives the same 401 for a wrong password and an unknown email', async () => {
      const anna = await createUser('Anna');

      const wrongPassword = await http()
        .post('/auth/login')
        .send({ email: anna.email, password: 'Wrong123!' });
      const unknownEmail = await http()
        .post('/auth/login')
        .send({ email: uniqueEmail(), password: PASSWORD });

      expect(wrongPassword.status).toBe(401);
      expect(unknownEmail.status).toBe(401);
      expect(wrongPassword.body.message).toBe('Invalid email or password');
      expect(unknownEmail.body).toEqual(wrongPassword.body);
    });

    it('rejects an invalid body with 400', async () => {
      const res = await http().post('/auth/login').send({ password: PASSWORD });

      expect(res.status).toBe(400);
    });
  });

  describe('protected routes (denied access)', () => {
    const routes = [
      ['get', '/users?search=a'],
      ['get', '/users/1'],
      ['patch', '/users/me'],
      ['delete', '/users/me'],
    ] as const;

    it.each(routes)('%s %s without a token returns 401', async (method, path) => {
      const res = await http()[method](path);

      expect(res.status).toBe(401);
    });

    it.each(routes)(
      '%s %s with a token signed by someone else returns 401',
      async (method, path) => {
        const forged = await new JwtService({ secret: 'not-our-secret' }).signAsync({ sub: 1 });

        const res = await http()[method](path).set('Authorization', `Bearer ${forged}`);

        expect(res.status).toBe(401);
      },
    );

    it.each(routes)('%s %s with the wrong scheme returns 401', async (method, path) => {
      const res = await http()[method](path).set('Authorization', 'Basic dXNlcjpwYXNz');

      expect(res.status).toBe(401);
    });

    it.each(routes)('%s %s with a token that is not a JWT returns 401', async (method, path) => {
      const res = await http()[method](path).set('Authorization', 'Bearer not-a-jwt');

      expect(res.status).toBe(401);
    });

    it.each(routes)('%s %s with an expired token returns 401', async (method, path) => {
      const expired = await jwt.signAsync({ sub: 1, role: 'user' }, { expiresIn: -60 });

      const res = await http()[method](path).set('Authorization', `Bearer ${expired}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('updates only the logged-in user', async () => {
      const anna = await createUser('Anna');
      const bo = await createUser('Bo');

      const res = await http()
        .patch('/users/me')
        .set('Authorization', `Bearer ${anna.token}`)
        .send({ firstName: 'Annie' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: anna.id,
        firstName: 'Annie',
        lastName: 'Test',
        email: anna.email,
      });
      expect((await findUser(bo.id))?.first_name).toBe('Bo');
    });

    it('returns 409 when the email belongs to someone else', async () => {
      const anna = await createUser('Anna');
      const bo = await createUser('Bo');

      const res = await http()
        .patch('/users/me')
        .set('Authorization', `Bearer ${anna.token}`)
        .send({ email: bo.email });

      expect(res.status).toBe(409);
      expect((await findUser(anna.id))?.email).toBe(anna.email);
    });

    it('rejects an id in the body, so nobody can target another user', async () => {
      const anna = await createUser('Anna');
      const bo = await createUser('Bo');

      const res = await http()
        .patch('/users/me')
        .set('Authorization', `Bearer ${anna.token}`)
        .send({ id: bo.id, firstName: 'Hacked' });

      expect(res.status).toBe(400);
      expect((await findUser(bo.id))?.first_name).toBe('Bo');
    });
  });

  describe('DELETE /users/me', () => {
    it('deletes only the logged-in user', async () => {
      const anna = await createUser('Anna');
      const bo = await createUser('Bo');

      const res = await http().delete('/users/me').set('Authorization', `Bearer ${anna.token}`);

      expect(res.status).toBe(204);
      expect(await findUser(anna.id)).toBeUndefined();
      expect(await findUser(bo.id)).toBeDefined();
    });

    it('returns 404 when the token belongs to a deleted user', async () => {
      const anna = await createUser('Anna');
      await http().delete('/users/me').set('Authorization', `Bearer ${anna.token}`);

      const res = await http()
        .patch('/users/me')
        .set('Authorization', `Bearer ${anna.token}`)
        .send({ firstName: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });
});
