'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Grid3X3, List, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { AdvancedFilter } from '@/components/ui/advanced-filter';
import { ProviderForm } from '@/components/features/providers/provider-form';
import { mockProviders } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import { PROVIDER_STATUS_OPTIONS, PROVIDER_SPECIALTY_OPTIONS, PROVIDER_TYPE_OPTIONS } from '@/lib/constants/index';
import { cn } from '@/lib/utils';
import type { Provider, FilterState, TableColumn } from '@/types';

const providerColumns: TableColumn<Provider>[] = [
  {
    key: 'firstName',
    header: 'Name',
    render: (_, row: Provider) => `${row.firstName} ${row.lastName}`,
  },
  {
    key: 'providerType',
    header: 'Type',
    render: (value) => (
      <span className="capitalize">
        {value === 'individual' ? 'Individual' : 'Organization'}
      </span>
    ),
  },
  {
    key: 'specialty',
    header: 'Specialty',
    render: (value) => {
      const specialty = PROVIDER_SPECIALTY_OPTIONS.find(s => s.value === value);
      return specialty?.label || value;
    },
  },
  {
    key: 'npiNumber',
    header: 'NPI Number',
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'phone',
    header: 'Phone',
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <StatusBadge status={value as any} />,
  },
];

export default function ProvidersPage() {
  const router = useRouter();
  const { success } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({ search: '' });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setProviders(mockProviders);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filterConfig = useMemo(() => [
    {
      key: 'status' as keyof FilterState,
      label: 'Status',
      type: 'select' as const,
      options: PROVIDER_STATUS_OPTIONS,
    },
    {
      key: 'type' as keyof FilterState,
      label: 'Type',
      type: 'select' as const,
      options: PROVIDER_TYPE_OPTIONS,
    },
    {
      key: 'specialty' as keyof FilterState,
      label: 'Specialty',
      type: 'select' as const,
      options: PROVIDER_SPECIALTY_OPTIONS,
    },
  ], []);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          provider.firstName.toLowerCase().includes(searchLower) ||
          provider.lastName.toLowerCase().includes(searchLower) ||
          provider.npiNumber.toLowerCase().includes(searchLower) ||
          provider.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && provider.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type && provider.providerType !== filters.type) {
        return false;
      }

      // Specialty filter
      if (filters.specialty && provider.specialty !== filters.specialty) {
        return false;
      }

      return true;
    });
  }, [providers, filters]);

  const handleCreateProvider = async (data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newProvider: Provider = {
      ...data,
      id: `prov-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProviders((prev) => [newProvider, ...prev]);
    setIsModalOpen(false);
    setIsSubmitting(false);
    success('Provider Created', `${data.firstName} ${data.lastName} has been created successfully.`);
  };

  const handleRowClick = (provider: Provider) => {
    router.push(`/dashboard/providers/${provider.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Providers"
        description="Manage healthcare providers and doctors"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Providers' },
        ]}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <AdvancedFilter
          filters={filters}
          onFilterChange={setFilters}
          config={filterConfig}
          searchPlaceholder="Search providers by name, NPI, or email..."
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
      ) : filteredProviders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="Stethoscope"
            title="No providers found"
            description={
              filters.search || filters.status || filters.type || filters.specialty
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first provider'
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            <Link
              key={provider.id}
              href={`/dashboard/providers/${provider.id}`}
              className={cn(
                'group rounded-xl border border-border bg-card p-5',
                'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                'transition-all duration-300 block'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Stethoscope className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <StatusBadge status={provider.status} />
              </div>
              <h3 className="font-semibold text-foreground mb-1 truncate">
                {provider.firstName} {provider.lastName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {PROVIDER_SPECIALTY_OPTIONS.find(s => s.value === provider.specialty)?.label}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-foreground capitalize">
                    {provider.providerType === 'individual' ? 'Individual' : 'Organization'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NPI:</span>
                  <span className="font-medium text-foreground">{provider.npiNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground text-xs truncate">{provider.email}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <DataTable
          columns={providerColumns}
          data={filteredProviders}
          keyField="id"
          onRowClick={handleRowClick}
          emptyTitle="No providers found"
          emptyDescription="There are no providers matching your criteria"
          emptyIcon="Stethoscope"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Provider"
        description="Create a new healthcare provider"
      >
        <ProviderForm
          onSubmit={handleCreateProvider}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
