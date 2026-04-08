'use client';

import { cn } from '@/lib/utils';
import type { Status, UserRole } from '@/types';

interface StatusBadgeProps {
  status: Status | UserRole;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  inactive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  admin: 'bg-primary/10 text-primary border-primary/20',
  staff: 'bg-accent/10 text-accent border-accent/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        statusStyles[status] || 'bg-muted text-muted-foreground border-border',
        className
      )}
    >
      {status}
    </span>
  );
}
