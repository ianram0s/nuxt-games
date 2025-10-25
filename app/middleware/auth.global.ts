const protectedRoutes = ['/lobby', '/game'];

const isProtectedRoute = (path: string) => {
    if (protectedRoutes.some((route) => path.includes(route))) {
        return true;
    }
    return protectedRoutes.includes(path);
};

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { session } = await useAuth();

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
