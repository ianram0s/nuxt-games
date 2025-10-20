import { authClient } from '~/lib/auth-client';
import { socketManager } from '~/lib/socket';

export const useAuth = async () => {
    const { data: sessionData, error: sessionError, isPending } = await authClient.useSession(useFetch);

    const session = computed(() => sessionData.value?.session || null);
    const user = computed(() => sessionData.value?.user || null);
    const isLoggedIn = computed(() => !!sessionData.value);

    const signOut: typeof authClient.signOut = async () => {
        socketManager.block();
        return authClient.signOut();
    };

    const signIn: typeof authClient.signIn.social = async (provider, options) => {
        socketManager.unblock();
        return authClient.signIn.social(provider, options);
    };

    return {
        session,
        user,
        isPending,
        isLoggedIn,
        sessionError,
        signIn,
        signOut,
    };
};
