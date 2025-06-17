"use client"

import { useState, useEffect } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
} from "firebase/auth"
import { auth, googleProvider, facebookProvider } from "@/lib/firebase"
import { getUserProfile, type UserProfile } from "@/lib/firestore"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Get user profile if it exists
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    if (displayName && result.user) {
      await updateProfile(result.user, { displayName })
    }

    return result
  }

  const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider)
  }

  const signInWithFacebook = async () => {
    return signInWithPopup(auth, facebookProvider)
  }

  const logout = async () => {
    return signOut(auth)
  }

  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email)
  }

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    resetPassword,
  }
}
