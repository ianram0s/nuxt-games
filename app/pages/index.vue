<script setup lang="ts">
const { isLoggedIn } = await useAuth();

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
                    <h2 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">Word Spy</h2>
                    <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Uncover the secret word through strategic questioning and deduction. Challenge your friends in
                        this thrilling word-guessing game!
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
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Deduction</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Use strategic questions to narrow down possibilities and uncover the secret word.
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                        >
                            <UIcon name="i-heroicons-users" class="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multiplayer Fun</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Play with friends and family in real-time multiplayer sessions.
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
                        >
                            <UIcon name="i-heroicons-trophy" class="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Compete & Win</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Track your progress, earn achievements, and climb the leaderboards.
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
                        Start Playing
                    </UButton>
                    <UButton
                        v-else
                        @click="navigateToSignIn"
                        color="primary"
                        size="xl"
                        icon="i-heroicons-arrow-right-on-rectangle"
                        class="px-8 py-4 text-lg cursor-pointer"
                    >
                        Sign In to Play
                    </UButton>

                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{
                            isLoggedIn
                                ? 'Ready to start your game?'
                                : 'Sign in to start playing and competing with friends!'
                        }}
                    </p>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 Spy Game - IanBytes.com. All rights reserved.</p>
        </footer>
    </div>
</template>
