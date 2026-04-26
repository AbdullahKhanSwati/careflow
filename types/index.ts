// ==========================================
// GLOBAL TYPE DEFINITIONS
// ==========================================

// Status types
export type Status = 'active' | 'inactive' | 'pending';
export type UserRole = 'admin' | 'staff';
export type Gender = 'male' | 'female' | 'other';

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Structure type
export interface Structure extends BaseEntity {
  name: string;
  description: string;
  regionCode: string;
  status: Status;
  notes: string;
  branchCount: number;
}

// Branch type
export interface Branch extends BaseEntity {
  structureId: string;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  status: Status;
  patientCount: number;
  userCount: number;
}

// Patient type
export interface Patient extends BaseEntity {
  branchId: string;
  fullName: string;
  age: number;
  gender: Gender;
  contactNumber: string;
  address: string;
  medicalNotes: string;
  status: Status;
}

// User type
export interface User extends BaseEntity {
  branchId: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: Status;
  notes: string;
  avatar?: string;
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
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio';
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
