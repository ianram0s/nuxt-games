<script setup lang="ts">
const { user, signOut } = await useAuth();
const toast = useToast();

const isSigningOut = ref(false);
const isSigningIn = ref(false);

const navigateToSignIn = async () => {
    isSigningIn.value = true;
    try {
        await navigateTo('/sign-in');
    } finally {
        isSigningIn.value = false;
    }
};

const handleSignOut = async () => {
    isSigningOut.value = true;
    try {
        const { error } = await signOut();

        if (error) {
            toast.add({
                title: $t('auth.signOutFailed.title'),
                description: error.message || $t('auth.signOutFailed.description'),
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });
            return;
        }

        toast.add({
            title: $t('auth.signedOut.title'),
            description: $t('auth.signedOut.description'),
            icon: 'i-heroicons-arrow-right-on-rectangle',
            color: 'success',
        });

        await navigateTo('/');
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
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $t('app.name') }}</h1>
        </div>

        <div class="flex items-center gap-4">
            <LanguageSwitcher />
            <UButton
                v-if="!user"
                @click="navigateToSignIn"
                color="primary"
                variant="soft"
                :icon="isSigningIn ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-right-on-rectangle'"
                :loading="isSigningIn"
                :disabled="isSigningIn"
                class="cursor-pointer"
            >
                {{ $t('common.signIn') }}
            </UButton>
            <div v-else class="flex items-center gap-3">
                <UAvatar :src="user.image || undefined" :alt="user.name || 'User'" size="lg" />

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
                    {{ $t('common.signOut') }}
                </UButton>
            </div>
        </div>
    </header>
</template>
