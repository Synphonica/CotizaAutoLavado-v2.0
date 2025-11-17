import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Definir rutas públicas (no requieren autenticación)
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhook(.*)',
    '/results(.*)',
    '/services(.*)',
    '/compare(.*)',
    '/map(.*)',
    '/provider/sign-in(.*)',
    '/provider/sign-up(.*)',
    '/provider/onboarding(.*)',
]);

// Rutas protegidas solo para proveedores
const isProviderRoute = createRouteMatcher([
    '/provider/dashboard(.*)',
    '/provider/services(.*)',
    '/provider/bookings(.*)',
    '/provider/analytics(.*)',
]);

// Si Clerk está configurado, usar su middleware
export default hasClerk
    ? clerkMiddleware(async (auth, req) => {
        const { userId } = await auth();
        const url = req.nextUrl;

        // Si la ruta es pública, permitir acceso
        if (isPublicRoute(req)) {
            // Si ya está autenticado y trata de ir a sign-in/sign-up, redirigir
            if (userId && (url.pathname.includes('/sign-in') || url.pathname.includes('/sign-up'))) {
                if (url.pathname.includes('/provider/')) {
                    return NextResponse.redirect(new URL('/provider', req.url));
                }
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            return NextResponse.next();
        }

        // Verificar autenticación para rutas protegidas
        if (!userId) {
            // Redirigir a sign-in apropiado
            if (isProviderRoute(req)) {
                return NextResponse.redirect(new URL('/provider/sign-in', req.url));
            }
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        return NextResponse.next();
    })
    : (() => NextResponse.next());

export const config = {
    matcher: [
        // Excluir archivos estáticos y Next.js internals
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Incluir API routes
        "/(api|trpc)(.*)",
    ],
};


