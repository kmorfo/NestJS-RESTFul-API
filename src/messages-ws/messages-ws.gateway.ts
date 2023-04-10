import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from 'src/auth/interfaces';


@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly JwtService: JwtService
  ) { }

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.JwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      // throw new WsException('Invalid credentials');
      client.disconnect();
      return;
    }

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    // console.log(client.id, payload);
    //! Responde al cliente que emitio el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message'
    // })

    //! Emitir a todos menos al cliente emisor
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message'
    // })

    //! Emitir a todos
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullNameById(client.id),
      message: payload.message || 'no-message'
    })
  }
}
