// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n'],
    css: ['~/assets/css/main.css'],
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        locales: [
            { code: 'en', name: 'English', file: 'en.json' },
            { code: 'pt-br', name: 'Português (BR)', file: 'pt-br.json' },
        ],
    },
    nitro: {
        experimental: {
            wasm: true,
            websocket: true,
        },
    },
});
