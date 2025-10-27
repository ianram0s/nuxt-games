import { socketManager } from '~/lib/socket';
import { logger } from '~~/shared/lib/logger';
import type { SocketResponse } from '~~/shared/types';
import type { ClientClickRaceRoom, CreateClickRaceRoomData, ClickRacePlayer, ButtonPosition } from '~~/shared/types';

class ClickRaceService {
    private static instance: ClickRaceService;
    private socket = socketManager.getSocket();
    private constructor() {}

    /**
     * @returns The singleton instance of the ClickRaceService
     */
    public static getInstance(): ClickRaceService {
        if (!ClickRaceService.instance) {
            ClickRaceService.instance = new ClickRaceService();
        }
        return ClickRaceService.instance;
    }

    /**
     * Joins the click race lobby
     * @returns A promise that resolves to the response from the server
     */
    public joinLobby() {
        return new Promise<SocketResponse>((resolve) => {
            this.socket.emit('clickRace:lobby:join', (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Creates a new click race room
     * @param data The data for the new room
     * @returns A promise that resolves to the response from the server
     */
    public createRoom(data: CreateClickRaceRoomData) {
        return new Promise<SocketResponse<{ roomId: string }>>((resolve, reject) => {
            this.socket.emit('clickRace:room:create', data, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Gets a click race room by game ID
     * @param gameId
     * @returns
     */
    public getRoom(gameId: string) {
        return new Promise<SocketResponse<ClientClickRaceRoom>>((resolve) => {
            this.socket.emit('clickRace:room:get', gameId, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Joins a click race room
     * @param gameId
     * @param password
     * @returns
     */
    public joinRoom(gameId: string, password?: string) {
        return new Promise<SocketResponse>((resolve) => {
            this.socket.emit('clickRace:room:join', { gameId, password }, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Leaves a click race room
     * @param gameId
     * @returns
     */
    public leaveRoom(gameId: string) {
        return new Promise<SocketResponse>((resolve) => {
            this.socket.emit('clickRace:room:leave', gameId, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Sets player ready status
     * @param gameId
     * @param isReady
     * @returns
     */
    public setPlayerReady(gameId: string, isReady: boolean) {
        return new Promise<SocketResponse>((resolve) => {
            this.socket.emit('clickRace:player:ready', gameId, isReady, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Handles player click during game
     * @param gameId
     * @returns
     */
    public handlePlayerClick(gameId: string) {
        return new Promise<SocketResponse<ButtonPosition>>((resolve) => {
            this.socket.emit('clickRace:player:click', gameId, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Starts the game (host only)
     * @param gameId
     * @returns
     */
    public startGame(gameId: string) {
        return new Promise<SocketResponse>((resolve) => {
            this.socket.emit('clickRace:game:start', gameId, (response) => {
                resolve(response);
            });
        });
    }

    /**
     * Listens for lobby updates
     * @param callback A callback function that will be called when the lobby is updated
     */
    public onLobbyUpdate(callback: (rooms: ClientClickRaceRoom[]) => void): void {
        this.socket.on('clickRace:lobby:update', (rooms) => {
            callback(rooms);
        });
    }

    /**
     * Listens for room updates
     * @param callback A callback function that will be called when the room is updated
     */
    public onRoomUpdate(callback: (room: ClientClickRaceRoom) => void): void {
        this.socket.on('clickRace:room:update', (room) => {
            callback(room);
        });
    }

    /**
     * Listens for player ready status changes
     * @param callback A callback function that will be called when a player's ready status changes
     */
    public onPlayerReady(callback: (playerId: string, isReady: boolean) => void): void {
        this.socket.on('clickRace:player:ready', (playerId, isReady) => {
            callback(playerId, isReady);
        });
    }

    /**
     * Listens for player clicks
     * @param callback A callback function that will be called when a player clicks
     */
    public onPlayerClick(callback: (playerId: string, clicks: number) => void): void {
        this.socket.on('clickRace:player:click', (playerId, clicks) => {
            callback(playerId, clicks);
        });
    }

    /**
     * Listens for button position updates
     * @param callback A callback function that will be called when button position updates
     */
    public onButtonUpdate(callback: (position: ButtonPosition) => void): void {
        this.socket.on('clickRace:button:update', (position) => {
            callback(position);
        });
    }

    /**
     * Listens for game start events
     * @param callback A callback function that will be called when the game starts
     */
    public onGameStart(callback: (room: ClientClickRaceRoom) => void): void {
        this.socket.on('clickRace:game:start', (room) => {
            callback(room);
        });
    }

    /**
     * Listens for game end events
     * @param callback A callback function that will be called when the game ends
     */
    public onGameEnd(callback: (room: ClientClickRaceRoom, winner: ClickRacePlayer) => void): void {
        this.socket.on('clickRace:game:end', (room, winner) => {
            callback(room, winner);
        });
    }

    /**
     * Clears Click Race game listeners
     */
    public clearGameListeners(): void {
        this.socket.off('clickRace:room:update');
        this.socket.off('clickRace:player:ready');
        this.socket.off('clickRace:player:click');
        this.socket.off('clickRace:button:update');
        this.socket.off('clickRace:game:start');
        this.socket.off('clickRace:game:end');
    }

    /**
     * Clears Click Race lobby listeners
     */
    public clearLobbyListeners(): void {
        this.socket.off('clickRace:lobby:update');
    }
}

export const clickRaceService = ClickRaceService.getInstance();
