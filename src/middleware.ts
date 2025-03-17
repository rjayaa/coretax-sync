// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If already logged in and trying to access login page
    if (req.nextUrl.pathname.startsWith("/auth/login") && req.nextauth.token) {
      return NextResponse.redirect(new URL("/user/company-selection", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to login page
        if (req.nextUrl.pathname.startsWith("/auth/login")) {
          return true
        }
        // Require authentication for all other pages
        return !!token
      },
    },
    cookies: {
      sessionToken: {
        name: 'next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!auth/login|_next|api/auth|_static|favicon.ico|images).*)',
  ],
}