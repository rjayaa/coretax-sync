// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If already logged in and trying to access login page
    if (req.nextUrl.pathname.startsWith("/auth/login") && req.nextauth.token) {
      // Get callbackUrl if it exists, otherwise redirect to dashboard
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl")
      const redirectUrl = callbackUrl || "/dashboard"
      
      // Make sure the URL is properly decoded
      const decodedUrl = decodeURIComponent(redirectUrl)
      
      // Only redirect to internal URLs (security measure)
      if (decodedUrl.startsWith("/")) {
        return NextResponse.redirect(new URL(decodedUrl, req.url))
      }
      
      // Fallback to dashboard for external URLs
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Public paths that don't require authentication
        if (
          req.nextUrl.pathname.startsWith("/auth") || 
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true
        }
        
        // All other paths require authentication
        return !!token
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

// Match all routes except for API auth routes, static files, etc.
export const config = {
  matcher: [
    // Exclude Next.js internals
    '/((?!_next/static|_next/image|_next/data|favicon.ico|images).*)',
    // Include all pages
    '/',
  ],
}