import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsService } from './conversations.service.js';
import { Conversation } from './entities/conversation.entity.js';
import { ConversationParticipant } from './entities/conversation-participant.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, ConversationParticipant])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
