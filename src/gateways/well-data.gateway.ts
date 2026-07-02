import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WellService } from "../services/data.service";

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
    path: "/socket.io"
})
export class WellDataGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly wellService: WellService) { }

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }

    @SubscribeMessage("subscribeToWell")
    async handleSubscribeToWell(
        @MessageBody() data: { wellId: string },
        @ConnectedSocket() client: Socket,
    ){
        const { wellId }  = data;

        const roomName = `well:${wellId}`;
        await client.join(roomName);
        console.log(`Client ${client.id} joined room ${roomName}`);

        

    }
}