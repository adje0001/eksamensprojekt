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

  beforeEach(async () => {
    findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: { findOne },
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
});
