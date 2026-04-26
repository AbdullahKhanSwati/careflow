'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Phone,
  MapPin,
  Search,
  Grid3X3,
  List,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { mockPatients, mockBranches } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Patient, TableColumn } from '@/types';

const patientColumns: TableColumn<Patient>[] = [
  {
    key: 'fullName',
    header: 'Patient',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-primary">
            {row.fullName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {row.age} yrs, {row.gender}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'branchId',
    header: 'Branch',
    sortable: true,
    render: (value) => {
      const branch = mockBranches.find((b) => b.id === value);
      return (
        <span className="text-sm text-muted-foreground">
          {branch?.name || 'Unknown'}
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
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value as 'active' | 'inactive' | 'pending'} />,
  },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPatients(mockPatients);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contactNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
              searchQuery
                ? 'Try adjusting your search criteria'
                : 'There are no patients registered yet'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => {
            const branch = mockBranches.find((b) => b.id === patient.branchId);
            return (
              <div
                key={patient.id}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5',
                  'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                  'transition-all duration-300'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <span className="text-xl font-semibold text-primary group-hover:text-primary-foreground transition-colors">
                      {patient.fullName.charAt(0)}
                    </span>
                  </div>
                  <StatusBadge status={patient.status} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {patient.fullName}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {patient.age} years old, {patient.gender}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {patient.contactNumber}
                  </div>
                  {branch && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {branch.name}
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
              </div>
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
