import type { ClientPlayer } from '~~/types';

// Player-specific Server -> Client events
export interface PlayerServerToClientEvents {
    'player:status:change': {
        payload: ClientPlayer | null;
        response: null;
    };
}

// Player-specific Client -> Server events
export interface PlayerClientToServerEvents {
    'player:getStatus': {
        payload: {};
        response: ClientPlayer | null;
    };
    'player:room:join': {
        payload: { room: 'SpyGame'; gameId: string };
        response: { success: boolean; error?: string };
    };
    'player:room:leave': {
        payload: { room: 'SpyGame'; gameId: string };
        response: { success: boolean; error?: string };
    };
}
