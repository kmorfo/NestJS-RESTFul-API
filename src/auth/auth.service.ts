import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto, ResetPasswordDto } from './dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,

    private readonly mailService: MailService,

    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);

      delete user.password;

      return { ...user, token: this.getJwToken({ id: user.id }) };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    delete user.password;

    return {
      ...user,
      token: this.getJwToken({ id: user.id })
    };
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);
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

      const user = this.usersService.updateUserPassword(id, resetPasswordDto);

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token is not valid');
    }
  }

  async checkAuthStatus(user: User) {
    return { ...user, token: this.getJwToken({ id: user.id }) };
  }

  private getJwToken(payload: JwtPayload, options?: JwtSignOptions) {
    return this.jwtService.sign(payload, options);
  }


  async updateUserPassword(id: string, resetPasswordDto: ResetPasswordDto): Promise<User | undefined> {
    try {
      const user = await this.usersService.findOneById(id);
      if (!user) throw new NotFoundException(`User not found`);


      await this.usersService.updateUserPassword(user.id, resetPasswordDto);
      delete user.password;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Unexpected error, check server logs');
    }
  }
  
  async sendEmailVerification(email: string): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Email does not exist');

    //Here we can check if the user is already verified before send email again

    //Creates a 60 minutes valid token 
    const token = this.getJwToken({ id: user.id }, { expiresIn: '60 minutes' });

    this.mailService.sendEmailVerification(user, token);

    return true;
  }

  async verifyEmailToken(token: string): Promise<User> {
    try {
      const { id } = this.jwtService.verify(token);

      if (!id) throw new UnauthorizedException('Token is not valid');

      const user = this.usersService.setUserEmailVerified(id);

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token is not valid');
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
