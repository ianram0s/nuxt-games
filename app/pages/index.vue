<script setup lang="ts">
const { isLoggedIn } = await useAuth();
const { t } = useI18n({
    useScope: 'local',
});

const navigateToSignIn = () => {
    navigateTo('/sign-in');
};

const navigateToGame = () => {
    // TODO: Navigate to game when implemented
    console.log('Navigate to game');
};
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <!-- Header -->
        <LayoutHeader />

        <!-- Hero Section -->
        <main class="flex-1 flex items-center justify-center px-6">
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
                            class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
                        >
                            <UIcon name="i-heroicons-light-bulb" class="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {{ t('features.deduction.title') }}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            {{ t('features.deduction.description') }}
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                        >
                            <UIcon name="i-heroicons-users" class="w-8 h-8 text-green-600 dark:text-green-400" />
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
                            class="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
                        >
                            <UIcon name="i-heroicons-trophy" class="w-8 h-8 text-purple-600 dark:text-purple-400" />
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
        </main>

        <!-- Footer -->
        <footer class="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{{ $t('footer.copyright') }}</p>
        </footer>
    </div>
</template>

<i18n lang="json">
{
    "en": {
        "hero": {
            "title": "Word Spy",
            "description": "Uncover the secret word through strategic questioning and deduction. Challenge your friends in this thrilling word-guessing game!"
        },
        "features": {
            "deduction": {
                "title": "Smart Deduction",
                "description": "Use strategic questions to narrow down possibilities and uncover the secret word."
            },
            "multiplayer": {
                "title": "Multiplayer Fun",
                "description": "Play with friends and family in real-time multiplayer sessions."
            },
            "compete": {
                "title": "Compete & Win",
                "description": "Track your progress, earn achievements, and climb the leaderboards."
            }
        },
        "cta": {
            "startPlaying": "Start Playing",
            "signInToPlay": "Sign In to Play",
            "readyMessage": "Ready to start your game?",
            "signInMessage": "Sign in to start playing and competing with friends!"
        }
    },
    "pt-br": {
        "hero": {
            "title": "Espião de Palavras",
            "description": "Descubra a palavra secreta através de perguntas estratégicas e dedução. Desafie seus amigos neste emocionante jogo de adivinhação!"
        },
        "features": {
            "deduction": {
                "title": "Dedução Inteligente",
                "description": "Use perguntas estratégicas para reduzir as possibilidades e descobrir a palavra secreta."
            },
            "multiplayer": {
                "title": "Diversão Multiplayer",
                "description": "Jogue com amigos e família em sessões multiplayer em tempo real."
            },
            "compete": {
                "title": "Compete e Vença",
                "description": "Acompanhe seu progresso, ganhe conquistas e suba nas tabelas de classificação."
            }
        },
        "cta": {
            "startPlaying": "Começar a Jogar",
            "signInToPlay": "Entre para Jogar",
            "readyMessage": "Pronto para começar seu jogo?",
            "signInMessage": "Entre para começar a jogar e competir com amigos!"
        }
    }
}
</i18n>
