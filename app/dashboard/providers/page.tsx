'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BadgeCheck,
  Eye,
  Grid3X3,
  List,
  Mail,
  MapPin,
  Phone,
  Plus,
  Stethoscope,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mockProviders } from '@/lib/mock-data';
import {
  SPECIALTY_OPTIONS,
  STATUS_OPTIONS,
  withAllOption,
} from '@/lib/constants';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import { FilterBar } from '@/components/shared/filter-bar';
import { ProviderForm } from '@/components/features/providers/provider-form';
import { cn } from '@/lib/utils';
import type { Provider, TableColumn } from '@/types';

export default function ProvidersPage() {
  const router = useRouter();
  const { selectedNode, scopeIds, getNode, nodes } = useNodes();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isAddOpen, setAddOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState<Provider[]>(mockProviders);

  const inScope = useMemo(
    () => providers.filter((p) => scopeIds.has(p.nodeId)),
    [providers, scopeIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inScope.filter((p) => {
      if (specialty && p.specialty !== specialty) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (!q) return true;
      return [p.fullName, p.email, p.phone, p.licenseNumber, p.specialty]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [inScope, search, specialty, statusFilter]);

  // Provider creation needs a leaf-node target. Build options scoped to the
  // current selection so the dropdown only shows relevant places to attach.
  const nodeOptions = useMemo(() => {
    return nodes
      .filter(
        (n) =>
          scopeIds.has(n.id) && (n.type === 'location' || n.type === 'program')
      )
      .map((n) => ({ value: n.id, label: n.name }));
  }, [nodes, scopeIds]);

  if (!selectedNode) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="No node selected"
        description="Pick a node from the sidebar."
      />
    );
  }

  const handleCreate = async (
    data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt' | 'avatar'>
  ) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const next: Provider = {
      ...data,
      id: `prov-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProviders((prev) => [next, ...prev]);
    setSubmitting(false);
    setAddOpen(false);
    success('Provider added', `${data.fullName} has been registered.`);
  };

  const handleReset = () => {
    setSearch('');
    setSpecialty('');
    setStatusFilter('');
  };

  const columns: TableColumn<Provider>[] = [
    {
      key: 'fullName',
      header: 'Provider',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
            <Stethoscope className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{row.fullName}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {row.specialty}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'nodeId',
      header: 'Attached to',
      sortable: true,
      render: (value) => {
        const node = getNode(String(value));
        return (
          <span className="text-sm text-muted-foreground">
            {node?.name ?? 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'licenseNumber',
      header: 'License',
      sortable: false,
      render: (value) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'yearsExperience',
      header: 'Experience',
      sortable: true,
      render: (value) =>
        value === undefined || value === null ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <span className="text-sm">{String(value)} yrs</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value as Provider['status']} />,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      className: 'w-[1%] whitespace-nowrap text-right',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/providers/${row.id}`);
          }}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb />

      <PageHeader
        title="Providers"
        description={`Healthcare providers attached inside ${selectedNode.name}.`}
        actions={
          nodeOptions.length > 0 && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          )
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search providers by name, license, specialty..."
        selects={[
          {
            id: 'specialty',
            label: 'Specialty',
            value: specialty,
            onChange: setSpecialty,
            options: withAllOption(SPECIALTY_OPTIONS),
          },
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: withAllOption(STATUS_OPTIONS),
          },
        ]}
        onReset={handleReset}
        rightSlot={
          <div className="flex items-center gap-1">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
        hint={
          <span>
            Showing <strong>{filtered.length}</strong> of {inScope.length} providers
          </span>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="UserCog"
            title="No providers found"
            description={
              inScope.length === 0
                ? `No providers are attached inside ${selectedNode.name}.`
                : 'Adjust the filters or clear them to see more.'
            }
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((provider) => {
            const node = getNode(provider.nodeId);
            return (
              <Link
                key={provider.id}
                href={`/dashboard/providers/${provider.id}`}
                className={cn(
                  'group rounded-xl border border-border bg-card p-5 block',
                  'hover:border-violet-500/40 hover:shadow-md transition-all'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                    <Stethoscope className="h-7 w-7 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors" />
                  </div>
                  <StatusBadge status={provider.status} />
                </div>
                <h3 className="font-semibold text-foreground mb-1 truncate">
                  {provider.fullName}
                </h3>
                <p className="text-sm text-muted-foreground capitalize mb-4">
                  {provider.specialty}
                  {provider.yearsExperience !== undefined &&
                    ` · ${provider.yearsExperience} yrs`}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {provider.phone}
                  </div>
                  {node && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {node.name}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="font-mono text-xs">{provider.licenseNumber}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          onRowClick={(row) => router.push(`/dashboard/providers/${row.id}`)}
        />
      )}

      <Modal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        title="Add provider"
        description="Register a new healthcare provider."
        size="lg"
      >
        <ProviderForm
          nodeOptions={nodeOptions}
          onSubmit={handleCreate}
          onCancel={() => setAddOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
