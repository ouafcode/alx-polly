"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '../../lib/supabase'

/**
 * Authentication context type definition
 * Provides user authentication state and methods throughout the application
 */
interface AuthContextType {
  /** Current authenticated user object from Supabase */
  user: User | null
  /** Current session object containing authentication tokens */
  session: Session | null
  /** Loading state for authentication operations */
  loading: boolean
  /** Sign in method for existing users */
  signIn: (email: string, password: string) => Promise<{ error: any }>
  /** Sign up method for new user registration */
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  /** Sign out method to end user session */
  signOut: () => Promise<void>
}

// Create the authentication context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication Provider Component
 * 
 * Provides authentication context to the entire application using Supabase.
 * Manages user session state, handles authentication state changes, and provides
 * authentication methods to child components.
 * 
 * @param children - React children components that will have access to auth context
 * @returns JSX element wrapping children with authentication context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State management for authentication
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    /**
     * Initialize authentication state on component mount
     * Retrieves existing session from Supabase and sets up auth state listener
     */
    const getInitialSession = async () => {
      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    // Initialize session on mount
    getInitialSession()

    // Set up real-time authentication state listener
    // This will trigger on sign in, sign out, token refresh, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  /**
   * Sign in an existing user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to error object if sign in fails
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  /**
   * Register a new user account
   * 
   * @param email - User's email address
   * @param password - User's chosen password
   * @param name - User's display name
   * @returns Promise resolving to error object if registration fails
   */
  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    return { error }
  }

  /**
   * Sign out the current user and clear session
   * 
   * @returns Promise that resolves when sign out is complete
   */
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Create context value object with all authentication state and methods
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access authentication context
 * 
 * Provides access to authentication state and methods throughout the application.
 * Must be used within an AuthProvider component.
 * 
 * @returns Authentication context with user, session, loading state, and auth methods
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
