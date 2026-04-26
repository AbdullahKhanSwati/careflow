'use client';

import { useMemo, useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { mockUsers } from '@/lib/mock-data';
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  withAllOption,
} from '@/lib/constants';
import { FilterBar } from '@/components/shared/filter-bar';
import type { User } from '@/types';

/**
 * Compact staff tab embedded in the dashboard. Adds a Scope filter (Direct
 * vs All descendants) so the user can choose between staff attached only to
 * the selected node and staff anywhere below it.
 */
export function StaffTab() {
  const { selectedNode, scopeIds, getNode } = useNodes();
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'direct' | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const inScope = useMemo<User[]>(() => {
    if (!selectedNode) return [];
    if (scope === 'direct') {
      return mockUsers.filter((u) => u.nodeId === selectedNode.id);
    }
    return mockUsers.filter((u) => scopeIds.has(u.nodeId));
  }, [selectedNode, scopeIds, scope]);

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

  const handleReset = () => {
    setSearch('');
    setScope('all');
    setRoleFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff..."
        selects={[
          {
            id: 'scope',
            label: 'Scope',
            value: scope,
            onChange: (v) => setScope(v as 'direct' | 'all'),
            options: [
              { value: 'all', label: 'All descendants' },
              { value: 'direct', label: 'Direct only' },
            ],
          },
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
        hint={
          <span>
            Showing <strong>{filtered.length}</strong> of {inScope.length} staff
            {scope === 'direct'
              ? ' attached directly to'
              : ' anywhere inside'}{' '}
            {selectedNode?.name}
          </span>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="UserCog"
            title="No staff match"
            description={
              inScope.length === 0
                ? scope === 'direct'
                  ? `No staff attached directly to ${selectedNode?.name}.`
                  : `No staff anywhere inside ${selectedNode?.name}.`
                : 'Adjust the filters or clear them to see more.'
            }
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {filtered.map((user) => {
            const node = getNode(user.nodeId);
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-accent">
                    {user.fullName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">
                      {user.fullName}
                    </p>
                    <StatusBadge status={user.role} />
                    <StatusBadge status={user.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-[200px]">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </span>
                    {node && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {node.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
