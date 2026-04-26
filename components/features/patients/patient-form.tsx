'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { STATUS_OPTIONS, GENDER_OPTIONS } from '@/lib/constants';
import type { Patient } from '@/types';

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'branchId'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PatientFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    age: initialData?.age?.toString() || '',
    gender: initialData?.gender || 'male',
    contactNumber: initialData?.contactNumber || '',
    address: initialData?.address || '',
    medicalNotes: initialData?.medicalNotes || '',
    status: initialData?.status || 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) < 0) {
      newErrors.age = 'Please enter a valid age';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        fullName: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender as 'male' | 'female' | 'other',
        contactNumber: formData.contactNumber,
        address: formData.address,
        medicalNotes: formData.medicalNotes,
        status: formData.status as 'active' | 'inactive' | 'pending',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormInput
        label="Full Name"
        placeholder="e.g., John Anderson"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        error={errors.fullName}
        required
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <FormInput
          label="Age"
          type="number"
          placeholder="e.g., 45"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          error={errors.age}
          required
        />
        <FormSelect
          label="Gender"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          options={GENDER_OPTIONS}
          required
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={STATUS_OPTIONS}
          required
        />
      </div>

      <FormInput
        label="Contact Number"
        type="tel"
        placeholder="e.g., +1 (310) 555-1001"
        value={formData.contactNumber}
        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
        error={errors.contactNumber}
        required
      />

      <FormInput
        label="Address"
        placeholder="e.g., 123 Main St, Los Angeles, CA 90001"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        error={errors.address}
        required
      />

      <FormTextarea
        label="Medical Notes"
        placeholder="Enter any relevant medical information..."
        value={formData.medicalNotes}
        onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </form>
  );
}
