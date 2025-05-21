
'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { handleUserDetails } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ageOptions = Array.from({ length: 100 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }));
const bloodGroupOptions = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
  { value: 'Unknown', label: 'Unknown' },
];
const addictionOptions = [
  { id: 'smoking', label: 'Smoking' },
  { id: 'drinking', label: 'Drinking Alcohol' },
  { id: 'drugs', label: 'Recreational Drugs' },
];

export default function UserDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, formAction] = useActionState(handleUserDetails, { success: false, errors: {}, message: '' });
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

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Please provide some additional information to help us assist you better.</CardDescription>
        </CardHeader>
        <form action={formAction} ref={formRef}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="John Doe" required />
              {formState.errors?.fullName && <p className="text-sm text-destructive">{formState.errors.fullName[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Select name="age" required>
                  <SelectTrigger id="age">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formState.errors?.age && <p className="text-sm text-destructive">{formState.errors.age[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select name="bloodGroup" required>
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroupOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formState.errors?.bloodGroup && <p className="text-sm text-destructive">{formState.errors.bloodGroup[0]}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies (if any, comma-separated)</Label>
              <Textarea id="allergies" name="allergies" placeholder="e.g., Pollen, Peanuts" />
              {formState.errors?.allergies && <p className="text-sm text-destructive">{formState.errors.allergies[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyDiseaseHistory">History of Family Diseases (if any)</Label>
              <Textarea id="familyDiseaseHistory" name="familyDiseaseHistory" placeholder="e.g., Diabetes (Mother), Hypertension (Father)" />
              {formState.errors?.familyDiseaseHistory && <p className="text-sm text-destructive">{formState.errors.familyDiseaseHistory[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentMedications">Current Medications (if any)</Label>
              <Textarea id="currentMedications" name="currentMedications" placeholder="e.g., Metformin 500mg daily" />
              {formState.errors?.currentMedications && <p className="text-sm text-destructive">{formState.errors.currentMedications[0]}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Any Addictions</Label>
              <div className="space-y-2">
                {addictionOptions.map(addiction => (
                  <div key={addiction.id} className="flex items-center space-x-2">
                    <Checkbox id={addiction.id} name="addictions" value={addiction.id} />
                    <Label htmlFor={addiction.id} className="font-normal">{addiction.label}</Label>
                  </div>
                ))}
              </div>
               {formState.errors?.addictions && <p className="text-sm text-destructive">{formState.errors.addictions[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pastDiseases">Any Significant Past Diseases/Surgeries</Label>
              <Textarea id="pastDiseases" name="pastDiseases" placeholder="e.g., Appendectomy (2010), Chickenpox (Childhood)" />
              {formState.errors?.pastDiseases && <p className="text-sm text-destructive">{formState.errors.pastDiseases[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Save Details</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
