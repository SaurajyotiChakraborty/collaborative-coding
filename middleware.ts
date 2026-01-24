import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = [
        '/api/auth',
        '/auth/signin',
        '/auth/register',
        '/auth/error',
    ];

    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Special handling for home page
    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (isPublicPath && token && !pathname.startsWith('/api/auth')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Allow public paths
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Redirect to signin if not authenticated
    if (!token) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
        if (token.role !== 'Admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
};
