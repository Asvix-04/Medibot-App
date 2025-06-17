"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    setLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.name)
      toast.success("Account created successfully!")
      // Redirect to profile setup instead of dashboard
      router.push("/profile-setup")
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success("Account created with Google successfully!")
      router.push("/profile-setup")
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with Google")
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    setLoading(true)
    try {
      await signInWithFacebook()
      toast.success("Account created with Facebook successfully!")
      router.push("/profile-setup")
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with Facebook")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center mb-6 sm:mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white mr-3">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span className="text-white font-medium">Back</span>
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
                <Image src="/logo.png" alt="MedBot Logo" width={64} height={64} className="rounded-full" />
              </div>
              <span className="text-purple-400 font-semibold text-xl sm:text-2xl">MedBot</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Create Account</h1>
            <p className="text-slate-400 text-sm sm:text-base">Join MedBot to get personalized medical assistance</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white h-11 sm:h-12 rounded-xl text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white h-11 sm:h-12 rounded-xl text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white h-11 sm:h-12 rounded-xl pr-12 text-sm sm:text-base"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2 text-sm sm:text-base">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white h-11 sm:h-12 rounded-xl pr-12 text-sm sm:text-base"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-2 py-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                I agree to the{" "}
                <Link href="#" className="text-purple-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-purple-400 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg text-sm sm:text-base font-medium"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center">
              <span className="text-slate-400 text-sm sm:text-base">or continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                variant="outline"
                className="h-11 sm:h-12 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl text-sm sm:text-base"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                onClick={handleFacebookSignUp}
                disabled={loading}
                variant="outline"
                className="h-11 sm:h-12 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl text-sm sm:text-base"
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center">
              <span className="text-slate-400 text-sm sm:text-base">Already have an account? </span>
              <Link href="/auth/signin" className="text-green-400 hover:underline text-sm sm:text-base">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
