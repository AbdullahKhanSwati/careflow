'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Phone,
  Mail,
  Grid3X3,
  List,
  FileText,
  Star,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { AdvancedFilter } from '@/components/ui/advanced-filter';
import { mockPatients, mockBranches } from '@/lib/mock-data';
import { PATIENT_STATUS_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Patient, TableColumn, FilterState, PatientStatus } from '@/types';

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
              <p className="text-sm text-muted-foreground">
                {row.age} yrs, {row.gender}
              </p>
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    key: 'mainBranchId',
    header: 'Main Branch',
    sortable: true,
    render: (value) => {
      const branch = mockBranches.find((b) => b.id === value);
      return (
        <span className="text-sm text-muted-foreground">
          {branch?.title || 'Unknown'}
        </span>
      );
    },
  },
  {
    key: 'contactNumber',
    header: 'Contact',
    sortable: false,
  },
  {
    key: 'admissionDate',
    header: 'Admitted',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {new Date(String(value)).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value as PatientStatus} />,
  },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState<FilterState>({ search: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPatients(mockPatients);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const branchOptions = useMemo(() => 
    mockBranches.map(b => ({ value: b.id, label: b.title })),
    []
  );

  const filterConfig = useMemo(() => [
    {
      key: 'status' as keyof FilterState,
      label: 'Status',
      type: 'select' as const,
      options: PATIENT_STATUS_OPTIONS,
    },
    {
      key: 'branchId' as keyof FilterState,
      label: 'Branch',
      type: 'select' as const,
      options: branchOptions,
    },
    {
      key: 'dateFrom' as keyof FilterState,
      label: 'Admitted From',
      type: 'date' as const,
    },
    {
      key: 'dateTo' as keyof FilterState,
      label: 'Admitted To',
      type: 'date' as const,
    },
  ], [branchOptions]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          fullName.toLowerCase().includes(searchLower) ||
          patient.contactNumber.toLowerCase().includes(searchLower) ||
          patient.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && patient.status !== filters.status) {
        return false;
      }
      
      // Branch filter
      if (filters.branchId && !patient.branchIds.includes(filters.branchId)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateFrom && new Date(patient.admissionDate) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(patient.admissionDate) > new Date(filters.dateTo)) {
        return false;
      }
      
      return true;
    });
  }, [patients, filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Patients"
        description="View and manage all patients across your healthcare network"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Patients' },
        ]}
      />

      <div className="flex flex-col gap-4">
        <AdvancedFilter
          filters={filters}
          onFilterChange={setFilters}
          config={filterConfig}
          searchPlaceholder="Search patients by name, phone, or email..."
        />
        <div className="flex justify-end">
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
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="Users"
            title="No patients found"
            description={
              filters.search || filters.status || filters.branchId
                ? 'Try adjusting your search or filter criteria'
                : 'There are no patients registered yet'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => {
            const fullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
            const mainBranch = mockBranches.find((b) => b.id === patient.mainBranchId);
            return (
              <Link
                key={patient.id}
                href={`/dashboard/patients/${patient.id}`}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5',
                  'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                  'transition-all duration-300 block'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <span className="text-xl font-semibold text-primary group-hover:text-primary-foreground transition-colors">
                      {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                    </span>
                  </div>
                  <StatusBadge status={patient.status} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {fullName}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {patient.age} years old, {patient.gender}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {patient.contactNumber}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  {mainBranch && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      {mainBranch.title}
                    </div>
                  )}
                </div>
                {patient.medicalNotes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {patient.medicalNotes}
                      </p>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={patientColumns}
          data={filteredPatients}
          keyField="id"
          emptyTitle="No patients found"
          emptyDescription="There are no patients matching your criteria"
          emptyIcon="Users"
        />
      )}
    </div>
  );
}
