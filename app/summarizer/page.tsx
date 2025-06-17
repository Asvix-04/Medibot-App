"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Menu, FileText, Sparkles, Copy, Download, History, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { addSummaryRequest, getUserSummaries, type SummaryRequest } from "@/lib/firestore"
import { toast } from "sonner"

export default function SummarizerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState<"symptoms" | "medication" | "diagnosis" | "treatment" | "general">("general")
  const [loading, setLoading] = useState(false)
  const [summaries, setSummaries] = useState<SummaryRequest[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadSummaries()
    }
  }, [user])

  const loadSummaries = async () => {
    if (!user) return

    try {
      setLoadingHistory(true)
      const userSummaries = await getUserSummaries(user.uid)
      setSummaries(userSummaries)
    } catch (error) {
      console.error("Error loading summaries:", error)
      toast.error("Failed to load summary history")
    } finally {
      setLoadingHistory(false)
    }
  }

  const generateSummary = async () => {
    if (!inputText.trim() || !user) {
      toast.error("Please enter some text to summarize")
      return
    }

    setLoading(true)
    setSummary("")

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

      const generatedSummary = await generateMedicalSummary(inputText, category)
      setSummary(generatedSummary)

      // Save to Firestore
      await addSummaryRequest(user.uid, inputText, generatedSummary, category)

      toast.success("Summary generated successfully!")

      // Reload summaries
      loadSummaries()
    } catch (error) {
      console.error("Error generating summary:", error)
      toast.error("Failed to generate summary")
    } finally {
      setLoading(false)
    }
  }

  const generateMedicalSummary = async (text: string, category: string): Promise<string> => {
    const lowerText = text.toLowerCase()

    // Category-specific summarization
    switch (category) {
      case "symptoms":
        return generateSymptomSummary(text, lowerText)
      case "medication":
        return generateMedicationSummary(text, lowerText)
      case "diagnosis":
        return generateDiagnosisSummary(text, lowerText)
      case "treatment":
        return generateTreatmentSummary(text, lowerText)
      default:
        return generateGeneralSummary(text, lowerText)
    }
  }

  const generateSymptomSummary = (text: string, lowerText: string): string => {
    const symptoms = []
    const duration = []
    const severity = []

    // Extract symptoms
    if (lowerText.includes("headache") || lowerText.includes("head pain")) symptoms.push("headache")
    if (lowerText.includes("fever") || lowerText.includes("temperature")) symptoms.push("fever")
    if (lowerText.includes("nausea") || lowerText.includes("sick")) symptoms.push("nausea")
    if (lowerText.includes("fatigue") || lowerText.includes("tired")) symptoms.push("fatigue")
    if (lowerText.includes("pain")) symptoms.push("pain")
    if (lowerText.includes("cough")) symptoms.push("cough")
    if (lowerText.includes("shortness of breath") || lowerText.includes("breathing"))
      symptoms.push("breathing difficulty")

    // Extract duration
    if (lowerText.includes("days")) duration.push("several days")
    if (lowerText.includes("weeks")) duration.push("weeks")
    if (lowerText.includes("hours")) duration.push("hours")
    if (lowerText.includes("sudden") || lowerText.includes("acute")) duration.push("sudden onset")

    // Extract severity
    if (lowerText.includes("severe") || lowerText.includes("intense")) severity.push("severe")
    if (lowerText.includes("mild") || lowerText.includes("slight")) severity.push("mild")
    if (lowerText.includes("moderate")) severity.push("moderate")

    return `**SYMPTOM SUMMARY**

**Primary Symptoms:** ${symptoms.length > 0 ? symptoms.join(", ") : "Multiple symptoms reported"}

**Duration:** ${duration.length > 0 ? duration.join(", ") : "Duration mentioned in description"}

**Severity:** ${severity.length > 0 ? severity.join(", ") : "Severity varies"}

**Key Points:**
• Symptoms appear to be ${symptoms.length > 2 ? "systemic" : "localized"}
• ${duration.length > 0 ? "Timeline suggests " + duration[0] : "Duration should be monitored"}
• ${severity.length > 0 ? "Severity level: " + severity[0] : "Severity assessment needed"}

**Recommendations:**
• Monitor symptom progression
• Keep a symptom diary
• Consult healthcare provider if symptoms worsen
• Seek immediate care for severe or concerning symptoms

**Note:** This is an AI-generated summary for informational purposes. Always consult a healthcare professional for proper medical evaluation.`
  }

  const generateMedicationSummary = (text: string, lowerText: string): string => {
    const medications = []
    const dosages = []
    const frequencies = []

    // Extract common medications (simplified)
    if (lowerText.includes("ibuprofen") || lowerText.includes("advil")) medications.push("Ibuprofen")
    if (lowerText.includes("acetaminophen") || lowerText.includes("tylenol")) medications.push("Acetaminophen")
    if (lowerText.includes("aspirin")) medications.push("Aspirin")
    if (lowerText.includes("antibiotic")) medications.push("Antibiotic")

    // Extract dosages
    const dosageMatches = text.match(/\d+\s*(mg|g|ml|tablets?|pills?)/gi)
    if (dosageMatches) dosages.push(...dosageMatches)

    // Extract frequencies
    if (lowerText.includes("twice daily") || lowerText.includes("bid")) frequencies.push("twice daily")
    if (lowerText.includes("once daily") || lowerText.includes("daily")) frequencies.push("once daily")
    if (lowerText.includes("three times") || lowerText.includes("tid")) frequencies.push("three times daily")

    return `**MEDICATION SUMMARY**

**Medications Mentioned:** ${medications.length > 0 ? medications.join(", ") : "Various medications discussed"}

**Dosages:** ${dosages.length > 0 ? dosages.join(", ") : "Dosage information provided"}

**Frequency:** ${frequencies.length > 0 ? frequencies.join(", ") : "Frequency details mentioned"}

**Key Points:**
• ${medications.length} medication(s) referenced
• Dosage information ${dosages.length > 0 ? "specified" : "may need clarification"}
• Administration schedule ${frequencies.length > 0 ? "provided" : "should be confirmed"}

**Important Reminders:**
• Take medications exactly as prescribed
• Complete full course of antibiotics if prescribed
• Be aware of potential side effects
• Check for drug interactions
• Store medications properly
• Never share prescription medications

**Note:** This summary is for informational purposes only. Always follow your healthcare provider's instructions and consult your pharmacist for medication questions.`
  }

  const generateDiagnosisSummary = (text: string, lowerText: string): string => {
    const conditions = []
    const tests = []

    // Extract common conditions
    if (lowerText.includes("diabetes")) conditions.push("Diabetes")
    if (lowerText.includes("hypertension") || lowerText.includes("high blood pressure")) conditions.push("Hypertension")
    if (lowerText.includes("infection")) conditions.push("Infection")
    if (lowerText.includes("inflammation")) conditions.push("Inflammation")

    // Extract tests
    if (lowerText.includes("blood test") || lowerText.includes("lab")) tests.push("Blood work")
    if (lowerText.includes("x-ray") || lowerText.includes("xray")) tests.push("X-ray")
    if (lowerText.includes("mri") || lowerText.includes("scan")) tests.push("Imaging studies")

    return `**DIAGNOSIS SUMMARY**

**Conditions Discussed:** ${conditions.length > 0 ? conditions.join(", ") : "Medical conditions mentioned"}

**Diagnostic Tests:** ${tests.length > 0 ? tests.join(", ") : "Various tests discussed"}

**Key Information:**
• ${conditions.length > 0 ? "Specific conditions identified" : "General medical discussion"}
• ${tests.length > 0 ? "Diagnostic testing mentioned" : "Further evaluation may be needed"}
• Medical terminology and concepts explained

**Understanding Your Diagnosis:**
• Ask your healthcare provider to explain any unclear terms
• Request written information about your condition
• Understand the treatment plan and follow-up requirements
• Know when to seek immediate medical attention

**Next Steps:**
• Follow prescribed treatment plan
• Attend scheduled follow-up appointments
• Monitor symptoms as directed
• Ask questions about your condition and treatment

**Note:** This summary provides general information only. Always discuss your specific diagnosis and treatment plan with your healthcare provider.`
  }

  const generateTreatmentSummary = (text: string, lowerText: string): string => {
    const treatments = []
    const procedures = []

    // Extract treatments
    if (lowerText.includes("physical therapy") || lowerText.includes("pt")) treatments.push("Physical therapy")
    if (lowerText.includes("surgery") || lowerText.includes("operation")) treatments.push("Surgical intervention")
    if (lowerText.includes("medication") || lowerText.includes("drug")) treatments.push("Medication therapy")
    if (lowerText.includes("lifestyle") || lowerText.includes("diet")) treatments.push("Lifestyle modifications")

    return `**TREATMENT SUMMARY**

**Treatment Approaches:** ${treatments.length > 0 ? treatments.join(", ") : "Various treatment options discussed"}

**Key Treatment Elements:**
• ${treatments.length > 0 ? "Multiple treatment modalities" : "Comprehensive treatment approach"}
• Patient education and involvement emphasized
• Follow-up care and monitoring planned

**Treatment Goals:**
• Symptom relief and management
• Improved quality of life
• Prevention of complications
• Long-term health maintenance

**Patient Responsibilities:**
• Follow treatment plan as prescribed
• Attend all scheduled appointments
• Report any side effects or concerns
• Maintain healthy lifestyle habits
• Take medications as directed

**Monitoring Progress:**
• Regular check-ups with healthcare team
• Track symptoms and improvements
• Adjust treatment plan as needed
• Communicate openly with providers

**Note:** Treatment plans should always be individualized. This summary is for educational purposes - follow your specific treatment plan as prescribed by your healthcare provider.`
  }

  const generateGeneralSummary = (text: string, lowerText: string): string => {
    const wordCount = text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    // Extract key medical terms
    const medicalTerms = []
    if (lowerText.includes("health")) medicalTerms.push("health")
    if (lowerText.includes("medical")) medicalTerms.push("medical")
    if (lowerText.includes("doctor") || lowerText.includes("physician")) medicalTerms.push("healthcare provider")
    if (lowerText.includes("hospital") || lowerText.includes("clinic")) medicalTerms.push("healthcare facility")

    return `**GENERAL MEDICAL SUMMARY**

**Document Overview:**
• Length: ${wordCount} words, ${sentences.length} sentences
• Content: Medical information and health-related discussion
• Key topics: ${medicalTerms.length > 0 ? medicalTerms.join(", ") : "General health information"}

**Main Points:**
• Comprehensive health information provided
• Medical concepts and terminology explained
• Patient education and awareness emphasized
• Healthcare guidance and recommendations included

**Key Takeaways:**
• Stay informed about your health conditions
• Maintain open communication with healthcare providers
• Follow medical advice and treatment plans
• Seek professional help when needed
• Keep accurate health records

**Important Reminders:**
• This summary is for informational purposes only
• Always consult healthcare professionals for medical advice
• Individual cases may vary significantly
• Professional medical evaluation is essential for proper care

**Note:** This AI-generated summary provides general information only. For specific medical advice, diagnosis, or treatment, always consult qualified healthcare professionals.`
  }

  const copySummary = () => {
    navigator.clipboard.writeText(summary)
    toast.success("Summary copied to clipboard!")
  }

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medical-summary-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Summary downloaded!")
  }

  const clearAll = () => {
    setInputText("")
    setSummary("")
    setCategory("general")
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
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-purple-400 font-semibold">Medical Information</h1>
                <h2 className="text-purple-400 font-semibold">Summarizer</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Medical Information Summarizer</h1>
                <p className="text-slate-400">
                  Paste your medical information, reports, or health-related text to get an AI-powered summary with key
                  insights and recommendations.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Input Medical Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Category</label>
                      <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="general">🏥 General Medical</SelectItem>
                          <SelectItem value="symptoms">🤒 Symptoms & Signs</SelectItem>
                          <SelectItem value="medication">💊 Medications</SelectItem>
                          <SelectItem value="diagnosis">🔬 Diagnosis & Tests</SelectItem>
                          <SelectItem value="treatment">⚕️ Treatment Plans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Medical Text ({inputText.length}/5000 characters)
                      </label>
                      <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste your medical information here... (e.g., doctor's notes, lab results, symptom descriptions, medication lists, treatment plans)"
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 min-h-[300px] resize-none"
                        maxLength={5000}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={generateSummary}
                        disabled={loading || !inputText.trim()}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Summary
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={clearAll}
                        variant="outline"
                        className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>AI Summary</span>
                      </div>
                      {summary && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={copySummary}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={downloadSummary}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summary ? (
                      <div className="bg-slate-800 rounded-lg p-4 text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[300px] max-h-[400px] overflow-y-auto">
                        {summary}
                      </div>
                    ) : (
                      <div className="bg-slate-800 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                        <div>
                          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400 mb-2">Ready to summarize</p>
                          <p className="text-slate-500 text-sm">
                            Enter your medical information and click "Generate Summary" to get started
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary History */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Recent Summaries</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-slate-400">Loading summary history...</p>
                    </div>
                  ) : summaries.length > 0 ? (
                    <div className="space-y-4">
                      {summaries.slice(0, 5).map((summary, index) => (
                        <div key={summary.id || index} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className="bg-purple-600 text-white">
                              {summary.category.charAt(0).toUpperCase() + summary.category.slice(1)}
                            </Badge>
                            <span className="text-slate-500 text-xs">
                              {summary.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm line-clamp-2 mb-2">
                            {summary.originalText.slice(0, 150)}...
                          </p>
                          <p className="text-slate-400 text-xs">Summary: {summary.summary.slice(0, 100)}...</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-2">No summaries yet</p>
                      <p className="text-slate-500 text-sm">Generate your first medical summary to see it here</p>
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
