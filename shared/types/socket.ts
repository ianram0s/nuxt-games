import type { User } from '.';
import type { ClickRaceClientToServerEvents, ClickRaceServerToClientEvents } from './games/clickRace/events';
import type { Server, Socket } from 'socket.io';

export interface ServerToClientEvents extends ClickRaceServerToClientEvents {}
export interface ClientToServerEvents extends ClickRaceClientToServerEvents {}
export interface InterServerEvents {}

interface SocketData {
    user: User;
}

export interface SocketResponse<T = never> {
    success: boolean;
    error?: string;
    data?: T extends never ? never : T;
}

export type IoServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type IoSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
