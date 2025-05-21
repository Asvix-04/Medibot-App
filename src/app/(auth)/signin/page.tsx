
'use client';

import { useFormState } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { handleSignIn, handleSocialSignIn } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Simple SVG icons for Google and Facebook as lucide-react doesn't have them directly
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.94 11.06A10.06 10.06 0 0 0 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c4.44 0 8.22-2.81 9.49-6.69H12v-3.91h7.44c.2.91.36 1.85.36 2.85a10.7 10.7 0 0 1-2.36 6.88 10.26 10.26 0 0 1-6.94 3.75M22 12l-2-2-2 2 2 2 2-2z"/>
  </svg>
);

const FacebookIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);


export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, formAction] = useFormState(handleSignIn, { success: false, errors: {}, message: '' });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formState.message) {
      toast({
        title: formState.success ? 'Success' : 'Error',
        description: formState.message,
        variant: formState.success ? 'default' : 'destructive',
      });
      if (formState.success && formState.redirectTo) {
        router.push(formState.redirectTo);
      }
    }
  }, [formState, toast, router]);

  const onSocialSignIn = async (provider: 'google' | 'facebook') => {
    const result = await handleSocialSignIn(provider);
     toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Welcome back to MediAssistant.</CardDescription>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">Sign In</Button>
          <Separator />
          <Button variant="outline" className="w-full" onClick={() => onSocialSignIn('google')} type="button">
            <GoogleIcon /> Sign In with Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => onSocialSignIn('facebook')} type="button">
            <FacebookIcon /> Sign In with Facebook
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign Up</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
