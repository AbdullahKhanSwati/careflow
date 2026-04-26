'use client';

import { cn } from '@/lib/utils';

// ==========================================
// STAT ROW
// ==========================================
// Compact horizontal strip of counter cards used under detail headers (e.g.
// department: sub-departments, branches, patients, staff, providers).

export interface Stat {
  label: string;
  value: number | string;
  icon?: React.ElementType;
  /** Optional Tailwind colour utility class for the icon tile (e.g.
   *  `bg-primary/10 text-primary`). */
  tone?: string;
}

interface StatRowProps {
  stats: Stat[];
  className?: string;
}

export function StatRow({ stats, className }: StatRowProps) {
  if (stats.length === 0) return null;

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3',
        className
      )}
    >
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className={cn(
              'rounded-xl border border-border bg-card',
              'p-4 flex items-center gap-3'
            )}
          >
            {Icon && (
              <div
                className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                  s.tone ?? 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground leading-none">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {s.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
