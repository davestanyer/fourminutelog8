import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth routes handling
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // Protected routes handling
  if (
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/log') ||
    req.nextUrl.pathname.startsWith('/tasks') ||
    req.nextUrl.pathname.startsWith('/clients') ||
    req.nextUrl.pathname.startsWith('/team') ||
    req.nextUrl.pathname.startsWith('/recurring')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/log/:path*',
    '/tasks/:path*',
    '/clients/:path*',
    '/team/:path*',
    '/recurring/:path*',
    '/auth/:path*',
  ],
}