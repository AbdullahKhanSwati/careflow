'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import type { TableColumn } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton-loader';

interface DataTableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  loading?: boolean;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  emptyIcon = 'FileSearch',
  loading = false,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: keyof T | string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) =>
        searchFields.some((field) => {
          const value = row[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn as keyof T];
        const bVal = b[sortColumn as keyof T];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, searchFields, sortColumn, sortDirection]);

  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground',
                      column.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors',
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <span className="inline-flex flex-col">
                          {sortColumn === column.key ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12">
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((row) => (
                  <tr
                    key={String(row[keyField])}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-muted/50'
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${String(row[keyField])}-${String(column.key)}`}
                        className={cn('px-4 py-3 text-sm', column.className)}
                      >
                        {column.render
                          ? column.render(row[column.key as keyof T], row)
                          : String(row[column.key as keyof T] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
