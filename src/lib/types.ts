
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
