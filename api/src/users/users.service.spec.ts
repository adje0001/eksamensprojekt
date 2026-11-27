import { jest } from '@jest/globals';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { type FindManyOptions, QueryFailedError, DeleteResult } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  let findOneBy: jest.Mock<(where: { id: number }) => Promise<User | null>>;

  let find: jest.Mock<(options?: FindManyOptions<User>) => Promise<User[]>>;

  let save: jest.Mock<(user: User) => Promise<User>>;

  let deleteUser: jest.Mock<(id: number) => Promise<DeleteResult>>;

  beforeEach(async () => {
    findOneBy = jest.fn();
    find = jest.fn();
    save = jest.fn();
    deleteUser = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy,
            find,
            save,
            delete: deleteUser,
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

  it('returns the own profile with email but without hash or role', async () => {
    findOneBy.mockResolvedValue({
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
      email: 'filip@test.dk',
      passwordHash: 'not-returned',
      role: 'user',
      createdAt: new Date(),
    });

    expect(await service.findMe(1)).toEqual({
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
      email: 'filip@test.dk',
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

  it('updates the provided fields and returns the updated profile', async () => {
    const existingUser: User = {
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
      email: 'filip@test.dk',
      passwordHash: 'not-returned',
      role: 'user',
      createdAt: new Date(),
    };

    findOneBy.mockResolvedValue(existingUser);
    save.mockImplementation((user) => Promise.resolve(user));

    const result = await service.update(1, {
      firstName: '  Philip  ',
      email: '  PHILIP@TEST.DK  ',
    });

    expect(findOneBy).toHaveBeenCalledWith({ id: 1 });

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        firstName: 'Philip',
        lastName: 'Jensen',
        email: 'philip@test.dk',
      }),
    );

    expect(result).toEqual({
      id: 1,
      firstName: 'Philip',
      lastName: 'Jensen',
      email: 'philip@test.dk',
    });
  });

  it('throws NotFoundException when updating an unknown user', async () => {
    findOneBy.mockResolvedValue(null);

    await expect(service.update(999, { firstName: 'Philip' })).rejects.toThrow(NotFoundException);

    expect(save).not.toHaveBeenCalled();
  });

  it('rejects a first name containing only whitespace', async () => {
    findOneBy.mockResolvedValue({
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
      email: 'filip@test.dk',
      passwordHash: 'not-returned',
      role: 'user',
      createdAt: new Date(),
    });

    await expect(service.update(1, { firstName: '   ' })).rejects.toThrow(BadRequestException);

    expect(save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when the email is already registered', async () => {
    findOneBy.mockResolvedValue({
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
      email: 'filip@test.dk',
      passwordHash: 'not-returned',
      role: 'user',
      createdAt: new Date(),
    });

    save.mockRejectedValue(
      new QueryFailedError(
        'UPDATE users',
        [],
        Object.assign(new Error('duplicate email'), { code: '23505' }),
      ),
    );

    await expect(
      service.update(1, {
        email: 'existing@test.dk',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deletes an existing user', async () => {
    deleteUser.mockResolvedValue({
      raw: [],
      affected: 1,
    });

    await expect(service.remove(1)).resolves.toBeUndefined();

    expect(deleteUser).toHaveBeenCalledWith(1);
  });

  it('throws NotFoundException when deleting an unknown user', async () => {
    deleteUser.mockResolvedValue({
      raw: [],
      affected: 0,
    });

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
