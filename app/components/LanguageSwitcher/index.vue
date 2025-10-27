<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types';

const { locales, locale, setLocale } = useI18n();

const items = computed<DropdownMenuItem[][]>(() => [
    locales.value.map((loc) => ({
        label: loc.name || loc.code,
        icon: locale.value === loc.code ? 'i-heroicons-check' : undefined,
        onSelect: () => setLocale(loc.code),
    })),
]);
</script>

<template>
    <UDropdownMenu :items="items" :ui="{ content: 'min-w-40' }">
        <UButton
            icon="i-heroicons-language"
            color="neutral"
            variant="ghost"
            aria-label="Switch language"
            class="cursor-pointer"
        />
    </UDropdownMenu>
</template>
