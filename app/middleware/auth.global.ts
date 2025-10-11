const protectedRoutes = ['/lobby', '/game'];

const isProtectedRoute = (path: string) => {
    return protectedRoutes.includes(path);
};

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { session, showAuthRequiredToast } = await useAuth();

    if (!session.value) {
        if (isProtectedRoute(to.path)) {
            showAuthRequiredToast();
            return navigateTo('/sign-in');
        }
    } else {
        if (to.path === '/sign-in') {
            return navigateTo('/');
        }
    }
});
