import type { Server, Socket } from 'socket.io';
import type {
    ServerToClientEventName,
    ServerToClientEventPayload,
    ClientToServerEventName,
    ClientToServerEventPayload,
    ClientToServerEventResponse,
} from '~~/shared/events';
import { logger } from '~~/shared/lib/logger';

/**
 * Type-safe wrapper around socket.io for server-side usage
 * Provides automatic type inference for events and payloads
 */
export class SocketServer {
    private io: Server;
    private socket: Socket;

    constructor(io: Server, socket: Socket) {
        this.io = io;
        this.socket = socket;
    }

    /**
     * Listen for typed events from client
     * @param event - The event name
     * @param handler - The event handler with typed payload
     */
    public on<E extends ClientToServerEventName>(
        event: E,
        handler: (payload: ClientToServerEventPayload<E>) => void,
    ): void {
        this.socket.on(event, handler as any);
    }

    /**
     * Listen for typed events from client (once)
     * @param event - The event name
     * @param handler - The event handler with typed payload
     */
    public once<E extends ClientToServerEventName>(
        event: E,
        handler: (payload: ClientToServerEventPayload<E>) => void,
    ): void {
        this.socket.once(event, handler as any);
    }

    /**
     * Listen for typed requests from client
     * @param event - The event name
     * @param handler - The request handler with typed request/response
     */
    public onRequest<E extends ClientToServerEventName>(
        event: E,
        handler: (
            payload: ClientToServerEventPayload<E>,
            callback: (response: ClientToServerEventResponse<E>) => void,
        ) => void | Promise<void>,
    ): void {
        (this.socket as any).on(
            event,
            async (
                payload: ClientToServerEventPayload<E>,
                callback: (response: ClientToServerEventResponse<E>) => void,
            ) => {
                try {
                    await handler(payload, callback);
                } catch (error) {
                    logger.error(`Error handling request ${event}:`, error);

                    if (callback) {
                        callback(null as ClientToServerEventResponse<E>);
                    }
                }
            },
        );
    }

    /**
     * Emit typed events to this specific client
     * @param event - The event name
     * @param payload - The typed payload
     */
    public emit<E extends ServerToClientEventName>(event: E, payload: ServerToClientEventPayload<E>): void {
        this.socket.emit(event, payload);
    }

    /**
     * Emit typed events to all connected clients
     * @param event - The event name
     * @param payload - The typed payload
     */
    public emitToAll<E extends ServerToClientEventName>(event: E, payload: ServerToClientEventPayload<E>): void {
        this.io.emit(event, payload);
    }

    /**
     * Emit typed events to all clients in a specific room
     * @param room - The room name
     * @param event - The event name
     * @param payload - The typed payload
     */
    public emitToRoom<E extends ServerToClientEventName>(
        room: string,
        event: E,
        payload: ServerToClientEventPayload<E>,
    ): void {
        this.io.to(room).emit(event, payload);
    }

    /**
     * Emit typed events to all clients except this one
     * @param event - The event name
     * @param payload - The typed payload
     */
    public emitToOthers<E extends ServerToClientEventName>(event: E, payload: ServerToClientEventPayload<E>): void {
        this.socket.broadcast.emit(event, payload);
    }

    /**
     * Join a room
     * @param room - The room name
     */
    public join(room: string): void {
        this.socket.join(room);
    }

    /**
     * Leave a room
     * @param room - The room name
     */
    public leave(room: string): void {
        this.socket.leave(room);
    }

    /**
     * Remove event listener
     * @param event - The event name
     * @param handler - Optional specific handler to remove
     */
    public off<E extends ClientToServerEventName>(
        event: E,
        handler?: (payload: ClientToServerEventPayload<E>) => void,
    ): void {
        if (handler) {
            this.socket.off(event, handler as any);
        } else {
            (this.socket as any).off(event);
        }
    }

    /**
     * Get the underlying socket instance
     */
    public getSocket(): Socket {
        return this.socket;
    }

    /**
     * Get the underlying server instance
     */
    public getServer(): Server {
        return this.io;
    }

    /**
     * Get socket ID
     */
    public getId(): string {
        return this.socket.id;
    }

    /**
     * Disconnect the socket
     */
    public disconnect(): void {
        this.socket.disconnect();
    }

    /**
     * Static method to emit to all clients without needing a specific socket
     * @param io - The socket.io server instance
     * @param event - The event name
     * @param payload - The typed payload
     */
    public static emitToAll<E extends ServerToClientEventName>(
        io: Server,
        event: E,
        payload: ServerToClientEventPayload<E>,
    ): void {
        io.emit(event, payload);
    }
}

/**
 * Factory function to create a socket server
 * @param io - The socket.io server instance
 * @param socket - The socket instance
 * @returns SocketServer instance
 */
export function createSocketServer(io: Server, socket: Socket): SocketServer {
    return new SocketServer(io, socket);
}
