import type { NitroApp } from 'nitropack';
import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import { defineEventHandler } from 'h3';
import { auth } from '../lib/auth';
import { clickRaceService } from '../services';
import type { User, IoServer } from '~~/shared/types';
import { logger } from '~~/shared/lib/logger';

export default defineNitroPlugin((nitroApp: NitroApp) => {
    const engine = new Engine();
    const io: IoServer = new Server();

    io.bind(engine);

    const userConnections = new Map<string, string>(); // userId -> socketId

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

            const userId = session.user.id;
            const existingSocketId = userConnections.get(userId);

            if (existingSocketId && existingSocketId !== socket.id) {
                logger.debug(
                    `[SocketIO] ${session.user.name} already connected - disconnecting old socket (#${existingSocketId})`,
                );

                const oldSocket = io.sockets.sockets.get(existingSocketId);
                if (oldSocket) {
                    oldSocket.disconnect(true);
                }
            }

            userConnections.set(userId, socket.id);
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            const userId = socket.data.user?.id;
            if (userId && userConnections.get(userId) === socket.id) {
                userConnections.delete(userId);
            }
        });
    });

    clickRaceService.setup(io);

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
