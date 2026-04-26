'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components/ui/form-input';
import {
  CITIES_BY_STATE,
  COUNTRY_OPTIONS,
  GENDER_OPTIONS,
  PROVIDER_TYPE_OPTIONS,
  SPECIALTY_OPTIONS,
  STATES_BY_COUNTRY,
  STATUS_OPTIONS,
} from '@/lib/constants';
import type {
  Gender,
  Provider,
  ProviderSpecialty,
  ProviderType,
  Status,
} from '@/types';

interface ProviderFormProps {
  initialData?: Partial<Provider>;
  /** When supplied, the form shows an "Attached to" picker so the new
   *  provider can be slotted into a node in the hierarchy. */
  nodeOptions?: { value: string; label: string }[];
  onSubmit: (
    data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt' | 'avatar'>
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormState {
  providerType: ProviderType;
  nodeId: string;

  // Individual
  firstName: string;
  middleName: string;
  lastName: string;
  gender: Gender;

  // Organization
  organizationName: string;

  specialty: ProviderSpecialty;
  status: Status;

  // Professional
  npiNumber: string;
  licenseNumber: string;
  licenseExpiry: string;

  // Contact
  phone: string;
  extension: string;
  fax: string;
  email: string;

  // Address
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  isPrimaryLocation: boolean;

  notes: string;
}

/**
 * Healthcare provider registration form. Toggles between Individual and
 * Organization shapes; address pickers cascade country → state → city.
 */
export function ProviderForm({
  initialData,
  nodeOptions,
  onSubmit,
  onCancel,
  isLoading,
}: ProviderFormProps) {
  const [data, setData] = useState<FormState>({
    providerType: (initialData?.providerType ?? 'individual') as ProviderType,
    nodeId: initialData?.nodeId ?? nodeOptions?.[0]?.value ?? '',

    firstName: initialData?.firstName ?? '',
    middleName: initialData?.middleName ?? '',
    lastName: initialData?.lastName ?? '',
    gender: (initialData?.gender ?? 'male') as Gender,

    organizationName: initialData?.organizationName ?? initialData?.fullName ?? '',

    specialty: (initialData?.specialty ?? 'general') as ProviderSpecialty,
    status: (initialData?.status ?? 'active') as Status,

    npiNumber: initialData?.npiNumber ?? '',
    licenseNumber: initialData?.licenseNumber ?? '',
    licenseExpiry: initialData?.licenseExpiry ?? '',

    phone: initialData?.phone ?? '',
    extension: initialData?.extension ?? '',
    fax: initialData?.fax ?? '',
    email: initialData?.email ?? '',

    addressLine1: initialData?.addressLine1 ?? '',
    addressLine2: initialData?.addressLine2 ?? '',
    country: initialData?.country ?? '',
    state: initialData?.state ?? '',
    city: initialData?.city ?? '',
    zipCode: initialData?.zipCode ?? '',
    isPrimaryLocation: initialData?.isPrimaryLocation ?? false,

    notes: initialData?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  // Country → state → city dependent options.
  const stateOptions = useMemo(
    () => (data.country ? (STATES_BY_COUNTRY[data.country] ?? []) : []),
    [data.country]
  );
  const cityOptions = useMemo(
    () => (data.state ? (CITIES_BY_STATE[data.state] ?? []) : []),
    [data.state]
  );

  // Reset child selects when the parent changes.
  const handleCountryChange = (country: string) =>
    setData((p) => ({ ...p, country, state: '', city: '' }));
  const handleStateChange = (state: string) =>
    setData((p) => ({ ...p, state, city: '' }));

  const isIndividual = data.providerType === 'individual';

  const validate = () => {
    const next: Record<string, string> = {};
    if (nodeOptions && !data.nodeId) next.nodeId = 'Pick a branch or program';

    if (isIndividual) {
      if (!data.firstName.trim()) next.firstName = 'First name is required';
      if (!data.lastName.trim()) next.lastName = 'Last name is required';
    } else {
      if (!data.organizationName.trim())
        next.organizationName = 'Organization name is required';
    }

    if (!data.npiNumber.trim()) next.npiNumber = 'NPI number is required';
    else if (!/^\d{10}$/.test(data.npiNumber.trim()))
      next.npiNumber = 'NPI must be 10 digits';

    if (!data.phone.trim()) next.phone = 'Phone is required';
    if (!data.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email))
      next.email = 'Please enter a valid email';

    if (!data.country) next.country = 'Country is required';
    if (!data.state) next.state = 'State is required';
    if (!data.city) next.city = 'City is required';
    if (!data.zipCode.trim()) next.zipCode = 'ZIP code is required';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fullName = isIndividual
      ? [data.firstName.trim(), data.middleName.trim(), data.lastName.trim()]
          .filter(Boolean)
          .join(' ')
      : data.organizationName.trim();

    onSubmit({
      providerType: data.providerType,
      nodeId: data.nodeId,
      fullName,
      firstName: isIndividual ? data.firstName.trim() : undefined,
      middleName:
        isIndividual && data.middleName.trim()
          ? data.middleName.trim()
          : undefined,
      lastName: isIndividual ? data.lastName.trim() : undefined,
      organizationName: !isIndividual
        ? data.organizationName.trim()
        : undefined,
      gender: isIndividual ? data.gender : undefined,
      specialty: data.specialty,
      status: data.status,

      npiNumber: data.npiNumber.trim(),
      licenseNumber: data.licenseNumber.trim(),
      licenseExpiry: data.licenseExpiry || undefined,

      phone: data.phone.trim(),
      extension: data.extension.trim() || undefined,
      fax: data.fax.trim() || undefined,
      email: data.email.trim(),

      addressLine1: data.addressLine1.trim() || undefined,
      addressLine2: data.addressLine2.trim() || undefined,
      country: data.country,
      state: data.state,
      city: data.city,
      zipCode: data.zipCode.trim(),
      isPrimaryLocation: data.isPrimaryLocation,

      notes: data.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Provider Type ─────────────────────────────────────────────── */}
      <Section title="Provider Type">
        <FormSelect
          label="Provider Type"
          value={data.providerType}
          onChange={(e) =>
            set('providerType', e.target.value as ProviderType)
          }
          options={PROVIDER_TYPE_OPTIONS}
          required
        />
        {nodeOptions && (
          <FormSelect
            label="Attached to"
            value={data.nodeId}
            onChange={(e) => set('nodeId', e.target.value)}
            options={nodeOptions}
            error={errors.nodeId}
            required
          />
        )}
      </Section>

      {/* ── Personal / Organization ──────────────────────────────────── */}
      {isIndividual ? (
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
              placeholder="e.g., Smith"
              value={data.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              error={errors.lastName}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormSelect
              label="Gender"
              value={data.gender}
              onChange={(e) => set('gender', e.target.value as Gender)}
              options={GENDER_OPTIONS}
              required
            />
            <FormSelect
              label="Specialty"
              value={data.specialty}
              onChange={(e) =>
                set('specialty', e.target.value as ProviderSpecialty)
              }
              options={SPECIALTY_OPTIONS}
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
        </Section>
      ) : (
        <Section title="Organization Information">
          <FormInput
            label="Organization Name"
            placeholder="e.g., West Coast Medical Group"
            value={data.organizationName}
            onChange={(e) => set('organizationName', e.target.value)}
            error={errors.organizationName}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              label="Specialty"
              value={data.specialty}
              onChange={(e) =>
                set('specialty', e.target.value as ProviderSpecialty)
              }
              options={SPECIALTY_OPTIONS}
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
        </Section>
      )}

      {/* ── Professional ─────────────────────────────────────────────── */}
      <Section title="Professional Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput
            label="NPI Number"
            placeholder="e.g., 1234567890"
            inputMode="numeric"
            value={data.npiNumber}
            onChange={(e) => set('npiNumber', e.target.value)}
            error={errors.npiNumber}
            required
          />
          <FormInput
            label="License Number"
            placeholder="e.g., MD-12345"
            value={data.licenseNumber}
            onChange={(e) => set('licenseNumber', e.target.value)}
          />
          <FormInput
            label="License Expiry"
            type="date"
            value={data.licenseExpiry}
            onChange={(e) => set('licenseExpiry', e.target.value)}
          />
        </div>
      </Section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <Section title="Contact Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormInput
            label="Phone"
            type="tel"
            placeholder="e.g., (555) 123-4567"
            value={data.phone}
            onChange={(e) => set('phone', e.target.value)}
            error={errors.phone}
            required
          />
          <FormInput
            label="Extension"
            placeholder="e.g., 101"
            value={data.extension}
            onChange={(e) => set('extension', e.target.value)}
          />
          <FormInput
            label="Fax"
            type="tel"
            placeholder="e.g., (555) 123-4568"
            value={data.fax}
            onChange={(e) => set('fax', e.target.value)}
          />
        </div>
        <FormInput
          label="Email"
          type="email"
          placeholder="e.g., doctor@healthcare.com"
          value={data.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          required
        />
      </Section>

      {/* ── Address ──────────────────────────────────────────────────── */}
      <Section title="Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Address Line 1"
            placeholder="e.g., 123 Medical Plaza"
            value={data.addressLine1}
            onChange={(e) => set('addressLine1', e.target.value)}
          />
          <FormInput
            label="Address Line 2"
            placeholder="e.g., Suite 200"
            value={data.addressLine2}
            onChange={(e) => set('addressLine2', e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormSelect
            label="Country"
            value={data.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            options={[
              { value: '', label: 'Select country' },
              ...COUNTRY_OPTIONS,
            ]}
            error={errors.country}
            required
          />
          <FormSelect
            label="State"
            value={data.state}
            onChange={(e) => handleStateChange(e.target.value)}
            options={[
              { value: '', label: 'Select state' },
              ...stateOptions,
            ]}
            error={errors.state}
            required
            disabled={!data.country}
          />
          <FormSelect
            label="City"
            value={data.city}
            onChange={(e) => set('city', e.target.value)}
            options={[
              { value: '', label: 'Select city' },
              ...cityOptions,
            ]}
            error={errors.city}
            required
            disabled={!data.state}
          />
        </div>

        <FormInput
          label="ZIP Code"
          placeholder="e.g., 90001"
          value={data.zipCode}
          onChange={(e) => set('zipCode', e.target.value)}
          error={errors.zipCode}
          required
        />

        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
          <Checkbox
            checked={data.isPrimaryLocation}
            onCheckedChange={(checked) =>
              set('isPrimaryLocation', checked === true)
            }
          />
          Primary Location
        </label>
      </Section>

      {/* ── Notes ────────────────────────────────────────────────────── */}
      <Section title="Notes">
        <FormTextarea
          label="Notes"
          placeholder="Additional notes (optional)"
          value={data.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </Section>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : initialData
              ? 'Update Provider'
              : 'Add Provider'}
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
