import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'
import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser, GetRawHeaders, RoleProtected, Auth } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiResponse({status:201, description:'Create API account',type:User})
  @ApiResponse({status:400, description:'Invalid parameters'})
  @Post('signup')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiResponse({status:201, description:'Login API',type:User})
  @ApiResponse({status:400, description:'Invalid parameters'})
  @ApiResponse({status:401, description:'Credentials are nor valid(password)'})
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  
  
  @ApiResponse({status:200, description:'User is active, renew token',type:User})
  @ApiResponse({status:401, description:'Credentials are nor valid(password)'})
  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User){
    //En caso de querer quitar info lo podriamos hacer con la desectructuracion como en el login
    return this.authService.checkAuthStatus(user);
  }

  @ApiResponse({status:201, description:'Access to private site',type:User})
  @ApiResponse({status:401, description:'Bearer token is not valid'})
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request //Utilizando el Guard ya podriamos obtener el con request.user 
    @GetUser() user: User,
    // @GetUser('email') userEmail:string
    @GetRawHeaders() rawHeaders: string[]
  ) {

    return { "ok": true, user, rawHeaders }
  }

  //Se podria incluir para realizar comprobaciones con guards personalizados
  // @SetMetadata('roles',['admin','super-user'])//Añade info extra
  @ApiResponse({status:201, description:'Access to private site',type:User})
  @ApiResponse({status:401, description:'Bearer token is not valid'})
  @ApiResponse({status:403, description:'Not valid role'})
  @Get('private2')
  @RoleProtected(ValidRoles.admin)//Pueden ser varios separados por comas
  @UseGuards(AuthGuard(),UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
    ) {
      return { 'ok': true, user }
    }
    
    @ApiResponse({status:201, description:'Access to private site with permitted user role ',type:User})
    @ApiResponse({status:401, description:'Bearer token is not valid'})
    @ApiResponse({status:403, description:'Not valid role'})
  //Es similar al ejemplo anterior pero creando una composicion de decoradores
  @Get('private3')
  @Auth(ValidRoles.admin)//Si queremos que tan solo sea un usuario activo se deja vacio
  privateRoute3(
    @GetUser() user: User
  ) {
    return { 'ok': true, user }
  }
}
