
export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  sources?: string[];
};

export type SignUpFormData = {
  email: string;
  password_hash: string; // Store hash, not plain password
  mobile_number: string;
  country_code: string;
  // captcha is not part of the data to store, it's for validation only
};

export type SignInFormData = {
  email: string;
  password_hash: string; // Compare with stored hash
};

export type UserDetailsFormData = {
  fullName: string;
  age: string;
  bloodGroup: string;
  allergies?: string;
  familyDiseaseHistory?: string;
  currentMedications?: string;
  addictions?: string[]; // e.g., ['smoking', 'drinking']
  pastDiseases?: string;
};

// Defines the shape of the state object returned by server actions
// and used by useActionState.
export type ActionFormState<TFields = Record<string, any>> = {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof TFields]?: string[];
  } & { _form?: string[] }; // For general form errors not tied to a specific field
  redirectTo?: string;
};
