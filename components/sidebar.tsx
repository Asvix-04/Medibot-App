"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, FileText, Pill, History, User, Moon, X, Plus, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, userProfile, logout } = useAuth()

  const menuItems = [
    { icon: MessageCircle, label: "AI Chatbot", href: "/chat" },
    { icon: FileText, label: "Info Summarizer", href: "/summarizer" },
    { icon: Pill, label: "Medications", href: "/medications" },
    { icon: History, label: "Chat History", href: "/history" },
    { icon: User, label: "My Profile", href: "/profile" },
  ]

  const handleSignOut = async () => {
    try {
      await logout()
      if (onClose) onClose()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 transform transition-transform duration-300 ease-in-out border-r border-slate-800",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:inset-0",
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="MedBot Logo" width={32} height={32} className="rounded-full" />
              </div>
              <span className="text-purple-400 font-semibold text-lg">MedBot</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <Plus className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={userProfile?.photoURL || user?.photoURL || ""} />
                <AvatarFallback className="bg-purple-600 text-white font-semibold">
                  {userProfile?.displayName?.charAt(0).toUpperCase() ||
                    user?.displayName?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-slate-400 text-sm truncate">{user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-12 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:border-purple-500/30",
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Theme Toggle & Sign Out */}
          <div className="mt-auto space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:border-purple-500/30 rounded-xl h-12 transition-all duration-200"
            >
              <Moon className="mr-3 h-5 w-5" />
              Theme: Dark
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-600/20 hover:border-red-500/30 rounded-xl h-12 transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
