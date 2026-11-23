import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

// Table: conversations. 1:1 chats have no title; group chats have is_group = true.
@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn('identity', { type: 'integer', generatedIdentity: 'ALWAYS' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string | null;

  @Column({ name: 'is_group', type: 'boolean', default: false })
  isGroup: boolean;

  // The conversation stays if the creator is deleted
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User | null;

  @Column({ name: 'created_by', type: 'integer', nullable: true })
  createdById: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
