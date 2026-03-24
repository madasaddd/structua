import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Identify admin routes strictly
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'

  // If trying to access admin login while already authenticated, redirect to admin dashboard
  if (isAdminLogin && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Protect admin routes — must have a user and be the designated admin
  if (isAdminRoute && !isAdminLogin) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // Check if the user is the designated admin (simpler check using email)
    if (user.email !== 'asadalbalad29@gmail.com') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // All other routes (/, /learn/*) are completely public.
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
