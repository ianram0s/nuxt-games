// Spy game specific Server -> Client events
export interface SpyGameServerToClientEvents {
    'spy:game:created': {
        payload: {
            gameId: string;
            roomCode: string;
            hostId: string;
        };
        response: null;
    };

    'spy:game:joined': {
        payload: {
            gameId: string;
            playerId: string;
            playerCount: number;
        };
        response: null;
    };

    'spy:game:left': {
        payload: {
            gameId: string;
            playerId: string;
            playerCount: number;
        };
        response: null;
    };

    'spy:game:started': {
        payload: {
            gameId: string;
            players: Array<{
                id: string;
                name: string;
                role: 'spy' | 'civilian';
            }>;
        };
        response: null;
    };

    'spy:game:ended': {
        payload: {
            gameId: string;
            winner: 'spy' | 'civilians';
            spyId: string;
        };
        response: null;
    };
}

// Spy game specific Client -> Server events
export interface SpyGameClientToServerEvents {
    'spy:game:create': {
        payload: {
            roomName?: string;
        };
        response: {
            gameId: string;
            roomCode: string;
        };
    };

    'spy:game:join': {
        payload: {
            roomCode: string;
        };
        response: {
            success: boolean;
            gameId?: string;
            error?: string;
        };
    };

    'spy:game:leave': {
        payload: {
            gameId: string;
        };
        response: {
            success: boolean;
        };
    };

    'spy:game:start': {
        payload: {
            gameId: string;
        };
        response: {
            success: boolean;
            error?: string;
        };
    };
}
