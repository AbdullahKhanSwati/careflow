'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { LocationSelector } from '@/components/ui/location-selector';
import { TimezoneSelector } from '@/components/ui/timezone-selector';
import { STATUS_OPTIONS, FACILITY_TYPE_OPTIONS } from '@/lib/constants/index';
import type { Structure, Status, FacilityType } from '@/types';

interface StructureFormProps {
  initialData?: Partial<Structure>;
  onSubmit: (data: Omit<Structure, 'id' | 'createdAt' | 'updatedAt' | 'branchCount'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StructureForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: StructureFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    code: initialData?.code || '',
    type: initialData?.type || 'hospital',
    license: initialData?.license || '',
    licenseExpiry: initialData?.licenseExpiry || '',
    address: initialData?.address || '',
    address2: initialData?.address2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    county: initialData?.county || '',
    country: initialData?.country || '',
    phone: initialData?.phone || '',
    phoneExtension: initialData?.phoneExtension || '',
    fax: initialData?.fax || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    timezone: initialData?.timezone || 'America/New_York',
    notes: initialData?.notes || '',
    status: initialData?.status || 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation - run whenever form data changes
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    if (formData.code.trim() === '') {
      newErrors.code = 'Code is required';
    }
    if (formData.license.trim() === '') {
      newErrors.license = 'License is required';
    }
    if (!formData.licenseExpiry) {
      newErrors.licenseExpiry = 'License expiry is required';
    }
    if (formData.address.trim() === '') {
      newErrors.address = 'Address is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    if (formData.zipCode.trim() === '') {
      newErrors.zipCode = 'ZIP code is required';
    }
    if (formData.phone.trim() === '') {
      newErrors.phone = 'Phone is required';
    }
    if (formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (formData.county.trim() === '') {
      newErrors.county = 'County is required';
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
        title: formData.title,
        code: formData.code,
        type: formData.type as FacilityType,
        license: formData.license,
        licenseExpiry: formData.licenseExpiry,
        address: formData.address,
        address2: formData.address2 || undefined,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        county: formData.county,
        country: formData.country,
        phone: formData.phone,
        phoneExtension: formData.phoneExtension || undefined,
        fax: formData.fax || undefined,
        email: formData.email,
        website: formData.website || undefined,
        timezone: formData.timezone,
        notes: formData.notes,
        status: formData.status as Status,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormInput
            label="Title"
            placeholder="e.g., California Health Center"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            required
          />
          <FormInput
            label="Code"
            placeholder="e.g., CA-001"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            error={errors.code}
            required
          />
          <FormSelect
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={FACILITY_TYPE_OPTIONS}
            required
          />
        </div>
      </div>

      {/* License Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">License Information</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormInput
            label="License Number"
            placeholder="e.g., LIC-12345"
            value={formData.license}
            onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            error={errors.license}
            required
          />
          <FormInput
            label="License Expiry"
            type="date"
            value={formData.licenseExpiry}
            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
            error={errors.licenseExpiry}
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
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Address Line 1"
            placeholder="e.g., 123 Healthcare Blvd"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
            required
          />
          <FormInput
            label="Address Line 2"
            placeholder="e.g., Suite 100"
            value={formData.address2}
            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
          />
        </div>
        
        <LocationSelector
          country={formData.country}
          state={formData.state}
          city={formData.city}
          onCountryChange={(value) => setFormData({ ...formData, country: value })}
          onStateChange={(value) => setFormData({ ...formData, state: value })}
          onCityChange={(value) => setFormData({ ...formData, city: value })}
          error={{
            country: errors.country,
            state: errors.state,
            city: errors.city,
          }}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput
            label="ZIP Code"
            placeholder="e.g., 90001"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            error={errors.zipCode}
            required
          />
          <FormInput
            label="County"
            placeholder="e.g., Los Angeles"
            value={formData.county}
            onChange={(e) => setFormData({ ...formData, county: e.target.value })}
          />
          <TimezoneSelector
            value={formData.timezone}
            onChange={(value) => setFormData({ ...formData, timezone: value })}
            required
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
            placeholder="e.g., +1 (310) 555-0101"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
            required
          />
          <FormInput
            label="Phone Extension"
            placeholder="e.g., 123"
            value={formData.phoneExtension}
            onChange={(e) => setFormData({ ...formData, phoneExtension: e.target.value })}
          />
          <FormInput
            label="Fax"
            type="tel"
            placeholder="e.g., +1 (310) 555-0102"
            value={formData.fax}
            onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Email"
            type="email"
            placeholder="e.g., info@facility.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
          <FormInput
            label="Website"
            type="url"
            placeholder="e.g., https://www.facility.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
      </div>

      {/* Notes */}
      <FormTextarea
        label="Notes"
        placeholder="Additional notes (optional)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={4}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.title ? 'Update Structure' : 'Create Structure'}
        </Button>
      </div>
    </form>
  );
}
