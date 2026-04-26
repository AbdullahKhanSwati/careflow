'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  FileText,
  Grid3X3,
  List,
  MapPin,
  Phone,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { mockPatients } from '@/lib/mock-data';
import {
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  withAllOption,
} from '@/lib/constants';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import { FilterBar } from '@/components/shared/filter-bar';
import { cn } from '@/lib/utils';
import type { Patient, TableColumn } from '@/types';

const AGE_GROUPS = [
  { value: '', label: 'All ages' },
  { value: '0-17', label: '0–17' },
  { value: '18-39', label: '18–39' },
  { value: '40-64', label: '40–64' },
  { value: '65+', label: '65+' },
];

function ageInGroup(age: number, group: string) {
  if (!group) return true;
  if (group === '65+') return age >= 65;
  const [lo, hi] = group.split('-').map((n) => parseInt(n, 10));
  return age >= lo && age <= hi;
}

export default function PatientsPage() {
  const router = useRouter();
  const { selectedNode, scopeIds, getNode } = useNodes();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const inScope = useMemo(
    () => mockPatients.filter((p) => scopeIds.has(p.nodeId)),
    [scopeIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inScope.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (genderFilter && p.gender !== genderFilter) return false;
      if (!ageInGroup(p.age, ageFilter)) return false;
      if (!q) return true;
      return [p.fullName, p.contactNumber, p.address]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [inScope, search, statusFilter, genderFilter, ageFilter]);

  if (!selectedNode) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="No node selected"
        description="Pick a node from the sidebar."
      />
    );
  }

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setGenderFilter('');
    setAgeFilter('');
  };

  const columns: TableColumn<Patient>[] = [
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
      key: 'nodeId',
      header: 'Branch',
      sortable: true,
      render: (value) => {
        const node = getNode(String(value));
        return (
          <span className="text-sm text-muted-foreground">
            {node?.name ?? 'Unknown'}
          </span>
        );
      },
    },
    { key: 'contactNumber', header: 'Contact', sortable: false },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as Patient['status']} />,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      className: 'w-[1%] whitespace-nowrap text-right',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/patients/${row.id}`);
          }}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb />

      <PageHeader
        title="Patients"
        description={`Patients inside ${selectedNode.name} and every sub-node.`}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patients by name, phone, address..."
        selects={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: withAllOption(STATUS_OPTIONS),
          },
          {
            id: 'gender',
            label: 'Gender',
            value: genderFilter,
            onChange: setGenderFilter,
            options: withAllOption(GENDER_OPTIONS),
          },
          {
            id: 'age',
            label: 'Age',
            value: ageFilter,
            onChange: setAgeFilter,
            options: AGE_GROUPS,
          },
        ]}
        onReset={handleReset}
        rightSlot={
          <div className="flex items-center gap-1">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        }
        hint={
          <span>
            Showing <strong>{filtered.length}</strong> of {inScope.length} patients
          </span>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="Users"
            title="No patients found"
            description={
              inScope.length === 0
                ? `No patients are registered inside ${selectedNode.name}.`
                : 'Adjust the filters or clear them to see more.'
            }
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((patient) => {
            const node = getNode(patient.nodeId);
            return (
              <Link
                key={patient.id}
                href={`/dashboard/patients/${patient.id}`}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5 block',
                  'hover:border-primary/30 hover:shadow-md transition-all'
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
                  {node && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {node.name}
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
          columns={columns}
          data={filtered}
          keyField="id"
          onRowClick={(row) => router.push(`/dashboard/patients/${row.id}`)}
          emptyTitle="No patients"
          emptyDescription="No patients in the selected scope."
          emptyIcon="Users"
        />
      )}
    </div>
  );
}
