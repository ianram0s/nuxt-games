import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

class SocketManager {
    private static instance: SocketManager;
    private socket: Socket | null = null;
    private clientId: string | null = null;
    private blocked: boolean = false;

    private constructor() {}

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
     * Gets the socket instance
     * @returns
     */
    public getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Sets the client identifier used for authenticating the socket connection
     */
    public setClientId(clientId: string): void {
        this.clientId = clientId;
        if (this.socket) {
            this.socket.auth = { clientId };
        }
    }

    /**
     * Checks if the socket is connected
     * @returns
     */
    public isConnected(): boolean {
        return !!this.socket?.connected;
    }

    /**
     * Connects the socket
     */
    public connect(): void {
        if (this.blocked) {
            return;
        }
        if (!import.meta.client) {
            return;
        }
        this.ensureSocket();
        if (this.socket && this.socket.disconnected) {
            this.socket.connect();
        }
    }

    /**
     * Blocks the socket from reconnecting
     */
    public block(): void {
        this.blocked = true;
        if (this.socket) {
            this.socket.io.opts.reconnection = false;
            this.socket.disconnect();
        }
    }

    /**
     * Disconnects the socket
     */
    public disconnect(): void {
        this.socket?.disconnect();
    }

    /**
     * Waits for the socket to connect
     * @param timeoutMs
     * @returns
     */
    public async waitForConnection(timeoutMs: number = 3000): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.socket?.connected) {
                resolve(true);
                return;
            }

            const onConnect = () => {
                this.socket?.off('connect', onConnect);
                resolve(true);
            };

            this.socket?.on('connect', onConnect);

            setTimeout(() => {
                this.socket?.off('connect', onConnect);
                resolve(false);
            }, timeoutMs);
        });
    }

    /**
     * Ensure a socket instance exists. Safe to call multiple times; client-only.
     */
    public ensureSocket(): void {
        if (!import.meta.client) {
            return;
        }
        if (this.socket) {
            return;
        }
        const auth = this.clientId ? { clientId: this.clientId } : undefined;
        this.socket = io({ autoConnect: false, reconnection: true, auth });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });
        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
        this.socket.on('connect_error', (error) => {
            console.warn('Socket connection error:', error.message);
        });
    }
}

export const socketManager = SocketManager.getInstance();
