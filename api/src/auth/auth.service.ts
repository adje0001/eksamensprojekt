import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignupDto } from './dto/signup.dto.js';
import type { JwtPayload } from './jwt-auth.guard.js';

// Higher = slower to brute force, but slower signup/login. 12 is a common default.
const SALT_ROUNDS = 12;
const UNIQUE_VIOLATION = '23505';

// A real bcrypt hash of a random value. Login compares against it when the email is unknown,
// so a wrong email takes as long as a wrong password and the response time reveals nothing.
const DUMMY_HASH = '$2b$12$VaLc4yox1EEmXrWpodg3xe2JpvFEBXK2nC3SOWL03s7YpsG3cYl/S';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      const user = await this.users.save({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
      });
      // Pick fields explicitly, so the hash can never end up in the response
      return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email };
    } catch (error) {
      // The unique constraint on email decides, so two signups at the same time cannot both win
      if (error instanceof QueryFailedError && error.driverError.code === UNIQUE_VIOLATION) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    // password_hash is select: false on the entity, so ask for it explicitly
    const user = await this.users.findOne({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, role: true, passwordHash: true },
    });

    const passwordMatches = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordMatches) {
      // Same answer for an unknown email and a wrong password
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload) };
  }
}
