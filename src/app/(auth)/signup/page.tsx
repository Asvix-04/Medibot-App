
'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { handleSignUp } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const countryCodes = [
  { value: '+1', label: '+1 (USA/CAN)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+61', label: '+61 (Australia)' },
  // Add more country codes as needed
];

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, formAction] = useActionState(handleSignUp, { success: false, errors: {}, message: '' });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formState.message) {
      toast({
        title: formState.success ? 'Success' : 'Error',
        description: formState.message,
        variant: formState.success ? 'default' : 'destructive',
      });
      if (formState.success) {
        formRef.current?.reset();
        // Optionally redirect to sign-in page
        // router.push('/signin');
      }
    }
  }, [formState, toast, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Enter your details to sign up for Medibot.</CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            {formState.errors?.email && <p className="text-sm text-destructive">{formState.errors.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {formState.errors?.password && <p className="text-sm text-destructive">{formState.errors.password[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Re-enter Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
            {formState.errors?.confirmPassword && <p className="text-sm text-destructive">{formState.errors.confirmPassword[0]}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="countryCode">Code</Label>
              <Select name="countryCode" required>
                <SelectTrigger id="countryCode">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map(cc => (
                    <SelectItem key={cc.value} value={cc.value}>{cc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formState.errors?.countryCode && <p className="text-sm text-destructive">{formState.errors.countryCode[0]}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input id="mobileNumber" name="mobileNumber" type="tel" placeholder="Mobile number" required />
              {formState.errors?.mobileNumber && <p className="text-sm text-destructive">{formState.errors.mobileNumber[0]}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="captcha" name="captcha" />
            <Label htmlFor="captcha" className="text-sm font-normal">I am not a robot</Label>
          </div>
          {formState.errors?.captcha && <p className="text-sm text-destructive">{formState.errors.captcha[0]}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">Sign Up</Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link href="/signin" className="text-primary hover:underline">Sign In</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
