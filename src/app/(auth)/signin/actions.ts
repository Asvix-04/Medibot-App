
'use server';

import { z } from 'zod';
import type { SignInFormData, ActionFormState } from '@/lib/types';

const SignInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function handleSignIn(
  prevState: ActionFormState<SignInFormData>,
  formData: FormData
): Promise<ActionFormState<SignInFormData>> {
  const rawFormData = Object.fromEntries(formData.entries());
  const parsed = SignInSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Invalid form data.',
    };
  }

  const { email, password } = parsed.data;

  // In a real app, you would compare the hashed password from the database
  // For this placeholder, we'll simulate a successful login for specific credentials
  const signInData: SignInFormData = {
    email,
    password_hash: `hashed_${password}`, // Placeholder
  };
  console.log('User sign-in attempt (placeholder):', signInData);


  // Simulate successful sign-in for now
  if (email === 'test@example.com' && password === 'password123') {
    return {
      success: true,
      message: 'Sign in successful!',
      redirectTo: '/user-details', // Or '/chatbot' if details are already filled
      errors: {},
    };
  } else {
     return {
      success: false,
      message: 'Invalid email or password.',
      errors: { _form: ['Invalid email or password.'] }, // Example of a form-level error
    };
  }
}

export async function handleSocialSignIn(provider: 'google' | 'facebook'): Promise<ActionFormState> {
  console.log(`Social sign-in attempt with ${provider} (placeholder)`);
  // TODO: Implement actual social sign-in logic (OAuth flow)

  // Simulate successful social sign-in for now
  return {
    success: true,
    message: `Sign in with ${provider} successful!`,
    redirectTo: '/user-details',
  };
}
