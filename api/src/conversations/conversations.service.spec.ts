import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service.js';
import { Conversation } from './entities/conversation.entity.js';
import { ConversationParticipant } from './entities/conversation-participant.entity.js';
import { DataSource, DeleteResult, FindManyOptions, FindOneOptions } from 'typeorm';

describe('ConversationsService', () => {
  let service: ConversationsService;

  type ConversationInput = {
    title: string | null;
    isGroup: boolean;
    createdById: number;
  };

  type ParticipantInput = {
    conversationId: number;
    userId: number;
  };

  const conversationsRepository = {
    create: jest.fn<(input: ConversationInput) => Conversation>(),
    save: jest.fn<(conversation: Conversation) => Promise<Conversation>>(),
    findOne: jest.fn<(options: FindOneOptions<Conversation>) => Promise<Conversation | null>>(),
    delete: jest.fn<(criteria: { id: number; createdById: number }) => Promise<DeleteResult>>(),
  };

  const participantsRepository = {
    create: jest.fn<(input: ParticipantInput[]) => ConversationParticipant[]>(),
    save: jest.fn<
      (participants: ConversationParticipant[]) => Promise<ConversationParticipant[]>
    >(),
    find: jest.fn<
      (options?: FindManyOptions<ConversationParticipant>) => Promise<ConversationParticipant[]>
    >(),
    findOne:
      jest.fn<
        (
          options: FindOneOptions<ConversationParticipant>,
        ) => Promise<ConversationParticipant | null>
      >(),
  };

  const transactionManager = {
    getRepository: jest.fn(),
  };

  type TransactionCallback = (manager: typeof transactionManager) => Promise<unknown>;

  const dataSource = {
    transaction: jest.fn<(callback: TransactionCallback) => Promise<unknown>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    transactionManager.getRepository.mockImplementation((entity: unknown) => {
      if (entity === Conversation) {
        return conversationsRepository;
      }

      return participantsRepository;
    });

    dataSource.transaction.mockImplementation(async (callback) => callback(transactionManager));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: conversationsRepository,
        },
        {
          provide: getRepositoryToken(ConversationParticipant),
          useValue: participantsRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a conversation and adds the creator as a participant', async () => {
    const dto = {
      title: 'Eksamensgruppen',
      isGroup: true,
      participantIds: [2, 3],
    };

    const conversation = {
      id: 10,
      title: dto.title,
      isGroup: dto.isGroup,
      createdById: 1,
    } as Conversation;

    const participants = [
      { conversationId: 10, userId: 1 },
      { conversationId: 10, userId: 2 },
      { conversationId: 10, userId: 3 },
    ] as ConversationParticipant[];

    conversationsRepository.create.mockReturnValue(conversation);
    conversationsRepository.save.mockResolvedValue(conversation);
    participantsRepository.create.mockReturnValue(participants);
    participantsRepository.save.mockResolvedValue(participants);

    const result = await service.create(1, dto);

    expect(conversationsRepository.create).toHaveBeenCalledWith({
      title: 'Eksamensgruppen',
      isGroup: true,
      createdById: 1,
    });

    expect(participantsRepository.create).toHaveBeenCalledWith([
      { conversationId: 10, userId: 1 },
      { conversationId: 10, userId: 2 },
      { conversationId: 10, userId: 3 },
    ]);

    expect(participantsRepository.save).toHaveBeenCalledWith(participants);
    expect(result).toEqual(conversation);
  });

  it('rejects a direct conversation with more than one other participant', async () => {
    const dto = {
      isGroup: false,
      participantIds: [2, 3],
    };

    await expect(service.create(1, dto)).rejects.toThrow(
      'A direct conversation must have exactly one other participant',
    );

    expect(conversationsRepository.save).not.toHaveBeenCalled();
    expect(participantsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects participantIds containing the creator', async () => {
    const dto = {
      title: 'Eksamensgruppen',
      isGroup: true,
      participantIds: [1, 2, 3],
    };

    await expect(service.create(1, dto)).rejects.toThrow(
      'The creator must not be included in participantIds',
    );

    expect(conversationsRepository.save).not.toHaveBeenCalled();
    expect(participantsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a group conversation without a title', async () => {
    const dto = {
      isGroup: true,
      participantIds: [2, 3],
    };

    await expect(service.create(1, dto)).rejects.toThrow('A group conversation must have a title');

    expect(conversationsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a group conversation with fewer than two other participants', async () => {
    const dto = {
      title: 'Eksamensgruppen',
      isGroup: true,
      participantIds: [2],
    };

    await expect(service.create(1, dto)).rejects.toThrow(
      'A group conversation must have at least two other participants',
    );

    expect(conversationsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a direct conversation with a title', async () => {
    const dto = {
      title: 'Private chat',
      isGroup: false,
      participantIds: [2],
    };

    await expect(service.create(1, dto)).rejects.toThrow(
      'A direct conversation must not have a title',
    );

    expect(conversationsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects when saving participants fails', async () => {
    const dto = {
      title: 'Eksamensgruppen',
      isGroup: true,
      participantIds: [2, 3],
    };

    const conversation = {
      id: 10,
      title: dto.title,
      isGroup: true,
      createdById: 1,
    } as Conversation;

    const participants = [
      { conversationId: 10, userId: 1 },
      { conversationId: 10, userId: 2 },
      { conversationId: 10, userId: 3 },
    ] as ConversationParticipant[];

    conversationsRepository.create.mockReturnValue(conversation);
    conversationsRepository.save.mockResolvedValue(conversation);
    participantsRepository.create.mockReturnValue(participants);
    participantsRepository.save.mockRejectedValue(new Error('Participant save failed'));

    await expect(service.create(1, dto)).rejects.toThrow('Participant save failed');

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(conversationsRepository.save).toHaveBeenCalledWith(conversation);
    expect(participantsRepository.save).toHaveBeenCalledWith(participants);
  });

  it('rejects when saving participants fails', async () => {
    const dto = {
      title: 'Eksamensgruppen',
      isGroup: true,
      participantIds: [2, 3],
    };

    const conversation = {
      id: 10,
      title: dto.title,
      isGroup: true,
      createdById: 1,
    } as Conversation;

    const participants = [
      { conversationId: 10, userId: 1 },
      { conversationId: 10, userId: 2 },
      { conversationId: 10, userId: 3 },
    ] as ConversationParticipant[];

    conversationsRepository.create.mockReturnValue(conversation);
    conversationsRepository.save.mockResolvedValue(conversation);
    participantsRepository.create.mockReturnValue(participants);
    participantsRepository.save.mockRejectedValue(new Error('Participant save failed'));

    await expect(service.create(1, dto)).rejects.toThrow('Participant save failed');

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(conversationsRepository.save).toHaveBeenCalledWith(conversation);
    expect(participantsRepository.save).toHaveBeenCalledWith(participants);
  });

  it('returns conversations that the user participates in', async () => {
    const conversations = [
      {
        id: 10,
        title: 'Eksamensgruppen',
        isGroup: true,
      },
      {
        id: 11,
        title: null,
        isGroup: false,
      },
    ] as Conversation[];

    const memberships = [
      {
        conversationId: 10,
        userId: 1,
        conversation: conversations[0],
      },
      {
        conversationId: 11,
        userId: 1,
        conversation: conversations[1],
      },
    ] as ConversationParticipant[];

    participantsRepository.find.mockResolvedValue(memberships);

    const result = await service.findAllForUser(1);

    expect(participantsRepository.find).toHaveBeenCalledWith({
      where: { userId: 1 },
      relations: { conversation: true },
      order: { joinedAt: 'DESC' },
    });

    expect(result).toEqual(conversations);
  });

  it('returns a conversation when the user is a participant', async () => {
    const conversation = {
      id: 10,
      title: 'Eksamensgruppen',
      isGroup: true,
    } as Conversation;

    const membership = {
      conversationId: 10,
      userId: 1,
      conversation,
    } as ConversationParticipant;

    participantsRepository.findOne.mockResolvedValue(membership);

    const result = await service.findOneForUser(10, 1);

    expect(participantsRepository.findOne).toHaveBeenCalledWith({
      where: {
        conversationId: 10,
        userId: 1,
      },
      relations: { conversation: true },
    });

    expect(result).toEqual(conversation);
  });

  it('throws when the user is not a participant', async () => {
    participantsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOneForUser(10, 1)).rejects.toThrow('Conversation 10 not found');
  });

  it('updates the title when the current user created the group', async () => {
    const conversation = {
      id: 10,
      title: 'Gammel titel',
      isGroup: true,
      createdById: 1,
    } as Conversation;

    conversationsRepository.findOne.mockResolvedValue(conversation);
    conversationsRepository.save.mockResolvedValue({
      ...conversation,
      title: 'Ny titel',
    });

    const result = await service.updateTitle(10, 1, { title: 'Ny titel' });

    expect(conversationsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 10,
        createdById: 1,
        isGroup: true,
      },
    });

    expect(conversationsRepository.save).toHaveBeenCalledWith({
      ...conversation,
      title: 'Ny titel',
    });

    expect(result.title).toBe('Ny titel');
  });

  it('rejects updating a conversation the user did not create', async () => {
    conversationsRepository.findOne.mockResolvedValue(null);

    await expect(service.updateTitle(10, 2, { title: 'Ny titel' })).rejects.toThrow(
      'Conversation 10 not found',
    );

    expect(conversationsRepository.save).not.toHaveBeenCalled();
  });

  it('deletes a conversation created by the current user', async () => {
    conversationsRepository.delete.mockResolvedValue({
      affected: 1,
      raw: [],
    });

    await expect(service.remove(10, 1)).resolves.toBeUndefined();

    expect(conversationsRepository.delete).toHaveBeenCalledWith({
      id: 10,
      createdById: 1,
    });
  });

  it('rejects deleting a conversation the user did not create', async () => {
    conversationsRepository.delete.mockResolvedValue({
      affected: 0,
      raw: [],
    });

    await expect(service.remove(10, 2)).rejects.toThrow('Conversation 10 not found');

    expect(conversationsRepository.delete).toHaveBeenCalledWith({
      id: 10,
      createdById: 2,
    });
  });
});
