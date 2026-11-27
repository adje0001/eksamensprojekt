import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity.js';
import { ConversationParticipant } from './entities/conversation-participant.entity.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,

    @InjectRepository(ConversationParticipant)
    private readonly participantsRepository: Repository<ConversationParticipant>,

    private readonly dataSource: DataSource,
  ) {}

  async create(currentUserId: number, dto: CreateConversationDto): Promise<Conversation> {
    if (dto.participantIds.includes(currentUserId)) {
      throw new BadRequestException('The creator must not be included in participantIds');
    }

    if (!dto.isGroup && dto.participantIds.length !== 1) {
      throw new BadRequestException(
        'A direct conversation must have exactly one other participant',
      );
    }

    if (dto.isGroup && !dto.title) {
      throw new BadRequestException('A group conversation must have a title');
    }

    if (dto.isGroup && dto.participantIds.length < 2) {
      throw new BadRequestException(
        'A group conversation must have at least two other participants',
      );
    }

    if (!dto.isGroup && dto.title !== undefined) {
      throw new BadRequestException('A direct conversation must not have a title');
    }

    return this.dataSource.transaction(async (manager) => {
      const conversationsRepository = manager.getRepository(Conversation);

      const participantsRepository = manager.getRepository(ConversationParticipant);

      const conversation = conversationsRepository.create({
        title: dto.title ?? null,
        isGroup: dto.isGroup,
        createdById: currentUserId,
      });

      const savedConversation = await conversationsRepository.save(conversation);

      const participantIds = [currentUserId, ...dto.participantIds];

      const participants = participantsRepository.create(
        participantIds.map((userId) => ({
          conversationId: savedConversation.id,
          userId,
        })),
      );

      await participantsRepository.save(participants);

      return savedConversation;
    });
  }

  async findAllForUser(currentUserId: number): Promise<Conversation[]> {
    const memberships = await this.participantsRepository.find({
      where: { userId: currentUserId },
      relations: { conversation: true },
      order: { joinedAt: 'DESC' },
    });

    return memberships.map((membership) => membership.conversation);
  }

  async findOneForUser(conversationId: number, currentUserId: number): Promise<Conversation> {
    const membership = await this.participantsRepository.findOne({
      where: {
        conversationId,
        userId: currentUserId,
      },
      relations: { conversation: true },
    });

    if (!membership) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    return membership.conversation;
  }
}
