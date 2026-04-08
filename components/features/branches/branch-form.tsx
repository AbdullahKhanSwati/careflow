'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { STATUS_OPTIONS } from '@/lib/constants';
import type { Branch } from '@/types';

interface BranchFormProps {
  initialData?: Partial<Branch>;
  onSubmit: (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt' | 'structureId' | 'patientCount' | 'userCount'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BranchForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: BranchFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    contactNumber: initialData?.contactNumber || '',
    email: initialData?.email || '',
    status: initialData?.status || 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        contactNumber: formData.contactNumber,
        email: formData.email,
        status: formData.status as 'active' | 'inactive' | 'pending',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormInput
        label="Branch Name"
        placeholder="e.g., Los Angeles Medical Center"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <FormInput
        label="Address"
        placeholder="e.g., 123 Healthcare Blvd, Suite 100"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        error={errors.address}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          label="City"
          placeholder="e.g., Los Angeles"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          error={errors.city}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          label="Contact Number"
          type="tel"
          placeholder="e.g., +1 (310) 555-0101"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          error={errors.contactNumber}
          required
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="e.g., branch@careflow.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Branch' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
}
