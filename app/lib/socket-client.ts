import type { Socket } from 'socket.io-client';
import type {
    ServerToClientEventName,
    ServerToClientEventPayload,
    ClientToServerEventName,
    ClientToServerEventPayload,
    ClientToServerEventResponse,
} from '#shared/events';

/**
 * Type-safe wrapper around socket.io-client for client-side usage
 * Provides automatic type inference for events and payloads
 */
export class SocketClient {
    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    /**
     * Listen for typed events from server
     * @param event - The event name
     * @param handler - The event handler with typed payload
     * @returns Unsubscribe function
     */
    public on<E extends ServerToClientEventName>(
        event: E,
        handler: (payload: ServerToClientEventPayload<E>) => void,
    ): () => void {
        this.socket.on(event, handler as any);
        return () => this.socket.off(event, handler as any);
    }

    /**
     * Listen for typed events from server (one-time)
     * @param event - The event name
     * @param handler - The event handler with typed payload
     * @returns Unsubscribe function
     */
    public once<E extends ServerToClientEventName>(
        event: E,
        handler: (payload: ServerToClientEventPayload<E>) => void,
    ): () => void {
        this.socket.once(event, handler as any);
        return () => this.socket.off(event, handler as any);
    }

    /**
     * Emit typed events to server
     * @param event - The event name
     * @param payload - The typed payload
     */
    public emit<E extends ClientToServerEventName>(event: E, payload: ClientToServerEventPayload<E>): void {
        this.socket.emit(event, payload);
    }

    /**
     * Emit typed request to server and wait for response
     * @param event - The event name
     * @param payload - The typed request payload
     * @returns Promise with typed response
     */
    public async request<E extends ClientToServerEventName>(
        event: E,
        payload: ClientToServerEventPayload<E>,
    ): Promise<ClientToServerEventResponse<E>> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Request timeout for ${event}`));
            }, 10000);

            this.socket.emit(event, payload, (response: ClientToServerEventResponse<E>) => {
                clearTimeout(timeout);
                resolve(response);
            });
        });
    }

    /**
     * Remove event listener
     * @param event - The event name
     * @param handler - Optional specific handler to remove
     */
    public off<E extends ServerToClientEventName>(
        event: E,
        handler?: (payload: ServerToClientEventPayload<E>) => void,
    ): void {
        if (handler) {
            this.socket.off(event, handler as any);
        } else {
            this.socket.off(event);
        }
    }

    /**
     * Get the underlying socket instance
     */
    public getSocket(): Socket {
        return this.socket;
    }

    /**
     * Check if socket is connected
     */
    public isConnected(): boolean {
        return this.socket.connected;
    }

    /**
     * Disconnect the socket
     */
    public disconnect(): void {
        this.socket.disconnect();
    }
}

/**
 * Factory function to create a socket client
 * @param socket - The socket.io-client instance
 * @returns SocketClient instance
 */
export function createSocketClient(socket: Socket): SocketClient {
    return new SocketClient(socket);
}
