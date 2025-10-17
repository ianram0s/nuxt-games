import type { Server } from 'socket.io';
import { SocketServer } from '~~/server/lib/socket';
import type { User, ServerPlayer, PlayerStatus, ClientPlayer } from '~~/types';
import { logger } from '~~/shared/lib/logger';

export class PlayerService {
    private static instance: PlayerService;
    private connectedPlayers: Map<string, ServerPlayer> = new Map();
    private socketIdToUserId: Map<string, string> = new Map();
    private io: Server | null = null;

    private constructor() {}

    public static getInstance(): PlayerService {
        if (!PlayerService.instance) {
            PlayerService.instance = new PlayerService();
        }
        return PlayerService.instance;
    }

    /**
     * Sets the Socket.IO server instance
     */
    public setIO(io: Server): void {
        this.io = io;
    }

    /**
     * Handles a new player connection
     */
    public handleConnection(socket: SocketServer, user: User): void {
        logger.info(`[PlayerService] Player ${user.name} connecting with socket ${socket.getId()}`);

        const existingConnection = this.connectedPlayers.get(user.id);
        const oldSocketId = existingConnection?.socketId;

        const player: ServerPlayer = {
            userId: user.id,
            userName: user.name,
            userImage: user.image,
            socketId: socket.getId(),
            status: 'connected',
            lastActivity: Date.now(),
        };

        if (existingConnection?.reconnectionTimeout) {
            clearTimeout(existingConnection.reconnectionTimeout);
        }

        this.connectedPlayers.set(user.id, player);
        this.socketIdToUserId.set(socket.getId(), user.id);

        if (oldSocketId && oldSocketId !== socket.getId()) {
            logger.info(
                `[PlayerService] Player ${user.name} already connected, disconnecting old socket ${oldSocketId}`,
            );

            this.socketIdToUserId.delete(oldSocketId);

            const oldSocket = this.io?.sockets.sockets.get(oldSocketId);
            if (oldSocket) {
                oldSocket.disconnect(true);
            }
        }

        this.setupSocketHandlers(socket, user);

        this.notifyStatusChange(user.id, 'connected');

        logger.info(`[PlayerService] Player ${user.name} connected successfully`);
    }

    /**
     * Setup type-safe socket event handlers
     */
    private setupSocketHandlers(socket: SocketServer, user: User): void {
        socket.onRequest('player:getStatus', (data, callback) => {
            const player = this.connectedPlayers.get(user.id);
            const clientPlayer: ClientPlayer | null = player
                ? {
                      userId: player.userId,
                      userName: player.userName,
                      userImage: player.userImage,
                      status: player.status,
                      timestamp: Date.now(),
                  }
                : null;
            callback(clientPlayer);
        });

        socket.onRequest('player:room:join', async (payload, cb) => {
            try {
                if (payload.room === 'SpyGame' && payload.gameId) {
                    const newRoom = `SpyGame:${payload.gameId}`;

                    const socketRooms = Array.from(socket.getSocket().rooms);
                    for (const room of socketRooms) {
                        if (room.startsWith('SpyGame:') && room !== newRoom) {
                            socket.leave(room);
                        }
                    }

                    socket.join(newRoom);
                    return cb({ success: true });
                }
                cb({ success: false, error: 'Invalid room' });
            } catch (e: any) {
                cb({ success: false, error: e?.message || 'Failed to join room' });
            }
        });

        socket.onRequest('player:room:leave', async (payload, cb) => {
            try {
                if (payload.room === 'SpyGame' && payload.gameId) {
                    const room = `SpyGame:${payload.gameId}`;
                    socket.leave(room);
                    return cb({ success: true });
                }
                cb({ success: false, error: 'Invalid room' });
            } catch (e: any) {
                cb({ success: false, error: e?.message || 'Failed to leave room' });
            }
        });
    }

    /**
     * Handles player disconnection
     * Starts a 10-second reconnection window
     */
    public handleDisconnection(socketId: string): void {
        const userId = this.socketIdToUserId.get(socketId);
        if (!userId) {
            return;
        }

        const player = this.connectedPlayers.get(userId);
        if (!player) {
            return;
        }

        if (player.socketId !== socketId) {
            this.socketIdToUserId.delete(socketId);
            return;
        }

        logger.info(`[PlayerService] Player ${player.userName} disconnected, starting reconnection timer`);

        player.status = 'reconnecting';
        player.lastActivity = Date.now();

        if (player.reconnectionTimeout) {
            clearTimeout(player.reconnectionTimeout);
        }

        this.notifyStatusChange(userId, 'reconnecting');

        player.reconnectionTimeout = setTimeout(() => {
            logger.warn(`[PlayerService] Reconnection timeout expired for player ${player.userName}, cleaning up`);
            this.cleanupPlayer(userId);
        }, 10000);
    }

    /**
     * Handles player reconnection
     */
    public handleReconnection(socket: SocketServer, user: User): void {
        const player = this.connectedPlayers.get(user.id);
        if (!player) {
            this.handleConnection(socket, user);
            return;
        }

        logger.info(`[PlayerService] Player ${user.name} reconnecting with new socket ${socket.getId()}`);

        if (player.reconnectionTimeout) {
            clearTimeout(player.reconnectionTimeout);
            player.reconnectionTimeout = undefined;
        }

        this.socketIdToUserId.delete(player.socketId);

        player.socketId = socket.getId();
        player.status = 'connected';
        player.lastActivity = Date.now();

        this.socketIdToUserId.set(socket.getId(), user.id);

        this.setupSocketHandlers(socket, user);

        this.notifyStatusChange(user.id, 'connected');

        logger.info(`[PlayerService] Player ${user.name} reconnected successfully`);
    }

    /**
     * Gets the connection state for a player
     */
    public getPlayerConnection(userId: string): ServerPlayer | undefined {
        return this.connectedPlayers.get(userId);
    }

    /**
     * Gets player ID from socket ID
     */
    public getPlayerIdBySocketId(socketId: string): string | undefined {
        return this.socketIdToUserId.get(socketId);
    }

    /**
     * Gets all connected players
     */
    public getConnectedPlayers(): ServerPlayer[] {
        return Array.from(this.connectedPlayers.values()).filter((player) => player.status === 'connected');
    }

    /**
     * Checks if a player is connected
     */
    public isPlayerConnected(userId: string): boolean {
        const player = this.connectedPlayers.get(userId);
        return player?.status === 'connected';
    }

    /**
     * Cleans up a player's connection
     */
    public cleanupPlayer(userId: string): void {
        const player = this.connectedPlayers.get(userId);
        if (!player) {
            return;
        }

        logger.debug(`[PlayerService] Cleaning up player ${player.userName}`);

        if (player.reconnectionTimeout) {
            clearTimeout(player.reconnectionTimeout);
        }

        this.socketIdToUserId.delete(player.socketId);
        this.connectedPlayers.delete(userId);

        this.notifyStatusChange(userId, 'disconnected');

        logger.debug(`[PlayerService] Player ${player.userName} cleaned up`);
    }

    /**
     * Forces a player disconnection (e.g., when user signs out)
     */
    public forceDisconnect(userId: string): void {
        const player = this.connectedPlayers.get(userId);
        if (!player) {
            return;
        }

        logger.warn(`[PlayerService] Force disconnecting player ${player.userName}`);

        const socket = this.io?.sockets.sockets.get(player.socketId);
        if (socket) {
            socket.disconnect(true);
        }

        if (player.reconnectionTimeout) {
            clearTimeout(player.reconnectionTimeout);
        }
        this.socketIdToUserId.delete(player.socketId);
        this.connectedPlayers.delete(userId);

        this.notifyStatusChange(userId, 'disconnected');
    }

    /**
     * Notifies about player status changes
     * This can be consumed by future game/room services
     */
    private notifyStatusChange(userId: string, status: PlayerStatus): void {
        const player = this.connectedPlayers.get(userId);
        const clientPlayer: ClientPlayer | null = player
            ? {
                  userId: player.userId,
                  userName: player.userName,
                  userImage: player.userImage,
                  status: player.status,
                  timestamp: Date.now(),
              }
            : null;

        logger.debug(`[PlayerService] Player ${player?.userName || userId} status changed to ${status}`);

        if (this.io && player) {
            const socket = this.io.sockets.sockets.get(player.socketId);
            if (socket) {
                socket.emit('player:status:change', clientPlayer);
            }
        }
    }

    /**
     * Gets current service statistics
     */
    public getStats() {
        return {
            totalConnections: this.connectedPlayers.size,
            connectedPlayers: this.getConnectedPlayers().length,
            reconnectingPlayers: Array.from(this.connectedPlayers.values()).filter(
                (player) => player.status === 'reconnecting',
            ).length,
        };
    }
}

export const playerService = PlayerService.getInstance();
