-- Firestore Composite Indexes
-- Add these indexes in Firebase Console > Firestore Database > Indexes

-- Chat Sessions Index
-- Collection: chatSessions
-- Fields: userId (Ascending), updatedAt (Descending)

-- Medications Index  
-- Collection: medications
-- Fields: userId (Ascending), isActive (Ascending), createdAt (Descending)

-- Health Records Index
-- Collection: healthRecords  
-- Fields: userId (Ascending), createdAt (Descending)

-- Summaries Index
-- Collection: summaries
-- Fields: userId (Ascending), createdAt (Descending)

-- Prescription Analyses Index
-- Collection: prescriptionAnalyses
-- Fields: userId (Ascending), createdAt (Descending)

-- Notification Settings Index
-- Collection: notificationSettings
-- Fields: userId (Ascending), createdAt (Descending)

-- Medication Reminders Index
-- Collection: medicationReminders
-- Fields: userId (Ascending), isActive (Ascending), createdAt (Descending)
