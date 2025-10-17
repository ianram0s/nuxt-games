import type { NitroApp } from 'nitropack';
import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import { defineEventHandler } from 'h3';
import { auth } from '~~/server/lib/auth';
import { playerService } from '~~/server/services/player.service';
import { createSocketServer } from '~~/server/lib/socket';
import type { User } from '~~/types';

interface SocketData {
    user: User;
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const engine = new Engine();
    const io = new Server<object, object, object, SocketData>();

    io.bind(engine);

    playerService.setIO(io);

    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.request.headers.cookie || '';

            const session = await auth.api.getSession({
                headers: new Headers({
                    cookie: cookieHeader,
                }),
            });

            if (!session?.user) {
                return next(new Error('Authentication required'));
            }

            socket.data.user = session.user as User;
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.data.user;
        const socketWrapper = createSocketServer(io, socket);

        const existing = playerService.getPlayerConnection(user.id);
        if (existing && existing.status === 'reconnecting') {
            playerService.handleReconnection(socketWrapper, user);
        } else {
            playerService.handleConnection(socketWrapper, user);
        }

        socket.on('disconnect', (reason) => {
            playerService.handleDisconnection(socket.id);
        });
    });

    nitroApp.router.use(
        '/socket.io/',
        defineEventHandler({
            handler(event) {
                // @ts-expect-error wrong type
                engine.handleRequest(event.node.req, event.node.res);
                event._handled = true;
            },
            websocket: {
                open(peer) {
                    // @ts-expect-error private method and property
                    engine.prepare(peer._internal.nodeReq);
                    // @ts-expect-error private method and property
                    engine.onWebSocket(peer._internal.nodeReq, peer._internal.nodeReq.socket, peer.websocket);
                },
            },
        }),
    );
});
