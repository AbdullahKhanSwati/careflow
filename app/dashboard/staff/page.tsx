'use client';

import { useMemo, useState } from 'react';
import { Grid3X3, List, Mail, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { mockUsers } from '@/lib/mock-data';
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  withAllOption,
} from '@/lib/constants';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import { FilterBar } from '@/components/shared/filter-bar';
import { cn } from '@/lib/utils';
import type { TableColumn, User } from '@/types';

export default function StaffPage() {
  const { selectedNode, scopeIds, getNode } = useNodes();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const inScope = useMemo(
    () => mockUsers.filter((u) => scopeIds.has(u.nodeId)),
    [scopeIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inScope.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (!q) return true;
      return [u.fullName, u.email, u.phone]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [inScope, search, roleFilter, statusFilter]);

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
    setRoleFilter('');
    setStatusFilter('');
  };

  const columns: TableColumn<User>[] = [
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
      key: 'nodeId',
      header: 'Attached to',
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
    { key: 'phone', header: 'Phone', sortable: false },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => <StatusBadge status={value as User['role']} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as User['status']} />,
    },
  ];

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb />

      <PageHeader
        title="Staff"
        description={`Staff attached to ${selectedNode.name} and every sub-node.`}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name, email, phone..."
        selects={[
          {
            id: 'role',
            label: 'Role',
            value: roleFilter,
            onChange: setRoleFilter,
            options: withAllOption(ROLE_OPTIONS),
          },
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: withAllOption(STATUS_OPTIONS),
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
            Showing <strong>{filtered.length}</strong> of {inScope.length} staff
          </span>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="UserCog"
            title="No staff found"
            description={
              inScope.length === 0
                ? `No staff are attached inside ${selectedNode.name}.`
                : 'Adjust the filters or clear them to see more.'
            }
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => {
            const node = getNode(user.nodeId);
            return (
              <div
                key={user.id}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5',
                  'hover:border-accent/30 hover:shadow-md transition-all'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <span className="text-xl font-semibold text-accent group-hover:text-accent-foreground transition-colors">
                      {user.fullName.charAt(0)}
                    </span>
                  </div>
                  <StatusBadge status={user.role} />
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
                  {node && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {node.name}
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
          columns={columns}
          data={filtered}
          keyField="id"
          emptyTitle="No staff"
          emptyDescription="No staff in the selected scope."
          emptyIcon="UserCog"
        />
      )}
    </div>
  );
}
