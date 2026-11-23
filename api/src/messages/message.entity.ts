import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from '../conversations/conversation.entity.js';
import { User } from '../users/user.entity.js';

// Table: messages.
// The index (conversation_id, created_at DESC) serves "newest messages in a conversation".
// TypeORM cannot express DESC in a decorator, so the index is written by hand in the
// InitialSchema migration. synchronize: false tells migration:generate to leave it alone.
@Entity({ name: 'messages' })
@Index('idx_messages_conversation_created', { synchronize: false })
export class Message {
  // BIGINT: Postgres returns it as a string in JavaScript to avoid losing precision
  @PrimaryGeneratedColumn('identity', { type: 'bigint', generatedIdentity: 'ALWAYS' })
  id: string;

  @Column({ name: 'conversation_id', type: 'integer' })
  conversationId: number;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // NULL = "deleted user"
  @Column({ name: 'sender_id', type: 'integer', nullable: true })
  senderId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender: User | null;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
