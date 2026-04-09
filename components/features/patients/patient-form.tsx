'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { PATIENT_STATUS_OPTIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '@/lib/constants/index';
import type { Patient, PatientStatus, Gender, MaritalStatus } from '@/types';

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'mainBranchId' | 'branchIds' | 'assignedStaffIds'>) => void;
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
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    age: initialData?.age?.toString() || '',
    gender: initialData?.gender || 'male',
    maritalStatus: initialData?.maritalStatus || 'single',
    contactNumber: initialData?.contactNumber || '',
    admissionDate: initialData?.admissionDate || new Date().toISOString().split('T')[0],
    medicalNotes: initialData?.medicalNotes || '',
    status: initialData?.status || 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (formData.firstName.trim() === '') {
      newErrors.firstName = 'First name is required';
    }
    if (formData.lastName.trim() === '') {
      newErrors.lastName = 'Last name is required';
    }
    if (formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) < 0) {
      newErrors.age = 'Please enter a valid age';
    }
    if (formData.contactNumber.trim() === '') {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.admissionDate) {
      newErrors.admissionDate = 'Admission date is required';
    }

    setErrors(newErrors);
  }, [formData]);

  const validate = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        email: formData.email,
        age: parseInt(formData.age),
        gender: formData.gender as Gender,
        maritalStatus: formData.maritalStatus as MaritalStatus,
        contactNumber: formData.contactNumber,
        admissionDate: formData.admissionDate,
        medicalNotes: formData.medicalNotes,
        status: formData.status as PatientStatus,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput
            label="First Name"
            placeholder="e.g., John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            error={errors.firstName}
            required
          />
          <FormInput
            label="Middle Name"
            placeholder="e.g., Michael"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          />
          <FormInput
            label="Last Name"
            placeholder="e.g., Anderson"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            error={errors.lastName}
            required
          />
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          label="Email"
          type="email"
          placeholder="e.g., john.anderson@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />
        <FormInput
          label="Contact Number"
          type="tel"
          placeholder="e.g., +1 (310) 555-1001"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          error={errors.contactNumber}
          required
        />
      </div>

      {/* Demographics Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          label="Marital Status"
          value={formData.maritalStatus}
          onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
          options={MARITAL_STATUS_OPTIONS}
          required
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={PATIENT_STATUS_OPTIONS}
          required
        />
      </div>

      {/* Admission Date */}
      <FormInput
        label="Admission Date"
        type="date"
        value={formData.admissionDate}
        onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
        error={errors.admissionDate}
        required
      />

      {/* Notes Section */}
      <FormTextarea
        label="Medical Notes"
        placeholder="Enter any relevant medical information..."
        value={formData.medicalNotes}
        onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
        rows={4}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.firstName ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </form>
  );
}
