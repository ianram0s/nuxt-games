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
    <UHeader
        :title="$t('app.name')"
        :ui="{
            root: 'backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70 border-b border-neutral-200/60 dark:border-neutral-800/60 sticky top-0 z-50',
            container: 'p-4 sm:p-6',
            title: 'text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white',
        }"
        toggle-side="left"
        mode="slideover"
    >
        <template #right>
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
                    class="cursor-pointer rounded-xl"
                >
                    {{ $t('common.signIn') }}
                </UButton>
                <div v-else class="flex items-center gap-3">
                    <UAvatar
                        :src="user.image || undefined"
                        :alt="user.name || 'User'"
                        size="lg"
                        class="ring-2 ring-primary/20"
                    />

                    <UButton
                        @click="handleSignOut"
                        color="error"
                        variant="soft"
                        size="sm"
                        :icon="isSigningOut ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-right-on-rectangle'"
                        :loading="isSigningOut"
                        :disabled="isSigningOut"
                        class="cursor-pointer rounded-xl"
                    >
                        {{ $t('common.signOut') }}
                    </UButton>
                </div>
            </div>
        </template>
    </UHeader>
</template>
