//lib/firestore
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  limit,
  type Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  dateOfBirth?: string
  gender?: string
  phoneNumber?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  medicalInfo?: {
    allergies: string[]
    conditions: string[]
    bloodType?: string
  }
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  preferences?: {
    theme: "dark" | "light"
    notifications: boolean
    emailNotifications: boolean
    medicationReminders: boolean
    appointmentReminders: boolean
  }
}

export interface ChatMessage {
  id?: string
  userId: string
  message: string
  response: string
  timestamp: Timestamp | Date
  type: "chat" | "summarizer"
}

export interface ChatSession {
  id?: string
  userId: string
  title: string
  messages: ChatMessage[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface Medication {
  id?: string
  userId: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  notes?: string
  reminderTimes: string[]
  isActive: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface HealthRecord {
  id?: string
  userId: string
  type: "symptom" | "appointment" | "test_result" | "vital_signs"
  title: string
  description: string
  date: string
  attachments?: string[]
  createdAt: Timestamp | Date
}

export interface SummaryRequest {
  id?: string
  userId: string
  originalText: string
  summary: string
  category: "symptoms" | "medication" | "diagnosis" | "treatment" | "general"
  createdAt: Timestamp | Date
}

export interface PrescriptionAnalysis {
  id?: string
  userId: string
  fileName: string
  medications: string[]
  dosages: string[]
  instructions: string
  warnings: string[]
  createdAt: Timestamp | Date
}

export interface NotificationSettings {
  id?: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  medicationReminders: boolean
  appointmentReminders: boolean
  reminderTimes: string[]
  createdAt: Timestamp | Date
}

export interface Appointment {
  id?: string
  userId: string
  hospitalName: string
  hospitalAddress: string
  hospitalPhone?: string
  hospitalLocation?: {
    lat: number
    lng: number
  }
  doctorName: string
  appointmentType: string
  date: string
  time: string
  notes?: string
  status: "scheduled" | "completed" | "cancelled"
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

// User Profile Functions
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName?: string,
  photoURL?: string,
  additionalData?: Partial<UserProfile>,
) => {
  try {
    const userRef = doc(db, "users", uid)
    const userData: UserProfile = {
      uid,
      email,
      displayName: displayName || email.split("@")[0],
      photoURL,
      ...additionalData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      preferences: {
        theme: "dark",
        notifications: true,
        emailNotifications: true,
        medicationReminders: true,
        appointmentReminders: true,
        ...additionalData?.preferences,
      },
    }

    await setDoc(userRef, userData)

    // Create default notification settings
    await createNotificationSettings(uid)

    return userData
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw new Error("Failed to create user profile")
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    // Update user profile with new photo URL
    await updateUserProfile(userId, { photoURL: downloadURL })

    return downloadURL
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    throw new Error("Failed to upload profile picture")
  }
}

// Chat Functions
export const createChatSession = async (userId: string, title: string) => {
  try {
    const chatRef = collection(db, "chatSessions")
    const chatData = {
      userId,
      title: title.slice(0, 100),
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(chatRef, chatData)
    return docRef.id
  } catch (error) {
    console.error("Error creating chat session:", error)
    throw new Error("Failed to create chat session")
  }
}

export const addMessageToSession = async (
  sessionId: string,
  userId: string,
  message: string,
  response: string,
  type: "chat" | "summarizer" = "chat",
) => {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId)
    const sessionSnap = await getDoc(sessionRef)

    if (!sessionSnap.exists()) {
      throw new Error("Session not found")
    }

    const sessionData = sessionSnap.data() as ChatSession
    const newMessage: ChatMessage = {
      userId,
      message: message.slice(0, 1000),
      response: response.slice(0, 2000),
      type,
      timestamp: new Date(),
    }

    const updatedMessages = [...(sessionData.messages || []), newMessage]

    await updateDoc(sessionRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp(),
    })

    return newMessage
  } catch (error) {
    console.error("Error adding message to session:", error)
    throw new Error("Failed to add message")
  }
}

export const getUserChatSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const chatsRef = collection(db, "chatSessions")
    const q = query(chatsRef, where("userId", "==", userId), limit(20))

    const querySnapshot = await getDocs(q)
    const sessions = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as ChatSession,
    )

    return sessions.sort((a, b) => {
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt as any)?.seconds * 1000 || 0
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt as any)?.seconds * 1000 || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error("Error getting chat sessions:", error)
    return []
  }
}

export const deleteChatSession = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId)
    await deleteDoc(sessionRef)
  } catch (error) {
    console.error("Error deleting chat session:", error)
    throw new Error("Failed to delete chat session")
  }
}

// Prescription Analysis Functions
export const analyzePrescription = async (
  userId: string,
  fileName: string,
  description: string,
): Promise<PrescriptionAnalysis> => {
  try {
    // Simulate AI analysis - in real implementation, this would call an AI service
    const analysis: Omit<PrescriptionAnalysis, "id"> = {
      userId,
      fileName,
      medications: ["Amoxicillin", "Ibuprofen", "Vitamin D3"],
      dosages: ["500mg twice daily", "200mg as needed", "1000 IU daily"],
      instructions: "Take Amoxicillin with food. Ibuprofen for pain relief only. Vitamin D3 with breakfast.",
      warnings: [
        "Do not take Ibuprofen on empty stomach",
        "Complete full course of Amoxicillin even if feeling better",
        "Avoid alcohol while taking Amoxicillin",
      ],
      createdAt: serverTimestamp() as Timestamp,
    }

    const analysisRef = collection(db, "prescriptionAnalyses")
    const docRef = await addDoc(analysisRef, analysis)

    return { id: docRef.id, ...analysis }
  } catch (error) {
    console.error("Error analyzing prescription:", error)
    throw new Error("Failed to analyze prescription")
  }
}

// Medication Functions
export const addMedication = async (
  userId: string,
  medication: Omit<Medication, "id" | "userId" | "createdAt" | "updatedAt">,
) => {
  try {
    const medicationRef = collection(db, "medications")
    const medicationData: Omit<Medication, "id"> = {
      userId,
      ...medication,
      isActive: true,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(medicationRef, medicationData)

    // Schedule medication reminders
    await scheduleMedicationReminders(userId, docRef.id, medication.reminderTimes)

    return docRef.id
  } catch (error) {
    console.error("Error adding medication:", error)
    throw new Error("Failed to add medication")
  }
}

export const updateMedication = async (medicationId: string, data: Partial<Medication>) => {
  try {
    const medicationRef = doc(db, "medications", medicationId)
    await updateDoc(medicationRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating medication:", error)
    throw new Error("Failed to update medication")
  }
}

export const deleteMedication = async (medicationId: string) => {
  try {
    const medicationRef = doc(db, "medications", medicationId)
    await deleteDoc(medicationRef)
  } catch (error) {
    console.error("Error deleting medication:", error)
    throw new Error("Failed to delete medication")
  }
}

export const getUserMedications = async (userId: string): Promise<Medication[]> => {
  try {
    const medicationsRef = collection(db, "medications")
    const q = query(medicationsRef, where("userId", "==", userId), limit(50))

    const querySnapshot = await getDocs(q)
    const medications = querySnapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Medication,
      )
      .filter((med) => med.isActive)

    return medications.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds * 1000 || 0
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds * 1000 || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error("Error getting medications:", error)
    return []
  }
}

// Appointment Functions
export const addAppointment = async (
  userId: string,
  appointment: Omit<Appointment, "id" | "userId" | "status" | "createdAt" | "updatedAt">,
) => {
  try {
    const appointmentRef = collection(db, "appointments")
    const appointmentData: Omit<Appointment, "id"> = {
      userId,
      ...appointment,
      status: "scheduled",
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(appointmentRef, appointmentData)
    return docRef.id
  } catch (error) {
    console.error("Error adding appointment:", error)
    throw new Error("Failed to add appointment")
  }
}

export const updateAppointment = async (appointmentId: string, data: Partial<Appointment>) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId)
    await updateDoc(appointmentRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    throw new Error("Failed to update appointment")
  }
}

export const deleteAppointment = async (appointmentId: string) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId)
    await deleteDoc(appointmentRef)
  } catch (error) {
    console.error("Error deleting appointment:", error)
    throw new Error("Failed to delete appointment")
  }
}

export const getUserAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    const appointmentsRef = collection(db, "appointments")
    const q = query(appointmentsRef, where("userId", "==", userId), limit(50))

    const querySnapshot = await getDocs(q)
    const appointments = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    )

    return appointments.sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time}`).getTime()
      const bTime = new Date(`${b.date}T${b.time}`).getTime()
      return bTime - aTime
        })
  } catch (error) {
    console.error("Error getting appointments:", error)
    return []
  }
}

// Notification Functions
export const createNotificationSettings = async (userId: string) => {
  try {
    const notificationRef = collection(db, "notificationSettings")
    const notificationData: Omit<NotificationSettings, "id"> = {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      medicationReminders: true,
      appointmentReminders: true,
      reminderTimes: ["09:00", "21:00"],
      createdAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(notificationRef, notificationData)
    return docRef.id
  } catch (error) {
    console.error("Error creating notification settings:", error)
    throw new Error("Failed to create notification settings")
  }
}

export const scheduleMedicationReminders = async (userId: string, medicationId: string, reminderTimes: string[]) => {
  try {
    // In a real implementation, this would integrate with a notification service
    // For now, we'll just store the reminder schedule
    const reminderRef = collection(db, "medicationReminders")
    const reminderData = {
      userId,
      medicationId,
      reminderTimes,
      isActive: true,
      createdAt: serverTimestamp(),
    }

    await addDoc(reminderRef, reminderData)

    // Request notification permission if not already granted
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  } catch (error) {
    console.error("Error scheduling medication reminders:", error)
    throw new Error("Failed to schedule reminders")
  }
}

export const sendMedicationReminder = async (userId: string, medicationName: string) => {
  try {
    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Medication Reminder", {
        body: `Time to take your ${medicationName}`,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: "medication-reminder",
      })
    }

    // You could also send email notifications here
    // await sendEmailReminder(userId, medicationName)
  } catch (error) {
    console.error("Error sending medication reminder:", error)
  }
}

// Health Records Functions
export const addHealthRecord = async (userId: string, record: Omit<HealthRecord, "id" | "userId" | "createdAt">) => {
  try {
    const recordRef = collection(db, "healthRecords")
    const recordData: Omit<HealthRecord, "id"> = {
      userId,
      ...record,
      createdAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(recordRef, recordData)
    return docRef.id
  } catch (error) {
    console.error("Error adding health record:", error)
    throw new Error("Failed to add health record")
  }
}

export const getUserHealthRecords = async (userId: string): Promise<HealthRecord[]> => {
  try {
    const recordsRef = collection(db, "healthRecords")
    const q = query(recordsRef, where("userId", "==", userId), limit(50))

    const querySnapshot = await getDocs(q)
    const records = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as HealthRecord,
    )

    return records.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds * 1000 || 0
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds * 1000 || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error("Error getting health records:", error)
    return []
  }
}

// Summary Functions
export const addSummaryRequest = async (
  userId: string,
  originalText: string,
  summary: string,
  category: "symptoms" | "medication" | "diagnosis" | "treatment" | "general",
) => {
  try {
    const summaryRef = collection(db, "summaries")
    const summaryData: Omit<SummaryRequest, "id"> = {
      userId,
      originalText: originalText.slice(0, 5000),
      summary: summary.slice(0, 2000),
      category,
      createdAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(summaryRef, summaryData)
    return docRef.id
  } catch (error) {
    console.error("Error adding summary:", error)
    throw new Error("Failed to save summary")
  }
}

export const getUserSummaries = async (userId: string): Promise<SummaryRequest[]> => {
  try {
    const summariesRef = collection(db, "summaries")
    const q = query(summariesRef, where("userId", "==", userId), limit(20))

    const querySnapshot = await getDocs(q)
    const summaries = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as SummaryRequest,
    )

    return summaries.sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds * 1000 || 0
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds * 1000 || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error("Error getting summaries:", error)
    return []
  }
}

// Real-time listeners
export const subscribeToUserChatSessions = (userId: string, callback: (sessions: ChatSession[]) => void) => {
  const chatsRef = collection(db, "chatSessions")
  const q = query(chatsRef, where("userId", "==", userId), limit(20))

  return onSnapshot(
    q,
    (querySnapshot) => {
      try {
        const sessions = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as ChatSession,
        )

        const sortedSessions = sessions.sort((a, b) => {
          const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : (a.updatedAt as any)?.seconds * 1000 || 0
          const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : (b.updatedAt as any)?.seconds * 1000 || 0
          return bTime - aTime
        })

        callback(sortedSessions)
      } catch (error) {
        console.error("Error processing chat sessions:", error)
        callback([])
      }
    },
    (error) => {
      console.error("Error in chat sessions listener:", error)
      callback([])
    },
  )
}

export const subscribeToUserMedications = (userId: string, callback: (medications: Medication[]) => void) => {
  const medicationsRef = collection(db, "medications")
  const q = query(medicationsRef, where("userId", "==", userId), limit(50))

  return onSnapshot(
    q,
    (querySnapshot) => {
      try {
        const medications = querySnapshot.docs
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as Medication,
          )
          .filter((med) => med.isActive)

        const sortedMedications = medications.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.seconds * 1000 || 0
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.seconds * 1000 || 0
          return bTime - aTime
        })

        callback(sortedMedications)
      } catch (error) {
        console.error("Error processing medications:", error)
        callback([])
      }
    },
    (error) => {
      console.error("Error in medications listener:", error)
      callback([])
    },
  )
}

export const subscribeToUserAppointments = (userId: string, callback: (appointments: Appointment[]) => void) => {
  const appointmentsRef = collection(db, "appointments")
  const q = query(appointmentsRef, where("userId", "==", userId), limit(50))

  return onSnapshot(
    q,
    (querySnapshot) => {
      try {
        const appointments = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Appointment,
        )

        const sortedAppointments = appointments.sort((a, b) => {
          const aTime = new Date(`${a.date}T${a.time}`).getTime()
          const bTime = new Date(`${b.date}T${b.time}`).getTime()
          return bTime - aTime
        })

        callback(sortedAppointments)
      } catch (error) {
        console.error("Error processing appointments:", error)
        callback([])
      }
    },
    (error) => {
      console.error("Error in appointments listener:", error)
      callback([])
    },
  )
}

// Helper function to create sample data for testing
export const createSampleHealthRecord = async (userId: string) => {
  try {
    const sampleRecord: Omit<HealthRecord, "id" | "userId" | "createdAt"> = {
      type: "symptom",
      title: "Sample Health Record",
      description: "This is a sample health record for testing purposes",
      date: new Date().toISOString().split("T")[0],
    }

    return addHealthRecord(userId, sampleRecord)
  } catch (error) {
    console.error("Error creating sample health record:", error)
    throw new Error("Failed to create sample health record")
  }
}