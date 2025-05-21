
'use server';

import { z } from 'zod';
import type { SignUpFormData } from '@/lib/types';

const SignUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
  confirmPassword: z.string(),
  countryCode: z.string().min(1, { message: 'Country code is required.' }),
  mobileNumber: z.string().min(5, { message: 'Valid mobile number is required.' }),
  captcha: z.boolean().refine(value => value === true, { message: 'Please confirm you are not a robot.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'], // Point error to confirmPassword field
});

export async function handleSignUp(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const parsed = SignUpSchema.safeParse({
    ...rawFormData,
    captcha: rawFormData.captcha === 'on',
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Invalid form data.',
    };
  }

  const { email, password, countryCode, mobileNumber } = parsed.data;

  // In a real app, hash the password before saving
  // const hashedPassword = await hashPassword(password);

  const newUserData: SignUpFormData = {
    email,
    password_hash: `hashed_${password}`, // Placeholder for actual hashing
    country_code: countryCode,
    mobile_number: mobileNumber,
  };

  console.log('New user sign-up data (placeholder):', newUserData);
  // TODO: Implement actual user creation logic (e.g., save to database)

  return {
    success: true,
    message: 'Sign up successful! Please proceed to sign in.',
    // In a real app, you might redirect or return a session token
  };
}
