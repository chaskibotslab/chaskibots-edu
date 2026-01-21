import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación de admin
const ADMIN_ROUTES = ['/admin']

// Rutas que requieren autenticación (cualquier usuario)
const PROTECTED_ROUTES = ['/dashboard', '/curso', '/tareas']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar si es ruta de admin
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
  
  // Verificar si es ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  
  if (isAdminRoute || isProtectedRoute) {
    // Obtener la cookie de sesión
    const userCookie = request.cookies.get('chaskibots_session')
    
    if (!userCookie?.value) {
      // No hay sesión, redirigir a login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      // Decodificar la sesión
      const sessionData = JSON.parse(atob(userCookie.value))
      
      // Si es ruta de admin, verificar rol
      if (isAdminRoute) {
        if (sessionData.role !== 'admin' && sessionData.role !== 'teacher') {
          // No es admin ni teacher, redirigir a home
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
      
      // Usuario autenticado y autorizado
      return NextResponse.next()
    } catch {
      // Cookie inválida, redirigir a login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      // Limpiar cookie inválida
      response.cookies.delete('chaskibots_session')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/curso/:path*',
    '/tareas/:path*'
  ]
}
