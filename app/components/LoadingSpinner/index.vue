<script setup lang="ts">
interface Props {
    /**
     * Size of the spinner. Can be a Tailwind size class (sm, md, lg, xl) or custom size
     */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
    /**
     * Color variant of the spinner
     */
    color?: 'neutral' | 'blue' | 'white' | 'current';
    /**
     * Optional text to display next to the spinner
     */
    text?: string;
    /**
     * Whether to center the spinner in its container
     */
    centered?: boolean;
    /**
     * Additional CSS classes for the container
     */
    containerClass?: string;
    /**
     * Additional CSS classes for the text
     */
    textClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    color: 'neutral',
    centered: false,
    containerClass: '',
    textClass: '',
});

const sizeMap = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
};

const colorMap = {
    neutral: 'text-neutral-400',
    blue: 'text-blue-500',
    white: 'text-white',
    current: 'text-current',
};

const spinnerClass = computed(() => {
    const sizeClass = sizeMap[props.size as keyof typeof sizeMap] || `h-${props.size} w-${props.size}`;
    const colorClass = colorMap[props.color];
    return `animate-spin ${sizeClass} ${colorClass}`;
});

const containerClass = computed(() => {
    const baseClass = props.text ? 'flex items-center gap-3' : 'flex items-center justify-center';
    const centeredClass = props.centered ? 'justify-center' : '';
    return `${baseClass} ${centeredClass} ${props.containerClass}`.trim();
});

const textClass = computed(() => {
    const baseClass = props.text ? 'text-neutral-400' : '';
    return `${baseClass} ${props.textClass}`.trim();
});
</script>
<template>
    <div :class="containerClass">
        <svg :class="spinnerClass" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
        <span v-if="text" :class="textClass">{{ text }}</span>
    </div>
</template>
