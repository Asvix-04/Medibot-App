
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu, Camera, RotateCcw, Plus, Send, Upload, X, FileText, Pill, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
  createChatSession,
  addMessageToSession,
  subscribeToUserChatSessions,
  analyzePrescription,
  type ChatSession,
  type PrescriptionAnalysis,
} from "@/lib/firestore"
import { toast } from "sonner"
import Link from "next/link"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysis | null>(null)
  const [analyzingPrescription, setAnalyzingPrescription] = useState(false)
  const { user, userProfile } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserChatSessions(user.uid, (userSessions) => {
      setSessions(userSessions)
      if (!currentSession && userSessions.length > 0) {
        setCurrentSession(userSessions[0])
      }
    })

    return unsubscribe
  }, [user, currentSession])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const startNewChat = async () => {
    if (!user) return

    try {
      const sessionId = await createChatSession(user.uid, "New Chat")
      const newSession: ChatSession = {
        id: sessionId,
        userId: user.uid,
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setCurrentSession(newSession)
      toast.success("New chat started!")
    } catch (error) {
      console.error("Error starting new chat:", error)
      toast.error("Failed to start new chat")
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || loading || !user) return

    const userMessage = message.trim()
    setMessage("")
    setLoading(true)

    try {
      let sessionToUse = currentSession

      if (!sessionToUse) {
        const smartTitle = generateChatTitle(userMessage)
        const sessionId = await createChatSession(user.uid, smartTitle)
        sessionToUse = {
          id: sessionId,
          userId: user.uid,
          title: smartTitle,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setCurrentSession(sessionToUse)
      }

      const botResponse = await generateAIResponse(userMessage)

      if (sessionToUse.id) {
        const newMessage = await addMessageToSession(sessionToUse.id, user.uid, userMessage, botResponse, "chat")

        setCurrentSession((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
            updatedAt: new Date(),
          }
        })

        sendMessageNotification(userMessage, botResponse)
        toast.success("Message sent!")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
      setMessage(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const generateChatTitle = (firstMessage: string): string => {
    const lowerMessage = firstMessage.toLowerCase()

    if (lowerMessage.includes("headache") || lowerMessage.includes("migraine")) {
      return "Headache Consultation"
    }
    if (lowerMessage.includes("fever") || lowerMessage.includes("temperature")) {
      return "Fever Assessment"
    }
    if (lowerMessage.includes("medication") || lowerMessage.includes("medicine")) {
      return "Medication Inquiry"
    }
    if (lowerMessage.includes("diet") || lowerMessage.includes("nutrition")) {
      return "Nutrition Guidance"
    }
    if (lowerMessage.includes("exercise") || lowerMessage.includes("workout")) {
      return "Exercise Consultation"
    }
    if (lowerMessage.includes("sleep") || lowerMessage.includes("insomnia")) {
      return "Sleep Health"
    }
    if (lowerMessage.includes("stress") || lowerMessage.includes("anxiety")) {
      return "Mental Health Support"
    }
    if (lowerMessage.includes("pain")) {
      return "Pain Management"
    }

    const words = firstMessage.split(" ").filter((word) => word.length > 3)
    if (words.length > 0) {
      return `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} Discussion`
    }

    return "Health Consultation"
  }

  const sendMessageNotification = (userMessage: string, botResponse: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Medibot Response", {
        body: "Your health question has been answered",
        icon: "/logo.png",
        badge: "/logo.png",
      })
    }
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("headache") || lowerMessage.includes("migraine")) {
      return "I understand you're experiencing headaches. 🧠 **Common headache types include:** tension headaches, migraines, and cluster headaches. **General management tips:** stay hydrated, maintain regular sleep, manage stress, and identify triggers. **When to seek help:** severe sudden headaches, headaches with fever, vision changes, or if they worsen over time. Please consult a healthcare professional for proper diagnosis and treatment."
    }

    if (lowerMessage.includes("fever") || lowerMessage.includes("temperature") || lowerMessage.includes("hot")) {
      return "Fever indicates your body is fighting an infection. 🌡️ **Normal body temperature:** 98.6°F (37°C). **Fever management:** rest, stay hydrated, use fever reducers as directed. **Seek immediate care if:** fever >103°F (39.4°C), persists for more than 3 days, or is accompanied by severe symptoms. Monitor symptoms closely."
    }

    if (lowerMessage.includes("medication") || lowerMessage.includes("medicine") || lowerMessage.includes("drug")) {
      return "I can provide general medication information. 💊 **Important reminders:** take as prescribed, don't skip doses, be aware of side effects, check for drug interactions, store properly, and never share prescriptions. **Questions about medications?** Contact your pharmacist or healthcare provider. They can provide specific guidance about your medications, dosing, and potential interactions."
    }

    const responses = [
      "Thank you for your health question! 🏥 While I can provide general health information, I always recommend consulting with a healthcare professional for personalized medical advice. **I can help with:** general health education, wellness tips, symptom information, and guidance on when to seek care. What specific health topic would you like to learn about?",
      "I'm here to help with health information! 📋 **Remember:** this information is educational and not a substitute for professional medical advice. For specific health concerns, symptoms, or treatment decisions, please consult with your healthcare provider. **I can assist with:** health education, wellness strategies, and general information about conditions and symptoms. How can I help you today?",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePrescriptionAnalysis = () => {
    setPrescriptionDialogOpen(true)
    setAnalysisResult(null)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAnalyzingPrescription(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const analysis = await analyzePrescription(user.uid, file.name, "Prescription uploaded for analysis")
      setAnalysisResult(analysis)
      toast.success("Prescription analyzed successfully!")
    } catch (error) {
      console.error("Error analyzing prescription:", error)
      toast.error("Failed to analyze prescription")
    } finally {
      setAnalyzingPrescription(false)
    }
  }

  const renderMessages = () => {
    if (!currentSession?.messages || currentSession.messages.length === 0) {
      return null
    }

    const allMessages: Array<{ type: "user" | "bot"; content: string; timestamp?: any; id: string }> = []

    currentSession.messages.forEach((msg, index) => {
      allMessages.push({
        type: "user",
        content: msg.message,
        timestamp: msg.timestamp,
        id: `user-${index}`,
      })

      if (msg.response) {
        allMessages.push({
          type: "bot",
          content: msg.response,
          timestamp: msg.timestamp,
          id: `bot-${index}`,
        })
      }
    })

    return allMessages.map((msg) => (
      <div
        key={msg.id}
        className={`flex w-full ${msg.type === "user" ? "justify-end" : "items-start space-x-2 sm:space-x-4"} mb-4`}
      >
        {msg.type === "bot" && (
          <>
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-1 flex-shrink-0">
              <AvatarImage src="/logo.png" alt="Medibot" />
              <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">
                <Image src="/logo.png" alt="M" width={24} height={24} className="rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 max-w-[90%] sm:max-w-3xl">
              <p className="text-white font-medium text-sm sm:text-base mb-2">Medibot</p>
              <div className="bg-slate-800 rounded-2xl rounded-tl-md p-3 sm:p-4 text-slate-300 text-sm sm:text-base leading-relaxed border border-slate-700 whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </>
        )}

        {msg.type === "user" && (
          <div className="flex items-start space-x-2 sm:space-x-3 max-w-[80%] sm:max-w-md lg:max-w-lg">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl rounded-tr-md p-3 sm:p-4 text-white text-sm sm:text-base leading-relaxed">
              {msg.content}
            </div>
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 mt-1 flex-shrink-0">
              <AvatarImage src={userProfile?.photoURL || user?.photoURL || ""} />
              <AvatarFallback className="bg-slate-600 text-white text-xs sm:text-sm">
                {userProfile?.displayName?.charAt(0).toUpperCase() ||
                  user?.displayName?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    ))
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="text-slate-400 hover:text-white lg:hidden"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="w-7 h-7 sm:w-8 sm:h-8 relative">
                <Image src="/logo.png" alt="MedBot Logo" width={32} height={32} className="rounded-full" />
              </div>
              <div>
                <h1 className="text-purple-400 font-semibold text-sm sm:text-base">Chat with</h1>
                <h2 className="text-purple-400 font-semibold text-base sm:text-lg">Medibot</h2>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                onClick={startNewChat}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Start New Chat"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                onClick={handlePrescriptionAnalysis}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Prescription Analysis"
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                onClick={() => setHistoryDialogOpen(true)}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Chat History"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {(!currentSession || currentSession.messages.length === 0) && (
                <div className="flex items-start space-x-2 sm:space-x-4">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-1">
                    <AvatarImage src="/logo.png" alt="Medibot" />
                    <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">
                      <Image src="/logo.png" alt="M" width={24} height={24} className="rounded-full" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm sm:text-base mb-2">Medibot</p>
                    <div className="bg-slate-800 rounded-2xl rounded-tl-md p-3 sm:p-4 text-slate-300 text-sm sm:text-base leading-relaxed border border-slate-700">
                      Hi there! I'm Medibot, your AI health assistant. 🏥 I can help with general health information,
                      wellness tips, and guidance on when to seek medical care.
                      <br />
                      <br />
                      **I can assist with:** symptoms information, medication guidance, lifestyle advice, and health
                      education.
                      <br />
                      <br />
                      **Remember:** I provide educational information only - always consult healthcare professionals for
                      medical advice, diagnosis, or treatment.
                      <br />
                      <br />
                      What health questions can I help you with today?
                    </div>
                  </div>
                </div>
              )}

              {renderMessages()}

              {loading && (
                <div className="flex items-start space-x-2 sm:space-x-4">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-1">
                    <AvatarImage src="/logo.png" alt="Medibot" />
                    <AvatarFallback className="bg-purple-600 text-white text-sm font-semibold">
                      <Image src="/logo.png" alt="M" width={24} height={24} className="rounded-full" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm sm:text-base mb-2">Medibot</p>
                    <div className="bg-slate-800 rounded-2xl rounded-tl-md p-3 sm:p-4 border border-slate-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 border-t border-slate-800 bg-slate-900">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a health question..."
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 h-10 sm:h-11 md:h-12 rounded-xl pr-10 sm:pr-12 text-sm sm:text-base"
                    disabled={loading}
                    maxLength={1000}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !message.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shadow-lg disabled:opacity-50"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Analysis Dialog */}
        <Dialog open={prescriptionDialogOpen} onOpenChange={setPrescriptionDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-[95vw] sm:max-w-lg md:max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Prescription Analysis</span>
              </DialogTitle>
            </DialogHeader>

            {!analysisResult ? (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm sm:text-base">
                  Upload a photo of your prescription for AI-powered analysis and information.
                </p>

                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 sm:p-8 text-center">
                  {analyzingPrescription ? (
                    <div className="space-y-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-slate-400 text-sm sm:text-base">Analyzing prescription...</p>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm sm:text-base mb-4">Upload prescription image</p>
                      <Button
                        onClick={handleFileUpload}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base"
                      >
                        <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Choose File
                      </Button>
                    </>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                <p className="text-xs text-slate-500">
                  Supported formats: JPG, PNG, HEIC. This feature analyzes prescription information for educational
                  purposes only.
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2 text-sm sm:text-base">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Analysis Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <h4 className="text-white font-medium text-sm sm:text-base mb-2">Detected Medications</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.medications.map((med, index) => (
                            <Badge key={index} className="bg-purple-600 text-white text-xs sm:text-sm">
                              <Pill className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium text-sm sm:text-base mb-2">Dosage Information</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.dosages.map((dosage, index) => (
                            <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300 text-xs sm:text-sm">
                              {dosage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium text-sm sm:text-base mb-2">Instructions</h4>
                      <p className="text-slate-300 text-xs sm:text-sm bg-slate-700 p-2 sm:p-3 rounded-lg">
                        {analysisResult.instructions}
                      </p>
                    </div>

                    {analysisResult.warnings.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium text-sm sm:text-base mb-2 flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                          Warnings & Precautions
                        </h4>
                        <div className="space-y-2">
                          {analysisResult.warnings.map((warning, index) => (
                            <div key={index} className="bg-yellow-900/20 border border-yellow-700 p-2 sm:p-3 rounded-lg">
                              <p className="text-yellow-300 text-xs sm:text-sm">{warning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-900/20 border border-blue-700 p-3 sm:p-4 rounded-lg">
                      <p className="text-blue-300 text-xs sm:text-sm">
                        <strong>Important:</strong> This analysis is for informational purposes only. Always follow your
                        doctor's instructions and consult your pharmacist for any questions about your medications.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button
                    onClick={() => {
                      setAnalysisResult(null)
                      setPrescriptionDialogOpen(false)
                    }}
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-400 hover:text-white text-sm sm:text-base"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setAnalysisResult(null)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base"
                  >
                    Analyze Another
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Chat History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-[95vw] sm:max-w-lg md:max-w-2xl mx-auto max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Recent Chats</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHistoryDialogOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[60vh] sm:max-h-96">
              {sessions.length > 0 ? (
                sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                      currentSession?.id === session.id
                        ? "bg-purple-600/20 border-purple-600"
                        : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                    }`}
                    onClick={() => {
                      setCurrentSession(session)
                      setHistoryDialogOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm sm:text-base truncate">{session.title}</h3>
                        <p className="text-slate-400 text-xs sm:text-sm">
                          {session.messages.length} messages •{" "}
                          {session.updatedAt instanceof Date
                            ? session.updatedAt.toLocaleDateString()
                            : (session.updatedAt as any)?.toDate?.()?.toLocaleDateString() || "Recently"}
                        </p>
                        {session.messages.length > 0 && (
                          <p className="text-slate-500 text-xs mt-1 truncate">
                            {session.messages[session.messages.length - 1]?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <RotateCcw className="h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm sm:text-base">No chat history yet</p>
                  <p className="text-slate-500 text-xs sm:text-sm">Start a conversation to see your history here</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 sm:pt-4 border-t border-slate-800">
              <Link href="/history">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-400 hover:text-white text-sm sm:text-base"
                  onClick={() => setHistoryDialogOpen(false)}
                >
                  View Full History
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
