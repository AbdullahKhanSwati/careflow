'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { STATUS_OPTIONS, ROLE_OPTIONS } from '@/lib/constants';
import type { Status, User, UserRole } from '@/types';

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'nodeId' | 'avatar'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'staff',
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as 'admin' | 'staff',
        status: formData.status as 'active' | 'inactive' | 'pending',
        notes: formData.notes,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormInput
        label="Full Name"
        placeholder="e.g., Dr. Amanda Foster"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        error={errors.fullName}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          label="Email"
          type="email"
          placeholder="e.g., amanda.foster@careflow.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
        />
        <FormInput
          label="Phone"
          type="tel"
          placeholder="e.g., +1 (310) 555-0001"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormSelect
          label="Role"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value as UserRole })
          }
          options={ROLE_OPTIONS}
          required
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as Status })
          }
          options={STATUS_OPTIONS}
          required
        />
      </div>

      <FormTextarea
        label="Notes"
        placeholder="Enter any relevant notes about this staff member..."
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Staff' : 'Add Staff'}
        </Button>
      </div>
    </form>
  );
}
