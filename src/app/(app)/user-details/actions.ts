
'use server';

import { z } from 'zod';
import type { UserDetailsFormData } from '@/lib/types';

const UserDetailsSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  age: z.string().min(1, { message: 'Age is required.' }), // Assuming age is selected from dropdown, so string initially
  bloodGroup: z.string().min(1, { message: 'Blood group is required.' }),
  allergies: z.string().optional(),
  familyDiseaseHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  addictions: z.array(z.string()).optional(), // Assuming checkboxes send an array of values
  pastDiseases: z.string().optional(),
});

export async function handleUserDetails(formData: FormData) {
  const rawFormData = {
    fullName: formData.get('fullName'),
    age: formData.get('age'),
    bloodGroup: formData.get('bloodGroup'),
    allergies: formData.get('allergies'),
    familyDiseaseHistory: formData.get('familyDiseaseHistory'),
    currentMedications: formData.get('currentMedications'),
    addictions: formData.getAll('addictions'), // Handles multiple checkboxes
    pastDiseases: formData.get('pastDiseases'),
  };

  const parsed = UserDetailsSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Invalid form data.',
    };
  }

  const userDetails: UserDetailsFormData = parsed.data;

  console.log('User details collected (placeholder):', userDetails);
  // TODO: Store these details in a persistent store (e.g., database).
  // TODO: Send this data to a data pipeline for model training.
  // For example, save to a JSON file (server-side, requires appropriate permissions and setup):
  // import fs from 'fs/promises';
  // import path from 'path';
  // const filePath = path.join(process.cwd(), 'user_data', `${userDetails.fullName.replace(/\s+/g, '_')}_details.json`);
  // await fs.mkdir(path.dirname(filePath), { recursive: true });
  // await fs.writeFile(filePath, JSON.stringify(userDetails, null, 2));
  // console.log(`User details saved to ${filePath}`);
  // Note: Direct file system writes like this might not be suitable for all deployment environments (e.g., serverless).

  return {
    success: true,
    message: 'User details saved successfully!',
    redirectTo: '/chatbot',
  };
}
