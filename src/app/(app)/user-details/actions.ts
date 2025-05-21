
'use server';

import { z } from 'zod';
import type { UserDetailsFormData, ActionFormState } from '@/lib/types';

const UserDetailsSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  age: z.string().min(1, { message: 'Age is required.' }),
  bloodGroup: z.string().min(1, { message: 'Blood group is required.' }),
  allergies: z.string().optional(),
  familyDiseaseHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  addictions: z.array(z.string()).optional(),
  pastDiseases: z.string().optional(),
});

export async function handleUserDetails(
  prevState: ActionFormState<UserDetailsFormData>,
  formData: FormData
): Promise<ActionFormState<UserDetailsFormData>> {
  const rawFormData = {
    fullName: formData.get('fullName'),
    age: formData.get('age'),
    bloodGroup: formData.get('bloodGroup'),
    allergies: formData.get('allergies'),
    familyDiseaseHistory: formData.get('familyDiseaseHistory'),
    currentMedications: formData.get('currentMedications'),
    addictions: formData.getAll('addictions'),
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

  // Ensure parsed.data conforms to UserDetailsFormData for type safety
  const userDetails: UserDetailsFormData = {
    fullName: parsed.data.fullName,
    age: parsed.data.age,
    bloodGroup: parsed.data.bloodGroup,
    allergies: parsed.data.allergies,
    familyDiseaseHistory: parsed.data.familyDiseaseHistory,
    currentMedications: parsed.data.currentMedications,
    addictions: parsed.data.addictions,
    pastDiseases: parsed.data.pastDiseases,
  };

  console.log('User details collected (placeholder):', userDetails);
  // TODO: Store these details in a persistent store (e.g., database).
  // TODO: Send this data to a data pipeline for model training.

  return {
    success: true,
    message: 'User details saved successfully!',
    redirectTo: '/chatbot',
    errors: {},
  };
}
