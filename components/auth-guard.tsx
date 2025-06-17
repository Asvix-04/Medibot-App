"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push("/auth/signin")
      } else if (!requireAuth && user) {
        // Don't redirect if user is on profile-setup page
        if (pathname !== "/profile-setup") {
          router.push("/dashboard")
        }
      }
    }
  }, [user, loading, requireAuth, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (!requireAuth && user && pathname !== "/profile-setup") {
    return null
  }

  return <>{children}</>
}
