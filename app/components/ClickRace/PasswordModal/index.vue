<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import { ref } from 'vue';
import { clickRaceService } from '~/services/clickrace.service';
import { logger } from '~~/shared/lib/logger';

interface Props {
    modelValue: boolean;
    gameId: string | undefined;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const open = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const resetForm = () => {
    password.value = '';
    isLoading.value = false;
    errorMessage.value = '';
};

const closeModal = () => {
    open.value = false;
    resetForm();
};

const cancelModal = async () => {
    closeModal();
    await navigateTo('/click-race/lobby');
};

const joinRoom = async () => {
    if (!props.gameId) {
        errorMessage.value = $t('errors.roomNotFound');
        return;
    }

    if (!password.value.trim()) {
        errorMessage.value = $t('passwordRequired');
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const { success, error } = await clickRaceService.joinRoom(props.gameId, password.value);
        if (success) {
            logger.debug('Joined click race room successfully.');
            closeModal();
        } else {
            errorMessage.value = error ? $t(`errors.${error}`) : $t('joinFailed');
            logger.error('Failed to join click race room:', error);
        }
        isLoading.value = false;
    } catch (error) {
        errorMessage.value = $t('unexpectedError');
        console.error('Failed to join room:', error);
        isLoading.value = false;
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading.value) {
        joinRoom();
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
            @click.self="cancelModal"
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
                        <label class="block text-sm font-medium text-neutral-300 mb-2">{{ $t('passwordLabel') }}</label>
                        <input
                            v-model="password"
                            type="password"
                            id="roomPassword"
                            :placeholder="$t('passwordPlaceholder')"
                            class="w-full rounded-xl border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            @keydown="handleKeydown"
                            :disabled="isLoading"
                        />
                    </div>

                    <UAlert v-if="errorMessage" color="error" variant="soft" :title="errorMessage" />

                    <div class="flex gap-3 pt-4">
                        <button
                            @click="cancelModal"
                            :disabled="isLoading"
                            class="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-3 text-neutral-300 font-medium transition-colors hover:bg-neutral-800/70 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {{ $t('cancel') }}
                        </button>
                        <button
                            @click="joinRoom"
                            :disabled="!password.trim() || isLoading"
                            class="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-white font-medium transition-colors hover:bg-blue-700 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <LoadingSpinner
                                v-if="isLoading"
                                size="xs"
                                color="white"
                                :text="$t('joining')"
                                container-class="justify-center gap-2"
                            />
                            <span v-else>{{ $t('join') }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
