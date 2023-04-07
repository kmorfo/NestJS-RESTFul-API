import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      //Una vez guardada la contraseña la borramos para no enviarsela al usuario con la respuesta
      delete user.password;

      return {
        ...user,
        token: this.getJwToken({ id: user.id })
      };
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne(
      {
        where: { email },
        select: { email: true, password: true, id: true }//! Ojo no olvidar el id
      });

    if (!user)
      throw new UnauthorizedException('Credentials are nor valid(email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are nor valid(password)');

    return {
      ...user,
      token: this.getJwToken({ id: user.id })
    };
  }

  async checkAuthStatus(user: User) {
    return { ...user, token: this.getJwToken({ id: user.id }) };
  }

  private getJwToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }

}
