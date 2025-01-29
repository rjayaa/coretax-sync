// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If already logged in and trying to access login page
    if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to login page
        if (req.nextUrl.pathname === "/login") {
          return true
        }
        // Require authentication for all other pages
        return !!token
      },
    },
  }
)

// Protect all routes except login
export const config = {
  matcher: ["/login"],
}