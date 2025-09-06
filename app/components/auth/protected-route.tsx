"use client"

import { useAuth } from '../../contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Props interface for ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** Child components to render when user is authenticated */
  children: React.ReactNode
  /** Optional custom loading fallback component */
  fallback?: React.ReactNode
}

/**
 * Protected Route Component
 * 
 * A higher-order component that protects routes requiring authentication.
 * Automatically redirects unauthenticated users to the login page and shows
 * a loading state while authentication status is being determined.
 * 
 * @param children - Components to render when user is authenticated
 * @param fallback - Optional custom loading component
 * @returns JSX element with protected content or loading/redirect state
 */
export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  // Get authentication state from context
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if user is not authenticated and loading is complete
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state while authentication status is being determined
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Return null if user is not authenticated (redirect will happen)
  if (!user) {
    return null
  }

  // Render protected content when user is authenticated
  return <>{children}</>
}
