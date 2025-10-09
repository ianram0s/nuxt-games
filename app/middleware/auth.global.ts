import { authClient } from '~/lib/auth-client';

const protectedRoutes = ['/lobby', '/game'];

const isProtectedRoute = (path: string) => {
    return protectedRoutes.includes(path);
};

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { data: session } = await authClient.useSession(useFetch);

    if (!session.value) {
        if (isProtectedRoute(to.path)) {
            return navigateTo('/sign-in');
        }
    } else {
        if (to.path === '/sign-in') {
            return navigateTo('/');
        }
    }
});
