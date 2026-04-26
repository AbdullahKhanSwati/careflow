'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-input';
import { STATUS_OPTIONS } from '@/lib/constants';
import { allowedChildTypes } from '@/lib/utils/node-tree';
import { NodeIcon } from './node-icon';
import { NODE_TYPE_LABEL } from '@/lib/constants/node-colors';
import type { Node, NodeType } from '@/types';

export type NodeFormValues = {
  type: NodeType;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  // department
  code?: string;
  notes?: string;
  // location
  address?: string;
  city?: string;
  contactNumber?: string;
  email?: string;
  // program
  schedule?: string;
  area?: string;
};

interface NodeFormProps {
  parent: Node;
  /** Restrict the type picker — defaults to whatever the parent allows. */
  allowedTypes?: NodeType[];
  /** Pre-select a type, useful when the page already filters by type. */
  defaultType?: NodeType;
  initialData?: Partial<NodeFormValues>;
  onSubmit: (values: NodeFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Single form that renders the right fields for whichever child node type the
 * user picks. The picker is hidden when only one type is allowed (e.g. under
 * the root only departments are permitted).
 */
export function NodeForm({
  parent,
  allowedTypes,
  defaultType,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: NodeFormProps) {
  const types = useMemo(() => {
    const fromParent = allowedChildTypes(parent.type);
    if (!allowedTypes) return fromParent;
    return fromParent.filter((t) => allowedTypes.includes(t));
  }, [parent.type, allowedTypes]);

  const [type, setType] = useState<NodeType>(
    defaultType && types.includes(defaultType) ? defaultType : types[0] ?? 'department'
  );

  const [values, setValues] = useState<NodeFormValues>({
    type,
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    status: (initialData?.status as NodeFormValues['status']) ?? 'active',
    code: initialData?.code ?? '',
    notes: initialData?.notes ?? '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    contactNumber: initialData?.contactNumber ?? '',
    email: initialData?.email ?? '',
    schedule: initialData?.schedule ?? '',
    area: initialData?.area ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof NodeFormValues>(key: K, value: NodeFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = 'Name is required';
    if (type === 'location') {
      if (!values.address?.trim()) next.address = 'Address is required';
      if (!values.city?.trim()) next.city = 'City is required';
      if (!values.contactNumber?.trim())
        next.contactNumber = 'Contact number is required';
      if (!values.email?.trim()) next.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(values.email))
        next.email = 'Please enter a valid email';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...values, type });
  };

  const showTypePicker = types.length > 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <NodeIcon type={parent.type} level={parent.level} size="sm" />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Adding under
          </p>
          <p className="font-medium text-foreground truncate">{parent.name}</p>
        </div>
      </div>

      {showTypePicker && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Node type<span className="text-destructive ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {types.map((t) => (
              <NodeTypeOption
                key={t}
                type={t}
                selected={type === t}
                onSelect={() => setType(t)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          label="Name"
          placeholder={
            type === 'department'
              ? 'e.g., Specialty Care'
              : type === 'location'
                ? 'e.g., Manhattan Medical Center'
                : 'e.g., School Screening Program'
          }
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          required
        />
        <FormSelect
          label="Status"
          value={values.status}
          onChange={(e) => set('status', e.target.value as NodeFormValues['status'])}
          options={STATUS_OPTIONS}
          required
        />
      </div>

      <FormTextarea
        label="Description"
        placeholder="Short description (optional)"
        value={values.description ?? ''}
        onChange={(e) => set('description', e.target.value)}
      />

      {type === 'department' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            label="Code"
            placeholder="e.g., CLIN-PC"
            value={values.code ?? ''}
            onChange={(e) => set('code', e.target.value)}
          />
          <FormInput
            label="Notes"
            placeholder="Optional notes"
            value={values.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      )}

      {type === 'location' && (
        <div className="space-y-5">
          <FormInput
            label="Address"
            placeholder="e.g., 123 Healthcare Blvd, Suite 100"
            value={values.address ?? ''}
            onChange={(e) => set('address', e.target.value)}
            error={errors.address}
            required
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="City"
              placeholder="e.g., Los Angeles"
              value={values.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
              error={errors.city}
              required
            />
            <FormInput
              label="Contact number"
              type="tel"
              placeholder="e.g., +1 (310) 555-0101"
              value={values.contactNumber ?? ''}
              onChange={(e) => set('contactNumber', e.target.value)}
              error={errors.contactNumber}
              required
            />
          </div>
          <FormInput
            label="Email"
            type="email"
            placeholder="e.g., branch@careflow.com"
            value={values.email ?? ''}
            onChange={(e) => set('email', e.target.value)}
            error={errors.email}
            required
          />
        </div>
      )}

      {type === 'program' && (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="Service area"
              placeholder="e.g., Greater Los Angeles"
              value={values.area ?? ''}
              onChange={(e) => set('area', e.target.value)}
            />
            <FormInput
              label="Schedule"
              placeholder="e.g., Mon, Wed, Fri"
              value={values.schedule ?? ''}
              onChange={(e) => set('schedule', e.target.value)}
            />
          </div>
          <FormInput
            label="Contact number"
            type="tel"
            placeholder="e.g., +1 (310) 555-9111"
            value={values.contactNumber ?? ''}
            onChange={(e) => set('contactNumber', e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : `Create ${NODE_TYPE_LABEL[type]}`}
        </Button>
      </div>
    </form>
  );
}

function NodeTypeOption({
  type,
  selected,
  onSelect,
}: {
  type: NodeType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:bg-muted/50'
      }`}
    >
      <NodeIcon type={type} size="sm" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {NODE_TYPE_LABEL[type]}
        </p>
        <p className="text-xs text-muted-foreground">
          {type === 'department'
            ? 'Sub-grouping'
            : type === 'location'
              ? 'Physical branch'
              : 'Outreach group'}
        </p>
      </div>
    </button>
  );
}
