<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
const { user, signIn, signOut } = await useAuth();
const { t } = useI18n();
const toast = useToast();

useHead({
    title: t('meta.title'),
    meta: [{ name: 'description', content: t('meta.description') }],
});

const isLoading = ref(false);

const handleGoogleSignIn = async () => {
    isLoading.value = true;

    const { error } = await signIn({
        provider: 'google',
    });

    if (error) {
        toast.add({
            title: $t('auth.signInFailed.title'),
            description: error.message || $t('auth.signInFailed.description'),
            icon: 'i-heroicons-x-circle',
            color: 'error',
        });
        isLoading.value = false;
    }
};

const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
        toast.add({
            title: $t('auth.signOutFailed.title'),
            description: $t('auth.signOutFailed.description'),
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
};
</script>

<template>
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div class="w-full max-w-md">
            <!-- Main Card -->
            <UCard class="rounded-2xl shadow-lg ring-1 ring-neutral-950/5 dark:ring-white/10">
                <template #header>
                    <div class="text-center space-y-3">
                        <div class="flex justify-center">
                            <div
                                class="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                            >
                                <UIcon name="i-heroicons-user" class="w-6 h-6 text-neutral-900 dark:text-neutral-400" />
                            </div>
                        </div>
                        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">{{ $t('common.welcome') }}</h1>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400">
                            {{ user ? t('status.signedIn') : t('status.signInPrompt') }}
                        </p>
                    </div>
                </template>

                <div class="space-y-6 py-2">
                    <!-- Not Authenticated -->
                    <div v-if="!user" class="space-y-6">
                        <UAlert
                            icon="i-heroicons-information-circle"
                            color="neutral"
                            variant="soft"
                            :title="t('alerts.notAuthenticated.title')"
                            :description="t('alerts.notAuthenticated.description')"
                        />

                        <UButton
                            @click="handleGoogleSignIn"
                            color="primary"
                            size="lg"
                            block
                            variant="soft"
                            icon="i-simple-icons-google"
                            :loading="isLoading"
                            class="cursor-pointer rounded-xl"
                        >
                            {{ t('actions.continueWithGoogle') }}
                        </UButton>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>
