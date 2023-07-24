import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, ResetPasswordDto } from 'src/auth/dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }


  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true, roles: true }
    });
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ id });
  }
  async create(createUserDto: CreateUserDto): Promise<User | undefined> {
    const { password, ...userData } = createUserDto;

    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10)
    });
    return this.userRepository.save(user);

  }
  async updateUserRoles(user: User, roles: string[]) {
    user.roles = roles;
    this.userRepository.save(user);
  }

  async updateUserPassword(id: string, resetPasswordDto: ResetPasswordDto): Promise<User | undefined> {
    try {
      const user = await this.findOneById(id);
      if (!user) throw new NotFoundException(`User not found`);

      user.password = bcrypt.hashSync(resetPasswordDto.password, 10);

      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Unexpected error, check server logs');
    }
  }
}
