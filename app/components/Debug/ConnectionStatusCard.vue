<script setup lang="ts">
const { isConnected } = useSocket();
</script>

<template>
    <!-- Connection Status Card -->
    <UCard class="rounded-2xl overflow-hidden shadow-lg ring-1 ring-neutral-950/5 dark:ring-white/10 mb-8">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">Connection Status</h2>
                <div class="flex items-center gap-2">
                    <div :class="['w-3 h-3 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500']"></div>
                    <span
                        :class="[
                            'text-sm font-medium',
                            isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                        ]"
                    >
                        {{ isConnected ? 'Connected' : 'Disconnected' }}
                    </span>
                </div>
            </div>
        </template>

        <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <div class="flex items-center gap-3">
                    <UIcon
                        :name="isConnected ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                        :class="['w-6 h-6', isConnected ? 'text-green-500' : 'text-red-500']"
                    />
                    <span class="font-medium text-neutral-900 dark:text-white"> Socket Connection </span>
                </div>
                <UBadge :color="isConnected ? 'success' : 'error'" variant="soft">
                    {{ isConnected ? 'Active' : 'Inactive' }}
                </UBadge>
            </div>

            <div class="text-sm text-neutral-500 dark:text-neutral-400">
                <p v-if="isConnected">✅ Socket is connected and ready for communication</p>
                <p v-else>❌ Socket is disconnected. Click "Connect" to establish connection.</p>
            </div>
        </div>
    </UCard>
</template>
