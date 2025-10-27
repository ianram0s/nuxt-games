<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

useHead({
    title: $t('meta.title'),
    meta: [{ name: 'description', content: $t('meta.description') }],
});

import { useRoute } from 'vue-router';
import { clickRaceService } from '~/services/clickrace.service';
import type { ClientClickRaceRoom, ClickRacePlayer, ButtonPosition } from '~~/shared/types/games';
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
const currentButtonPosition = ref<ButtonPosition | null>(null);
const isClicking = ref(false);

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 350;

const getButtonStyle = (position: ButtonPosition) => {
    const size = Math.min(position.width, position.height);
    return {
        left: `${(position.x / CANVAS_WIDTH) * 100}%`,
        top: `${(position.y / CANVAS_HEIGHT) * 100}%`,
        width: `${(size / CANVAS_WIDTH) * 100}%`,
        height: `${(size / CANVAS_HEIGHT) * 100}%`,
        minWidth: '30px',
        minHeight: '30px',
    };
};

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
    if (room.value?.status !== 'playing' || !currentButtonPosition.value || isClicking.value) return;

    isClicking.value = true;
    try {
        const response = await clickRaceService.handlePlayerClick(gameId!);
        if (!response.success) {
            toast.add({
                title: $t('errors.failedToRegisterClick'),
                description: response.error || $t('errors.failedToRegisterClick'),
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });
        } else if (response.data) {
            currentButtonPosition.value = response.data;
        }
    } catch (error) {
        console.error('Failed to handle click:', error);
    } finally {
        isClicking.value = false;
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
        currentButtonPosition.value = null;
        isClicking.value = false;

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

    clickRaceService.onButtonUpdate((position) => {
        currentButtonPosition.value = position;
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
            <div class="mb-4 sm:mb-8 px-2">
                <h1 class="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-neutral-100">
                    {{ $t('ui.clickRaceGame') }}
                </h1>
                <p class="mt-2 text-xs sm:text-sm text-neutral-500 hidden sm:block">
                    {{ $t('ui.welcomeMessage') }}
                </p>
            </div>

            <!-- Game Status -->
            <div
                class="mx-auto w-full max-w-4xl flex flex-col rounded-2xl sm:rounded-3xl border border-neutral-800/60 bg-neutral-950/70 p-4 sm:p-6 md:p-10 shadow-2xl backdrop-blur mb-4 sm:mb-6"
            >
                <div class="flex items-center justify-between mb-4 sm:mb-6">
                    <div v-if="room?.status === 'playing'">
                        <div class="text-xs sm:text-sm text-neutral-400">
                            {{ $t('ui.yourScore') }}:
                            <span class="text-blue-400 font-semibold">{{
                                connectedPlayers.find((p) => p.userId === user?.id)?.currentClicks || 0
                            }}</span>
                        </div>
                    </div>
                    <div v-if="room?.status === 'playing'" class="text-right">
                        <div class="text-xl sm:text-2xl font-bold text-blue-400">{{ gameTimeRemaining }}s</div>
                        <div class="text-xs sm:text-sm text-neutral-400">{{ $t('ui.timeRemaining') }}</div>
                    </div>
                </div>

                <!-- Click Race Game Canvas -->
                <div class="relative w-full max-w-full mx-auto mb-4 sm:mb-6 px-2 sm:px-4">
                    <div
                        class="relative border-2 sm:border-4 border-blue-600 rounded-xl sm:rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black overflow-hidden game-canvas"
                        :style="{
                            width: '100%',
                            height: '0',
                            paddingBottom: '43.75%',
                            maxWidth: '800px',
                            margin: '0 auto',
                        }"
                    >
                        <div class="absolute inset-0 w-full h-full">
                            <!-- Grid Pattern Background -->
                            <div
                                class="absolute inset-0 opacity-10 game-grid"
                                style="
                                    background-image:
                                        linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
                                    background-size: 6.25% 6.25%;
                                "
                            ></div>

                            <!-- Button Target -->
                            <button
                                v-if="currentButtonPosition && room?.status === 'playing'"
                                @click="handleClick"
                                :disabled="
                                    connectedPlayers.find((p) => p.userId === user?.id)?.role === 'spectator' ||
                                    isClicking
                                "
                                class="absolute rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-2xl ring-2 ring-red-400 ring-opacity-30 cursor-pointer touch-manipulation aspect-square"
                                :style="getButtonStyle(currentButtonPosition)"
                            ></button>

                            <!-- Waiting State -->
                            <div
                                v-else-if="room?.status === 'waiting'"
                                class="absolute inset-0 flex items-center justify-center"
                            >
                                <div class="text-center px-4">
                                    <div class="animate-pulse text-blue-400 text-base sm:text-xl font-semibold mb-2">
                                        {{ $t('ui.waitingForGame') }}
                                    </div>
                                    <div class="text-neutral-400 text-xs sm:text-sm">{{ $t('ui.getReady') }}</div>
                                </div>
                            </div>

                            <!-- Game End State -->
                            <div v-else class="absolute inset-0 flex items-center justify-center">
                                <div class="text-center px-4">
                                    <div class="text-lg sm:text-2xl font-bold text-neutral-300 mb-2">
                                        {{ $t('ui.gameEnded') }}
                                    </div>
                                    <div class="text-neutral-400 text-xs sm:text-sm">
                                        {{ $t('ui.waitingForNextRound') }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Game Controls -->
                <div class="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    <button
                        v-if="
                            room?.status === 'waiting' &&
                            connectedPlayers.find((p) => p.userId === user?.id)?.role === 'player'
                        "
                        @click="toggleReady"
                        :class="[
                            'px-3 sm:px-6 py-2 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer',
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
                        class="px-3 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
                    >
                        {{ $t('ui.startGame') }}
                    </button>

                    <button
                        @click="leaveGame"
                        class="px-3 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm rounded-lg transition-colors cursor-pointer"
                    >
                        {{ $t('ui.leaveGame') }}
                    </button>
                </div>
            </div>

            <!-- Connected Players -->
            <div
                class="mx-auto w-full max-w-4xl flex flex-col rounded-2xl sm:rounded-3xl border border-neutral-800/60 bg-neutral-950/70 p-4 sm:p-6 md:p-10 shadow-2xl backdrop-blur"
            >
                <h2 class="text-lg sm:text-xl font-semibold text-neutral-100 mb-4 sm:mb-6">
                    {{ $t('ui.connectedPlayers') }}
                </h2>

                <!-- Players List -->
                <div class="grid gap-2 sm:gap-4">
                    <div
                        v-for="player in connectedPlayers"
                        :key="player.userId"
                        class="flex items-center justify-between rounded-lg sm:rounded-xl border border-neutral-700 bg-neutral-800/50 p-3 sm:p-4"
                    >
                        <div class="flex items-center gap-2 sm:gap-4">
                            <div
                                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0"
                            >
                                <img
                                    v-if="player.userImage"
                                    :src="player.userImage"
                                    :alt="player.userName"
                                    class="w-full h-full object-cover"
                                />
                                <span v-else class="text-xs sm:text-sm">{{
                                    player.userName.charAt(0).toUpperCase()
                                }}</span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="font-medium text-neutral-100 text-left text-sm sm:text-base">
                                        {{ player.userName }}
                                    </h3>
                                    <span
                                        v-if="player.userId === room?.hostId"
                                        class="flex items-center gap-0.5 text-xs text-yellow-400"
                                        title="Host"
                                    >
                                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                            />
                                        </svg>
                                        <span class="hidden sm:inline">{{ $t('ui.host') }}</span>
                                    </span>
                                </div>
                                <div class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-400">
                                    <span>{{ $t('ui.wins', { wins: player.wins }) }}</span>
                                    <span
                                        v-if="player.role === 'player'"
                                        :class="[
                                            'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs',
                                            player.isReady
                                                ? 'bg-green-600/20 text-green-400'
                                                : 'bg-yellow-600/20 text-yellow-400',
                                        ]"
                                    >
                                        {{ player.isReady ? $t('ui.ready') : $t('ui.notReady') }}
                                    </span>
                                    <span
                                        v-if="player.role === 'spectator'"
                                        class="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs bg-purple-600/20 text-purple-400"
                                    >
                                        {{ $t('ui.spectator') }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <div class="text-base sm:text-lg font-semibold text-blue-400">
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
