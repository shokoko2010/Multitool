"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"

interface User {
  id: string
  name?: string
  email?: string
  image?: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        id: (session.user as any).id || "",
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      })
      setIsLoading(false)
    } else {
      setUser(null)
      setIsLoading(false)
    }
  }, [session, status])

  const login = async (email: string, password: string) => {
    return await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  }

  const loginWithGoogle = async () => {
    return await signIn("google", { callbackUrl: "/dashboard" })
  }

  const logout = async () => {
    return await signOut({ callbackUrl: "/" })
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!session,
    login,
    loginWithGoogle,
    logout,
  }
}