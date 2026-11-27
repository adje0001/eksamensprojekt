import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

// PostgreSQL SQLSTATE for a unique constraint violation.
const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

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

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    if (dto.firstName !== undefined) {
      const firstName = dto.firstName.trim();

      if (!firstName) {
        throw new BadRequestException('First name cannot be empty');
      }

      user.firstName = firstName;
    }

    if (dto.lastName !== undefined) {
      const lastName = dto.lastName.trim();

      if (!lastName) {
        throw new BadRequestException('Last name cannot be empty');
      }

      user.lastName = lastName;
    }

    if (dto.email !== undefined) {
      user.email = dto.email.trim().toLowerCase();
    }

    let savedUser: User;

    try {
      savedUser = await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === POSTGRES_UNIQUE_VIOLATION_CODE
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }

    return {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
    };
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }
  }
}
