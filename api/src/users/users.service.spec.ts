import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let findOneBy: jest.Mock<(where: { id: number }) => Promise<User | null>>;

  beforeEach(async () => {
    findOneBy = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOneBy },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('returns a public user profile', async () => {
    findOneBy.mockResolvedValue({
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
      email: 'filip@test.dk',
      passwordHash: 'not-returned',
      role: 'user',
      createdAt: new Date(),
    });

    const result = await service.findOne(1);

    expect(findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual({
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
    });
  });

  it('throws NotFoundException when the user does not exist', async () => {
    findOneBy.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
