<template>
    <div
        class="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900"
    >
        <!-- Header -->
        <LayoutHeader />

        <!-- Main Content -->
        <main class="flex-1 flex px-4 sm:px-6 lg:px-8 py-8">
            <slot />
        </main>
    </div>
</template>
