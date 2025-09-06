"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useAuth } from "../../contexts/auth-context"

/**
 * Login Form Component
 * 
 * Provides a form interface for existing users to sign in to their accounts.
 * Handles form validation, authentication state management, and error handling.
 * Redirects users to dashboard upon successful authentication.
 * 
 * @returns JSX element containing the login form
 */
export default function LoginForm() {
  // Form state management
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Authentication context and navigation
  const { signIn } = useAuth()
  const router = useRouter()

  /**
   * Handle form submission for user login
   * 
   * Validates form data, attempts authentication through Supabase,
   * and handles success/error states appropriately.
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Attempt to sign in with provided credentials
      const { error } = await signIn(email, password)
      
      if (error) {
        // Display authentication error to user
        setError(error.message)
      } else {
        // Redirect to dashboard on successful login
        router.push("/dashboard")
      }
    } catch (err) {
      // Handle unexpected errors
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error message display */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {/* Email input field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {/* Password input field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
