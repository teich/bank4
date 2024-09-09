import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // Extract the first segment of the path
  const firstPathSegment = request.nextUrl.pathname.split('/')[1]

  // Check if the path starts with a family name (not empty and not a known route)
  if (firstPathSegment && !['login', 'api', '_next'].includes(firstPathSegment)) {
    // If there's no session, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Specify which routes this middleware should run for
export const config = {
  matcher: '/:path*',
}