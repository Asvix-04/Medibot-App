"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, Activity, Pill, MessageSquare, TrendingUp, Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
  getUserHealthRecords,
  subscribeToUserChatSessions,
  subscribeToUserMedications,
  createSampleHealthRecord,
  type ChatSession,
  type Medication,
  type HealthRecord,
} from "@/lib/firestore"
import Link from "next/link"
import { toast } from "sonner"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user, userProfile } = useAuth()

  useEffect(() => {
    if (!user) return

    setLoading(true)

    // Set up real-time listeners with error handling
    const unsubscribeChats = subscribeToUserChatSessions(user.uid, (sessions) => {
      setChatSessions(sessions)
      setLoading(false)
    })

    const unsubscribeMedications = subscribeToUserMedications(user.uid, (meds) => {
      setMedications(meds)
    })

    // Load health records with better error handling
    const loadHealthRecords = async () => {
      try {
        const records = await getUserHealthRecords(user.uid)
        setHealthRecords(records)
      } catch (error) {
        console.error("Error loading health records:", error)
        // Create a sample record if none exist and there's an error
        try {
          await createSampleHealthRecord(user.uid)
          const records = await getUserHealthRecords(user.uid)
          setHealthRecords(records)
        } catch (sampleError) {
          console.error("Error creating sample record:", sampleError)
          setHealthRecords([])
        }
      }
    }

    loadHealthRecords()

    // Cleanup listeners
    return () => {
      unsubscribeChats()
      unsubscribeMedications()
    }
  }, [user])

  const totalMessages = chatSessions.reduce((total, session) => total + session.messages.length, 0)
  const activeMedications = medications.filter((med) => med.isActive).length
  const recentActivity = chatSessions
    .flatMap((session) =>
      session.messages.map((msg) => ({
        ...msg,
        sessionTitle: session.title,
      })),
    )
    .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
    .slice(0, 5)

  // Calculate health score based on user activity
  const calculateHealthScore = () => {
    let score = 50 // Base score
    if (chatSessions.length > 0) score += 20 // Active in asking questions
    if (medications.length > 0) score += 15 // Managing medications
    if (healthRecords.length > 0) score += 15 // Tracking health records
    return Math.min(score, 100)
  }

  const handleCreateSampleData = async () => {
    if (!user) return

    try {
      await createSampleHealthRecord(user.uid)
      toast.success("Sample health record created!")

      // Reload health records
      const records = await getUserHealthRecords(user.uid)
      setHealthRecords(records)
    } catch (error) {
      console.error("Error creating sample data:", error)
      toast.error("Failed to create sample data")
    }
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-950">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-slate-400 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="text-purple-400 font-semibold">MedBot Dashboard</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome back, {userProfile?.displayName || "User"}!
                </h1>
                <p className="text-slate-400">Here's your health overview for today</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Chat Sessions</CardTitle>
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-white">{chatSessions.length}</div>
                    <p className="text-xs text-slate-400">{totalMessages} total messages</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Medications</CardTitle>
                    <Pill className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-white">{activeMedications}</div>
                    <p className="text-xs text-slate-400">
                      {activeMedications > 0 ? "Active medications" : "No medications"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Health Score</CardTitle>
                    <Activity className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-400">{calculateHealthScore()}</div>
                    <p className="text-xs text-slate-400">
                      {calculateHealthScore() >= 80
                        ? "Excellent"
                        : calculateHealthScore() >= 60
                          ? "Good"
                          : "Needs attention"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">Health Records</CardTitle>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-white">{healthRecords.length}</div>
                    <p className="text-xs text-slate-400">
                      {healthRecords.length > 0 ? "Records tracked" : "No records yet"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/chat">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12">
                        Start New Chat
                      </Button>
                    </Link>
                    <Link href="/medications">
                      <Button
                        variant="outline"
                        className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-12"
                      >
                        Add Medication
                      </Button>
                    </Link>
                    <Link href="/summarizer">
                      <Button
                        variant="outline"
                        className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-12"
                      >
                        Search Medical Info
                      </Button>
                    </Link>
                    <Button
                      onClick={handleCreateSampleData}
                      variant="outline"
                      className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 h-12"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Health Record
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-slate-400">Loading activity...</p>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-300 text-sm block truncate">{activity.message}</span>
                            <span className="text-slate-500 text-xs">
                              in {activity.sessionTitle} •{" "}
                              {activity.timestamp?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-2">No recent activity</p>
                      <p className="text-slate-500 text-sm">Start a conversation to see your activity here</p>
                      <Link href="/chat">
                        <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                          Start Your First Chat
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
