'use client';

import { Building2, GitBranch } from 'lucide-react';
import type { TableColumn, Structure } from '@/types';
import { StatusBadge } from '@/components/ui/status-badge';

export const structuresColumns: TableColumn<Structure>[] = [
  {
    key: 'name',
    header: 'Structure',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.regionCode}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    sortable: false,
    render: (value) => (
      <p className="text-sm text-muted-foreground truncate max-w-xs">
        {String(value)}
      </p>
    ),
  },
  {
    key: 'branchCount',
    header: 'Branches',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
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
  {
    key: 'updatedAt',
    header: 'Last Updated',
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
];
