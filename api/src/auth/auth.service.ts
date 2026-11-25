import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
import type { SignupDto } from './dto/signup.dto.js';

// Higher = slower to brute force, but slower signup/login. 12 is a common default.
const SALT_ROUNDS = 12;
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

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
}
