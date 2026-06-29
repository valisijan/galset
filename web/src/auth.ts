import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function auth() {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) return null

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { }
          },
        },
        cookieOptions: {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !session.user) return null

    const dbUser = await db.query.users.findFirst({
      where: eq(users.supabaseId, session.user.id),
    })

    if (!dbUser) return null

    return {
      user: {
        id: dbUser.id.toString(),
        email: dbUser.email,
        name: dbUser.fullName || dbUser.username || '',
        image: dbUser.profileImg || dbUser.image || '',
        description: dbUser.description,
      },
      sessionToken: session.access_token,
    }
  } catch (err) {
    console.error('Error in auth() helper:', err)
    return null
  }
}

export async function signIn() { }
export async function signOut() { }
