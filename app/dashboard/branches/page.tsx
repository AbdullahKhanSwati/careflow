'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GitBranch,
  Users,
  UserCog,
  MapPin,
  Grid3X3,
  List,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { AdvancedFilter } from '@/components/ui/advanced-filter';
import { mockBranches, mockStructures } from '@/lib/mock-data';
import { STATUS_OPTIONS, FACILITY_TYPE_OPTIONS } from '@/lib/constants/index';
import { cn } from '@/lib/utils';
import type { Branch, TableColumn, FilterState } from '@/types';

const branchColumns: TableColumn<Branch>[] = [
  {
    key: 'title',
    header: 'Branch',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <GitBranch className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.title}</p>
          <p className="text-sm text-muted-foreground">{row.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'structureId',
    header: 'Structure',
    sortable: true,
    render: (value) => {
      const structure = mockStructures.find((s) => s.id === value);
      return (
        <span className="text-sm text-muted-foreground">
          {structure?.title || 'Unknown'}
        </span>
      );
    },
  },
  {
    key: 'patientCount',
    header: 'Patients',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{String(value)}</span>
      </div>
    ),
  },
  {
    key: 'userCount',
    header: 'Staff',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <UserCog className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{String(value)}</span>
      </div>
    ),
  },
  {
    key: 'notes',
    header: 'Description',
    sortable: false,
    render: (value) => (
      <p className="text-sm text-muted-foreground truncate max-w-xs">
        {String(value || '-')}
      </p>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value as 'active' | 'inactive' | 'pending'} />,
  },
];

export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({ search: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setBranches(mockBranches);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const structureOptions = useMemo(() => 
    mockStructures.map(s => ({ value: s.id, label: s.title })),
    []
  );

  const filterConfig = useMemo(() => [
    {
      key: 'status' as keyof FilterState,
      label: 'Status',
      type: 'select' as const,
      options: STATUS_OPTIONS,
    },
    {
      key: 'type' as keyof FilterState,
      label: 'Type',
      type: 'select' as const,
      options: FACILITY_TYPE_OPTIONS,
    },
    {
      key: 'structureId' as keyof FilterState,
      label: 'Structure',
      type: 'select' as const,
      options: structureOptions,
    },
  ], [structureOptions]);

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          branch.title.toLowerCase().includes(searchLower) ||
          branch.code.toLowerCase().includes(searchLower) ||
          branch.city.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && branch.status !== filters.status) {
        return false;
      }
      
      // Type filter
      if (filters.type && branch.type !== filters.type) {
        return false;
      }
      
      // Structure filter
      if (filters.structureId && branch.structureId !== filters.structureId) {
        return false;
      }
      
      return true;
    });
  }, [branches, filters]);

  const handleRowClick = (branch: Branch) => {
    router.push(`/dashboard/branches/${branch.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Branches"
        description="View and manage all branches across your healthcare network"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Branches' },
        ]}
      />

      <div className="flex flex-col gap-4">
        <AdvancedFilter
          filters={filters}
          onFilterChange={setFilters}
          config={filterConfig}
          searchPlaceholder="Search branches by name, code, or city..."
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
      ) : filteredBranches.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="GitBranch"
            title="No branches found"
            description={
              filters.search || filters.status || filters.type || filters.structureId
                ? 'Try adjusting your search or filter criteria'
                : 'There are no branches in your network yet'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => {
            const structure = mockStructures.find((s) => s.id === branch.structureId);
            return (
              <Link
                key={branch.id}
                href={`/dashboard/branches/${branch.id}`}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5',
                  'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                  'transition-all duration-300 block'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <GitBranch className="h-6 w-6 text-accent group-hover:text-accent-foreground transition-colors" />
                  </div>
                  <StatusBadge status={branch.status} />
                </div>
                <h3 className="font-semibold text-foreground mb-1 truncate">{branch.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 truncate">{branch.notes || '-'}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {structure?.title || 'Unknown Structure'}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{branch.city}, {branch.state}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                    <div>
                      <span className="text-muted-foreground">Patients</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium">{branch.patientCount}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Staff</span>
                      <div className="flex items-center gap-1 mt-1">
                        <UserCog className="h-4 w-4 text-accent" />
                        <span className="font-medium">{branch.userCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={branchColumns}
          data={filteredBranches}
          keyField="id"
          onRowClick={handleRowClick}
          emptyTitle="No branches found"
          emptyDescription="There are no branches matching your criteria"
          emptyIcon="GitBranch"
        />
      )}
    </div>
  );
}
