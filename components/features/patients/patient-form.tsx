'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components/ui/form-input';
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/constants';
import type { Gender, MaritalStatus, Patient, Status } from '@/types';

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'nodeId'>
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  age: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  email: string;
  contactNumber: string;
  alternatePhone: string;
  address: string;
  admissionDate: string;
  status: Status;
  medicalNotes: string;
}

function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function splitFullName(fullName?: string) {
  if (!fullName) return { first: '', middle: '', last: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
  if (parts.length === 2)
    return { first: parts[0], middle: '', last: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(' '),
    last: parts[parts.length - 1],
  };
}

/**
 * Patient registration form. Sections (Personal · Contact · Admission)
 * mirror the user-supplied design and keep the dialog scannable when the
 * dialog is short on vertical room.
 */
export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PatientFormProps) {
  const fallback = splitFullName(initialData?.fullName);

  const [data, setData] = useState<FormState>({
    firstName: initialData?.firstName ?? fallback.first,
    middleName: initialData?.middleName ?? fallback.middle,
    lastName: initialData?.lastName ?? fallback.last,
    age: initialData?.age?.toString() ?? '',
    gender: (initialData?.gender ?? 'male') as Gender,
    maritalStatus: (initialData?.maritalStatus ?? 'single') as MaritalStatus,
    email: initialData?.email ?? '',
    contactNumber: initialData?.contactNumber ?? '',
    alternatePhone: initialData?.alternatePhone ?? '',
    address: initialData?.address ?? '',
    admissionDate: initialData?.admissionDate ?? todayISO(),
    status: (initialData?.status ?? 'active') as Status,
    medicalNotes: initialData?.medicalNotes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!data.firstName.trim()) next.firstName = 'First name is required';
    if (!data.lastName.trim()) next.lastName = 'Last name is required';
    if (!data.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email))
      next.email = 'Please enter a valid email';
    const ageNum = parseInt(data.age, 10);
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 130)
      next.age = 'Enter a valid age';
    if (!data.contactNumber.trim())
      next.contactNumber = 'Contact number is required';
    if (!data.address.trim()) next.address = 'Address is required';
    if (!data.admissionDate) next.admissionDate = 'Admission date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const fullName = [data.firstName.trim(), data.middleName.trim(), data.lastName.trim()]
      .filter(Boolean)
      .join(' ');
    onSubmit({
      fullName,
      firstName: data.firstName.trim(),
      middleName: data.middleName.trim() || undefined,
      lastName: data.lastName.trim(),
      age: parseInt(data.age, 10),
      gender: data.gender,
      maritalStatus: data.maritalStatus,
      email: data.email.trim(),
      contactNumber: data.contactNumber.trim(),
      alternatePhone: data.alternatePhone.trim() || undefined,
      address: data.address.trim(),
      admissionDate: data.admissionDate,
      status: data.status,
      medicalNotes: data.medicalNotes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Personal Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput
            label="First Name"
            placeholder="e.g., John"
            value={data.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          <FormInput
            label="Middle Name"
            placeholder="e.g., Michael"
            value={data.middleName}
            onChange={(e) => set('middleName', e.target.value)}
          />
          <FormInput
            label="Last Name"
            placeholder="e.g., Anderson"
            value={data.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput
            label="Age"
            type="number"
            min={0}
            max={130}
            placeholder="e.g., 45"
            value={data.age}
            onChange={(e) => set('age', e.target.value)}
            error={errors.age}
            required
          />
          <FormSelect
            label="Gender"
            value={data.gender}
            onChange={(e) => set('gender', e.target.value as Gender)}
            options={GENDER_OPTIONS}
            required
          />
          <FormSelect
            label="Marital Status"
            value={data.maritalStatus}
            onChange={(e) =>
              set('maritalStatus', e.target.value as MaritalStatus)
            }
            options={MARITAL_STATUS_OPTIONS}
            required
          />
        </div>
      </Section>

      <Section title="Contact Information">
        <FormInput
          label="Email"
          type="email"
          placeholder="e.g., john@example.com"
          value={data.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Contact Number"
            type="tel"
            placeholder="e.g., +1 (555) 123-4567"
            value={data.contactNumber}
            onChange={(e) => set('contactNumber', e.target.value)}
            error={errors.contactNumber}
            required
          />
          <FormInput
            label="Alternate Phone"
            type="tel"
            placeholder="e.g., +1 (310) 555-1001"
            value={data.alternatePhone}
            onChange={(e) => set('alternatePhone', e.target.value)}
          />
        </div>

        <FormInput
          label="Address"
          placeholder="e.g., 123 Main St, Los Angeles, CA 90001"
          value={data.address}
          onChange={(e) => set('address', e.target.value)}
          error={errors.address}
          required
        />
      </Section>

      <Section title="Admission Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Admission Date"
            type="date"
            value={data.admissionDate}
            onChange={(e) => set('admissionDate', e.target.value)}
            error={errors.admissionDate}
            required
          />
          <FormSelect
            label="Status"
            value={data.status}
            onChange={(e) => set('status', e.target.value as Status)}
            options={STATUS_OPTIONS}
            required
          />
        </div>

        <FormTextarea
          label="Medical Notes"
          placeholder="Enter any relevant medical information..."
          value={data.medicalNotes}
          onChange={(e) => set('medicalNotes', e.target.value)}
        />
      </Section>

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : initialData
              ? 'Update Patient'
              : 'Add Patient'}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
