import type { ClientOptions, InferSessionFromClient, InferUserFromClient } from 'better-auth';
import { createAuthClient } from 'better-auth/vue';
import { socketManager } from '~/lib/socket-manager';

export function useAuth() {
    const url = useRequestURL();
    const headers = import.meta.server ? useRequestHeaders() : undefined;

    const authClient = createAuthClient({
        baseURL: url.origin,
        fetchOptions: {
            headers,
        },
    });

    const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null);
    const user = useState<InferUserFromClient<ClientOptions> | null>('auth:user', () => null);
    const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false);
    const sessionError = useState<string | null>('auth:sessionError', () => null);

    const fetchSession = async () => {
        if (sessionFetching.value) return;
        sessionFetching.value = true;

        const { data, error } = await authClient.getSession();
        session.value = data?.session || null;
        user.value = data?.user || null;
        sessionError.value = error?.message || null;

        sessionFetching.value = false;
    };

    if (import.meta.client) {
        authClient.$store.listen('$sessionSignal', async (signal) => {
            if (!signal) return;

            await fetchSession();
        });
    }

    const signOut: typeof authClient.signOut = async (options) => {
        socketManager.block();

        return await authClient.signOut(options);
    };

    return {
        session,
        user,
        isPending: sessionFetching,
        isLoggedIn: computed(() => !!session.value),
        sessionError,
        signIn: authClient.signIn,
        signOut,
        fetchSession,
        client: authClient,
    };
}
