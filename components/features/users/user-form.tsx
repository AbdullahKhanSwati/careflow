'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAFF_STATUS_OPTIONS, ROLE_OPTIONS, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '@/lib/constants/index';
import type { User, StaffStatus, UserRole, Gender, MaritalStatus } from '@/types';

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'branchId' | 'avatar' | 'assignedPatientIds'>) => void;
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
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    password: '',
    confirmPassword: '',
    age: initialData?.age?.toString() || '',
    gender: initialData?.gender || 'male',
    maritalStatus: initialData?.maritalStatus || 'single',
    contactNumber: initialData?.contactNumber || '',
    admissionDate: initialData?.admissionDate || new Date().toISOString().split('T')[0],
    role: initialData?.role || 'staff',
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = Boolean(initialData?.firstName);

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
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) < 18) {
      newErrors.age = 'Please enter a valid age (18+)';
    }
    if (formData.contactNumber.trim() === '') {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.admissionDate) {
      newErrors.admissionDate = 'Hire date is required';
    }

    setErrors(newErrors);
  }, [formData, isEditMode]);

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
        password: formData.password || undefined,
        age: parseInt(formData.age),
        gender: formData.gender as Gender,
        maritalStatus: formData.maritalStatus as MaritalStatus,
        contactNumber: formData.contactNumber,
        admissionDate: formData.admissionDate,
        role: formData.role as UserRole,
        status: formData.status as StaffStatus,
        notes: formData.notes,
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
            placeholder="e.g., Amanda"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            error={errors.firstName}
            required
          />
          <FormInput
            label="Middle Name"
            placeholder="e.g., Marie"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          />
          <FormInput
            label="Last Name"
            placeholder="e.g., Foster"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            error={errors.lastName}
            required
          />
        </div>
      </div>

      {/* Account Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Account Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
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
            label="Contact Number"
            type="tel"
            placeholder="e.g., +1 (310) 555-0001"
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            error={errors.contactNumber}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!isEditMode && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password {!isEditMode && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormInput
          label="Age"
          type="number"
          placeholder="e.g., 35"
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
        <FormInput
          label="Hire Date"
          type="date"
          value={formData.admissionDate}
          onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
          error={errors.admissionDate}
          required
        />
      </div>

      {/* Role and Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={ROLE_OPTIONS}
          required
        />
        <FormSelect
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={STAFF_STATUS_OPTIONS}
          required
        />
      </div>

      {/* Notes Section */}
      <FormTextarea
        label="Notes"
        placeholder="Enter any relevant notes about this staff member..."
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={4}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Update Staff' : 'Add Staff'}
        </Button>
      </div>
    </form>
  );
}
