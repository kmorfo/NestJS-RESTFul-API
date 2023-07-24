import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { MessagesWsGateway } from './messages-ws.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [MessagesWsGateway, MessagesWsService],
  imports: [AuthModule,UsersModule]
})
export class MessagesWsModule { }
