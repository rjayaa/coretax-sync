// hooks/use-auth.ts
'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const refreshSession = useCallback(async () => {
    try {
      await update() // This will trigger a session refresh
    } catch (error) {
      console.error('Error refreshing session:', error)
      router.push('/login')
    }
  }, [update, router])

  useEffect(() => {
    if (session) {
      // Set up timer to refresh session 1 minute before expiry
      const expiryTime = (session as any)?.expires 
      if (expiryTime) {
        const timeUntilExpiry = new Date(expiryTime).getTime() - Date.now()
        const refreshTime = timeUntilExpiry - (60 * 1000) // 1 minute before expiry
        
        const refreshTimer = setTimeout(refreshSession, refreshTime)
        return () => clearTimeout(refreshTimer)
      }
    }
  }, [session, refreshSession])

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    refreshSession
  }
}