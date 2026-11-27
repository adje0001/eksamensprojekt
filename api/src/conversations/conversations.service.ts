import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity.js';
import { ConversationParticipant } from './entities/conversation-participant.entity.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { UpdateConversationDto } from './dto/update-conversation.dto.js';

const POSTGRES_FOREIGN_KEY_VIOLATION_CODE = '23503';
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

    try {
      return await this.dataSource.transaction(async (manager) => {
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
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === POSTGRES_FOREIGN_KEY_VIOLATION_CODE
      ) {
        throw new BadRequestException('One or more participants were not found');
      }

      throw error;
    }
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

  async updateTitle(
    conversationId: number,
    currentUserId: number,
    dto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: {
        id: conversationId,
        createdById: currentUserId,
        isGroup: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    conversation.title = dto.title;

    return this.conversationsRepository.save(conversation);
  }

  async remove(conversationId: number, currentUserId: number): Promise<void> {
    const result = await this.conversationsRepository.delete({
      id: conversationId,
      createdById: currentUserId,
    });

    if (!result.affected) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }
  }
}
