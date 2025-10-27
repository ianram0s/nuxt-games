export type ClickRaceRoomStatus = 'waiting' | 'playing';

export type ClickRacePlayerRole = 'player' | 'spectator';

export interface ClickRacePlayer {
    userId: string;
    userName: string;
    userImage: string | null;
    role: ClickRacePlayerRole;
    isReady: boolean;
    wins: number;
    currentClicks: number;
    joinedAt: number;
}

export interface ClickRaceRoom {
    id: string;
    name: string;
    hostId: string;
    hostName: string;
    playerCount: number;
    maxPlayers: number;
    status: ClickRaceRoomStatus;
    createdAt: number;
}

export interface ButtonPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ServerClickRaceRoom extends ClickRaceRoom {
    password?: string;
    players: Map<string, ClickRacePlayer>;
    gameData?: {
        startTime?: number;
        endTime?: number;
        winnerId?: string;
        scores?: Record<string, number>;
        buttonSequence?: ButtonPosition[];
        playerButtonIndices?: Map<string, number>;
    };
}

export interface ClientClickRaceRoom extends ClickRaceRoom {
    hasPassword: boolean;
    timestamp: number;
    players: ClickRacePlayer[];
    currentButton?: ButtonPosition;
}

export interface CreateClickRaceRoomData {
    name: string;
    maxPlayers: number;
    password?: string;
}
