import { onMounted, onUnmounted } from 'vue';
import { playerServiceClient } from '~/services/player.service';
import { socketManager } from '~/lib/socket-manager';
import type { ClientPlayer } from '~~/types/player';
import { logger } from '~~/shared/lib/logger';

export const useGame = () => {
    const { user } = useAuth();
    const { isConnected, onConnect, onDisconnect } = useSocket({ lease: false });

    const localPlayer = useState<ClientPlayer | null>('game:localPlayer', () => null);

    let cleanupPlayerStatus: (() => void) | null = null;

    const setupPlayerStatusListener = () => {
        cleanupPlayerStatus?.();
        cleanupPlayerStatus = playerServiceClient.onPlayerStatusChange((player) => {
            if (player && user.value?.id === player.userId) {
                localPlayer.value = player;
            }
        });
    };

    onMounted(() => {
        if (isConnected.value && !cleanupPlayerStatus) {
            setupPlayerStatusListener();
        }
    });

    const offConnect = onConnect(async () => {
        if (!cleanupPlayerStatus) {
            setupPlayerStatusListener();
        }

        await socketManager.joinLobby();
    });

    const offDisconnect = onDisconnect(() => {
        localPlayer.value = null;
        cleanupPlayerStatus = null;
        socketManager.leaveLobby();
    });

    onUnmounted(() => {
        cleanupPlayerStatus?.();
        offConnect();
        offDisconnect();
        socketManager.leaveLobby();
    });

    return {
        localPlayer: readonly(localPlayer),
        socket: socketManager,
        isConnected,
        joinLobby: () => socketManager.joinLobby(),
        leaveLobby: () => socketManager.leaveLobby(),
        joinGameRoom: (gameId: string) => socketManager.joinGameRoom(gameId),
        leaveGameRoom: (gameId: string) => socketManager.leaveGameRoom(gameId),
        setRoom: (roomId: string | null) => socketManager.setRoom(roomId),
    };
};
