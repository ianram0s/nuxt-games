<script setup lang="ts">
import { useSocket } from '~/composables/useSocket';

const { isConnected } = useSocket();
</script>

<template>
    <div class="flex-1 w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div class="w-full max-w-4xl mx-auto">
            <!-- Header Section -->
            <div class="text-center mb-12">
                <h1 class="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                    Socket Debug
                    <span class="text-lg font-normal ml-2"> ({{ isConnected ? 'Connected' : 'Disconnected' }}) </span>
                </h1>
                <p class="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                    Test and monitor your socket connection status in real-time
                </p>
            </div>

            <!-- Components -->
            <DebugConnectionStatusCard />
            <DebugControlPanel />
        </div>
    </div>
</template>
