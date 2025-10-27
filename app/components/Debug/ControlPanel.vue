<script setup lang="ts">
const { isConnected, isConnecting, connect, disconnect } = useSocket();
</script>

<template>
    <!-- Control Panel -->
    <UCard class="rounded-2xl overflow-hidden shadow-lg ring-1 ring-neutral-950/5 dark:ring-white/10">
        <template #header>
            <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">Connection Controls</h2>
        </template>

        <div class="space-y-6">
            <div class="grid sm:grid-cols-2 gap-4">
                <UButton
                    @click="connect"
                    :loading="isConnecting"
                    :disabled="isConnected || isConnecting"
                    color="primary"
                    size="lg"
                    variant="soft"
                    icon="i-heroicons-link"
                    class="w-full cursor-pointer rounded-xl"
                >
                    {{ isConnecting ? 'Connecting...' : 'Connect' }}
                </UButton>

                <UButton
                    @click="disconnect"
                    :loading="isConnecting"
                    :disabled="!isConnected || isConnecting"
                    color="error"
                    size="lg"
                    variant="soft"
                    icon="i-heroicons-link-slash"
                    class="w-full cursor-pointer rounded-xl"
                >
                    {{ isConnecting ? 'Disconnecting...' : 'Disconnect' }}
                </UButton>
            </div>

            <div class="flex justify-center">
                <UButton
                    to="/spy/debug/game"
                    color="success"
                    size="lg"
                    variant="soft"
                    icon="i-heroicons-gamepad"
                    class="cursor-pointer rounded-xl"
                >
                    Go to Game Example
                </UButton>
            </div>

            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div class="flex items-start gap-3">
                    <UIcon
                        name="i-heroicons-information-circle"
                        class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    />
                    <div class="text-sm text-blue-900 dark:text-blue-200">
                        <p class="font-medium mb-1">Debug Information</p>
                        <p>
                            This page allows you to test the socket connection functionality. Use the buttons above to
                            connect or disconnect from the socket server.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </UCard>
</template>
