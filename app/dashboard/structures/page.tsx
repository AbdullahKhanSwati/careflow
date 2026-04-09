'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Grid3X3, List, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { AdvancedFilter } from '@/components/ui/advanced-filter';
import { StructureForm } from '@/components/features/structures/structure-form';
import { structuresColumns } from '@/components/features/structures/structures-columns';
import { mockStructures } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import { STATUS_OPTIONS, FACILITY_TYPE_OPTIONS } from '@/lib/constants/index';
import { cn } from '@/lib/utils';
import type { Structure, FilterState } from '@/types';

export default function StructuresPage() {
  const router = useRouter();
  const { success } = useToast();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({ search: '' });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStructures(mockStructures);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const structureTypeOptions = useMemo(
    () => FACILITY_TYPE_OPTIONS,
    []
  );

  const filterConfig = useMemo(() => [
    {
      key: 'status' as keyof FilterState,
      label: 'Status',
      type: 'select' as const,
      options: STATUS_OPTIONS,
    },
    {
      key: 'type' as keyof FilterState,
      label: 'Type',
      type: 'select' as const,
      options: FACILITY_TYPE_OPTIONS,
    },
  ], []);

  const filteredStructures = useMemo(() => {
    return structures.filter((structure) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          structure.title.toLowerCase().includes(searchLower) ||
          structure.code.toLowerCase().includes(searchLower) ||
          structure.city.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && structure.status !== filters.status) {
        return false;
      }
      
      // Type filter
      if (filters.type && structure.type !== filters.type) {
        return false;
      }
      
      return true;
    });
  }, [structures, filters]);

  const handleCreateStructure = async (data: Omit<Structure, 'id' | 'createdAt' | 'updatedAt' | 'branchCount'>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newStructure: Structure = {
      ...data,
      id: `str-${Date.now()}`,
      branchCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setStructures((prev) => [newStructure, ...prev]);
    setIsModalOpen(false);
    setIsSubmitting(false);
    success('Structure Created', `${data.title} has been created successfully.`);
  };

  const handleRowClick = (structure: Structure) => {
    router.push(`/dashboard/structures/${structure.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Structures"
        description="Manage regional groupings for your healthcare network"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Structures' },
        ]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Structure
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <AdvancedFilter
          filters={filters}
          onFilterChange={setFilters}
          config={filterConfig}
          searchPlaceholder="Search structures by name, code, or city..."
        />
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="Building2"
            title="No structures found"
            description={
              filters.search || filters.status || filters.type
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first structure'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStructures.map((structure) => (
            <Link
              key={structure.id}
              href={`/dashboard/structures/${structure.id}`}
              className={cn(
                'group rounded-xl border border-border bg-card p-5',
                'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                'transition-all duration-300 block'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Building2 className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <StatusBadge status={structure.status} />
              </div>
              <h3 className="font-semibold text-foreground mb-1 truncate">
                {structure.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{structure.city}, {structure.state}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code:</span>
                  <span className="font-medium text-foreground">{structure.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-foreground capitalize">{structure.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branches:</span>
                  <span className="font-medium text-foreground">{structure.branchCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <DataTable
          columns={structuresColumns}
          data={filteredStructures}
          keyField="id"
          onRowClick={handleRowClick}
          emptyTitle="No structures found"
          emptyDescription="There are no structures matching your criteria"
          emptyIcon="Building2"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Structure"
        description="Add a new regional structure to your organization"
        size="lg"
      >
        <StructureForm
          onSubmit={handleCreateStructure}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
