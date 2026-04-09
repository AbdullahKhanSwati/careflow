'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterState } from '@/types';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: keyof FilterState;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: FilterOption[];
  placeholder?: string;
}

interface AdvancedFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  config: FilterConfig[];
  searchPlaceholder?: string;
}

export function AdvancedFilter({
  filters,
  onFilterChange,
  config,
  searchPlaceholder = 'Search...',
}: AdvancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = { search: '' };
    config.forEach((c) => {
      if (c.key !== 'search') {
        clearedFilters[c.key] = undefined;
      }
    });
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'search' && value !== undefined && value !== ''
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== undefined && value !== ''
  ).length;

  return (
    <div className="space-y-4">
      {/* Search bar and toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pr-8"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expandable filter panel */}
      {isExpanded && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.map((filter) => {
              if (filter.key === 'search') return null;

              return (
                <div key={filter.key} className="space-y-2">
                  <Label htmlFor={filter.key} className="text-sm">
                    {filter.label}
                  </Label>
                  {filter.type === 'select' && filter.options && (
                    <Select
                      value={filters[filter.key] as string || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange(filter.key, value === 'all' ? '' : value)
                      }
                    >
                      <SelectTrigger id={filter.key}>
                        <SelectValue placeholder={filter.placeholder || 'All'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === 'date' && (
                    <Input
                      id={filter.key}
                      type="date"
                      value={(filters[filter.key] as string) || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                  )}
                  {filter.type === 'text' && (
                    <Input
                      id={filter.key}
                      type="text"
                      placeholder={filter.placeholder}
                      value={(filters[filter.key] as string) || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
