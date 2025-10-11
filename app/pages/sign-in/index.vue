<script setup lang="ts">
const { user, signIn, signOut } = await useAuth();

const isLoading = ref(false);

const handleGoogleSignIn = async () => {
    isLoading.value = true;

    const { error } = await signIn('google');
    if (error) {
        isLoading.value = false;
    }
};

const handleSignOut = async () => {
    await signOut();
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
                        <h1 class="text-2xl font-bold">Welcome</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ user ? 'You are signed in' : 'Sign in to continue' }}
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
                            title="Not authenticated"
                            description="Please sign in with your Google account to continue."
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
                            Continue with Google
                        </UButton>
                    </div>

                    <!-- Authenticated -->
                    <div v-else class="space-y-6">
                        <UAlert
                            icon="i-heroicons-check-circle"
                            color="neutral"
                            variant="soft"
                            title="Successfully authenticated"
                            description="You're signed in and ready to go!"
                        />

                        <!-- User Info Card -->
                        <div class="space-y-3">
                            <div class="flex items-center gap-2 text-sm font-medium">
                                <UIcon name="i-heroicons-user-circle" class="w-5 h-5" />
                                <span>User Information</span>
                            </div>

                            <UCard>
                                <div class="space-y-3 text-sm">
                                    <div v-if="user.name" class="flex justify-between">
                                        <span class="text-gray-500 dark:text-gray-400">Name</span>
                                        <span class="font-medium">{{ user.name }}</span>
                                    </div>
                                    <USeparator v-if="user?.name" />

                                    <div v-if="user.email" class="flex justify-between">
                                        <span class="text-gray-500 dark:text-gray-400">Email</span>
                                        <span class="font-medium">{{ user.email }}</span>
                                    </div>
                                    <USeparator v-if="user?.email" />

                                    <div v-if="user.image" class="flex justify-between items-center">
                                        <span class="text-gray-500 dark:text-gray-400">Avatar</span>
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
                            Sign Out
                        </UButton>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>
