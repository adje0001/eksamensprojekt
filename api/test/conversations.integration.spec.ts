import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';

const EMAIL_PREFIX = 'conversation-test-';
const TITLE_PREFIX = 'Conversation test';
const PASSWORD = 'Secret123!';

let counter = 0;

const uniqueEmail = () => `${EMAIL_PREFIX}${Date.now()}-${counter++}@example.com`;

describe('Conversations endpoints (integration)', () => {
  let app: INestApplication;
  let db: DataSource;

  const http = () => request(app.getHttpServer());

  const createUser = async (firstName: string) => {
    const email = uniqueEmail();

    const signup = await http().post('/auth/signup').send({
      firstName,
      lastName: 'Test',
      email,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });

    const login = await http().post('/auth/login').send({
      email,
      password: PASSWORD,
    });

    expect(signup.status).toBe(201);
    expect(login.status).toBe(200);

    return {
      id: signup.body.id as number,
      token: login.body.accessToken as string,
    };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    db = app.get(DataSource);
  });

  afterAll(async () => {
    await db.query('DELETE FROM conversations WHERE title LIKE $1', [`${TITLE_PREFIX}%`]);

    await db.query('DELETE FROM users WHERE email LIKE $1', [`${EMAIL_PREFIX}%`]);

    await app.close();
  });

  it('creates a group conversation with the creator as a participant', async () => {
    const creator = await createUser('Creator');
    const participantOne = await createUser('Anna');
    const participantTwo = await createUser('Bo');

    const response = await http()
      .post('/conversations')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({
        title: `${TITLE_PREFIX} group`,
        isGroup: true,
        participantIds: [participantOne.id, participantTwo.id],
      });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      title: `${TITLE_PREFIX} group`,
      isGroup: true,
      createdById: creator.id,
    });

    const participants = await db.query(
      `
        SELECT user_id
        FROM conversation_participants
        WHERE conversation_id = $1
        ORDER BY user_id
      `,
      [response.body.id],
    );

    expect(participants.map((participant: { user_id: number }) => participant.user_id)).toEqual(
      [creator.id, participantOne.id, participantTwo.id].sort((a, b) => a - b),
    );
  });

  it('allows participants to read the conversation but hides it from outsiders', async () => {
    const creator = await createUser('Creator');
    const participantOne = await createUser('ParticipantOne');
    const participantTwo = await createUser('ParticipantTwo');
    const outsider = await createUser('Outsider');

    const created = await http()
      .post('/conversations')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({
        title: `${TITLE_PREFIX} access`,
        isGroup: true,
        participantIds: [participantOne.id, participantTwo.id],
      });

    expect(created.status).toBe(201);

    const participantResponse = await http()
      .get(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${participantOne.token}`);

    expect(participantResponse.status).toBe(200);
    expect(participantResponse.body.id).toBe(created.body.id);

    const listResponse = await http()
      .get('/conversations')
      .set('Authorization', `Bearer ${participantOne.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toContainEqual(
      expect.objectContaining({
        id: created.body.id,
      }),
    );

    const outsiderResponse = await http()
      .get(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${outsider.token}`);

    expect(outsiderResponse.status).toBe(404);
  });

  it('allows only the creator to update the group title', async () => {
    const creator = await createUser('Creator');
    const participantOne = await createUser('ParticipantOne');
    const participantTwo = await createUser('ParticipantTwo');

    const created = await http()
      .post('/conversations')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({
        title: `${TITLE_PREFIX} original`,
        isGroup: true,
        participantIds: [participantOne.id, participantTwo.id],
      });

    expect(created.status).toBe(201);

    const forbiddenUpdate = await http()
      .patch(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${participantOne.token}`)
      .send({
        title: 'Hacked title',
      });

    expect(forbiddenUpdate.status).toBe(404);

    const creatorUpdate = await http()
      .patch(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${creator.token}`)
      .send({
        title: '  Updated title  ',
      });

    expect(creatorUpdate.status).toBe(200);
    expect(creatorUpdate.body.title).toBe('Updated title');
  });

  it('allows only the creator to delete the conversation', async () => {
    const creator = await createUser('Creator');
    const participantOne = await createUser('ParticipantOne');
    const participantTwo = await createUser('ParticipantTwo');

    const created = await http()
      .post('/conversations')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({
        title: `${TITLE_PREFIX} delete`,
        isGroup: true,
        participantIds: [participantOne.id, participantTwo.id],
      });

    expect(created.status).toBe(201);

    const forbiddenDelete = await http()
      .delete(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${participantOne.token}`);

    expect(forbiddenDelete.status).toBe(404);

    const existingConversation = await http()
      .get(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${creator.token}`);

    expect(existingConversation.status).toBe(200);

    const creatorDelete = await http()
      .delete(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${creator.token}`);

    expect(creatorDelete.status).toBe(204);

    const deletedConversation = await http()
      .get(`/conversations/${created.body.id}`)
      .set('Authorization', `Bearer ${creator.token}`);

    expect(deletedConversation.status).toBe(404);

    const participants = await db.query(
      `
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = $1
    `,
      [created.body.id],
    );

    expect(participants).toEqual([]);
  });

  it.each([
    [
      'a group without a title',
      {
        isGroup: true,
        participantIds: [999_991, 999_992],
      },
    ],
    [
      'a direct conversation with multiple participants',
      {
        isGroup: false,
        participantIds: [999_991, 999_992],
      },
    ],
    [
      'duplicate participant ids',
      {
        title: `${TITLE_PREFIX} duplicate`,
        isGroup: true,
        participantIds: [999_991, 999_991],
      },
    ],
    [
      'an unknown createdById field',
      {
        title: `${TITLE_PREFIX} injected creator`,
        isGroup: true,
        participantIds: [999_991, 999_992],
        createdById: 123,
      },
    ],
  ])('rejects %s', async (_description, body) => {
    const creator = await createUser('Creator');

    const response = await http()
      .post('/conversations')
      .set('Authorization', `Bearer ${creator.token}`)
      .send(body);

    expect(response.status).toBe(400);
  });

  it('rejects participantIds containing the creator', async () => {
    const creator = await createUser('Creator');

    const response = await http()
      .post('/conversations')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({
        title: `${TITLE_PREFIX} duplicate creator`,
        isGroup: true,
        participantIds: [creator.id, 999_992],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('The creator must not be included in participantIds');
  });

  it('rolls back the conversation when saving participants fails', async () => {
    const creator = await createUser('Creator');
    const validParticipant = await createUser('Participant');

    const title = `${TITLE_PREFIX} rollback ${Date.now()}`;

    const response = await http()
      .post('/conversations')
      .set('Authorization', `Bearer ${creator.token}`)
      .send({
        title,
        isGroup: true,
        participantIds: [validParticipant.id, 2_147_483_647],
      });

    expect(response.status).toBe(500);

    const conversations = await db.query(
      `
      SELECT id
      FROM conversations
      WHERE title = $1
    `,
      [title],
    );

    expect(conversations).toEqual([]);
  });
});
