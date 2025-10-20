import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '~~/shared/types/events';

class SocketManager {
    private static instance: SocketManager;
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private blocked: boolean = false;

    private constructor() {
        this.socket = io({
            autoConnect: false,
            reconnection: true,
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
        if (this.blocked) {
            return;
        }
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

    /**
     * Blocks the socket from reconnecting
     */
    public block(): void {
        this.blocked = true;
        this.socket.io.opts.reconnection = false;
        this.socket.disconnect();
    }

    /**
     * Unblocks the socket to allow reconnecting
     */
    public unblock(): void {
        this.blocked = false;
        this.socket.io.opts.reconnection = true;
    }
}

export const socketManager = SocketManager.getInstance();
export const socket = socketManager.getSocket();
