// ==========================================
// APPLICATION CONSTANTS
// ==========================================

export const APP_NAME = 'CareFlow';
export const APP_DESCRIPTION = 'Patient Care Management System';

// Status options (general)
export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

// Patient status options
export const PATIENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'hospitalized', label: 'Hospitalized' },
  { value: 'jailed', label: 'Jailed' },
  { value: 'loa', label: 'LOA' },
  { value: 'pending', label: 'Pending' },
];

// Staff status options
export const STAFF_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// Marital status options
export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
];

// Facility type options
export const FACILITY_TYPE_OPTIONS = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'care_center', label: 'Care Center' },
  { value: 'nursing_home', label: 'Nursing Home' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
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

// Branch status options
export const BRANCH_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
];

// Branch type options
export const BRANCH_TYPE_OPTIONS = [
  { value: 'primary_branch', label: 'Primary Branch' },
  { value: 'secondary_branch', label: 'Secondary Branch' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'satellite_center', label: 'Satellite Center' },
];

// US Timezones
export const US_TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (AZ)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
];

// Timezone options (alias for compatibility)
export const TIMEZONE_OPTIONS = US_TIMEZONE_OPTIONS;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Status colors
export const STATUS_COLORS = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-red-500/10 text-red-500 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  hospitalized: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  jailed: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  loa: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
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
