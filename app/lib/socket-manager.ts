import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { createSocketClient, type SocketClient } from './socket-client';

class SocketManager {
    private static instance: SocketManager;
    private socket: Socket | null = null;
    private socketWrapper: SocketClient | null = null;
    private isAuthenticated: boolean = false;
    private leaseCount: number = 0;
    private desiredRoom: string | null = null;
    private connectCallbacks: Set<() => void> = new Set();
    private disconnectCallbacks: Set<(reason?: string) => void> = new Set();

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
     * Gets the socket wrapper instance
     * @returns
     */
    public getSocketWrapper(): SocketClient | null {
        return this.socketWrapper;
    }

    /**
     * Sets the authentication status
     */
    public setAuthenticated(authenticated: boolean): void {
        this.isAuthenticated = authenticated;
        if (!authenticated) {
            this.block();
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
     * Subscribe to connect events
     */
    public onConnect(cb: () => void): () => void {
        this.connectCallbacks.add(cb);
        return () => this.connectCallbacks.delete(cb);
    }

    /**
     * Subscribe to disconnect events
     */
    public onDisconnect(cb: (reason?: string) => void): () => void {
        this.disconnectCallbacks.add(cb);
        return () => this.disconnectCallbacks.delete(cb);
    }

    /**
     * Acquire a connection lease (opt-in). Safe to call multiple times.
     */
    public acquireLease(): void {
        if (!import.meta.client) return;
        this.leaseCount++;
        this.ensureSocket();
    }

    /**
     * Release a previously acquired lease. When no leases remain, disconnect and cleanup.
     */
    public releaseLease(): void {
        if (!import.meta.client) return;
        this.leaseCount = Math.max(0, this.leaseCount - 1);
        if (this.leaseCount === 0) {
            this.hardDisconnect();
        }
    }

    /**
     * Connects the socket
     */
    public connect(): void {
        if (!import.meta.client) {
            return;
        }
        if (!this.isAuthenticated) {
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
        this.isAuthenticated = false;
        this.desiredRoom = null;
        this.leaseCount = 0;
        if (this.socket) {
            this.socket.io.opts.reconnection = false;
        }
        this.hardDisconnect();
    }

    /**
     * Disconnects the socket
     */
    public disconnect(): void {
        this.socket?.disconnect();
    }

    /**
     * Join a logical room (tracked and re-joined on reconnect)
     */
    public async joinLobby(): Promise<boolean> {
        return this.joinRoom('Lobby');
    }

    /**
     * Leave a logical room
     */
    public async leaveLobby(): Promise<boolean> {
        return this.leaveRoom();
    }

    public async joinGameRoom(gameId: string): Promise<boolean> {
        return this.joinRoom(gameId);
    }

    public async leaveGameRoom(gameId: string): Promise<boolean> {
        return this.leaveRoom();
    }

    /**
     * Join a specific room (replaces current room)
     */
    public async joinRoom(roomId: string): Promise<boolean> {
        const room = `SpyGame:${roomId}`;

        if (this.desiredRoom && this.desiredRoom !== room) {
            await this.leaveRoom();
        }

        this.desiredRoom = room;

        if (this.socketWrapper && this.isConnected()) {
            try {
                const res = await this.socketWrapper.request('player:room:join', { room: 'SpyGame', gameId: roomId });
                return !!res?.success;
            } catch {
                return false;
            }
        }
        return true;
    }

    /**
     * Leave current room
     */
    public async leaveRoom(): Promise<boolean> {
        if (!this.desiredRoom) {
            return true;
        }

        const roomId = this.desiredRoom.split(':')[1];
        if (!roomId) {
            return false;
        }

        this.desiredRoom = null;

        if (this.socketWrapper && this.isConnected()) {
            try {
                const res = await this.socketWrapper.request('player:room:leave', { room: 'SpyGame', gameId: roomId });
                return !!res?.success;
            } catch {
                return false;
            }
        }
        return true;
    }

    /**
     * Set the desired room (replaces current room)
     */
    public async setRoom(roomId: string | null): Promise<void> {
        if (roomId === null) {
            await this.leaveRoom();
        } else {
            await this.joinRoom(roomId);
        }
    }

    /**
     * Ensure a socket instance exists; client-only.
     */
    public ensureSocket(): void {
        if (!import.meta.client) {
            return;
        }
        if (this.socket) {
            return;
        }
        this.socket = io({
            autoConnect: false,
            reconnection: true,
            withCredentials: true,
        });
        this.socketWrapper = createSocketClient(this.socket);
        this.bindCoreListeners();
    }

    /**
     * Disconnect and destroy the socket instance
     */
    private hardDisconnect(): void {
        if (this.socket) {
            try {
                this.socket.disconnect();
            } catch {}
        }
        this.socket = null;
        this.socketWrapper = null;
    }

    private bindCoreListeners(): void {
        if (!this.socket) return;
        const s = this.socket;
        s.on('connect', () => {
            this.onConnected();
        });
        s.on('disconnect', (reason) => {
            this.onDisconnected(typeof reason === 'string' ? reason : undefined);
        });
    }

    private async onConnected(): Promise<void> {
        if (this.desiredRoom) {
            try {
                const roomId = this.desiredRoom.split(':')[1];
                if (roomId) {
                    await this.socketWrapper?.request('player:room:join', { room: 'SpyGame', gameId: roomId });
                }
            } catch {}
        }
        for (const cb of Array.from(this.connectCallbacks)) cb();
    }

    private onDisconnected(reason?: string): void {
        for (const cb of Array.from(this.disconnectCallbacks)) cb(reason);
    }
}

export const socketManager = SocketManager.getInstance();
