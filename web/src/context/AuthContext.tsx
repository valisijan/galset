"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

type User = {
  id: string
  fullName: string
  username: string
  email: string
  profileImg?: string
  country?: string
  city?: string
  address?: string
  phone?: string
  birthDate?: string
  description?: string
} | null

interface AuthContextType {
  user: User
  sessionToken: string | null
  setUser: (user: User) => void
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  sessionToken: null,
  setUser: () => { },
  refreshUser: async () => { },
  logout: async () => { },
  loading: true,
})

export const AuthProvider = ({ children, initialUser, initialSessionToken }: { children: ReactNode, initialUser?: User, initialSessionToken?: string }) => {
  const [user, setUser] = useState<User>(initialUser || null)
  const [sessionToken, setSessionToken] = useState<string | null>(initialSessionToken || null)
  const [loading, setLoading] = useState(!initialUser)

  async function refreshUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || sessionToken

      if (!token) {
        setUser(null)
        setSessionToken(null)
        setLoading(false)
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        // Explicitly unauthorized — clear the user
        await supabase.auth.signOut()
        setUser(null)
        setSessionToken(null)
      } else if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setSessionToken(token)
      }
      // For other errors (500, network, etc.) — keep existing user state
    } catch {
      // Network error — keep existing user state, don't logout
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers,
      })
      await supabase.auth.signOut()
      setUser(null)
      setSessionToken(null)
    } catch (err) {
      console.error("Greška pri odjavi:", err)
    }
  }

  useEffect(() => {
    if (!initialUser) {
      // No SSR user — fetch from API to check if logged in
      refreshUser()
    } else {
      // SSR already provided user — mark loading as done immediately
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSessionToken(session.access_token)
        refreshUser()
      } else {
        setUser(null)
        setSessionToken(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user && sessionToken) {
      const syncHistory = async () => {
        try {
          const localHistoryStr = localStorage.getItem("galset_local_history");
          if (localHistoryStr) {
            const localHistory = JSON.parse(localHistoryStr);
            if (Array.isArray(localHistory) && localHistory.length > 0) {
              const adIds = localHistory.map((h: any) => h.adId);
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history/sync`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({ adIds })
              });
              if (res.ok) {
                localStorage.removeItem("galset_local_history");
              }
            }
          }
        } catch (err) {
          console.error("Failed to sync history:", err);
        }
      };
      syncHistory();
    }
  }, [user, sessionToken]);

  return (
    <AuthContext.Provider
      value={{ user, sessionToken, setUser, refreshUser, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
