import { authClient } from '~/lib/auth-client';

export const useAuth = async () => {
    const { data: sessionData, error: sessionError, isPending } = await authClient.useSession(useFetch);

    const session = computed(() => sessionData.value?.session || null);
    const user = computed(() => sessionData.value?.user || null);
    const isLoggedIn = computed(() => !!sessionData.value);

    return {
        session,
        user,
        isPending,
        isLoggedIn,
        sessionError,
        signIn: authClient.signIn.social,
        signOut: authClient.signOut,
    };
};
