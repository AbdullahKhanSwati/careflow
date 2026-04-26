'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { STATUS_OPTIONS } from '@/lib/constants';
import type { Structure } from '@/types';

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
    name: initialData?.name || '',
    description: initialData?.description || '',
    regionCode: initialData?.regionCode || '',
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.regionCode.trim()) {
      newErrors.regionCode = 'Region code is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name,
        description: formData.description,
        regionCode: formData.regionCode,
        status: formData.status as 'active' | 'inactive' | 'pending',
        notes: formData.notes,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          label="Structure Name"
          placeholder="e.g., California Region"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />
        <FormInput
          label="Region Code"
          placeholder="e.g., CA-001"
          value={formData.regionCode}
          onChange={(e) => setFormData({ ...formData, regionCode: e.target.value })}
          error={errors.regionCode}
          required
        />
      </div>

      <FormTextarea
        label="Description"
        placeholder="Describe this structure..."
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        required
      />

      <FormSelect
        label="Status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        options={STATUS_OPTIONS}
        required
      />

      <FormTextarea
        label="Notes"
        placeholder="Additional notes (optional)"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Structure' : 'Create Structure'}
        </Button>
      </div>
    </form>
  );
}
