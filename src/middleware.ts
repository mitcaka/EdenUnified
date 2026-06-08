import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Các path mà người chơi (public) được truy cập tự do
const publicPathPrefixes = [
  '/news',
  '/rules',
  '/guides',
  '/gallery',
  '/faq',
  '/contact',
  '/how-to-join',
  '/rp-guide',
  '/sitemap.xml',
  '/api/cms',
  '/api/public',
]

function isPublicPath(path: string): boolean {
  // Trang chủ
  if (path === '/') return true
  // Các prefix public
  return publicPathPrefixes.some(prefix => path.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip static files
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/api/auth') ||
    path.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next()
  }

  // Public paths: cho phép truy cập không cần login
  if (isPublicPath(path)) {
    return NextResponse.next()
  }

  // Các path còn lại (dashboard, admin, logs, content) cần đăng nhập
  const cookie = request.cookies.get('session')?.value

  if (!cookie && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (cookie && path === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
