import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';

describe('Users endpoints (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let userId: number;

  const email = `users-test-${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    db = app.get(DataSource);

    const [user] = await db.query(
      `
        INSERT INTO users (
          email,
          first_name,
          last_name,
          password_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [
        email,
        'Integration',
        'Testuser',
        '$2b$10$Iipx4Lf4L9PhdfEBEM4GbekvUIB9/TtmjzDMI30E9NbxzDqBYCWtu',
      ],
    );

    userId = user.id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    await app.close();
  });

  it('returns a public user profile', async () => {
    const response = await request(app.getHttpServer()).get(`/users/${userId}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      id: userId,
      firstName: 'Integration',
      lastName: 'Testuser',
    });

    expect(response.body).not.toHaveProperty('email');
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('role');
  });

  it('returns users matching a case-insensitive search', async () => {
    const response = await request(app.getHttpServer()).get('/users').query({
      search: email.toUpperCase(),
    });

    expect(response.status).toBe(200);

    expect(response.body).toContainEqual({
      id: userId,
      firstName: 'Integration',
      lastName: 'Testuser',
    });

    for (const user of response.body) {
      expect(user).not.toHaveProperty('email');
      expect(user).not.toHaveProperty('passwordHash');
      expect(user).not.toHaveProperty('role');
    }
  });

  it('returns 404 when the user does not exist', async () => {
    const response = await request(app.getHttpServer()).get('/users/2147483647');

    expect(response.status).toBe(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'User with id 2147483647 was not found',
      error: 'Not Found',
    });
  });

  it('returns 400 when the user id is not a number', async () => {
    const response = await request(app.getHttpServer()).get('/users/not-a-number');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });

  it('returns an empty array when no search term is provided', async () => {
    const response = await request(app.getHttpServer()).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
