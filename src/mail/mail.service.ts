import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailForgotPassword(user: User, token: string) {
    //En este caso crea la url a reset-password con el token, tendriamos que crear una pagina que cargara 
    //el token y pidiera el password al usuario, dentro de una app con un deep-link que carge el token y pida con contraseña al user

    //Otra opcion en este caso sin token seria crear una nueva contraseña aleatoria y enviarsela al usuario por mail
    //Luego el dentro de la aplicacion seria el encargado de cambiarla si asi lo desea
    const urltoken = `${process.env.HOST_API}/auth/reset-password/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Notificación de restablecimiento de contraseña',
      template: './resetpassword', 
      context: { 
        name: user.fullName,
        urltoken,
      },
    });
  }
}
