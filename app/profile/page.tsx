"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, User, Palette, Bell, Shield, Database, Camera } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { updateUserProfile, uploadProfilePicture, type UserProfile } from "@/lib/firestore"
import { toast } from "sonner"

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    allergies: "",
    conditions: "",
    bloodType: "",
    preferences: {
      theme: "dark" as "dark" | "light",
      notifications: true,
      emailNotifications: true,
      medicationReminders: true,
      appointmentReminders: true,
      healthTips: false,
      pushNotifications: true,
      shareDataForResearch: false,
      analytics: true,
      saveConversations: true,
    },
  })
  const { user, userProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        email: userProfile.email || "",
        dateOfBirth: userProfile.dateOfBirth || "",
        gender: userProfile.gender || "",
        phoneNumber: userProfile.phoneNumber || "",
        emergencyContactName: userProfile.emergencyContact?.name || "",
        emergencyContactPhone: userProfile.emergencyContact?.phone || "",
        emergencyContactRelationship: userProfile.emergencyContact?.relationship || "",
        allergies: userProfile.medicalInfo?.allergies?.join(", ") || "",
        conditions: userProfile.medicalInfo?.conditions?.join(", ") || "",
        bloodType: userProfile.medicalInfo?.bloodType || "",
        preferences: {
          theme: userProfile.preferences?.theme || "dark",
          notifications: userProfile.preferences?.notifications ?? true,
          emailNotifications: userProfile.preferences?.emailNotifications ?? true,
          medicationReminders: userProfile.preferences?.medicationReminders ?? true,
          appointmentReminders: userProfile.preferences?.appointmentReminders ?? true,
          healthTips: false,
          pushNotifications: true,
          shareDataForResearch: false,
          analytics: true,
          saveConversations: true,
        },
      })
    }
  }, [userProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const updateData: Partial<UserProfile> = {
        displayName: formData.displayName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        },
        medicalInfo: {
          allergies: formData.allergies
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a),
          conditions: formData.conditions
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c),
          bloodType: formData.bloodType,
        },
        preferences: formData.preferences,
      }

      await updateUserProfile(user.uid, updateData)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingPhoto(true)
    try {
      await uploadProfilePicture(user.uid, file)
      toast.success("Profile picture updated successfully!")
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Failed to upload profile picture")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [key]: value,
      },
    })
  }

  const handleExportData = () => {
    const exportData = {
      profile: userProfile,
      exportDate: new Date().toISOString(),
      note: "This is your MedBot data export",
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medbot-data-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Data exported successfully!")
  }

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      toast.success("Data clearing initiated. This feature will be implemented soon.")
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
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-white font-semibold">Profile Settings</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Settings */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <User className="h-5 w-5 text-slate-400 mr-2" />
                  <CardTitle className="text-white">Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={userProfile?.photoURL || user?.photoURL || ""} />
                        <AvatarFallback className="bg-purple-600 text-white text-2xl font-semibold">
                          {formData.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Change Photo
                            </>
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <p className="text-slate-400 text-sm mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Display Name</label>
                        <Input
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                          placeholder="Enter your display name"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                        <Input
                          value={formData.email}
                          disabled
                          className="bg-slate-800 border-slate-700 text-slate-400"
                        />
                        <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Date of Birth</label>
                        <Input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Gender</label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="bg-slate-800 border-slate-700 text-white"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Contact Name</label>
                          <Input
                            value={formData.emergencyContactName}
                            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="Emergency contact name"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Contact Phone</label>
                          <Input
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="Emergency contact phone"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Relationship</label>
                          <Input
                            value={formData.emergencyContactRelationship}
                            onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="e.g., Parent, Spouse"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium text-lg">Medical Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Allergies</label>
                          <Input
                            value={formData.allergies}
                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="e.g., Penicillin, Peanuts (comma separated)"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-2">Medical Conditions</label>
                          <Input
                            value={formData.conditions}
                            onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="e.g., Diabetes, Hypertension (comma separated)"
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-1/3">
                        <label className="block text-slate-300 text-sm font-medium mb-2">Blood Type</label>
                        <Select
                          value={formData.bloodType}
                          onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select blood type" />
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

                    <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <Palette className="h-5 w-5 text-slate-400 mr-2" />
                  <CardTitle className="text-white">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Theme Preference</label>
                    <Select
                      value={formData.preferences.theme}
                      onValueChange={(value: "dark" | "light") => handlePreferenceChange("theme", value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="dark">🌙 Theme: Dark</SelectItem>
                        <SelectItem value="light">☀️ Theme: Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <Bell className="h-5 w-5 text-slate-400 mr-2" />
                  <CardTitle className="text-white">Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Medication Reminders</p>
                      <p className="text-slate-400 text-sm">Get notified to take your medications</p>
                    </div>
                    <Switch
                      checked={formData.preferences.medicationReminders}
                      onCheckedChange={(checked) => handlePreferenceChange("medicationReminders", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Appointment Reminders</p>
                      <p className="text-slate-400 text-sm">Reminders for upcoming medical appointments</p>
                    </div>
                    <Switch
                      checked={formData.preferences.appointmentReminders}
                      onCheckedChange={(checked) => handlePreferenceChange("appointmentReminders", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Health Tips</p>
                      <p className="text-slate-400 text-sm">General health tips and wellness advice</p>
                    </div>
                    <Switch
                      checked={formData.preferences.healthTips}
                      onCheckedChange={(checked) => handlePreferenceChange("healthTips", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-slate-400 text-sm">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={formData.preferences.emailNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-slate-400 text-sm">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={formData.preferences.pushNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange("pushNotifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <Shield className="h-5 w-5 text-slate-400 mr-2" />
                  <CardTitle className="text-white">Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Share Data for Research</p>
                      <p className="text-slate-400 text-sm">Help improve healthcare by sharing anonymized data</p>
                    </div>
                    <Switch
                      checked={formData.preferences.shareDataForResearch}
                      onCheckedChange={(checked) => handlePreferenceChange("shareDataForResearch", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Analytics</p>
                      <p className="text-slate-400 text-sm">Allow app usage analytics to improve user experience</p>
                    </div>
                    <Switch
                      checked={formData.preferences.analytics}
                      onCheckedChange={(checked) => handlePreferenceChange("analytics", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Save Conversations</p>
                      <p className="text-slate-400 text-sm">Keep chat history for future reference</p>
                    </div>
                    <Switch
                      checked={formData.preferences.saveConversations}
                      onCheckedChange={(checked) => handlePreferenceChange("saveConversations", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <Database className="h-5 w-5 text-slate-400 mr-2" />
                  <CardTitle className="text-white">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      📤 Export My Data
                    </Button>
                    <Button onClick={handleClearData} variant="destructive" className="bg-red-600 hover:bg-red-700">
                      🗑️ Clear All Data
                    </Button>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Export your data to keep a backup, or clear all your data to start fresh.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
