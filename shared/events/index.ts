import type { PlayerServerToClientEvents, PlayerClientToServerEvents } from './player';
import type { SpyGameServerToClientEvents, SpyGameClientToServerEvents } from './spygame';

export interface ServerToClientEventMap extends PlayerServerToClientEvents, SpyGameServerToClientEvents {}

export interface ClientToServerEventMap extends PlayerClientToServerEvents, SpyGameClientToServerEvents {}

export type ServerToClientEventName = keyof ServerToClientEventMap;
export type ClientToServerEventName = keyof ClientToServerEventMap;

export type ServerToClientEventPayload<E extends ServerToClientEventName> = ServerToClientEventMap[E]['payload'];
export type ServerToClientEventResponse<E extends ServerToClientEventName> = ServerToClientEventMap[E]['response'];

export type ClientToServerEventPayload<E extends ClientToServerEventName> = ClientToServerEventMap[E]['payload'];
export type ClientToServerEventResponse<E extends ClientToServerEventName> = ClientToServerEventMap[E]['response'];
