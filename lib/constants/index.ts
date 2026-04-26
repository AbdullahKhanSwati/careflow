// ==========================================
// APPLICATION CONSTANTS
// ==========================================

export const APP_NAME = 'CareFlow';
export const APP_DESCRIPTION = 'Patient Care Management System';

// Status options
export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Role options
export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

// Marital status options
export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'other', label: 'Other' },
];

// Healthcare provider specialties
export const SPECIALTY_OPTIONS = [
  { value: 'general', label: 'General Practice' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'dermatology', label: 'Dermatology' },
];

// Filter helpers — prepend an "All" option to a base option list.
export function withAllOption(
  options: { value: string; label: string }[],
  allLabel = 'All'
) {
  return [{ value: '', label: allLabel }, ...options];
}

// ==========================================
// GEO — countries / states / cities
// ==========================================
// Light cascading dataset just for form pickers. Real apps would source this
// from an API or ISO 3166 dataset.

export const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
];

export const STATES_BY_COUNTRY: Record<
  string,
  { value: string; label: string }[]
> = {
  US: [
    { value: 'CA', label: 'California' },
    { value: 'TX', label: 'Texas' },
    { value: 'NY', label: 'New York' },
    { value: 'FL', label: 'Florida' },
    { value: 'WA', label: 'Washington' },
  ],
  CA: [
    { value: 'ON', label: 'Ontario' },
    { value: 'QC', label: 'Quebec' },
    { value: 'BC', label: 'British Columbia' },
  ],
  UK: [
    { value: 'ENG', label: 'England' },
    { value: 'SCT', label: 'Scotland' },
    { value: 'WLS', label: 'Wales' },
  ],
};

export const CITIES_BY_STATE: Record<
  string,
  { value: string; label: string }[]
> = {
  CA: [
    { value: 'los_angeles', label: 'Los Angeles' },
    { value: 'san_francisco', label: 'San Francisco' },
    { value: 'san_diego', label: 'San Diego' },
    { value: 'sacramento', label: 'Sacramento' },
  ],
  TX: [
    { value: 'houston', label: 'Houston' },
    { value: 'dallas', label: 'Dallas' },
    { value: 'austin', label: 'Austin' },
  ],
  NY: [
    { value: 'new_york', label: 'New York' },
    { value: 'brooklyn', label: 'Brooklyn' },
    { value: 'buffalo', label: 'Buffalo' },
  ],
  FL: [
    { value: 'miami', label: 'Miami' },
    { value: 'orlando', label: 'Orlando' },
    { value: 'tampa', label: 'Tampa' },
  ],
  WA: [
    { value: 'seattle', label: 'Seattle' },
    { value: 'spokane', label: 'Spokane' },
  ],
  ON: [
    { value: 'toronto', label: 'Toronto' },
    { value: 'ottawa', label: 'Ottawa' },
  ],
  QC: [
    { value: 'montreal', label: 'Montreal' },
    { value: 'quebec_city', label: 'Quebec City' },
  ],
  BC: [{ value: 'vancouver', label: 'Vancouver' }],
  ENG: [
    { value: 'london', label: 'London' },
    { value: 'manchester', label: 'Manchester' },
  ],
  SCT: [{ value: 'edinburgh', label: 'Edinburgh' }],
  WLS: [{ value: 'cardiff', label: 'Cardiff' }],
};

// Provider type options
export const PROVIDER_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual Provider' },
  { value: 'organization', label: 'Organization' },
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Status colors
export const STATUS_COLORS = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-red-500/10 text-red-500 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
