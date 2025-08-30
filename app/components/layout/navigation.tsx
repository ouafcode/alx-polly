"use client"

import Link from "next/link"
import { Button } from "../ui/button"

export default function Navigation() {
  // TODO: Replace with actual authentication state
  const isAuthenticated = false
  const user = null

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
          <Link href="/create" className="text-sm font-medium hover:text-primary transition-colors">
            Create Poll
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name || 'User'}
              </span>
              <Button variant="outline" size="sm">
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
