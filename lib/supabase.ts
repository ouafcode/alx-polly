import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (for use in components)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
  )
}

// Server-side functions (for use in API routes and server components)
export async function createServerClient() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    (process.env.SUPABASE_SECRET_KEY as string),
    {
      cookies: {
      get(name) {
        return cookieStore.get(name)?.value
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
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    (process.env.SUPABASE_SECRET_KEY as string),
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
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
