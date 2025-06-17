import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 relative">
            <Image src="/logo.png" alt="MedBot Logo" width={80} height={80} className="rounded-full" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome to Medibot</h1>
            <p className="text-slate-400 text-sm">Navigate to the section you want to test:</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/auth/signup" className="block">
            <Button
              variant="outline"
              className="w-full h-12 bg-slate-900 border-slate-700 text-white hover:bg-slate-800 rounded-xl"
            >
              Sign Up Page
            </Button>
          </Link>

          <Link href="/auth/signin" className="block">
            <Button
              variant="outline"
              className="w-full h-12 bg-slate-900 border-slate-700 text-white hover:bg-slate-800 rounded-xl"
            >
              Sign In Page
            </Button>
          </Link>

          <Link href="/chat" className="block">
            <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg">
              Go to Chatbot
            </Button>
          </Link>

          <Link href="/summarizer" className="block">
            <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg">
              Go to Info Summarizer
            </Button>
          </Link>

          <Link href="/dashboard" className="block">
            <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg">
              Go to User Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
