const protectedRoutes = ['/lobby', '/game'];

const isProtectedRoute = (path: string) => {
    return protectedRoutes.includes(path);
};

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { session, fetchSession } = useAuth();

    await fetchSession();

    if (!session.value && isProtectedRoute(to.path)) {
        return navigateTo('/sign-in');
    }

    if (session.value && to.path === '/sign-in') {
        return navigateTo('/');
    }
});
