<script setup lang="ts">
const { connect, disconnect } = useSocket();
const { isConnected, localPlayer } = useGame();

const connectSocket = () => {
    connect();
};

const disconnectSocket = () => {
    disconnect();
};

const playerStatusColor = computed(() => {
    if (!localPlayer.value) return 'gray';
    switch (localPlayer.value.status) {
        case 'connected':
            return 'green';
        case 'reconnecting':
            return 'yellow';
        case 'disconnected':
            return 'red';
        default:
            return 'gray';
    }
});
</script>

<template>
    <div class="flex-1 w-full flex items-center justify-center px-6">
        <div class="text-center max-w-2xl mx-auto">
            <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">Spy Game Lobby</h2>

            <!-- Connection Status Card -->
            <div
                class="mb-8 p-8 rounded-lg border-2 transition-all"
                :class="
                    isConnected
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                "
            >
                <!-- Status Icon and Text -->
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="relative">
                        <UIcon
                            :name="isConnected ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                            class="w-16 h-16"
                            :class="
                                isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            "
                        />
                        <!-- Pulse animation when connected -->
                        <span
                            v-if="isConnected"
                            class="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-ping"
                        ></span>
                    </div>
                    <div>
                        <h3
                            class="text-2xl font-bold"
                            :class="
                                isConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                            "
                        >
                            {{ isConnected ? 'Socket Connected' : 'Socket Disconnected' }}
                        </h3>
                        <p
                            class="text-sm"
                            :class="
                                isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            "
                        >
                            {{ isConnected ? 'Real-time communication active' : 'No connection to server' }}
                        </p>
                    </div>
                </div>

                <!-- Connection Details -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-left">
                    <div class="grid gap-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Status:</span>
                            <span
                                class="font-semibold"
                                :class="
                                    isConnected
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                "
                            >
                                {{ isConnected ? 'ONLINE' : 'OFFLINE' }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Connection Type:</span>
                            <span class="font-semibold text-gray-900 dark:text-white">WebSocket</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-gray-400">Protocol:</span>
                            <span class="font-semibold text-gray-900 dark:text-white">Socket.IO</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Control Buttons -->
            <div class="flex gap-4 justify-center">
                <UButton
                    @click="connectSocket"
                    :disabled="isConnected"
                    color="success"
                    size="lg"
                    icon="i-heroicons-signal"
                    class="px-6"
                >
                    Connect
                </UButton>
                <UButton
                    @click="disconnectSocket"
                    :disabled="!isConnected"
                    color="error"
                    size="lg"
                    icon="i-heroicons-signal-slash"
                    class="px-6"
                >
                    Disconnect
                </UButton>
            </div>

            <!-- Player Status -->
            <div
                v-if="localPlayer"
                class="mt-8 p-4 rounded-lg border-2"
                :class="`border-${playerStatusColor}-500 bg-${playerStatusColor}-50 dark:bg-${playerStatusColor}-900/20`"
            >
                <h3 class="text-lg font-semibold mb-2">Your Status</h3>
                <p class="text-sm">
                    Player ID: <span class="font-mono">{{ localPlayer.userId }}</span>
                </p>
                <p class="text-sm">
                    Status: <span class="font-semibold capitalize">{{ localPlayer.status }}</span>
                </p>
            </div>

            <!-- Info Message -->
            <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div class="flex items-start gap-3">
                    <UIcon
                        name="i-heroicons-information-circle"
                        class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    />
                    <p class="text-sm text-blue-800 dark:text-blue-300 text-left">
                        This lobby uses WebSocket connections to enable real-time multiplayer gameplay. The connection
                        status above shows whether you're currently connected to the game server.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
