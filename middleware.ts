import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Create a response with the original request
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  // Create a Supabase client
  const supabase = createServerClient(
    "https://ifflvmakttghpdkppfst.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmx2bWFrdHRnaHBka3BwZnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzg1NjcsImV4cCI6MjA3MjA1NDU2N30.FeQUH_1lwPHeYvDZNEwzg351JjUJgXkd2eghoRpQVAo",
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // If the cookie is updated, update the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // If the cookie is removed, update the request and response
          request.cookies.delete({
            name,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({
            name,
            ...options,
          })
        }
      }
    }
  )

  // Refresh session if it exists
  await supabase.auth.getSession()
  
  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
