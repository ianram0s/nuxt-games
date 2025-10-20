import type { ClientPlayer } from '..';

// Player-specific Server -> Client events
export interface PlayerServerToClientEvents {
    'player:state:update': (player: ClientPlayer | null) => void;
}

// Player-specific Client -> Server events
export interface PlayerClientToServerEvents {
    'player:getState': (callback: (player: ClientPlayer | null) => void) => void;
    'player:forceDisconnect': () => void;
    'player:room:join': (
        data: { room: 'SpyGame'; gameId: string },
        callback: (response: { success: boolean; error?: string }) => void,
    ) => void;
    'player:room:leave': (
        data: { room: 'SpyGame'; gameId: string },
        callback: (response: { success: boolean; error?: string }) => void,
    ) => void;
}
