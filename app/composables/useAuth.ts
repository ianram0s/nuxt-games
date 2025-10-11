import { authClient } from '~/lib/auth-client';

export const useAuth = async () => {
    const toast = useToast();
    const { data: sessionData, error: sessionError, isPending } = await authClient.useSession(useFetch);

    const session = computed(() => sessionData.value?.session || null);
    const user = computed(() => sessionData.value?.user || null);
    const isLoggedIn = computed(() => !!sessionData.value);

    if (sessionError.value) {
        toast.add({
            title: 'Authentication Error',
            description: 'Failed to authenticate user.',
            icon: 'i-heroicons-exclamation-circle',
            color: 'error',
        });
    }

    const signIn = async (provider: 'google' = 'google') => {
        const { error } = await authClient.signIn.social({
            provider,
        });

        if (error) {
            toast.add({
                title: 'Sign-in failed',
                description: error.message || 'An error occurred during sign-in.',
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });

            return { success: false, error };
        }

        return { success: true, error: null };
    };

    const signOut = async (options?: { redirect?: string }) => {
        const { error } = await authClient.signOut();

        if (error) {
            toast.add({
                title: 'Sign out failed',
                description: error.message || 'An error occurred during sign-out.',
                icon: 'i-heroicons-x-circle',
                color: 'error',
            });

            return { success: false, error };
        }

        toast.add({
            title: 'Signed out',
            description: 'You have been successfully signed out.',
            icon: 'i-heroicons-arrow-right-on-rectangle',
            color: 'success',
        });

        if (options?.redirect) {
            await navigateTo(options.redirect);
        }

        return { success: true, error: null };
    };

    const showAuthRequiredToast = () => {
        toast.add({
            title: 'Authentication Required',
            description: 'Please sign-in to access this page.',
            icon: 'i-heroicons-lock-closed',
            color: 'warning',
        });
    };

    return {
        session,
        user,
        isPending,
        isLoggedIn,
        signIn,
        signOut,
        showAuthRequiredToast,
    };
};
