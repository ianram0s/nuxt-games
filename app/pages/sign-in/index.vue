<script setup lang="ts">
const { user, signIn, signOut } = await useAuth();
const { t } = useI18n({
    useScope: 'local',
});
const toast = useToast();

const isLoading = ref(false);

const handleGoogleSignIn = async () => {
    isLoading.value = true;

    const { error } = await signIn.social({
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
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Main Card -->
            <UCard>
                <template #header>
                    <div class="text-center space-y-2">
                        <div class="flex justify-center">
                            <div
                                class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                            >
                                <UIcon
                                    name="i-heroicons-shield-check"
                                    class="w-6 h-6 text-gray-600 dark:text-gray-400"
                                />
                            </div>
                        </div>
                        <h1 class="text-2xl font-bold">{{ $t('common.welcome') }}</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ user ? t('status.signedIn') : t('status.signInPrompt') }}
                        </p>
                    </div>
                </template>

                <div class="space-y-6 py-4">
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
                            color="neutral"
                            size="lg"
                            block
                            icon="i-simple-icons-google"
                            :loading="isLoading"
                            class="cursor-pointer"
                        >
                            {{ t('actions.continueWithGoogle') }}
                        </UButton>
                    </div>

                    <!-- Authenticated -->
                    <div v-else class="space-y-6">
                        <UAlert
                            icon="i-heroicons-check-circle"
                            color="neutral"
                            variant="soft"
                            :title="t('alerts.authenticated.title')"
                            :description="t('alerts.authenticated.description')"
                        />

                        <!-- User Info Card -->
                        <div class="space-y-3">
                            <div class="flex items-center gap-2 text-sm font-medium">
                                <UIcon name="i-heroicons-user-circle" class="w-5 h-5" />
                                <span>{{ t('userInfo.title') }}</span>
                            </div>

                            <UCard>
                                <div class="space-y-3 text-sm">
                                    <div v-if="user.name" class="flex justify-between">
                                        <span class="text-gray-500 dark:text-gray-400">{{ $t('common.name') }}</span>
                                        <span class="font-medium">{{ user.name }}</span>
                                    </div>
                                    <USeparator v-if="user?.name" />

                                    <div v-if="user.email" class="flex justify-between">
                                        <span class="text-gray-500 dark:text-gray-400">{{ $t('common.email') }}</span>
                                        <span class="font-medium">{{ user.email }}</span>
                                    </div>
                                    <USeparator v-if="user?.email" />

                                    <div v-if="user.image" class="flex justify-between items-center">
                                        <span class="text-gray-500 dark:text-gray-400">{{ $t('common.avatar') }}</span>
                                        <UAvatar :src="user.image" :alt="user.name" size="sm" />
                                    </div>
                                </div>
                            </UCard>
                        </div>

                        <!-- Sign Out Button -->
                        <UButton
                            @click="handleSignOut"
                            color="error"
                            variant="soft"
                            size="lg"
                            block
                            icon="i-heroicons-arrow-right-on-rectangle"
                            class="cursor-pointer"
                        >
                            {{ $t('common.signOut') }}
                        </UButton>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<i18n lang="json">
{
    "en": {
        "status": {
            "signedIn": "You are signed in",
            "signInPrompt": "Sign in to continue"
        },
        "alerts": {
            "notAuthenticated": {
                "title": "Not authenticated",
                "description": "Please sign in with your Google account to continue."
            },
            "authenticated": {
                "title": "Successfully authenticated",
                "description": "You're signed in and ready to go!"
            }
        },
        "actions": {
            "continueWithGoogle": "Continue with Google"
        },
        "userInfo": {
            "title": "User Information"
        }
    },
    "pt-br": {
        "status": {
            "signedIn": "Você está conectado",
            "signInPrompt": "Entre para continuar"
        },
        "alerts": {
            "notAuthenticated": {
                "title": "Não autenticado",
                "description": "Por favor, entre com sua conta Google para continuar."
            },
            "authenticated": {
                "title": "Autenticado com sucesso",
                "description": "Você está conectado e pronto para começar!"
            }
        },
        "actions": {
            "continueWithGoogle": "Continuar com Google"
        },
        "userInfo": {
            "title": "Informações do Usuário"
        }
    }
}
</i18n>
