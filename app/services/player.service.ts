import type { SocketClient } from '~/lib/socket-client';
import type { ClientPlayer } from '~~/types';
import { logger } from '#shared/lib/logger';

type PlayerStatusCallback = (player: ClientPlayer | null) => void;

class PlayerServiceClient {
    private socket: SocketClient | null = null;
    private statusCallbacks: Set<PlayerStatusCallback> = new Set();
    private isInitialized: boolean = false;

    /**
     * Initialize the player service with a socket instance
     */
    public initialize(socket: SocketClient): void {
        if (this.socket === socket && this.isInitialized) {
            return;
        }

        if (this.socket) {
            this.cleanup();
        }

        this.socket = socket;
        this.setupListeners();
        this.isInitialized = true;
    }

    /**
     * Setup socket event listeners
     */
    private setupListeners(): void {
        if (!this.socket) return;

        this.socket.off('player:status:change');

        this.socket.on('player:status:change', (player) => {
            this.statusCallbacks.forEach((callback) => {
                callback(player);
            });
        });
    }

    /**
     * Cleanup listeners
     */
    public cleanup(): void {
        if (this.socket) {
            this.socket.off('player:status:change');
            this.socket = null;
        }

        this.isInitialized = false;
        this.statusCallbacks.clear();
    }

    /**
     * Subscribe to player status changes
     */
    public onPlayerStatusChange(callback: PlayerStatusCallback): () => void {
        this.statusCallbacks.add(callback);

        return () => {
            this.statusCallbacks.delete(callback);
        };
    }

    /**
     * Get current player status
     */
    public async getStatus(): Promise<ClientPlayer | null> {
        if (!this.socket) return null;

        return this.socket.request('player:getStatus', {});
    }
}

export const playerServiceClient = new PlayerServiceClient();
