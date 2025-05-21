
'use server';

import { z } from 'zod';
import type { SignInFormData } from '@/lib/types';

const SignInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function handleSignIn(formData: FormData) {
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

  const signInData: SignInFormData = {
    email,
    password_hash: `hashed_${password}`, // In a real app, compare hashed password
  };

  console.log('User sign-in attempt (placeholder):', signInData);
  // TODO: Implement actual user authentication (e.g., check against database, create session)

  // Simulate successful sign-in for now
  if (email === 'test@example.com' && password === 'password123') {
    return {
      success: true,
      message: 'Sign in successful!',
      redirectTo: '/user-details', // Or '/chatbot' if details are already filled
    };
  } else {
     return {
      success: false,
      message: 'Invalid email or password.',
      errors: {},
    };
  }
}

export async function handleSocialSignIn(provider: 'google' | 'facebook') {
  console.log(`Social sign-in attempt with ${provider} (placeholder)`);
  // TODO: Implement actual social sign-in logic (OAuth flow)
  // This would typically redirect to the OAuth provider and then back to a callback URL

  // Simulate successful social sign-in for now
  return {
    success: true,
    message: `Sign in with ${provider} successful!`,
    redirectTo: '/user-details', // Or '/chatbot'
  };
}
