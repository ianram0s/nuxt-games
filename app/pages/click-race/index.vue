<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
const { isLoggedIn } = await useAuth();
const { t } = useI18n();

useHead({
    title: t('meta.title'),
    meta: [{ name: 'description', content: t('meta.description') }],
});

const navigateToSignIn = () => {
    navigateTo('/sign-in');
};

const navigateToGame = () => {
    navigateTo('/click-race/lobby');
};
</script>

<template>
    <div class="flex-1 w-full flex items-center justify-center px-6">
        <div class="text-center max-w-4xl mx-auto">
            <div class="mb-8">
                <h2 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">{{ t('hero.title') }}</h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    {{ t('hero.description') }}
                </p>
            </div>

            <!-- Game Features -->
            <div class="grid md:grid-cols-3 gap-8 mb-12">
                <div class="text-center">
                    <div
                        class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center"
                    >
                        <UIcon name="i-heroicons-cursor-arrow-rays" class="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('features.speed.title') }}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300">
                        {{ t('features.speed.description') }}
                    </p>
                </div>

                <div class="text-center">
                    <div
                        class="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center"
                    >
                        <UIcon name="i-heroicons-users" class="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('features.multiplayer.title') }}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300">
                        {{ t('features.multiplayer.description') }}
                    </p>
                </div>

                <div class="text-center">
                    <div
                        class="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center"
                    >
                        <UIcon name="i-heroicons-trophy" class="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {{ t('features.compete.title') }}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-300">
                        {{ t('features.compete.description') }}
                    </p>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="space-y-4">
                <UButton
                    v-if="isLoggedIn"
                    @click="navigateToGame"
                    color="primary"
                    size="xl"
                    icon="i-heroicons-play"
                    class="px-8 py-4 text-lg cursor-pointer"
                >
                    {{ t('cta.startPlaying') }}
                </UButton>
                <UButton
                    v-else
                    @click="navigateToSignIn"
                    color="primary"
                    size="xl"
                    icon="i-heroicons-arrow-right-on-rectangle"
                    class="px-8 py-4 text-lg cursor-pointer"
                >
                    {{ t('cta.signInToPlay') }}
                </UButton>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ isLoggedIn ? t('cta.readyMessage') : t('cta.signInMessage') }}
                </p>
            </div>
        </div>
    </div>
</template>
