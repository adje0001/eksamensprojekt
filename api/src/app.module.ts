// Root module. Every feature (auth, users, conversations, messages) gets its own module
// and is imported here.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { appDbOptions } from './db/data-source.js';
import { HealthModule } from './health/health.module.js';
import { UsersModule } from './users/users.module.js';
import { ConversationsModule } from './conversations/conversations.module.js';
import { MessagesModule } from './messages/messages.module.js';

@Module({
  imports: [
    // TypeORM connection as chat_app. synchronize is false (set in db/config.ts):
    // the schema only changes through migrations.
    TypeOrmModule.forRootAsync({ useFactory: appDbOptions }),
    HealthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
    AuthModule,
  ],
})
export class AppModule {}
