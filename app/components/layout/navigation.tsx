"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { useAuth } from "../../contexts/auth-context"

export default function Navigation() {
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">PollApp</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/polls" className="text-sm font-medium hover:text-primary transition-colors">
            Browse Polls
          </Link>
          {user && (
            <>
              <Link href="/create" className="text-sm font-medium hover:text-primary transition-colors">
                Create Poll
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.user_metadata?.name || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
