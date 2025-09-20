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
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/csrf'
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
    return NextResponse.next()
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Get the token (user session)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // If not authenticated, allow normal auth flow (will be handled by individual layouts)
  if (!token) {
    return NextResponse.next()
  }

  // Allow auth-related routes for authenticated users
  if (authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // For authenticated users, check if they need onboarding
  // Check the JWT token for profile completion status
  // If isProfileComplete is undefined/null (new user), also redirect to onboarding
  if (token.isProfileComplete !== true) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
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