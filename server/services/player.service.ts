import type { User, ServerPlayer as Player, PlayerStatus, ClientPlayer, IoServer, IoSocket } from '~~/shared/types';
import { logger } from '~~/shared/lib/logger';

export class PlayerService {
    private static instance: PlayerService;
    private connectedPlayers: Map<string, Player> = new Map();
    private socketIdToUserId: Map<string, string> = new Map();
    private io: IoServer | null = null;

    private constructor() {}

    public static getInstance(): PlayerService {
        if (!PlayerService.instance) {
            PlayerService.instance = new PlayerService();
        }
        return PlayerService.instance;
    }

    /**
     * Sets up the player service
     * @param io
     */
    public setup(io: IoServer): void {
        this.io = io;

        this.io.on('connection', (socket) => {
            this.onConnect(socket, socket.data.user);

            socket.on('disconnect', () => {
                this.onDisconnect(socket.id);
            });
        });
    }

    /**
     * Handles a new player connection
     */
    private onConnect(socket: IoSocket, user: User): void {
        const existingConnection = this.connectedPlayers.get(user.id);

        if (existingConnection && existingConnection.status === 'reconnecting') {
            this.onReconnect(socket, user);
            return;
        }

        const oldSocketId = existingConnection?.socketId;
        if (oldSocketId && oldSocketId !== socket.id) {
            logger.debug(`[PlayerService] ${user.name} already connected - disconnecting old socket (#${oldSocketId})`);

            this.socketIdToUserId.delete(oldSocketId);

            const oldSocket = this.io?.sockets.sockets.get(oldSocketId);
            if (oldSocket) {
                oldSocket.disconnect(true);
            }
        }

        this.createPlayer(user, socket.id);

        this.setupSocketHandlers(socket, user);

        logger.debug(`[PlayerService] ${user.name} connected successfully (#${socket.id})`);
    }

    /**
     * Handles player disconnection
     * Starts a 10-second reconnection window
     */
    private onDisconnect(socketId: string): void {
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

        logger.debug(`[PlayerService] ${player.userName} disconnected (waiting for reconnection...)`);

        if (player.reconnectionTimeout) {
            clearTimeout(player.reconnectionTimeout);
        }

        player.reconnectionTimeout = setTimeout(() => {
            this.deletePlayer(userId);
        }, 10000);

        this.updatePlayer(userId, {
            status: 'reconnecting',
            reconnectionTimeout: player.reconnectionTimeout,
        });
    }

    /**
     * Handles player reconnection
     */
    private onReconnect(socket: IoSocket, user: User): void {
        const player = this.connectedPlayers.get(user.id);
        if (!player) {
            this.onConnect(socket, user);
            return;
        }

        if (player.reconnectionTimeout) {
            clearTimeout(player.reconnectionTimeout);
        }

        this.socketIdToUserId.delete(player.socketId);
        this.socketIdToUserId.set(socket.id, user.id);

        this.updatePlayer(user.id, {
            socketId: socket.id,
            status: 'connected',
            reconnectionTimeout: undefined,
        });

        this.setupSocketHandlers(socket, user);

        logger.debug(`[PlayerService] Player ${user.name} reconnected`);
    }

    /**
     * Forces a player disconnection (e.g., when user signs out)
     */
    private forceDisconnect(userId: string): void {
        const player = this.connectedPlayers.get(userId);
        if (!player) {
            return;
        }

        logger.debug(`[PlayerService] Force disconnecting player ${player.userName}`);

        const socket = this.io?.sockets.sockets.get(player.socketId);
        if (socket) {
            socket.disconnect(true);
        }

        this.deletePlayer(userId);
    }

    /**
     * Setup type-safe socket event handlers
     */
    private setupSocketHandlers(socket: IoSocket, user: User): void {
        socket.on('player:getState', (callback) => {
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
        socket.on('player:forceDisconnect', () => {
            this.forceDisconnect(user.id);
        });
    }

    /**
     * Creates a new player
     */
    public createPlayer(user: User, socketId: string): Player {
        const player: Player = {
            userId: user.id,
            userName: user.name,
            userImage: user.image,
            socketId: socketId,
            status: 'connected',
            lastActivity: Date.now(),
        };

        this.connectedPlayers.set(user.id, player);
        this.socketIdToUserId.set(socketId, user.id);

        this.emitPlayerUpdate(user.id);

        return player;
    }

    /**
     * Updates an existing player
     */
    public updatePlayer(userId: string, updates: Partial<Omit<Player, 'userId'>>): Player | null {
        const player = this.connectedPlayers.get(userId);
        if (!player) {
            return null;
        }

        Object.assign(player, updates);
        player.lastActivity = Date.now();

        this.emitPlayerUpdate(userId);

        return player;
    }

    /**
     * Deletes a player
     */
    public deletePlayer(userId: string): boolean {
        const player = this.connectedPlayers.get(userId);
        if (!player) {
            return false;
        }

        if (player.reconnectionTimeout) {
            clearTimeout(player.reconnectionTimeout);
        }

        this.socketIdToUserId.delete(player.socketId);
        this.connectedPlayers.delete(userId);

        logger.debug(`[PlayerService] Fully disconnected player ${player.userName} (#${player.socketId})`);

        return true;
    }

    /**
     * Gets a player by user ID
     */
    public getPlayer(userId: string): Player | undefined {
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
    public getConnectedPlayers(): Player[] {
        return Array.from(this.connectedPlayers.values()).filter((player) => player.status === 'connected');
    }

    /**
     * Emits player state update to the client
     */
    private emitPlayerUpdate(userId: string): void {
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

        if (this.io && player) {
            const socket = this.io.sockets.sockets.get(player.socketId);
            if (socket) {
                socket.emit('player:state:update', clientPlayer);
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
