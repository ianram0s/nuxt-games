export type PlayerStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface Player {
    userId: string;
    userName: string;
    userImage: string | null;
    status: PlayerStatus;
}

export interface ServerPlayer extends Player {
    socketId: string;
    lastActivity: number;
    reconnectionTimeout?: NodeJS.Timeout;
}

export interface ClientPlayer extends Player {
    timestamp: number;
}
