import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

type PublicUser = {
  id: number;
  firstName: string;
  lastName: string;
};

describe('UsersController', () => {
  let controller: UsersController;

  let findOne: jest.Mock<(id: number) => Promise<PublicUser>>;

  let search: jest.Mock<(searchTerm: string) => Promise<PublicUser[]>>;

  beforeEach(async () => {
    findOne = jest.fn();
    search = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne,
            search,
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('returns the user from UsersService', async () => {
    const publicUser: PublicUser = {
      id: 1,
      firstName: 'Filip',
      lastName: 'Jensen',
    };

    findOne.mockResolvedValue(publicUser);

    const result = await controller.findOne(1);

    expect(findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(publicUser);
  });

  it('returns users matching the search term', async () => {
    const users: PublicUser[] = [
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
    ];

    search.mockResolvedValue(users);

    const result = await controller.search('filip');

    expect(search).toHaveBeenCalledWith('filip');
    expect(result).toEqual(users);
  });

  it('uses an empty search term when none is provided', async () => {
    search.mockResolvedValue([]);

    const result = await controller.search();

    expect(search).toHaveBeenCalledWith('');
    expect(result).toEqual([]);
  });
});
