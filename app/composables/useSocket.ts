import { socketManager } from '~/lib/socket-manager';
import { playerServiceClient } from '~/services/player.service';

type UseSocketOptions = {
    auto?: boolean;
    lease?: boolean;
};

export const useSocket = (options: UseSocketOptions = {}) => {
    const { auto = false, lease = true } = options;
    const { isLoggedIn } = useAuth();
    const isConnected = useState<boolean>('socket-connected', () => socketManager.isConnected());

    const bootstrapped = useState<boolean>('socket:bootstrapped', () => false);
    if (import.meta.client && !bootstrapped.value) {
        watch(
            isLoggedIn,
            (logged) => {
                socketManager.setAuthenticated(!!logged);
                if (!logged) playerServiceClient.cleanup();
            },
            { immediate: true },
        );

        socketManager.onConnect(() => {
            isConnected.value = true;
            const socket = socketManager.getSocketWrapper();
            if (socket) playerServiceClient.initialize(socket);
        });

        socketManager.onDisconnect(() => {
            isConnected.value = false;
            playerServiceClient.cleanup();
        });

        bootstrapped.value = true;
    }

    if (lease) {
        onMounted(() => {
            socketManager.acquireLease();
            socketManager.setAuthenticated(!!isLoggedIn.value);
            if (auto && isLoggedIn.value) {
                socketManager.connect();
            }
        });

        onScopeDispose(() => {
            socketManager.releaseLease();
        });
    }

    return {
        isConnected,
        connect: () => socketManager.connect(),
        disconnect: () => socketManager.disconnect(),
        onConnect: (callback: () => void) => socketManager.onConnect(callback),
        onDisconnect: (callback: (reason?: string) => void) => socketManager.onDisconnect(callback),
    };
};
