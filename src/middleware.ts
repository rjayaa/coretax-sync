// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If already logged in and trying to access login page
    if (req.nextUrl.pathname.startsWith("/auth/login") && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to login page and root page
        if (req.nextUrl.pathname.startsWith("/auth/login") || req.nextUrl.pathname === "/") {
          return true
        }
        // Require authentication for all other pages
        return !!token
      },
    },
    pages: {
      signIn: "/auth/login",
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

// Perbarui matcher untuk mencakup semua rute kecuali yang eksplisit diizinkan
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)',
  ],
}