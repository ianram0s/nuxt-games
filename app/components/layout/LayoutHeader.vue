<script setup lang="ts">
import { authClient } from '~/lib/auth-client';

const { data: session } = await authClient.useSession(useFetch);

const isSigningOut = ref(false);

const navigateToSignIn = () => {
    navigateTo('/sign-in');
};

const handleSignOut = async () => {
    isSigningOut.value = true;
    try {
        await authClient.signOut();
    } finally {
        isSigningOut.value = false;
    }
};
</script>

<template>
    <header
        class="flex justify-between items-center p-6 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50"
    >
        <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Spy Game</h1>
        </div>

        <div class="flex items-center gap-4">
            <UButton
                v-if="!session"
                @click="navigateToSignIn"
                color="primary"
                variant="soft"
                icon="i-heroicons-arrow-right-on-rectangle"
                class="cursor-pointer"
            >
                Sign In
            </UButton>
            <div v-else class="flex items-center gap-3">
                <UAvatar :src="session.user.image || undefined" :alt="session.user.name || 'User'" size="lg" />

                <UButton
                    @click="handleSignOut"
                    color="error"
                    variant="soft"
                    size="sm"
                    :icon="isSigningOut ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-right-on-rectangle'"
                    :loading="isSigningOut"
                    :disabled="isSigningOut"
                    class="cursor-pointer"
                >
                    Sign Out
                </UButton>
            </div>
        </div>
    </header>
</template>
