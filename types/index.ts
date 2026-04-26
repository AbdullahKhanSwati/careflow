// ==========================================
// GLOBAL TYPE DEFINITIONS
// ==========================================

export type Status = 'active' | 'inactive' | 'pending';
export type UserRole = 'admin' | 'staff';
export type Gender = 'male' | 'female' | 'other';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// HIERARCHICAL NODE MODEL
// ==========================================
// root -> department(s) -> department(s) -> location | program
// - root      : organization root, holds all sub-nodes (created on first login)
// - department: virtual container, can hold sub-departments / locations / programs
// - location  : physical branch (leaf)
// - program   : staff-on-the-go group / outreach (leaf, no physical address required)

export type NodeType = 'root' | 'department' | 'location' | 'program';

export interface BaseNode extends BaseEntity {
  type: NodeType;
  parentId: string | null;
  name: string;
  description?: string;
  status: Status;
  // Materialized path of ancestor ids (root first) for fast scoping/queries.
  path: string[];
  level: number;
}

export interface RootNode extends BaseNode {
  type: 'root';
  parentId: null;
  organizationName: string;
}

export interface DepartmentNode extends BaseNode {
  type: 'department';
  code?: string;
  notes?: string;
}

export interface LocationNode extends BaseNode {
  type: 'location';
  address: string;
  city: string;
  contactNumber: string;
  email: string;
}

export interface ProgramNode extends BaseNode {
  type: 'program';
  schedule?: string;
  area?: string;
  contactNumber?: string;
}

export type Node = RootNode | DepartmentNode | LocationNode | ProgramNode;

export type LeafNodeType = 'location' | 'program';
export type ContainerNodeType = 'root' | 'department';

// Tree shape used by the sidebar / breadcrumbs.
export interface NodeTreeItem {
  node: Node;
  children: NodeTreeItem[];
}

// ==========================================
// PEOPLE
// ==========================================

export type MaritalStatus =
  | 'single'
  | 'married'
  | 'divorced'
  | 'widowed'
  | 'other';

export interface Patient extends BaseEntity {
  nodeId: string; // the leaf node (location/program) the patient is assigned to
  /** Canonical display name. Built from first + middle + last on creation. */
  fullName: string;
  // Name parts — optional so existing mock patients (which only have
  // `fullName`) keep working without backfilling.
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age: number;
  gender: Gender;
  contactNumber: string;
  /** Optional secondary number, e.g. emergency contact. */
  alternatePhone?: string;
  email?: string;
  address: string;
  maritalStatus?: MaritalStatus;
  /** ISO date string (YYYY-MM-DD). */
  admissionDate?: string;
  medicalNotes: string;
  status: Status;
}

export interface User extends BaseEntity {
  nodeId: string; // any node from which the user inherits scope (incl. departments)
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: Status;
  notes: string;
  avatar?: string;
}

// Healthcare providers (clinical practitioners). Distinct from administrative
// staff (Users) — providers have license, specialty, and tenure attributes.
export type ProviderSpecialty =
  | 'general'
  | 'cardiology'
  | 'pediatrics'
  | 'neurology'
  | 'orthopedics'
  | 'oncology'
  | 'psychiatry'
  | 'dermatology';

export type ProviderType = 'individual' | 'organization';

export interface Provider extends BaseEntity {
  nodeId: string;
  /** Display name. For individuals: full name; for organizations: org name. */
  fullName: string;
  email: string;
  phone: string;
  specialty: ProviderSpecialty;
  /** Existing license id — optional now, NPI is the new required identifier. */
  licenseNumber: string;
  status: Status;
  notes: string;
  avatar?: string;

  // ── New fields (all optional so existing mock data keeps type-checking) ──
  providerType?: ProviderType;
  /** For Individual providers. */
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: Gender;
  /** For Organization providers. */
  organizationName?: string;

  yearsExperience?: number;
  /** US National Provider Identifier (10 digits). */
  npiNumber?: string;
  /** ISO date string for license expiry (YYYY-MM-DD). */
  licenseExpiry?: string;

  /** Phone extension. */
  extension?: string;
  fax?: string;

  /** Address line 1 — street + number. */
  addressLine1?: string;
  /** Address line 2 — suite / unit. */
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  /** Marks this address as the provider's primary location. */
  isPrimaryLocation?: boolean;
}

// ==========================================
// MEDICATION ADMINISTRATION
// ==========================================
// A medication is a scheduled dose for a patient. Some medications carry
// pre-requisite vital checks that must fall within a normal range BEFORE the
// dose can be administered.

export type PrerequisiteType = 'bp' | 'glucose' | 'temperature' | 'pulse';

interface BasePrerequisite {
  type: PrerequisiteType;
  label: string;
  /** Human-readable instruction, e.g. "Check BP before dosing." */
  instruction?: string;
}

/** Blood pressure has two readings — systolic and diastolic. */
export interface BloodPressurePrerequisite extends BasePrerequisite {
  type: 'bp';
  systolic: { min: number; max: number }; // mmHg
  diastolic: { min: number; max: number }; // mmHg
}

/** Single-value vital (glucose mg/dL, temperature °F, pulse bpm). */
export interface VitalPrerequisite extends BasePrerequisite {
  type: 'glucose' | 'temperature' | 'pulse';
  unit: string;
  range: { min: number; max: number };
}

export type MedicationPrerequisite =
  | BloodPressurePrerequisite
  | VitalPrerequisite;

export type MedicationStatus = 'pending' | 'administered' | 'skipped';

/** A single vital reading captured at administration time. */
export interface VitalReading {
  type: PrerequisiteType;
  /** For BP: stored as `${systolic}/${diastolic}`. For others: a number. */
  value: string;
  recordedAt: string;
}

export interface Medication extends BaseEntity {
  patientId: string;
  name: string;
  dosage: string;
  /** 24-hour scheduled time, e.g. "08:00". */
  scheduledTime: string;
  prerequisites: MedicationPrerequisite[];
  notes?: string;
}

/** Runtime record of an administration. Lives in component state for the
 *  mock app — would be persisted server-side in production. */
export interface AdministrationRecord {
  medicationId: string;
  status: MedicationStatus;
  administeredAt?: string;
  administeredBy?: string;
  readings: VitalReading[];
}

export interface Agency extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
}

// ==========================================
// UI HELPERS
// ==========================================

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

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

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
