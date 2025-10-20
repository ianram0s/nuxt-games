import type { User } from '..';
import type { PlayerServerToClientEvents, PlayerClientToServerEvents } from './player';
import type { Server, Socket } from 'socket.io';

export interface ServerToClientEvents extends PlayerServerToClientEvents {}
export interface ClientToServerEvents extends PlayerClientToServerEvents {}
export interface InterServerEvents {}

interface SocketData {
    user: User;
}

export type IoServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type IoSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
