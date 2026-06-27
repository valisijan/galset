import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log("=== MIDDLEWARE REQUEST ===", request.nextUrl.pathname);
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pendingVerification = request.cookies.get('pending_verification')?.value

  // Guard for authenticated but unconfirmed users or users with pending verification cookie
  if ((user && !user.email_confirmed_at) || pendingVerification === 'true') {
    const isAuthVerify = request.nextUrl.pathname === '/auth/verify'
    const isForgotPasswordSuccess = request.nextUrl.pathname === '/auth/forgot-password/success'
    const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
    // Next.js static files, public assets, and APIs should be allowed
    const isStaticOrApi = 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/data') ||
      request.nextUrl.pathname.includes('.')

    if (!isAuthVerify && !isForgotPasswordSuccess && !isAuthCallback && !isStaticOrApi) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/verify'
      return NextResponse.redirect(url)
    }
  }

  const PROTECTED_ROUTES = [
    '/ad',
    '/following',
    '/inbox',
    '/my-ads',
    '/wishlist',
    '/settings'
  ]

  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
