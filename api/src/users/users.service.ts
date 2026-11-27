import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async search(searchTerm: string) {
    const term = searchTerm.trim();

    if (!term) {
      return [];
    }

    const users = await this.usersRepository.find({
      where: [
        { firstName: ILike(`%${term}%`) },
        { lastName: ILike(`%${term}%`) },
        { email: ILike(`%${term}%`) },
      ],
      order: {
        firstName: 'ASC',
        lastName: 'ASC',
      },
      take: 20,
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
  }
}
