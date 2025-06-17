"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { createUserProfile, type UserProfile } from "@/lib/firestore"
import { toast } from "sonner"

export default function ProfileSetupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    bloodGroup: "",
    allergies: "",
    familyDiseases: "",
    currentMedications: "",
    pastDiseases: "",
    addictions: {
      smoking: false,
      drinkingAlcohol: false,
      recreationalDrugs: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Calculate birth year from age
      const currentYear = new Date().getFullYear()
      const birthYear = formData.age ? currentYear - Number.parseInt(formData.age) : ""
      const dateOfBirth = birthYear ? `${birthYear}-01-01` : ""

      // Prepare addictions array
      const addictions = []
      if (formData.addictions.smoking) addictions.push("Smoking")
      if (formData.addictions.drinkingAlcohol) addictions.push("Drinking Alcohol")
      if (formData.addictions.recreationalDrugs) addictions.push("Recreational Drugs")

      const profileData: Partial<UserProfile> = {
        displayName: formData.fullName,
        dateOfBirth,
        medicalInfo: {
          allergies: formData.allergies
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a),
          conditions: [
            ...formData.familyDiseases
              .split(",")
              .map((d) => d.trim())
              .filter((d) => d),
            ...formData.pastDiseases
              .split(",")
              .map((d) => d.trim())
              .filter((d) => d),
          ],
          bloodType: formData.bloodGroup,
        },
        preferences: {
          theme: "dark",
          notifications: true,
          emailNotifications: true,
          medicationReminders: true,
          appointmentReminders: true,
        },
      }

      // Update user profile with detailed information
      await createUserProfile(user.uid, user.email!, formData.fullName, user.photoURL || "", profileData)

      toast.success("Profile setup completed successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error setting up profile:", error)
      toast.error("Failed to setup profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Complete Your Profile</h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Please provide some additional information to help us assist you better.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm sm:text-base">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white h-12 rounded-xl text-sm sm:text-base placeholder-slate-500"
                required
              />
            </div>

            {/* Age and Blood Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-3 text-sm sm:text-base">Age</label>
                <Select value={formData.age} onValueChange={(value) => setFormData({ ...formData, age: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12 rounded-xl">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age} years
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white font-medium mb-3 text-sm sm:text-base">Blood Group</label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12 rounded-xl">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm sm:text-base">
                Allergies (if any, comma-separated)
              </label>
              <Textarea
                placeholder="e.g., Pollen, Peanuts"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-sm sm:text-base placeholder-slate-500 min-h-[80px] resize-none"
              />
            </div>

            {/* History of Family Diseases */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm sm:text-base">
                History of Family Diseases (if any)
              </label>
              <Textarea
                placeholder="e.g., Diabetes (Mother), Hypertension (Father)"
                value={formData.familyDiseases}
                onChange={(e) => setFormData({ ...formData, familyDiseases: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-sm sm:text-base placeholder-slate-500 min-h-[80px] resize-none"
              />
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm sm:text-base">
                Current Medications (if any)
              </label>
              <Textarea
                placeholder="e.g., Metformin 500mg daily"
                value={formData.currentMedications}
                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-sm sm:text-base placeholder-slate-500 min-h-[80px] resize-none"
              />
            </div>

            {/* Any Addictions */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm sm:text-base">Any Addictions</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="smoking"
                    checked={formData.addictions.smoking}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        addictions: { ...formData.addictions, smoking: checked as boolean },
                      })
                    }
                  />
                  <label htmlFor="smoking" className="text-slate-300 text-sm sm:text-base">
                    Smoking
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="drinking"
                    checked={formData.addictions.drinkingAlcohol}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        addictions: { ...formData.addictions, drinkingAlcohol: checked as boolean },
                      })
                    }
                  />
                  <label htmlFor="drinking" className="text-slate-300 text-sm sm:text-base">
                    Drinking Alcohol
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="drugs"
                    checked={formData.addictions.recreationalDrugs}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        addictions: { ...formData.addictions, recreationalDrugs: checked as boolean },
                      })
                    }
                  />
                  <label htmlFor="drugs" className="text-slate-300 text-sm sm:text-base">
                    Recreational Drugs
                  </label>
                </div>
              </div>
            </div>

            {/* Any Significant Past Diseases/Surgeries */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm sm:text-base">
                Any Significant Past Diseases/Surgeries
              </label>
              <Textarea
                placeholder="e.g., Appendectomy (2010), Chickenpox (Childhood)"
                value={formData.pastDiseases}
                onChange={(e) => setFormData({ ...formData, pastDiseases: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white rounded-xl text-sm sm:text-base placeholder-slate-500 min-h-[80px] resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg text-sm sm:text-base font-medium"
              >
                {loading ? "Saving Details..." : "Save Details"}
              </Button>
              <Button
                type="button"
                onClick={handleSkip}
                variant="outline"
                className="flex-1 h-12 bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl text-sm sm:text-base"
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
