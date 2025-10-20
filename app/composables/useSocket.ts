import { socketManager } from '~/lib/socket';
import { logger } from '~~/shared/lib/logger';

export const useSocket = () => {
    const isConnected = useState<boolean>('socket-connected', () => socketManager.isConnected());
    const isConnecting = useState<boolean>('socket-connecting', () => false);
    const isSetup = useState<boolean>('socket-setup', () => false);
    const consumers = useState<number>('socket-consumers', () => 0);
    const socket = socketManager.getSocket();

    const connect = () => {
        if (isConnected.value) {
            return;
        }
        isConnecting.value = true;
        socketManager.connect();
    };

    const disconnect = () => {
        if (!isConnected.value) {
            return;
        }

        isConnecting.value = true;
        socketManager.disconnect();
    };

    const onConnect = () => {
        logger.debug('Socket connected');
        isConnected.value = true;
        isConnecting.value = false;
    };

    const onConnectError = () => {
        logger.error('Socket connection error');
        isConnecting.value = false;
    };

    const onDisconnect = () => {
        logger.debug('Socket disconnected');
        isConnected.value = false;
        isConnecting.value = false;
    };

    const setup = () => {
        if (isSetup.value) {
            return;
        }

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);

        connect();

        isSetup.value = true;
    };

    const clear = () => {
        if (!isSetup.value) {
            return;
        }

        disconnect();

        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');

        isSetup.value = false;
    };

    onMounted(() => {
        consumers.value++;

        setup();
    });

    onUnmounted(() => {
        consumers.value--;

        if (consumers.value <= 0) {
            clear();
        }
    });

    return {
        isConnected,
        isConnecting,
        connect,
        disconnect,
    };
};
