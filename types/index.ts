// ==========================================
// GLOBAL TYPE DEFINITIONS
// ==========================================

// Status types
export type Status = 'active' | 'inactive' | 'pending';
export type PatientStatus = 'active' | 'inactive' | 'hospitalized' | 'jailed' | 'loa' | 'pending';
export type StaffStatus = 'active' | 'inactive';
export type UserRole = 'admin' | 'staff';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
export type FacilityType = 'hospital' | 'clinic' | 'care_center' | 'nursing_home' | 'rehabilitation';

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Structure type
export interface Structure extends BaseEntity {
  title: string;
  code: string;
  type: FacilityType;
  license: string;
  licenseExpiry: string;
  
  // Address fields
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
  
  // Contact fields
  phone: string;
  phoneExtension?: string;
  fax?: string;
  email: string;
  website?: string;
  
  // Additional
  timezone: string;
  notes: string;
  status: Status;
  branchCount: number;
}

// Branch type
export interface Branch extends BaseEntity {
  structureId: string;
  title: string;
  code: string;
  type: FacilityType;
  license: string;
  licenseExpiry: string;
  
  // Address fields
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  country: string;
  
  // Contact fields
  phone: string;
  phoneExtension?: string;
  fax?: string;
  email: string;
  website?: string;
  
  // Additional
  timezone: string;
  notes?: string;
  status: Status;
  patientCount: number;
  userCount: number;
}

// Patient type
export interface Patient extends BaseEntity {
  // Name split into parts
  firstName: string;
  middleName?: string;
  lastName: string;
  
  // Personal info
  email: string;
  maritalStatus: MaritalStatus;
  admissionDate: string;
  age: number;
  gender: Gender;
  contactNumber: string;
  medicalNotes: string;
  status: PatientStatus;
  
  // Multi-branch support
  mainBranchId: string;
  branchIds: string[];
  assignedStaffIds: string[];
}

// User type
export interface User extends BaseEntity {
  // Name split into parts
  firstName: string;
  middleName?: string;
  lastName: string;
  
  // Personal info
  maritalStatus: MaritalStatus;
  admissionDate: string;
  age: number;
  gender: Gender;
  contactNumber: string;
  
  // Account info
  email: string;
  password?: string;
  role: UserRole;
  status: StaffStatus;
  notes: string;
  avatar?: string;
  
  // Branch association
  branchId: string;
  assignedPatientIds: string[];
}

// Agency type
export interface Agency extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
}

// Table column configuration
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

// Sidebar menu item
export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

// Form field configuration
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio' | 'date' | 'password';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Toast notification
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Statistics card
export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
}

// Theme type
export type Theme = 'light' | 'dark' | 'system';

// Pagination
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Filter state
export interface FilterState {
  search: string;
  status?: string;
  type?: string;
  branchId?: string;
  structureId?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
}
