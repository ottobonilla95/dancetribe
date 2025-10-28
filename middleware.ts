import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that don't require onboarding
const publicRoutes = [
  '/',
  '/api/auth',
  '/api/webhook',
  '/blog',
  '/privacy-policy',
  '/tos',
  '/dev',
  '/signin',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/csrf',
  '/dancer',
  '/dance-style',
  '/city',
  '/cities'
]

// Routes that require authentication but allow incomplete profiles
const authRoutes = [
  '/onboarding',
  '/api/user/profile',
  '/api/user/check-username',
  '/api/upload-profile-pic',
  '/api/dance-styles',
  '/api/cities',
  '/api/countries',
  '/api/continents'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ========================================
  // Language Detection (for i18n)
  // ========================================
  
  // Get user's token to check their preferred language
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value;
  const headerLang = request.headers.get('accept-language');
  
  // Determine language (priority: user DB preference > cookie > header > default 'en')
  let locale = 'en';
  if (token?.preferredLanguage && ['en', 'es'].includes(token.preferredLanguage as string)) {
    locale = token.preferredLanguage as string;
  } else if (cookieLang && ['en', 'es'].includes(cookieLang)) {
    locale = cookieLang;
  } else if (headerLang?.includes('es')) {
    locale = 'es';
  }

  // Add locale to request headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  // ========================================
  // Authentication & Onboarding Logic
  // ========================================

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/apple-icon.png') ||
    pathname.startsWith('/icon.png') ||
    pathname.startsWith('/opengraph-image.png') ||
    pathname.startsWith('/twitter-image.png')
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Allow username routes (/{username} pattern - single segment, no slashes)
  // This allows users to share their profile via dancecircle.co/username
  const pathSegments = pathname.split('/').filter(Boolean)
  if (pathSegments.length === 1) {
    // Single segment path - likely a username
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Token was already fetched above for language detection
  // If not authenticated, allow normal auth flow (will be handled by individual layouts)
  if (!token) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Allow auth-related routes for authenticated users
  if (authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Check if user has completed onboarding
  console.log('🔍 Middleware - Checking onboarding status:', {
    pathname,
    userId: token.sub,
    isProfileComplete: token.isProfileComplete
  })

  // If user hasn't completed profile, redirect to onboarding
  if (token.isProfileComplete === false) {
    console.log('🔄 Middleware - Redirecting to onboarding (profile incomplete)')
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // If user has completed profile but tries to access onboarding, redirect to dashboard
  if (pathname === '/onboarding' && token.isProfileComplete === true) {
    console.log('🔄 Middleware - Redirecting to dashboard (profile complete)')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - api/webhook (webhook routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
}
