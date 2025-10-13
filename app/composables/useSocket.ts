import { onMounted, onUnmounted } from 'vue';
import { socketManager } from '~/lib/socket';

export const useSocket = () => {
    const isConnected = useState<boolean>('socket-connected', () => false);

    const updateConnectionStatus = () => {
        isConnected.value = socketManager.isConnected();
    };

    const onConnect = () => {
        console.log('[useSocket] Socket connected');
        updateConnectionStatus();
    };

    const onDisconnect = (reason: string) => {
        console.log('[useSocket] Socket disconnected:', reason);
        updateConnectionStatus();
    };

    const onConnectError = (error: Error) => {
        console.warn('[useSocket] Socket connection error:', error.message);
        updateConnectionStatus();
    };

    onMounted(() => {
        socketManager.ensureSocket();
        updateConnectionStatus();

        const socket = socketManager.getSocket();
        socket?.on('connect', onConnect);
        socket?.on('disconnect', onDisconnect);
        socket?.on('connect_error', onConnectError);
    });

    onUnmounted(() => {
        const socket = socketManager.getSocket();
        socket?.off('connect', onConnect);
        socket?.off('disconnect', onDisconnect);
        socket?.off('connect_error', onConnectError);
    });

    return {
        isConnected,
        socket: socketManager,
    };
};
