import {
    ClientClickRaceRoom,
    CreateClickRaceRoomData,
    ServerClickRaceRoom,
    ClickRacePlayer,
    ButtonPosition,
} from '~~/shared/types';
import type { SocketResponse, IoServer, IoSocket } from '~~/shared/types';
import { v4 as uuidv4 } from 'uuid';

class ClickRaceService {
    private static instance: ClickRaceService;
    private io: IoServer | null = null;
    private rooms: Map<string, ServerClickRaceRoom> = new Map();

    private constructor() {}

    public static getInstance(): ClickRaceService {
        if (!ClickRaceService.instance) {
            ClickRaceService.instance = new ClickRaceService();
        }
        return ClickRaceService.instance;
    }

    public setup(io: IoServer): void {
        this.io = io;
        this.io.on('connection', (socket) => {
            this.setupSocketHandlers(socket);
        });
    }

    private createRoom(user: User, data: CreateClickRaceRoomData): SocketResponse<{ roomId: string }> {
        if (!data.name || !data.name.trim()) {
            return { success: false, error: 'nameRequired' };
        }

        if (data.name.trim().length > 16) {
            return { success: false, error: 'nameTooLong' };
        }

        const existingHostRoom = Array.from(this.rooms.values()).find((room) => room.hostId === user.id);
        if (existingHostRoom) {
            return { success: false, error: 'alreadyHosting' };
        }

        const existingRoomName = Array.from(this.rooms.values()).find((room) => room.name === data.name);
        if (existingRoomName) {
            return { success: false, error: 'alreadyExists' };
        }

        const room: ServerClickRaceRoom = {
            id: uuidv4(),
            name: data.name,
            password: data.password,
            hostId: user.id,
            hostName: user.name,
            playerCount: 0,
            maxPlayers: data.maxPlayers,
            status: 'waiting',
            createdAt: Date.now(),
            players: new Map(),
            gameData: undefined,
        };
        this.rooms.set(room.id, room);

        return { success: true, data: { roomId: room.id } };
    }

    private getRoom(gameId: string): SocketResponse<ClientClickRaceRoom> {
        const room = this.rooms.get(gameId);
        if (room) {
            return {
                success: true,
                data: this.convertToClientRoom(room),
            };
        } else {
            return { success: false, error: 'roomNotFound' };
        }
    }

    private joinRoom(socket: IoSocket, gameId: string, password?: string): SocketResponse {
        const room = this.rooms.get(gameId);
        const user = socket.data.user;
        if (!room) {
            return { success: false, error: 'roomNotFound' };
        }

        if (room.password && room.password !== password && room.hostId !== user.id) {
            return { success: false, error: 'invalidPassword' };
        }

        if (room.players.has(user.id)) {
            return { success: false, error: 'alreadyInRoom' };
        }

        if (room.playerCount >= room.maxPlayers) {
            return { success: false, error: 'roomFull' };
        }

        const player: ClickRacePlayer = {
            userId: user.id,
            userName: user.name,
            userImage: user.image,
            role: room.status === 'playing' ? 'spectator' : 'player',
            isReady: false,
            wins: 0,
            currentClicks: 0,
            joinedAt: Date.now(),
        };

        room.players.set(user.id, player);
        room.playerCount++;

        socket.join(`clickRace:room:${gameId}`);

        this.updateRoom(gameId);

        return { success: true };
    }

    private leaveRoom(socket: IoSocket, gameId: string): SocketResponse {
        const room = this.rooms.get(gameId);
        const user = socket.data.user;
        if (!room) {
            return { success: false, error: 'roomNotFound' };
        }
        if (room.players.has(user.id)) {
            const isHost = room.hostId === user.id;
            room.players.delete(user.id);
            room.playerCount--;
            socket.leave(`clickRace:room:${gameId}`);

            if (room.status === 'playing' && room.playerCount === 1) {
                this.endGame(gameId);
                return { success: true };
            }

            if (isHost) {
                if (room.playerCount === 0) {
                    this.rooms.delete(gameId);
                    this.updateLobby();
                    return { success: true };
                } else {
                    const nextPlayer = Array.from(room.players.values())[0];
                    if (nextPlayer) {
                        room.hostId = nextPlayer.userId;
                        room.hostName = nextPlayer.userName;
                    }
                }
            }

            this.updateRoom(gameId);
            return { success: true };
        } else {
            return { success: false, error: 'notInRoom' };
        }
    }

    private setPlayerReady(socket: IoSocket, gameId: string, isReady: boolean): SocketResponse {
        const room = this.rooms.get(gameId);
        const user = socket.data.user;
        if (!room) {
            return { success: false, error: 'roomNotFound' };
        }

        const player = room.players.get(user.id);
        if (!player) {
            return { success: false, error: 'notInRoom' };
        }

        if (room.status !== 'waiting') {
            return { success: false, error: 'gameInProgress' };
        }

        if (player.role === 'spectator') {
            return { success: false, error: 'spectatorCannotReady' };
        }

        player.isReady = isReady;
        this.updateRoom(gameId);

        this.io?.to(`clickRace:room:${gameId}`).emit('clickRace:player:ready', user.id, isReady);

        return { success: true };
    }

    private generateButtonSequence(
        count: number,
        canvasWidth: number = 800,
        canvasHeight: number = 350,
    ): ButtonPosition[] {
        const buttons: ButtonPosition[] = [];
        const minSize = 35;
        const maxSize = 60;

        for (let i = 0; i < count; i++) {
            const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

            const x = Math.floor(Math.random() * (canvasWidth - size));
            const y = Math.floor(Math.random() * (canvasHeight - size));

            buttons.push({ x, y, width: size, height: size });
        }

        return buttons;
    }

    private handlePlayerClick(socket: IoSocket, gameId: string): SocketResponse<ButtonPosition> {
        const room = this.rooms.get(gameId);
        const user = socket.data.user;
        if (!room) {
            return { success: false, error: 'roomNotFound' };
        }

        const player = room.players.get(user.id);
        if (!player) {
            return { success: false, error: 'notInRoom' };
        }

        if (room.status !== 'playing') {
            return { success: false, error: 'gameNotStarted' };
        }

        if (player.role === 'spectator') {
            return { success: false, error: 'spectatorCannotClick' };
        }

        if (!room.gameData?.buttonSequence || !room.gameData.playerButtonIndices) {
            return { success: false, error: 'gameDataMissing' };
        }

        player.currentClicks++;

        let playerIndex = room.gameData.playerButtonIndices.get(user.id) ?? 0;
        playerIndex++;

        if (playerIndex >= room.gameData.buttonSequence.length) {
            playerIndex = 0;
        }

        room.gameData.playerButtonIndices.set(user.id, playerIndex);

        this.updateRoom(gameId);

        this.io?.to(`clickRace:room:${gameId}`).emit('clickRace:player:click', user.id, player.currentClicks);

        const nextButton = room.gameData.buttonSequence[playerIndex];
        socket.emit('clickRace:button:update', nextButton);

        return { success: true, data: nextButton };
    }

    private startGame(socket: IoSocket, gameId: string): SocketResponse {
        const room = this.rooms.get(gameId);
        const user = socket.data.user;
        if (!room) {
            return { success: false, error: 'roomNotFound' };
        }

        if (room.hostId !== user.id) {
            return { success: false, error: 'notHost' };
        }

        if (room.status !== 'waiting') {
            return { success: false, error: 'gameAlreadyStarted' };
        }

        if (room.playerCount < 2) {
            return { success: false, error: 'notEnoughPlayers' };
        }

        const allReady = Array.from(room.players.values()).every((player) => player.isReady);
        if (!allReady) {
            return { success: false, error: 'playersNotReady' };
        }

        room.status = 'playing';

        const buttonSequence = this.generateButtonSequence(600, 800, 350);

        // Initialize per-player button indices
        const playerButtonIndices = new Map<string, number>();
        room.players.forEach((player) => {
            player.currentClicks = 0;
            // Start each player at index 0 (the first button)
            playerButtonIndices.set(player.userId, 0);
        });

        room.gameData = {
            startTime: Date.now(),
            scores: {},
            buttonSequence,
            playerButtonIndices,
        };

        this.updateRoom(gameId);

        this.io?.to(`clickRace:room:${gameId}`).emit('clickRace:game:start', this.convertToClientRoom(room));

        // Send the initial button to all players
        if (room.gameData.buttonSequence && room.gameData.buttonSequence.length > 0) {
            const initialButton = room.gameData.buttonSequence[0];
            this.io?.to(`clickRace:room:${gameId}`).emit('clickRace:button:update', initialButton);
        }

        setTimeout(() => {
            this.endGame(gameId);
        }, 30000);

        return { success: true };
    }

    private endGame(gameId: string): void {
        const room = this.rooms.get(gameId);
        if (!room || room.status !== 'playing') {
            return;
        }

        room.gameData = {
            ...room.gameData,
            endTime: Date.now(),
        };

        let winner: ClickRacePlayer | null = null;
        let maxClicks = -1;
        let winnerClicks = 0;

        for (const [playerId, player] of room.players) {
            if (player.role === 'player' && player.currentClicks > maxClicks) {
                maxClicks = player.currentClicks;
                winner = player;
                winnerClicks = player.currentClicks;
            }
        }

        if (winner) {
            winner.wins++;
            room.gameData!.winnerId = winner.userId;
        }

        room.status = 'waiting';

        room.players.forEach((player) => {
            if (player.role === 'player') {
                player.isReady = false;
                player.currentClicks = 0;
            } else if (player.role === 'spectator') {
                player.role = 'player';
                player.isReady = false;
                player.currentClicks = 0;
            }
        });

        this.updateRoom(gameId);

        if (winner) {
            const winnerWithClicks = {
                userId: winner.userId,
                userName: winner.userName,
                userImage: winner.userImage,
                role: winner.role,
                isReady: winner.isReady,
                wins: winner.wins,
                currentClicks: winnerClicks,
                joinedAt: winner.joinedAt,
            };
            this.io
                ?.to(`clickRace:room:${gameId}`)
                .emit('clickRace:game:end', this.convertToClientRoom(room), winnerWithClicks);
        }
    }

    private convertToClientRoom(room: ServerClickRaceRoom): ClientClickRaceRoom {
        return {
            id: room.id,
            name: room.name,
            hostId: room.hostId,
            hostName: room.hostName,
            playerCount: room.playerCount,
            maxPlayers: room.maxPlayers,
            status: room.status,
            hasPassword: !!room.password,
            timestamp: Date.now(),
            createdAt: room.createdAt,
            players: Array.from(room.players.values()),
        };
    }

    private setupSocketHandlers(socket: IoSocket): void {
        socket.on('disconnect', () => {
            const rooms = Array.from(this.rooms.values()).filter((room) => room.players.has(socket.data.user.id));
            rooms.forEach((room) => {
                this.leaveRoom(socket, room.id);
            });
        });
        socket.on('clickRace:lobby:join', (callback) => {
            socket.join('clickRace:lobby');
            callback({ success: true });
            this.updateLobby(socket);
        });
        socket.on('clickRace:lobby:leave', (callback) => {
            socket.leave('clickRace:lobby');
            callback({ success: true });
        });
        socket.on('clickRace:room:create', (data: CreateClickRaceRoomData, callback) => {
            const result = this.createRoom(socket.data.user, data);
            callback(result);
            if (result.success) {
                this.updateLobby();
            }
        });
        socket.on('clickRace:room:get', (gameId: string, callback) => {
            const result = this.getRoom(gameId);
            callback(result);
        });
        socket.on('clickRace:room:join', (data, callback) => {
            const result = this.joinRoom(socket, data.gameId, data.password);
            callback(result);
        });
        socket.on('clickRace:room:leave', (gameId: string, callback) => {
            const result = this.leaveRoom(socket, gameId);
            callback(result);
        });
        socket.on('clickRace:player:ready', (gameId: string, isReady: boolean, callback) => {
            const result = this.setPlayerReady(socket, gameId, isReady);
            callback(result);
        });
        socket.on('clickRace:player:click', (gameId: string, callback) => {
            const result = this.handlePlayerClick(socket, gameId);
            callback(result);
        });
        socket.on('clickRace:game:start', (gameId: string, callback) => {
            const result = this.startGame(socket, gameId);
            callback(result);
        });
    }

    private updateLobby(socket?: IoSocket): void {
        const rooms: ClientClickRaceRoom[] = Array.from(this.rooms.values()).map((room) =>
            this.convertToClientRoom(room),
        );

        if (socket) {
            socket.emit('clickRace:lobby:update', rooms);
        } else {
            this.io?.to('clickRace:lobby').emit('clickRace:lobby:update', rooms);
        }
    }

    private updateRoom(gameId: string, socket?: IoSocket): void {
        const room = this.rooms.get(gameId);
        if (!room) {
            return;
        }

        const clientRoom = this.convertToClientRoom(room);

        if (socket) {
            socket.to(`clickRace:room:${gameId}`).emit('clickRace:room:update', clientRoom);
        } else {
            this.io?.to(`clickRace:room:${gameId}`).emit('clickRace:room:update', clientRoom);
        }
        this.updateLobby();
    }
}

export const clickRaceService = ClickRaceService.getInstance();
