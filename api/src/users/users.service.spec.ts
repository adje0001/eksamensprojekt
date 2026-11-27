import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { FindManyOptions } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  let findOneBy: jest.Mock<(where: { id: number }) => Promise<User | null>>;

  let find: jest.Mock<(options?: FindManyOptions<User>) => Promise<User[]>>;

  beforeEach(async () => {
    findOneBy = jest.fn();
    find = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy,
            find,
          },
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

  it('returns public profiles matching the search', async () => {
    find.mockResolvedValue([
      {
        id: 1,
        firstName: 'Filip',
        lastName: 'Jensen',
        email: 'filip@test.dk',
        passwordHash: 'not-returned',
        role: 'user',
        createdAt: new Date(),
      },
      {
        id: 2,
        firstName: 'Filippa',
        lastName: 'Hansen',
        email: 'filippa@test.dk',
        passwordHash: 'not-returned',
        role: 'user',
        createdAt: new Date(),
      },
    ]);

    const result = await service.search('filip');

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        order: {
          firstName: 'ASC',
          lastName: 'ASC',
        },
      }),
    );

    expect(result).toEqual([
      {
        id: 1,
        firstName: 'Filip',
        lastName: 'Jensen',
      },
      {
        id: 2,
        firstName: 'Filippa',
        lastName: 'Hansen',
      },
    ]);
  });

  it('returns an empty array for an empty search', async () => {
    const result = await service.search('   ');

    expect(result).toEqual([]);
    expect(find).not.toHaveBeenCalled();
  });
});
