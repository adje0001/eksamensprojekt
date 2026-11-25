import { jest } from '@jest/globals';
import { BadRequestException, ConflictException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { AuthService } from './auth.service.js';
import type { User } from '../users/user.entity.js';
import type { SignupDto } from './dto/signup.dto.js';

// Unit test: AuthService with a fake repository. No HTTP, no database.
describe('AuthService.signup', () => {
  const dto: SignupDto = {
    firstName: 'Anna',
    lastName: 'Jensen',
    email: 'Anna@Example.com',
    password: 'Secret123!',
    confirmPassword: 'Secret123!',
  };

  let repo: { save: jest.Mock<(user: Partial<User>) => Promise<Partial<User>>> };
  let service: AuthService;

  beforeEach(() => {
    repo = { save: jest.fn((user) => Promise.resolve({ id: 1, ...user })) };
    service = new AuthService(repo as never);
  });

  it('saves a lowercase email and a bcrypt hash, and returns no password', async () => {
    const result = await service.signup(dto);

    const saved = repo.save.mock.calls[0][0];
    expect(saved.email).toBe('anna@example.com');
    expect(await bcrypt.compare('Secret123!', saved.passwordHash!)).toBe(true);
    expect(result).toEqual({
      id: 1,
      firstName: 'Anna',
      lastName: 'Jensen',
      email: 'anna@example.com',
    });
  });

  it('throws 400 when the passwords do not match', async () => {
    await expect(service.signup({ ...dto, confirmPassword: 'Other123!' })).rejects.toThrow(
      BadRequestException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('throws 409 when the email is already taken', async () => {
    // 23505 = Postgres unique_violation
    repo.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], Object.assign(new Error('duplicate'), { code: '23505' })),
    );

    await expect(service.signup(dto)).rejects.toThrow(ConflictException);
  });
});
