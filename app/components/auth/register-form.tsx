"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useAuth } from "../../contexts/auth-context"

/**
 * Registration Form Component
 * 
 * Provides a form interface for new users to create accounts.
 * Handles form validation, password confirmation, and user registration through Supabase.
 * Includes client-side validation for password matching and minimum length requirements.
 * 
 * @returns JSX element containing the registration form
 */
export default function RegisterForm() {
  // Form state management with all required fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Authentication context and navigation
  const { signUp } = useAuth()
  const router = useRouter()

  /**
   * Handle form submission for user registration
   * 
   * Validates form data including password confirmation and minimum length,
   * attempts user registration through Supabase, and handles success/error states.
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation: Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Client-side validation: Check minimum password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Attempt to register new user with Supabase
      const { error } = await signUp(formData.email, formData.password, formData.name)
      
      if (error) {
        // Display registration error to user
        setError(error.message)
      } else {
        // Show success message (email verification required)
        setSuccess("Account created successfully! Please check your email to verify your account.")
        // Don't redirect immediately as email verification is required
      }
    } catch (err) {
      // Handle unexpected errors
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle input field changes for form data
   * 
   * Updates the form state when user types in any input field.
   * Uses controlled components pattern for form management.
   * 
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to start creating and voting on polls
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
          
          {/* Success message display */}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}
          
          {/* Full name input field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          {/* Email input field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          {/* Password confirmation input field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
