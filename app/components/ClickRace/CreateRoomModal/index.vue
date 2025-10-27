<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { clickRaceService } from '~/services/clickrace.service';

interface Props {
    modelValue: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'roomCreated', room: CreateClickRaceRoomData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const roomName = ref('');
const roomPassword = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const open = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const resetForm = () => {
    roomName.value = '';
    roomPassword.value = '';
    isLoading.value = false;
    errorMessage.value = '';
};

const closeModal = () => {
    open.value = false;
    resetForm();
};

const createRoom = async () => {
    if (!roomName.value.trim()) {
        errorMessage.value = $t('nameRequired');
        return;
    }

    if (roomName.value.trim().length > 16) {
        errorMessage.value = $t('nameTooLong');
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const roomData: CreateClickRaceRoomData = {
            name: roomName.value.trim(),
            password: roomPassword.value.trim() || undefined,
            maxPlayers: 4,
        };

        const { success, error, data } = await clickRaceService.createRoom(roomData);
        if (success && data?.roomId) {
            emit('roomCreated', roomData);
            closeModal();
            await navigateTo(`/click-race/game/${data.roomId}`);
        } else {
            errorMessage.value = error ? $t(`errors.${error}`) : $t('createFailed');
        }
        isLoading.value = false;
    } catch (error) {
        errorMessage.value = $t('unexpectedError');
        console.error('Failed to create room:', error);
        isLoading.value = false;
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading.value) {
        createRoom();
    }
};

watch(open, (newValue) => {
    if (!newValue) {
        resetForm();
    }
});
</script>

<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            @click.self="closeModal"
        >
            <div
                class="w-full max-w-md rounded-2xl border border-neutral-800/60 bg-neutral-950/90 p-8 shadow-2xl backdrop-blur"
            >
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-semibold text-neutral-100 mb-2">{{ $t('title') }}</h3>
                    <p class="text-sm text-neutral-400">{{ $t('subtitle') }}</p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-neutral-300 mb-2">{{ $t('nameLabel') }}</label>
                        <input
                            v-model="roomName"
                            type="text"
                            id="roomName"
                            maxlength="16"
                            autocomplete="game-room-name"
                            :placeholder="$t('namePlaceholder')"
                            class="w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            @keydown="handleKeydown"
                            :disabled="isLoading"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-neutral-300 mb-2">{{ $t('passwordLabel') }}</label>
                        <input
                            v-model="roomPassword"
                            type="password"
                            id="roomPassword"
                            autocomplete="game-room-password"
                            :placeholder="$t('passwordPlaceholder')"
                            class="w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            @keydown="handleKeydown"
                            :disabled="isLoading"
                        />
                    </div>

                    <UAlert v-if="errorMessage" color="error" variant="soft" :title="errorMessage" />

                    <div class="flex gap-3 pt-4">
                        <button
                            @click="closeModal"
                            :disabled="isLoading"
                            class="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-neutral-300 font-medium transition-colors hover:bg-neutral-800/70 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {{ $t('cancel') }}
                        </button>
                        <button
                            @click="createRoom"
                            :disabled="!roomName.trim() || isLoading"
                            class="flex-1 rounded-xl bg-green-600 px-4 py-3 text-white font-medium transition-colors hover:bg-green-700 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <LoadingSpinner
                                v-if="isLoading"
                                size="xs"
                                color="white"
                                :text="$t('creating')"
                                container-class="justify-center gap-2"
                            />
                            <span v-else>{{ $t('create') }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
