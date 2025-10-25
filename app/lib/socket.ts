import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '~~/shared/types';

class SocketManager {
    private static instance: SocketManager;
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    private constructor() {
        this.socket = io({
            autoConnect: false,
            reconnection: false,
        }) as Socket<ServerToClientEvents, ClientToServerEvents>;
    }

    /**
     * Gets the instance of the SocketManager
     * @returns
     */
    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    /**
     * Gets the typed socket instance
     * @returns
     */
    public getSocket() {
        return this.socket;
    }

    /**
     * Checks if the socket is connected
     * @returns
     */
    public isConnected(): boolean {
        return this.socket.connected;
    }

    /**
     * Connects the socket
     */
    public connect(): void {
        if (this.socket.connected) {
            return;
        }
        if (this.socket.disconnected) {
            this.socket.connect();
        }
    }

    /**
     * Disconnects the socket
     */
    public disconnect(): void {
        this.socket.disconnect();
    }
}

export const socketManager = SocketManager.getInstance();
export const socket = socketManager.getSocket();
