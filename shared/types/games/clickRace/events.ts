import type { ClientClickRaceRoom, CreateClickRaceRoomData, ClickRacePlayer } from './';
import type { SocketResponse } from '../../socket';

// Click Race-specific Server -> Client events
export interface ClickRaceServerToClientEvents {
    'clickRace:lobby:update': (rooms: ClientClickRaceRoom[]) => void;
    'clickRace:room:update': (room: ClientClickRaceRoom) => void;
    'clickRace:player:ready': (playerId: string, isReady: boolean) => void;
    'clickRace:player:click': (playerId: string, clicks: number) => void;
    'clickRace:game:start': (room: ClientClickRaceRoom) => void;
    'clickRace:game:end': (room: ClientClickRaceRoom, winner: ClickRacePlayer) => void;
}

// Player-specific Client -> Server events
export interface ClickRaceClientToServerEvents {
    'clickRace:lobby:join': (callback: (response: SocketResponse) => void) => void;
    'clickRace:lobby:leave': (callback: (response: SocketResponse) => void) => void;
    'clickRace:room:create': (
        data: CreateClickRaceRoomData,
        callback: (response: SocketResponse<{ roomId: string }>) => void,
    ) => void;
    'clickRace:room:get': (gameId: string, callback: (response: SocketResponse<ClientClickRaceRoom>) => void) => void;
    'clickRace:room:join': (
        data: { gameId: string; password?: string },
        callback: (response: SocketResponse) => void,
    ) => void;
    'clickRace:room:leave': (gameId: string, callback: (response: SocketResponse) => void) => void;
    'clickRace:player:ready': (gameId: string, isReady: boolean, callback: (response: SocketResponse) => void) => void;
    'clickRace:player:click': (gameId: string, callback: (response: SocketResponse) => void) => void;
    'clickRace:game:start': (gameId: string, callback: (response: SocketResponse) => void) => void;
}
