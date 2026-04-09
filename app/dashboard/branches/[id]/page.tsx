'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GitBranch,
  Users,
  UserCog,
  Plus,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Grid3X3,
  List,
  Globe,
  Clock,
  FileText,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton-loader';
import { DataTable } from '@/components/ui/data-table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/custom-tabs';
import { PatientForm } from '@/components/features/patients/patient-form';
import { UserForm } from '@/components/features/users/user-form';
import { mockBranches, mockStructures, mockPatients, mockUsers } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import { cn } from '@/lib/utils';
import type { Branch, Patient, User, TableColumn, PatientStatus, StaffStatus } from '@/types';

interface BranchDetailPageProps {
  params: Promise<{ id: string }>;
}

const patientColumns: TableColumn<Patient>[] = [
  {
    key: 'firstName',
    header: 'Patient',
    sortable: true,
    render: (_, row) => {
      const fullName = [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ');
      return (
        <Link href={`/dashboard/patients/${row.id}`} className="block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {row.firstName.charAt(0)}{row.lastName.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate hover:text-primary transition-colors">{fullName}</p>
              <p className="text-sm text-muted-foreground">{row.contactNumber}</p>
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    key: 'age',
    header: 'Age',
    sortable: true,
    render: (value) => <span>{String(value)} yrs</span>,
  },
  {
    key: 'gender',
    header: 'Gender',
    sortable: true,
    render: (value) => <span className="capitalize">{String(value)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value as PatientStatus} />,
  },
];

const userColumns: TableColumn<User>[] = [
  {
    key: 'firstName',
    header: 'Staff Member',
    sortable: true,
    render: (_, row) => {
      const fullName = [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ');
      return (
        <Link href={`/dashboard/staff/${row.id}`} className="block">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-accent">
                {row.firstName.charAt(0)}{row.lastName.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate hover:text-accent transition-colors">{fullName}</p>
              <p className="text-sm text-muted-foreground">{row.email}</p>
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    key: 'contactNumber',
    header: 'Phone',
    sortable: false,
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    render: (value) => <StatusBadge status={value as 'admin' | 'staff'} />,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value as StaffStatus} />,
  },
];

export default function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success } = useToast();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundBranch = mockBranches.find((b) => b.id === id);
      const branchPatients = mockPatients.filter((p) => p.branchIds.includes(id));
      const branchUsers = mockUsers.filter((u) => u.branchId === id);
      setBranch(foundBranch || null);
      setPatients(branchPatients);
      setUsers(branchUsers);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  const handleCreatePatient = async (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'mainBranchId' | 'branchIds' | 'assignedStaffIds'>) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newPatient: Patient = {
      ...data,
      id: `pat-${Date.now()}`,
      mainBranchId: id,
      branchIds: [id],
      assignedStaffIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setPatients((prev) => [newPatient, ...prev]);
    setPatientModalOpen(false);
    setIsSubmitting(false);
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
    success('Patient Added', `${fullName} has been registered successfully.`);
  };

  const handleCreateUser = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'branchId' | 'avatar' | 'assignedPatientIds'>) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newUser: User = {
      ...data,
      id: `usr-${Date.now()}`,
      branchId: id,
      assignedPatientIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setUsers((prev) => [newUser, ...prev]);
    setUserModalOpen(false);
    setIsSubmitting(false);
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
    success('Staff Added', `${fullName} has been added to the team.`);
  };

  const structure = branch
    ? mockStructures.find((s) => s.id === branch.structureId)
    : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <EmptyState
          icon="AlertCircle"
          title="Branch not found"
          description="The branch you're looking for doesn't exist or has been removed."
          actionLabel="Back to Branches"
          onAction={() => router.push('/dashboard/branches')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={branch.title}
        description={`${branch.city}, ${branch.state} - Part of ${structure?.title || 'Unknown Structure'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Branches', href: '/dashboard/branches' },
          { label: branch.title },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Branch Info Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <GitBranch className="h-7 w-7 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl font-semibold text-foreground">
                  {branch.title}
                </h2>
                <StatusBadge status={branch.status} />
                <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">
                  {branch.type.replace('_', ' ')}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{branch.address}, {branch.city}, {branch.state} {branch.zipCode}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{branch.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">License: {branch.license}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Expires: {branch.licenseExpiry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{branch.timezone.replace('America/', '')}</span>
                </div>
                {branch.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={branch.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {branch.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{patients.length}</span>
              </div>
              <span className="text-sm text-muted-foreground">Patients</span>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10">
              <div className="flex items-center gap-2 text-accent mb-1">
                <UserCog className="h-5 w-5" />
                <span className="text-2xl font-bold">{users.length}</span>
              </div>
              <span className="text-sm text-muted-foreground">Staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Patients and Users */}
      <Tabs defaultValue="patients">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="patients">
              <Users className="h-4 w-4 mr-2" />
              Patients ({patients.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              <UserCog className="h-4 w-4 mr-2" />
              Staff ({users.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="patients">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setPatientModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
            {patients.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon="Users"
                  title="No patients yet"
                  description="Add your first patient to this branch."
                  actionLabel="Add Patient"
                  onAction={() => setPatientModalOpen(true)}
                />
              </div>
            ) : viewMode === 'list' ? (
              <DataTable
                columns={patientColumns}
                data={patients}
                keyField="id"
                searchable
                searchPlaceholder="Search patients..."
                searchFields={['firstName', 'lastName', 'contactNumber', 'email']}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => {
                  const fullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
                  const isMainBranch = patient.mainBranchId === id;
                  return (
                    <Link
                      key={patient.id}
                      href={`/dashboard/patients/${patient.id}`}
                      className={cn(
                        'rounded-xl border border-border bg-card p-5',
                        'hover:border-primary/30 hover:shadow-md',
                        'transition-all duration-200 block'
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={patient.status} />
                          {isMainBranch && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Main Branch</span>
                          )}
                        </div>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {fullName}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {patient.age} yrs, {patient.gender}
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {patient.contactNumber}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          {patient.email}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setUserModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
            {users.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon="UserCog"
                  title="No staff yet"
                  description="Add your first staff member to this branch."
                  actionLabel="Add Staff"
                  onAction={() => setUserModalOpen(true)}
                />
              </div>
            ) : viewMode === 'list' ? (
              <DataTable
                columns={userColumns}
                data={users}
                keyField="id"
                searchable
                searchPlaceholder="Search staff..."
                searchFields={['firstName', 'lastName', 'email', 'contactNumber']}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => {
                  const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
                  return (
                    <Link
                      key={user.id}
                      href={`/dashboard/staff/${user.id}`}
                      className={cn(
                        'rounded-xl border border-border bg-card p-5',
                        'hover:border-accent/30 hover:shadow-md',
                        'transition-all duration-200 block'
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-accent">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={user.role} />
                          <StatusBadge status={user.status} />
                        </div>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {fullName}
                      </h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {user.contactNumber}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        title="Add New Patient"
        description={`Register a new patient at ${branch.title}`}
        size="lg"
      >
        <PatientForm
          onSubmit={handleCreatePatient}
          onCancel={() => setPatientModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Add Staff Member"
        description={`Add a new staff member to ${branch.title}`}
        size="lg"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setUserModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
