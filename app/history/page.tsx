"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Menu, Search, Download, Trash2, Calendar, MessageSquare, BarChart3, Eye, X } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getUserChatSessions, deleteChatSession, type ChatSession } from "@/lib/firestore"
import { toast } from "sonner"

export default function HistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadChatSessions()
    }
  }, [user])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSessions(chatSessions)
    } else {
      const filtered = chatSessions.filter(
        (session) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.messages.some(
            (msg) =>
              msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
              msg.response.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
      setFilteredSessions(filtered)
    }
  }, [searchQuery, chatSessions])

  const loadChatSessions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const sessions = await getUserChatSessions(user.uid)
      setChatSessions(sessions)
      setFilteredSessions(sessions)
    } catch (error) {
      console.error("Error loading chat sessions:", error)
      toast.error("Failed to load chat history")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId)
      toast.success("Chat session deleted successfully!")
      // Reload sessions
      loadChatSessions()
    } catch (error) {
      console.error("Error deleting session:", error)
      toast.error("Failed to delete chat session")
    }
  }

  const handleViewSession = (session: ChatSession) => {
    setSelectedSession(session)
    setViewDialogOpen(true)
  }

  const handleExportSession = (session: ChatSession) => {
    const exportData = {
      title: session.title,
      createdAt: session.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      messages: session.messages.map((msg) => ({
        user: msg.message,
        bot: msg.response,
        timestamp: msg.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${session.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Chat exported successfully!")
  }

  const totalMessages = chatSessions.reduce((total, session) => total + session.messages.length, 0)

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
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-white font-semibold text-lg">Chat History</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Chat History</h1>
                <p className="text-slate-400">View and manage your conversation history</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-white placeholder-slate-400 pl-12 h-12 rounded-xl"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-purple-400 mb-2">{chatSessions.length}</div>
                    <div className="text-slate-400 font-medium text-sm sm:text-base">Total Chats</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-blue-400 mb-2">{totalMessages}</div>
                    <div className="text-slate-400 font-medium text-sm sm:text-base">Total Messages</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-green-400 mb-2">
                      {
                        chatSessions.filter((s) => {
                          const sessionDate = s.createdAt?.toDate?.()
                          const today = new Date()
                          return sessionDate && sessionDate.toDateString() === today.toDateString()
                        }).length
                      }
                    </div>
                    <div className="text-slate-400 font-medium text-sm sm:text-base">Today's Chats</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-orange-400 mb-2">{filteredSessions.length}</div>
                    <div className="text-slate-400 font-medium text-sm sm:text-base">Search Results</div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat History Items */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading chat history...</p>
                </div>
              ) : filteredSessions.length > 0 ? (
                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <Card
                      key={session.id}
                      className="bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
                              <h3 className="text-white font-semibold text-base sm:text-lg truncate">
                                {session.title}
                              </h3>
                              <Badge className="bg-purple-600 text-white font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
                                {session.messages.length} messages
                              </Badge>
                              <span className="text-slate-400 text-xs sm:text-sm whitespace-nowrap">
                                {session.updatedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                              </span>
                            </div>
                            {session.messages.length > 0 && (
                              <p className="text-slate-400 line-clamp-2 leading-relaxed text-sm sm:text-base">
                                {session.messages[session.messages.length - 1]?.message}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 ml-4 sm:ml-6 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewSession(session)}
                              className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 sm:h-10 sm:w-10"
                              title="View Chat"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleExportSession(session)}
                              className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 sm:h-10 sm:w-10"
                              title="Export Chat"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => session.id && handleDeleteSession(session.id)}
                              className="text-slate-400 hover:text-red-400 hover:bg-slate-700 h-8 w-8 sm:h-10 sm:w-10"
                              title="Delete Chat"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchQuery ? "No matching conversations" : "No chat history yet"}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {searchQuery ? "Try adjusting your search terms" : "Start a conversation to see your history here"}
                  </p>
                  {!searchQuery && (
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Start Your First Chat
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Chat Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl mx-auto max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="truncate">{selectedSession?.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewDialogOpen(false)}
                  className="text-slate-400 hover:text-white flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
              {selectedSession?.messages.map((message, index) => (
                <div key={index} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl rounded-tr-md p-3 max-w-xs sm:max-w-md text-white text-sm">
                      {message.message}
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl rounded-tl-md p-3 max-w-xs sm:max-w-md text-slate-300 text-sm border border-slate-700">
                      {message.response}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
