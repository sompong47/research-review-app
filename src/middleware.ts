import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register', '/'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Allow public routes without token
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/evaluate/:path*', '/details/:path*'],
};

