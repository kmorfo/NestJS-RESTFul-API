import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto, ResetPasswordDto } from './dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
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

    const user = await this.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Email does not exist');

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

  private getJwToken(payload: JwtPayload, options?: JwtSignOptions) {
    return this.jwtService.sign(payload, options);
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Email does not exist');

    //Creacion del un token valido para las proximos 10 minutos
    const token = this.getJwToken({ id: user.id }, { expiresIn: '10 minutes' });

    this.mailService.sendEmailForgotPassword(user, token);

    return true;
  }

  async resetPasswordToken(token: string, resetPasswordDto: ResetPasswordDto): Promise<User> {
    try {
      const { id } = this.jwtService.verify(token);

      if (!id) throw new UnauthorizedException('Token is not valid');

      const user = this.updateUserPassword(id, resetPasswordDto);

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token is not valid');
    }
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

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true, roles: true }
    });
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ id });
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
