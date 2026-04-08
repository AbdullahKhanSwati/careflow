'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCog,
  Phone,
  Mail,
  Search,
  Grid3X3,
  List,
  MapPin,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { mockUsers, mockBranches } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { User, TableColumn } from '@/types';

const userColumns: TableColumn<User>[] = [
  {
    key: 'fullName',
    header: 'Staff Member',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-accent">
            {row.fullName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.fullName}</p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
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
    key: 'phone',
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
    render: (value) => <StatusBadge status={value as 'active' | 'inactive' | 'pending'} />,
  },
];

export default function StaffPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search staff..."
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
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="UserCog"
            title="No staff found"
            description={
              searchQuery
                ? 'Try adjusting your search criteria'
                : 'There are no staff members registered yet'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => {
            const branch = mockBranches.find((b) => b.id === user.branchId);
            return (
              <div
                key={user.id}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5',
                  'hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5',
                  'transition-all duration-300'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <span className="text-xl font-semibold text-accent group-hover:text-accent-foreground transition-colors">
                      {user.fullName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={user.role} />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {user.fullName}
                </h3>
                <StatusBadge status={user.status} className="mb-4" />
                <div className="space-y-2 text-sm mt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </div>
                  {branch && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {branch.name}
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
              </div>
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
