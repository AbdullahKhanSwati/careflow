'use client';

import {
  Activity,
  Building2,
  GitBranch,
  MapPin,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatCard as StatCardType } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Building2,
  GitBranch,
  Users,
  UserCog,
  Activity,
  MapPin,
  Sparkles,
  Stethoscope,
};

interface StatCardProps {
  stat: StatCardType;
  className?: string;
}

export function StatCard({ stat, className }: StatCardProps) {
  const Icon = iconMap[stat.icon] || Activity;

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-border bg-card p-6',
        'transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
        'hover:border-primary/20',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {stat.value}
          </p>
          {stat.change !== undefined && (
            <div className="flex items-center gap-1">
              {stat.changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  stat.changeType === 'increase'
                    ? 'text-emerald-500'
                    : 'text-red-500'
                )}
              >
                {stat.change}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'rounded-xl p-3',
            'bg-primary/10 text-primary',
            'transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {/* Decorative gradient */}
      <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
