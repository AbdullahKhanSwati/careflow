'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { LocationSelector } from '@/components/ui/location-selector';
import {
  PROVIDER_TYPE_OPTIONS,
  PROVIDER_SPECIALTY_OPTIONS,
  PROVIDER_STATUS_OPTIONS,
  GENDER_OPTIONS,
} from '@/lib/constants/index';
import type { Provider, ProviderType, ProviderSpecialty, Status, Gender } from '@/types';

interface ProviderFormProps {
  initialData?: Partial<Provider>;
  onSubmit: (data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProviderForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProviderFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    providerType: initialData?.providerType || 'individual',
    npiNumber: initialData?.npiNumber || '',
    specialty: initialData?.specialty || 'general_practice',
    licenseNumber: initialData?.licenseNumber || '',
    licenseExpiry: initialData?.licenseExpiry || '',
    gender: initialData?.gender || 'male',
    phone: initialData?.phone || '',
    phoneExtension: initialData?.phoneExtension || '',
    fax: initialData?.fax || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    address2: initialData?.address2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    country: initialData?.country || '',
    primaryLocation: initialData?.primaryLocation || false,
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate only touched fields
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (touched.firstName && formData.firstName.trim() === '') {
      newErrors.firstName = 'First name is required';
    }
    if (touched.lastName && formData.lastName.trim() === '') {
      newErrors.lastName = 'Last name is required';
    }
    if (touched.npiNumber && formData.npiNumber.trim() === '') {
      newErrors.npiNumber = 'NPI number is required';
    }
    if (touched.email && formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (touched.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (touched.phone && formData.phone.trim() === '') {
      newErrors.phone = 'Phone is required';
    }
    if (touched.address && formData.address.trim() === '') {
      newErrors.address = 'Address is required';
    }
    if (touched.country && !formData.country) {
      newErrors.country = 'Country is required';
    }
    if (touched.state && !formData.state) {
      newErrors.state = 'State is required';
    }
    if (touched.city && !formData.city) {
      newErrors.city = 'City is required';
    }
    if (touched.zipCode && formData.zipCode.trim() === '') {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
  }, [formData, touched]);

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateAllFields = () => {
    const allFields = ['firstName', 'lastName', 'npiNumber', 'email', 'phone', 'address', 'country', 'state', 'city', 'zipCode'];
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    const newErrors: Record<string, string> = {};
    if (formData.firstName.trim() === '') newErrors.firstName = 'First name is required';
    if (formData.lastName.trim() === '') newErrors.lastName = 'Last name is required';
    if (formData.npiNumber.trim() === '') newErrors.npiNumber = 'NPI number is required';
    if (formData.email.trim() === '') newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (formData.phone.trim() === '') newErrors.phone = 'Phone is required';
    if (formData.address.trim() === '') newErrors.address = 'Address is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (formData.zipCode.trim() === '') newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAllFields()) {
      onSubmit({
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        providerType: formData.providerType as ProviderType,
        npiNumber: formData.npiNumber,
        specialty: formData.specialty as ProviderSpecialty,
        licenseNumber: formData.licenseNumber || undefined,
        licenseExpiry: formData.licenseExpiry || undefined,
        gender: formData.gender as Gender,
        phone: formData.phone,
        phoneExtension: formData.phoneExtension || undefined,
        fax: formData.fax || undefined,
        email: formData.email,
        address: formData.address,
        address2: formData.address2 || undefined,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        primaryLocation: formData.primaryLocation,
        status: formData.status as Status,
        notes: formData.notes || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Provider Type Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Provider Type</h3>
        <FormSelect
          label="Provider Type"
          value={formData.providerType}
          onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
          options={PROVIDER_TYPE_OPTIONS}
          required
        />
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormInput
            label="First Name"
            placeholder="e.g., John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            onBlur={() => handleFieldBlur('firstName')}
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
            placeholder="e.g., Smith"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            onBlur={() => handleFieldBlur('lastName')}
            error={errors.lastName}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormSelect
            label="Gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            options={GENDER_OPTIONS}
            required
          />
          <FormSelect
            label="Specialty"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            options={PROVIDER_SPECIALTY_OPTIONS}
            required
          />
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={PROVIDER_STATUS_OPTIONS}
            required
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Professional Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormInput
            label="NPI Number"
            placeholder="e.g., 1234567890"
            value={formData.npiNumber}
            onChange={(e) => setFormData({ ...formData, npiNumber: e.target.value })}
            onBlur={() => handleFieldBlur('npiNumber')}
            error={errors.npiNumber}
            required
          />
          <FormInput
            label="License Number"
            placeholder="e.g., MD-12345"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          />
          <FormInput
            label="License Expiry"
            type="date"
            value={formData.licenseExpiry}
            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormInput
            label="Phone"
            type="tel"
            placeholder="e.g., (555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            onBlur={() => handleFieldBlur('phone')}
            error={errors.phone}
            required
          />
          <FormInput
            label="Extension"
            placeholder="e.g., 101"
            value={formData.phoneExtension}
            onChange={(e) => setFormData({ ...formData, phoneExtension: e.target.value })}
          />
          <FormInput
            label="Fax"
            type="tel"
            placeholder="e.g., (555) 123-4568"
            value={formData.fax}
            onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
          />
        </div>
        <FormInput
          label="Email"
          type="email"
          placeholder="e.g., doctor@healthcare.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onBlur={() => handleFieldBlur('email')}
          error={errors.email}
          required
        />
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Address Line 1"
            placeholder="e.g., 123 Medical Plaza"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            onBlur={() => handleFieldBlur('address')}
            error={errors.address}
            required
          />
          <FormInput
            label="Address Line 2"
            placeholder="e.g., Suite 200"
            value={formData.address2}
            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
          />
        </div>

        <LocationSelector
          country={formData.country}
          state={formData.state}
          city={formData.city}
          onCountryChange={(value) => {
            setFormData({ ...formData, country: value });
            handleFieldBlur('country');
          }}
          onStateChange={(value) => {
            setFormData({ ...formData, state: value });
            handleFieldBlur('state');
          }}
          onCityChange={(value) => {
            setFormData({ ...formData, city: value });
            handleFieldBlur('city');
          }}
          error={{
            country: errors.country,
            state: errors.state,
            city: errors.city,
          }}
        />

        <FormInput
          label="ZIP Code"
          placeholder="e.g., 90001"
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          onBlur={() => handleFieldBlur('zipCode')}
          error={errors.zipCode}
          required
        />
      </div>

      {/* Additional */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="primaryLocation"
            checked={formData.primaryLocation}
            onChange={(e) => setFormData({ ...formData, primaryLocation: e.target.checked })}
            className="w-4 h-4 rounded border-input cursor-pointer"
          />
          <label htmlFor="primaryLocation" className="text-sm font-medium cursor-pointer">
            Primary Location
          </label>
        </div>

        <FormTextarea
          label="Notes"
          placeholder="Additional notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.firstName ? 'Update Provider' : 'Create Provider'}
        </Button>
      </div>
    </form>
  );
}
