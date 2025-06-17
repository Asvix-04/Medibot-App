import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Use environment variables with fallback to prevent client-side access errors
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAB5TldoIqRS_WfUlF7JYfVnzXi3i96dmw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medibot-457514.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medibot-457514",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medibot-457514.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "806828516267",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:806828516267:web:a75aad403f3dfbc67da8ee",
  measurementId: "G-4S6ZN10CRC",
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error("Firebase initialization error:", error)
  // Fallback initialization
  app = initializeApp(firebaseConfig)
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Auth providers
export const googleProvider = new GoogleAuthProvider()
export const facebookProvider = new FacebookAuthProvider()

// Configure providers
googleProvider.setCustomParameters({
  prompt: "select_account",
})

facebookProvider.setCustomParameters({
  display: "popup",
})

export default app
