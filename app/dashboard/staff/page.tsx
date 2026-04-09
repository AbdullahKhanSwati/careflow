'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UserCog,
  Phone,
  Mail,
  Grid3X3,
  List,
  Building2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { AdvancedFilter } from '@/components/ui/advanced-filter';
import { mockUsers, mockBranches } from '@/lib/mock-data';
import { STAFF_STATUS_OPTIONS, ROLE_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { User, TableColumn, FilterState, StaffStatus } from '@/types';

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
    key: 'branchId',
    header: 'Branch',
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

export default function StaffPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState<FilterState>({ search: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers);
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
      options: STAFF_STATUS_OPTIONS,
    },
    {
      key: 'role' as keyof FilterState,
      label: 'Role',
      type: 'select' as const,
      options: ROLE_OPTIONS,
    },
    {
      key: 'branchId' as keyof FilterState,
      label: 'Branch',
      type: 'select' as const,
      options: branchOptions,
    },
    {
      key: 'dateFrom' as keyof FilterState,
      label: 'Hired From',
      type: 'date' as const,
    },
  ], [branchOptions]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          fullName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.contactNumber.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && user.status !== filters.status) {
        return false;
      }
      
      // Role filter
      if (filters.role && user.role !== filters.role) {
        return false;
      }
      
      // Branch filter
      if (filters.branchId && user.branchId !== filters.branchId) {
        return false;
      }
      
      // Date filter
      if (filters.dateFrom && new Date(user.admissionDate) < new Date(filters.dateFrom)) {
        return false;
      }
      
      return true;
    });
  }, [users, filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Staff"
        description="View and manage all staff members across your healthcare network"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Staff' },
        ]}
      />

      <div className="flex flex-col gap-4">
        <AdvancedFilter
          filters={filters}
          onFilterChange={setFilters}
          config={filterConfig}
          searchPlaceholder="Search staff by name, email, or phone..."
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
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="UserCog"
            title="No staff found"
            description={
              filters.search || filters.status || filters.role || filters.branchId
                ? 'Try adjusting your search or filter criteria'
                : 'There are no staff members registered yet'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => {
            const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
            const branch = mockBranches.find((b) => b.id === user.branchId);
            return (
              <Link
                key={user.id}
                href={`/dashboard/staff/${user.id}`}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5',
                  'hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5',
                  'transition-all duration-300 block'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <span className="text-xl font-semibold text-accent group-hover:text-accent-foreground transition-colors">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={user.role} />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {fullName}
                </h3>
                <StatusBadge status={user.status} className="mb-4" />
                <div className="space-y-2 text-sm mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {user.contactNumber}
                  </div>
                  {branch && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {branch.title}
                    </div>
                  )}
                </div>
                {user.notes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {user.notes}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={userColumns}
          data={filteredUsers}
          keyField="id"
          emptyTitle="No staff found"
          emptyDescription="There are no staff members matching your criteria"
          emptyIcon="UserCog"
        />
      )}
    </div>
  );
}
