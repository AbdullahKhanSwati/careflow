'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GitBranch,
  Users,
  UserCog,
  MapPin,
  Search,
  Grid3X3,
  List,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { mockBranches, mockStructures } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Branch, TableColumn } from '@/types';

const branchColumns: TableColumn<Branch>[] = [
  {
    key: 'name',
    header: 'Branch',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <GitBranch className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.city}</p>
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
          {structure?.name || 'Unknown'}
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setBranches(mockBranches);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search branches..."
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
      ) : filteredBranches.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="GitBranch"
            title="No branches found"
            description={
              searchQuery
                ? 'Try adjusting your search criteria'
                : 'There are no branches in your organization yet'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => {
            const structure = mockStructures.find(
              (s) => s.id === branch.structureId
            );
            return (
              <Link
                key={branch.id}
                href={`/dashboard/branches/${branch.id}`}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5',
                  'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                  'transition-all duration-300'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <GitBranch className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <StatusBadge status={branch.status} />
                </div>
                <h3 className="font-semibold text-foreground mb-1 truncate">
                  {branch.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5" />
                  {branch.city}
                </div>
                {structure && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Part of <span className="font-medium">{structure.name}</span>
                  </p>
                )}
                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {branch.patientCount}
                    </span>
                    <span className="text-xs text-muted-foreground">patients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {branch.userCount}
                    </span>
                    <span className="text-xs text-muted-foreground">staff</span>
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
