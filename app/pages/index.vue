<i18n src="./i18n.json"></i18n>
<script setup lang="ts">
const { t } = useI18n();

useHead({
    title: t('meta.title'),
    meta: [{ name: 'description', content: t('meta.description') }],
});

const navigateToSpyGame = () => {
    navigateTo('/spy');
};

const navigateToClickRaceGame = () => {
    navigateTo('/click-race');
};
</script>

<template>
    <div class="flex-1 flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div class="w-full max-w-6xl mx-auto">
            <!-- Games Section -->
            <div class="mb-16">
                <h2 class="text-center text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text">
                    {{ t('games.title') }}
                </h2>

                <!-- Games Grid -->
                <div class="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                    <!-- Word Spy Game Card -->
                    <UCard
                        class="rounded-2xl overflow-hidden shadow-lg ring-1 ring-neutral-950/5 dark:ring-white/10 transition-transform duration-300 hover:-translate-y-1"
                    >
                        <template #header>
                            <div class="h-40 sm:h-48 flex items-center justify-center">
                                <UIcon name="i-heroicons-user-group" class="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                            </div>
                        </template>

                        <div class="space-y-3">
                            <h3 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                {{ t('games.spygame.title') }}
                            </h3>
                            <p class="text-neutral-600 dark:text-neutral-300">
                                {{ t('games.spygame.description') }}
                            </p>
                        </div>

                        <template #footer>
                            <UButton
                                @click="navigateToSpyGame"
                                color="primary"
                                size="lg"
                                variant="soft"
                                icon="i-heroicons-arrow-right-on-rectangle"
                                class="w-full cursor-pointer rounded-xl"
                            >
                                {{ t('games.spygame.playNow') }}
                            </UButton>
                        </template>
                    </UCard>

                    <!-- Click Race Game Card -->
                    <UCard
                        class="rounded-2xl overflow-hidden shadow-lg ring-1 ring-neutral-950/5 dark:ring-white/10 transition-transform duration-300 hover:-translate-y-1"
                    >
                        <template #header>
                            <div
                                class="h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500"
                            >
                                <UIcon
                                    name="i-heroicons-cursor-arrow-rays"
                                    class="w-16 h-16 sm:w-20 sm:h-20 text-white"
                                />
                            </div>
                        </template>

                        <div class="space-y-3">
                            <h3 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                {{ t('games.clickrace.title') }}
                            </h3>
                            <p class="text-neutral-600 dark:text-neutral-300">
                                {{ t('games.clickrace.description') }}
                            </p>
                        </div>

                        <template #footer>
                            <UButton
                                @click="navigateToClickRaceGame"
                                color="primary"
                                size="lg"
                                variant="soft"
                                icon="i-heroicons-cursor-arrow-rays"
                                class="w-full cursor-pointer rounded-xl"
                            >
                                {{ t('games.clickrace.playNow') }}
                            </UButton>
                        </template>
                    </UCard>

                    <UCard
                        class="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center min-h-[340px]"
                    >
                        <div class="text-center p-6">
                            <UIcon
                                name="i-heroicons-clock"
                                class="w-14 h-14 text-neutral-400 dark:text-neutral-500 mx-auto mb-4"
                            />
                            <h3 class="text-lg sm:text-xl font-semibold text-neutral-500 dark:text-neutral-400">
                                {{ t('comingSoon') }}
                            </h3>
                        </div>
                    </UCard>
                </div>
            </div>
        </div>
    </div>
</template>
