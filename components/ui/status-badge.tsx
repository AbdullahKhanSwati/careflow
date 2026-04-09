'use client';

import { cn } from '@/lib/utils';
import type { Status, UserRole, PatientStatus, StaffStatus } from '@/types';

interface StatusBadgeProps {
  status: Status | UserRole | PatientStatus | StaffStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  hospitalized: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  jailed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  loa: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  admin: 'bg-primary/10 text-primary border-primary/20',
  staff: 'bg-accent/10 text-accent border-accent/20',
};

const statusLabels: Record<string, string> = {
  loa: 'LOA',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = statusLabels[status] || status;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        statusStyles[status] || 'bg-muted text-muted-foreground border-border',
        className
      )}
    >
      {label}
    </span>
  );
}
