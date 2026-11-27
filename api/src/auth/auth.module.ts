import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { requireEnv } from '../db/config.js';
import { User } from '../users/entities/user.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

// Feature module: signup and login. Imported by AppModule.
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // global: JwtService is available in every module, so JwtAuthGuard works everywhere.
    // registerAsync reads the secret when the app starts, and the app refuses to start without it.
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({ secret: requireEnv('JWT_SECRET'), signOptions: { expiresIn: '1h' } }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
