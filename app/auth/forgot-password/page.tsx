"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await resetPassword(email)
      setSent(true)
      toast.success("Password reset email sent!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/auth/signin">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-white font-medium">Back</span>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 relative">
              <Image src="/logo.png" alt="MedBot Logo" width={64} height={64} className="rounded-full" />
            </div>
            <span className="text-purple-400 font-semibold text-2xl">MedBot</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Reset Password</h1>
          <p className="text-slate-400">
            {sent
              ? "Check your email for password reset instructions"
              : "Enter your email address and we'll send you a link to reset your password"}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-white mb-2">Email sent successfully!</p>
              <p className="text-slate-400 text-sm">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/auth/signin" className="block">
                <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg">
                  Back to Sign In
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false)
                  setEmail("")
                }}
                className="w-full h-12 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl"
              >
                Send Another Email
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-slate-800 border-slate-700 text-white h-12 rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <span className="text-slate-400">Remember your password? </span>
              <Link href="/auth/signin" className="text-green-400 hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
