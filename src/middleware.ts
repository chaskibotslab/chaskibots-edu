import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'

// Rutas que requieren autenticación de admin
const ADMIN_ROUTES = ['/admin']

// Rutas que requieren autenticación (cualquier usuario)
const PROTECTED_ROUTES = ['/dashboard', '/curso', '/tareas', '/simuladores', '/academy']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si es ruta de admin
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))

  // Verificar si es ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  if (isAdminRoute || isProtectedRoute) {
    const userCookie = request.cookies.get(SESSION_COOKIE_NAME)

    // Verifica la firma HMAC de la cookie (no confía en el contenido crudo:
    // antes cualquiera podía escribir document.cookie con role:"admin" y
    // el middleware lo aceptaba sin comprobar nada).
    const session = await verifySessionCookie(userCookie?.value)

    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(SESSION_COOKIE_NAME)
      return response
    }

    if (isAdminRoute && session.role !== 'admin' && session.role !== 'teacher') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/curso/:path*',
    '/tareas/:path*',
    '/simuladores/:path*',
    '/academy/:path*'
  ]
}
