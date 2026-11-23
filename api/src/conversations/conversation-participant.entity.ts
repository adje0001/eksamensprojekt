import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Conversation } from './conversation.entity.js';
import { User } from '../users/user.entity.js';

// Table: conversation_participants. Join table between users and conversations.
// Composite primary key: a user can only be in a conversation once.
@Entity({ name: 'conversation_participants' })
@Index('idx_participants_user', ['userId']) // find the conversations a user is part of
export class ConversationParticipant {
  @PrimaryColumn({ name: 'conversation_id', type: 'integer' })
  conversationId: number;

  @PrimaryColumn({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;
}
