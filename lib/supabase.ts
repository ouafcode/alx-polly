import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (for use in components)
export function createClient() {
  return createBrowserClient(
    "https://ifflvmakttghpdkppfst.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmx2bWFrdHRnaHBka3BwZnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzg1NjcsImV4cCI6MjA3MjA1NDU2N30.FeQUH_1lwPHeYvDZNEwzg351JjUJgXkd2eghoRpQVAo"
  )
}

// Server-side functions (for use in API routes and server components)
export async function createServerClient() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  
  const cookieStore = await cookies()

  return createServerClient(
    "https://ifflvmakttghpdkppfst.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmx2bWFrdHRnaHBka3BwZnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzg1NjcsImV4cCI6MjA3MjA1NDU2N30.FeQUH_1lwPHeYvDZNEwzg351JjUJgXkd2eghoRpQVAo",
    {
      cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      getAll() {
        return cookieStore.getAll()
      },
      set(name, value, options) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.error('Error setting cookie in server component:', error)
        }
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: { expires?: Date } }>): void {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.error('Error setting cookies in server component:', error)
        }
      },
      remove(name, options) {
        try {
          cookieStore.delete({ name, ...options })
        } catch (error) {
          // The `remove` method was called from a Server Component.
          console.error('Error removing cookie in server component:', error)
        }
      }
    }
  })
}
export async function createRouteHandlerClient() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  
  const cookieStore = await cookies()

  return createServerClient(
    "https://ifflvmakttghpdkppfst.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmx2bWFrdHRnaHBka3BwZnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzg1NjcsImV4cCI6MjA3MjA1NDU2N30.FeQUH_1lwPHeYvDZNEwzg351JjUJgXkd2eghoRpQVAo",
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        getAll() {
          return cookieStore.getAll()
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error('Error setting cookie in route handler:', error)
          }
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: { expires?: Date } }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error('Error setting cookies in route handler:', error)
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            console.error('Error removing cookie in route handler:', error)
          }
        }
      }
    }
  )
}
