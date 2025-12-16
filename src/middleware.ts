import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasAccess } from '@/lib/access';

/**
 * Authentication middleware for Next.js
 *
 * Protects /app/* routes by:
 * 1. Redirecting unauthenticated users to /login
 * 2. Redirecting authenticated users without active subscription to /subscribe
 * 3. Allowing subscribed users to access protected routes
 *
 * @param request - The incoming Next.js request
 * @returns NextResponse with redirect or next() to continue
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Only protect /app/* routes
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  const session = await auth();

  // Not authenticated → redirect to login with callback URL
  if (!session?.user?.email) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check subscription status
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      subscriptionStatus: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  // Not subscribed or subscription expired → redirect to subscribe
  if (!user || !hasAccess(user)) {
    return NextResponse.redirect(new URL('/subscribe', request.url));
  }

  // Has access → allow request to continue
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Matches all routes under /app/*
 */
export const config = {
  matcher: ['/app/:path*'],
};
