import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard, type JwtPayload } from '../auth/jwt-auth.guard.js';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsService } from './conversations.service.js';
import type { CreateConversationDto } from './dto/create-conversation.dto.js';
import type { UpdateConversationDto } from './dto/update-conversation.dto.js';
import type { Conversation } from './entities/conversation.entity.js';

describe('ConversationsController', () => {
  let controller: ConversationsController;

  let create: jest.Mock<(userId: number, dto: CreateConversationDto) => Promise<Conversation>>;

  let findAllForUser: jest.Mock<(userId: number) => Promise<Conversation[]>>;

  let findOneForUser: jest.Mock<(conversationId: number, userId: number) => Promise<Conversation>>;

  let updateTitle: jest.Mock<
    (conversationId: number, userId: number, dto: UpdateConversationDto) => Promise<Conversation>
  >;

  let remove: jest.Mock<(conversationId: number, userId: number) => Promise<void>>;

  beforeEach(async () => {
    create = jest.fn();
    findAllForUser = jest.fn();
    findOneForUser = jest.fn();
    updateTitle = jest.fn();
    remove = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: {
            create,
            findAllForUser,
            findOneForUser,
            updateTitle,
            remove,
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ConversationsController);
  });

  it('creates a conversation for the logged-in user', async () => {
    const user: JwtPayload = {
      sub: 1,
      role: 'user',
    };

    const dto: CreateConversationDto = {
      title: 'Eksamensgruppen',
      isGroup: true,
      participantIds: [2, 3],
    };

    const conversation = {
      id: 10,
      title: dto.title,
      isGroup: true,
      createdById: user.sub,
    } as Conversation;

    create.mockResolvedValue(conversation);

    const result = await controller.create(user, dto);

    expect(create).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(conversation);
  });

  it('returns conversations for the logged-in user', async () => {
    const user: JwtPayload = {
      sub: 1,
      role: 'user',
    };

    const conversations = [
      {
        id: 10,
        title: 'Eksamensgruppen',
        isGroup: true,
      },
    ] as Conversation[];

    findAllForUser.mockResolvedValue(conversations);

    const result = await controller.findAll(user);

    expect(findAllForUser).toHaveBeenCalledWith(1);
    expect(result).toEqual(conversations);
  });

  it('returns one conversation for the logged-in user', async () => {
    const user: JwtPayload = {
      sub: 1,
      role: 'user',
    };

    const conversation = {
      id: 10,
      title: 'Eksamensgruppen',
      isGroup: true,
    } as Conversation;

    findOneForUser.mockResolvedValue(conversation);

    const result = await controller.findOne(10, user);

    expect(findOneForUser).toHaveBeenCalledWith(10, 1);
    expect(result).toEqual(conversation);
  });

  it('updates a conversation title for the logged-in user', async () => {
    const user: JwtPayload = {
      sub: 1,
      role: 'user',
    };

    const dto: UpdateConversationDto = {
      title: 'Ny titel',
    };

    const conversation = {
      id: 10,
      title: dto.title,
      isGroup: true,
      createdById: 1,
    } as Conversation;

    updateTitle.mockResolvedValue(conversation);

    const result = await controller.updateTitle(10, user, dto);

    expect(updateTitle).toHaveBeenCalledWith(10, 1, dto);
    expect(result).toEqual(conversation);
  });

  it('deletes a conversation for the logged-in user', async () => {
    const user: JwtPayload = {
      sub: 1,
      role: 'user',
    };

    remove.mockResolvedValue(undefined);

    await expect(controller.remove(10, user)).resolves.toBeUndefined();

    expect(remove).toHaveBeenCalledWith(10, 1);
  });
});
