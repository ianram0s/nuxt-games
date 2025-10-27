<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

useHead({
    title: $t('meta.title'),
    meta: [{ name: 'description', content: $t('meta.description') }],
});

import { useRoute } from 'vue-router';
import { clickRaceService } from '~/services/clickrace.service';
import { logger } from '~~/shared/lib/logger';
import type { ClientClickRaceRoom, ClickRacePlayer } from '~~/shared/types/games';
import PasswordModal from '~/components/ClickRace/PasswordModal/index.vue';

const route = useRoute();
const toast = useToast();
const { user } = await useAuth();
const { isConnected } = useSocket();

const connectedPlayers = ref<ClickRacePlayer[]>([]);

const isLoading = ref(true);
const room = ref<ClientClickRaceRoom | null>(null);
const showPasswordModal = ref(false);
const gameTimeRemaining = ref(0);
const gameTimer = ref<NodeJS.Timeout | null>(null);

const gameId = Array.isArray(route.params.gameId) ? route.params.gameId[0] : route.params.gameId;

const loadRoom = async () => {
    try {
        isLoading.value = true;

        if (!gameId) {
            await navigateTo('/click-race/lobby');
            return;
        }

        const response = await clickRaceService.getRoom(gameId);

        if (response.success && response.data) {
            room.value = response.data;

            if (room.value.hasPassword && room.value.hostId !== user.value?.id) {
                showPasswordModal.value = true;
            } else {
                const response = await clickRaceService.joinRoom(gameId);
                if (!response.success) {
                    toast.add({
                        title: $t('errors.joinRoomFailed'),
                        description: response.error,
                    });
                    await navigateTo('/click-race/lobby');
                }
                isLoading.value = false;
            }
        } else {
            toast.add({
                title: $t('ui.roomNotFound'),
                description: $t('ui.roomNotFoundDescription'),
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });
            await navigateTo('/click-race/lobby');
        }
    } catch (error) {
        console.error('Failed to load room:', error);
        toast.add({
            title: $t('errors.failedToLoadRoom'),
            description: $t('errors.failedToLoadRoom'),
            icon: 'i-heroicons-x-circle',
            color: 'error',
        });
        await navigateTo('/click-race/lobby');
    }
};

const leaveGame = async () => {
    try {
        const response = await clickRaceService.leaveRoom(gameId!);
        if (response.success) {
            await navigateTo('/click-race/lobby');
        } else {
            toast.add({
                title: $t('errors.failedToLeaveRoom'),
                description: response.error || $t('errors.failedToLeaveRoom'),
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });
        }
    } catch (error) {
        console.error('Failed to leave game:', error);
        toast.add({
            title: $t('errors.failedToLeaveGame'),
            description: $t('errors.failedToLeaveGame'),
            icon: 'i-heroicons-x-circle',
            color: 'error',
        });
    }
};

const handleClick = async () => {
    if (room.value?.status !== 'playing') return;

    try {
        const response = await clickRaceService.handlePlayerClick(gameId!);
        if (!response.success) {
            toast.add({
                title: $t('errors.failedToRegisterClick'),
                description: response.error || $t('errors.failedToRegisterClick'),
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });
        }
    } catch (error) {
        console.error('Failed to handle click:', error);
    }
};

const toggleReady = async () => {
    if (!room.value || room.value.status !== 'waiting') return;

    const currentPlayer = connectedPlayers.value.find((p) => p.userId === user.value?.id);
    if (!currentPlayer) return;

    try {
        const response = await clickRaceService.setPlayerReady(gameId!, !currentPlayer.isReady);
        if (!response.success) {
            toast.add({
                title: $t('errors.failedToUpdateReadyStatus'),
                description: response.error || $t('errors.failedToUpdateReadyStatus'),
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });
        }
    } catch (error) {
        console.error('Failed to toggle ready status:', error);
    }
};

const startGame = async () => {
    if (!room.value || room.value.hostId !== user.value?.id) return;

    try {
        const response = await clickRaceService.startGame(gameId!);
        if (!response.success) {
            toast.add({
                title: $t('errors.failedToStartGame'),
                description: response.error || $t('errors.failedToStartGame'),
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });
        }
    } catch (error) {
        console.error('Failed to start game:', error);
        toast.add({
            title: $t('errors.failedToStartGame'),
            description: $t('errors.failedToStartGame'),
            icon: 'i-heroicons-x-circle',
            color: 'error',
        });
    }
};

const setupGameListeners = () => {
    clickRaceService.onRoomUpdate((updatedRoom) => {
        room.value = updatedRoom;
        connectedPlayers.value = updatedRoom.players || [];
        isLoading.value = false;
    });

    clickRaceService.onPlayerReady((playerId, isReady) => {
        const player = connectedPlayers.value.find((p) => p.userId === playerId);
        if (player) {
            player.isReady = isReady;
        }
    });

    clickRaceService.onPlayerClick((playerId, clicks) => {
        const player = connectedPlayers.value.find((p) => p.userId === playerId);
        if (player) {
            player.currentClicks = clicks;
        }
    });

    clickRaceService.onGameStart((gameRoom) => {
        room.value = gameRoom;
        connectedPlayers.value = gameRoom.players || [];

        gameTimeRemaining.value = 30;
        gameTimer.value = setInterval(() => {
            gameTimeRemaining.value--;
            if (gameTimeRemaining.value <= 0) {
                clearInterval(gameTimer.value!);
                gameTimer.value = null;
            }
        }, 1000);

        toast.add({
            title: $t('success.gameStarted'),
            description: $t('success.gameStartedDescription'),
            icon: 'i-heroicons-play',
            color: 'success',
        });
    });

    clickRaceService.onGameEnd((gameRoom, winner) => {
        room.value = gameRoom;
        connectedPlayers.value = gameRoom.players || [];

        if (gameTimer.value) {
            clearInterval(gameTimer.value);
            gameTimer.value = null;
        }
        gameTimeRemaining.value = 0;

        toast.add({
            title: $t('success.gameFinished'),
            description: $t('success.gameFinishedDescription', {
                winner: winner.userName,
                clicks: winner.currentClicks,
            }),
            icon: 'i-heroicons-trophy',
            color: 'success',
        });
    });
};

onMounted(() => {
    setupGameListeners();
    loadRoom();
});

onUnmounted(() => {
    clickRaceService.clearGameListeners();
    clickRaceService.leaveRoom(gameId!);

    if (gameTimer.value) {
        clearInterval(gameTimer.value);
        gameTimer.value = null;
    }
});

watch(isConnected, (connected, wasConnected) => {
    if (wasConnected && !connected) {
        toast.add({
            title: $t('errors.socketDisconnected'),
            description: $t('errors.socketDisconnectedDescription'),
            icon: 'i-heroicons-x-circle',
            color: 'error',
        });
        navigateTo('/click-race');
    }
});
</script>

<template>
    <div class="flex-1 w-full flex items-center justify-center px-6">
        <!-- Loading Spinner -->
        <div v-if="isLoading" class="text-center">
            <LoadingSpinner
                size="xl"
                color="blue"
                :text="$t('ui.loadingRoom')"
                container-class="flex-col space-y-4"
                text-class="text-neutral-400"
            />
        </div>

        <!-- Game Content -->
        <div v-else class="text-center max-w-4xl mx-auto w-full">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl text-neutral-100">
                    {{ $t('ui.clickRaceGame') }}
                </h1>
                <p class="mt-3 text-sm text-neutral-400 sm:text-base">{{ $t('ui.roomId', { gameId }) }}</p>
                <p v-if="room" class="text-sm text-neutral-400">
                    {{ $t('ui.roomName', { name: room.name }) }}
                </p>
                <p class="text-sm text-neutral-500">
                    {{ $t('ui.welcomeMessage') }}
                </p>
            </div>

            <!-- Game Status -->
            <div
                class="mx-auto w-full max-w-4xl flex flex-col rounded-3xl border border-neutral-800/60 bg-neutral-950/70 p-10 shadow-2xl backdrop-blur mb-6"
            >
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-xl font-semibold text-neutral-100">{{ $t('ui.gameStatus') }}</h2>
                        <p class="text-sm text-neutral-400 mt-1">
                            {{ $t('ui.currentStatus', { status: room?.status }) }}
                        </p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-blue-400">{{ gameTimeRemaining }}s</div>
                        <div class="text-sm text-neutral-400">{{ $t('ui.timeRemaining') }}</div>
                    </div>
                </div>

                <!-- Click Race Button -->
                <div class="flex justify-center mb-6">
                    <button
                        @click="handleClick"
                        :disabled="
                            room?.status !== 'playing' ||
                            connectedPlayers.find((p) => p.userId === user?.id)?.role === 'spectator'
                        "
                        class="w-32 h-32 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white font-bold text-xl cursor-pointer"
                    >
                        {{ $t('ui.click') }}
                    </button>
                </div>

                <!-- Game Controls -->
                <div class="flex gap-4 justify-center">
                    <button
                        v-if="
                            room?.status === 'waiting' &&
                            connectedPlayers.find((p) => p.userId === user?.id)?.role === 'player'
                        "
                        @click="toggleReady"
                        :class="[
                            'px-6 py-2 rounded-lg transition-colors cursor-pointer',
                            connectedPlayers.find((p) => p.userId === user?.id)?.isReady
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white',
                        ]"
                    >
                        {{
                            connectedPlayers.find((p) => p.userId === user?.id)?.isReady
                                ? $t('ui.notReady')
                                : $t('ui.ready')
                        }}
                    </button>

                    <button
                        v-if="room?.status === 'waiting' && room?.hostId === user?.id"
                        @click="startGame"
                        :disabled="
                            !connectedPlayers.filter((p) => p.role === 'player').every((p) => p.isReady) ||
                            connectedPlayers.filter((p) => p.role === 'player').length < 2
                        "
                        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
                    >
                        {{ $t('ui.startGame') }}
                    </button>

                    <button
                        @click="leaveGame"
                        class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                        {{ $t('ui.leaveGame') }}
                    </button>
                </div>
            </div>

            <!-- Connected Players -->
            <div
                class="mx-auto w-full max-w-4xl flex flex-col rounded-3xl border border-neutral-800/60 bg-neutral-950/70 p-10 shadow-2xl backdrop-blur"
            >
                <h2 class="text-xl font-semibold text-neutral-100 mb-6">{{ $t('ui.connectedPlayers') }}</h2>

                <!-- Players List -->
                <div class="grid gap-4">
                    <div
                        v-for="player in connectedPlayers"
                        :key="player.userId"
                        class="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800/50 p-4"
                    >
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden"
                            >
                                <img
                                    v-if="player.userImage"
                                    :src="player.userImage"
                                    :alt="player.userName"
                                    class="w-full h-full object-cover"
                                />
                                <span v-else>{{ player.userName.charAt(0).toUpperCase() }}</span>
                            </div>
                            <div>
                                <h3 class="font-medium text-neutral-100">{{ player.userName }}</h3>
                                <div class="flex items-center gap-4 text-sm text-neutral-400">
                                    <span>{{ $t('ui.wins', { wins: player.wins }) }}</span>
                                    <span
                                        v-if="player.role === 'player'"
                                        :class="[
                                            'px-2 py-1 rounded-full text-xs',
                                            player.isReady
                                                ? 'bg-green-600/20 text-green-400'
                                                : 'bg-yellow-600/20 text-yellow-400',
                                        ]"
                                    >
                                        {{ player.isReady ? $t('ui.ready') : $t('ui.notReady') }}
                                    </span>
                                    <span
                                        v-if="player.role === 'spectator'"
                                        class="px-2 py-1 rounded-full text-xs bg-purple-600/20 text-purple-400"
                                    >
                                        {{ $t('ui.spectator') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-semibold text-blue-400">
                                {{ player.currentClicks }}
                            </div>
                            <div class="text-xs text-neutral-400">{{ $t('ui.clicks') }}</div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="connectedPlayers.length === 0" class="text-center py-8 text-neutral-400">
                    <svg
                        class="h-12 w-12 mx-auto mb-4 text-neutral-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                    </svg>
                    <p>{{ $t('ui.noPlayersConnected') }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Password Modal -->
    <PasswordModal v-if="gameId" v-model="showPasswordModal" :game-id="gameId" />
</template>
