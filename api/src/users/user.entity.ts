import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Table: users. The schema itself is created by the InitialSchema migration.
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('identity', { type: 'integer', generatedIdentity: 'ALWAYS' })
  id: number;

  // 254 = max length of an email address
  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  username: string;

  // A bcrypt hash is always exactly 60 characters. Never select this in API responses.
  @Column({ name: 'password_hash', type: 'char', length: 60, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
