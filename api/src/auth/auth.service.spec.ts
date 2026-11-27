import { jest } from '@jest/globals';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { AuthService } from './auth.service.js';
import type { User } from '../users/entities/user.entity.js';
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
    service = new AuthService(repo as never, {} as never);
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

describe('AuthService.login', () => {
  const PASSWORD = 'Secret123!';
  let hash: string;
  let repo: { findOne: jest.Mock<() => Promise<Partial<User> | null>> };
  let jwt: { signAsync: jest.Mock<(payload: object) => Promise<string>> };
  let service: AuthService;

  beforeAll(async () => {
    hash = await bcrypt.hash(PASSWORD, 4); // low cost, tests only
  });

  beforeEach(() => {
    repo = { findOne: jest.fn() };
    jwt = { signAsync: jest.fn(() => Promise.resolve('signed-token')) };
    service = new AuthService(repo as never, jwt as never);
  });

  // Removes the bcrypt spy even when a test fails, so it cannot affect later tests
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('signs a token with the user id and role', async () => {
    repo.findOne.mockResolvedValue({ id: 7, role: 'user', passwordHash: hash });

    const result = await service.login({ email: 'Anna@Example.com', password: PASSWORD });

    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'anna@example.com' } }),
    );
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 7, role: 'user' });
    expect(result).toEqual({ accessToken: 'signed-token' });
  });

  it('throws 401 for a wrong password', async () => {
    repo.findOne.mockResolvedValue({ id: 7, role: 'user', passwordHash: hash });

    await expect(
      service.login({ email: 'anna@example.com', password: 'Wrong123!' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('still runs bcrypt for an unknown email, so the response time does not reveal it', async () => {
    repo.findOne.mockResolvedValue(null);
    const compare = jest.spyOn(bcrypt, 'compare');

    await expect(
      service.login({ email: 'nobody@example.com', password: PASSWORD }),
    ).rejects.toThrow(UnauthorizedException);
    expect(compare).toHaveBeenCalledTimes(1);
  });
});
