
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures - users can only upload their own
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Prescription images - users can only upload their own
    match /prescriptions/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Health records attachments - users can only access their own
    match /health-records/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // General file size and type restrictions
    match /{allPaths=**} {
      allow write: if request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
