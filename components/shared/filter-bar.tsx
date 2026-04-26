'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ==========================================
// FILTER BAR
// ==========================================
// Reusable filter row used by Patients, Staff, Providers, Departments and
// Branches pages. Composable building blocks (search + select pills + reset)
// so each page declares only the filters it needs.

export interface FilterOption {
  value: string;
  label: string;
}

export interface SelectFilterDef {
  id: string;
  label: string;
  value: string;
  options: FilterOption[]; // first option is treated as "all" when value === ''
  onChange: (value: string) => void;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selects?: SelectFilterDef[];
  onReset?: () => void;
  /** Right-side actions like view-mode toggles. */
  rightSlot?: React.ReactNode;
  /** Bottom-left additional content like result counts. */
  hint?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  selects = [],
  onReset,
  rightSlot,
  hint,
  className,
}: FilterBarProps) {
  const hasActiveFilter =
    search.trim() !== '' || selects.some((s) => s.value !== '');

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3 sm:p-4',
        'flex flex-col gap-3',
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selects.map((s) => (
            <SelectPill key={s.id} {...s} />
          ))}

          {rightSlot}

          {onReset && hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SelectPill({
  id,
  label,
  value,
  options,
  onChange,
}: SelectFilterDef) {
  const inputId = `filter-${id}`;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border bg-background',
        'px-3 h-9 text-sm transition-colors hover:border-foreground/30',
        value !== '' && 'border-primary/50 bg-primary/5'
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-foreground font-medium outline-none cursor-pointer pr-1"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
