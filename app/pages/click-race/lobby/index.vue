<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { clickRaceService } from '~/services/clickrace.service';

useHead({
    title: $t('meta.title'),
    meta: [{ name: 'description', content: $t('meta.description') }],
});

const { user } = await useAuth();
const { isConnected } = useSocket();
const toast = useToast();

const rooms = ref<ClientClickRaceRoom[]>([]);
const isLoading = ref(true);
const showCreateModal = ref(false);
const errorMessage = ref('');

const joinLobby = async () => {
    try {
        isLoading.value = true;
        await clickRaceService.joinLobby();
    } catch (error) {
        console.error('Failed to join lobby:', error);
        errorMessage.value = $t('errors.connectionFailed');
    } finally {
        isLoading.value = false;
    }
};

const setupListeners = () => {
    clickRaceService.onLobbyUpdate((updatedRooms) => {
        rooms.value = updatedRooms;
    });
};

const openCreateModal = () => {
    showCreateModal.value = true;
    errorMessage.value = '';
};

const closeCreateModal = () => {
    showCreateModal.value = false;
};

const joinRoom = async (roomId: string) => {
    await navigateTo(`/click-race/game/${roomId}`);
};

onMounted(() => {
    setupListeners();
    joinLobby();
});

onUnmounted(() => {
    clickRaceService.clearLobbyListeners();
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
        <!-- Loading State - Show only when socket is connecting -->
        <div v-if="!isConnected" class="mx-auto w-full max-w-4xl flex flex-col items-center justify-center">
            <div class="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" color="neutral" text="Establishing connection..." text-class="text-lg" />
            </div>
        </div>

        <!-- Main Content - Show only when connected -->
        <div v-else class="text-center max-w-4xl mx-auto w-full">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl text-neutral-100">
                    {{ $t('title') }}
                </h1>
                <p class="mt-3 text-sm text-neutral-400 sm:text-base">
                    {{ $t('welcome') }}
                </p>
                <p class="text-sm text-neutral-500">
                    {{ $t('subtitle') }}
                </p>
            </div>

            <!-- Error Message -->
            <UAlert
                v-if="errorMessage"
                color="error"
                variant="soft"
                :title="errorMessage"
                class="mb-6"
                @close="errorMessage = ''"
            />

            <!-- Main Content -->
            <div
                class="mx-auto w-full max-w-4xl flex flex-col rounded-3xl border border-neutral-800/60 bg-neutral-950/70 p-10 shadow-2xl backdrop-blur"
            >
                <!-- Create Room Section -->
                <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 mb-6">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 class="text-xl font-semibold text-neutral-100">
                                {{ $t('createRoom.title') }}
                            </h2>
                            <p class="text-sm text-neutral-400 mt-1">
                                {{ $t('createRoom.subtitle') }}
                            </p>
                        </div>
                        <UButton
                            color="primary"
                            size="lg"
                            class="cursor-pointer self-center md:w-auto"
                            @click="openCreateModal"
                        >
                            {{ $t('createRoom.button') }}
                        </UButton>
                    </div>
                </div>

                <!-- Room List Section -->
                <div class="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
                    <h2 class="text-xl font-semibold text-neutral-100 mb-4">
                        {{ $t('roomList.title') }}
                    </h2>

                    <!-- Loading State -->
                    <div v-if="isLoading" class="flex items-center justify-center py-8">
                        <LoadingSpinner size="sm" color="neutral" :text="$t('roomList.loading')" />
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="rooms.length === 0" class="text-center py-8 text-neutral-400">
                        <p>{{ $t('roomList.empty') }}</p>
                    </div>

                    <!-- Room List -->
                    <div v-else class="overflow-y-auto pr-2 max-h-[400px]">
                        <div class="grid gap-4">
                            <div
                                v-for="room in rooms"
                                :key="room.id"
                                class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 hover:bg-neutral-800/70 transition-colors"
                            >
                                <div class="flex items-center gap-4 flex-1 min-w-0">
                                    <div
                                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 flex-shrink-0"
                                    >
                                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-medium text-neutral-100 text-left truncate">{{ room.name }}</h3>
                                        <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-400 mt-1">
                                            <span
                                                >{{ room.playerCount }}/{{ room.maxPlayers }}
                                                {{ $t('roomList.playerCount') }}</span
                                            >
                                            <span v-if="room.hasPassword" class="flex items-center gap-1 flex-shrink-0">
                                                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                                {{ $t('roomList.passwordProtected') }}
                                            </span>
                                            <span
                                                v-if="room.hostId === user?.id"
                                                class="flex items-center gap-1 text-blue-400 flex-shrink-0"
                                            >
                                                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                        clip-rule="evenodd"
                                                    />
                                                </svg>
                                                {{ $t('roomList.yourRoom') }}
                                            </span>
                                            <span
                                                class="text-xs px-2 py-1 rounded-full bg-neutral-700 text-neutral-300 flex-shrink-0"
                                            >
                                                {{ $t(`roomList.status.${room.status}`) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    :disabled="room.status !== 'waiting'"
                                    @click="joinRoom(room.id)"
                                    class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer w-full md:w-auto"
                                >
                                    {{ $t('roomList.joinButton') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Create Room Modal -->
    <ClickRaceCreateRoomModal v-model="showCreateModal" @room-created="closeCreateModal" />
</template>
