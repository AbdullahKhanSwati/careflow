'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid3X3,
  List,
  MapPin,
  Plus,
  Sparkles,
  UserCog,
  Users as UsersIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useNodes } from '@/components/providers/node-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mockPatients, mockUsers } from '@/lib/mock-data';
import {
  STATUS_OPTIONS,
  withAllOption,
} from '@/lib/constants';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import { NodeCard } from '@/components/features/nodes/node-card';
import { NodeForm, type NodeFormValues } from '@/components/features/nodes/node-form';
import { NodeTypeBadge } from '@/components/features/nodes/node-type-badge';
import { FilterBar } from '@/components/shared/filter-bar';
import { cn } from '@/lib/utils';
import type { Node, TableColumn } from '@/types';

export default function BranchesPage() {
  const router = useRouter();
  const {
    selectedNode,
    nodes,
    scopeIds,
    createNode,
  } = useNodes();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'direct' | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isAddOpen, setAddOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const branches = useMemo(() => {
    if (!selectedNode) return [];
    return nodes.filter((n) => {
      if (n.type !== 'location' && n.type !== 'program') return false;
      if (scope === 'direct') return n.parentId === selectedNode.id;
      return scopeIds.has(n.id);
    });
  }, [nodes, scopeIds, scope, selectedNode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return branches.filter((b) => {
      if (typeFilter && b.type !== typeFilter) return false;
      if (statusFilter && b.status !== statusFilter) return false;
      if (!q) return true;
      const haystack: string[] = [b.name];
      if (b.type === 'location') {
        haystack.push(b.city, b.address, b.email);
      } else if (b.type === 'program') {
        if (b.area) haystack.push(b.area);
        if (b.schedule) haystack.push(b.schedule);
      }
      return haystack.join(' ').toLowerCase().includes(q);
    });
  }, [branches, search, typeFilter, statusFilter]);

  if (!selectedNode) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="No node selected"
        description="Pick a node from the sidebar."
      />
    );
  }

  const canAddBranches =
    selectedNode.type === 'department' || selectedNode.type === 'root';

  const handleCreate = async (values: NodeFormValues) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = createNode({
      type: values.type,
      parentId: selectedNode.id,
      name: values.name,
      description: values.description,
      status: values.status,
      address: values.address,
      city: values.city,
      contactNumber: values.contactNumber,
      email: values.email,
      schedule: values.schedule,
      area: values.area,
    });
    setSubmitting(false);
    setAddOpen(false);
    success('Branch created', `${created.name} added to ${selectedNode.name}.`);
  };

  const handleReset = () => {
    setSearch('');
    setScope('all');
    setTypeFilter('');
    setStatusFilter('');
  };

  const tableColumns: TableColumn<Node>[] = [
    {
      key: 'name',
      header: 'Branch',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
              row.type === 'location'
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
            )}
          >
            {row.type === 'location' ? (
              <MapPin className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{row.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.type === 'location'
                ? row.city
                : row.type === 'program'
                  ? (row.area ?? '—')
                  : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (_, row) => <NodeTypeBadge type={row.type} level={row.level} />,
    },
    {
      key: 'parentId',
      header: 'Parent',
      sortable: false,
      render: (_, row) => {
        const parent = nodes.find((n) => n.id === row.parentId);
        return (
          <span className="text-sm text-muted-foreground">
            {parent?.name ?? '—'}
          </span>
        );
      },
    },
    {
      key: 'patientCount',
      header: 'Patients',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {mockPatients.filter((p) => p.nodeId === row.id).length}
          </span>
        </div>
      ),
    },
    {
      key: 'staffCount',
      header: 'Staff',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {mockUsers.filter((u) => u.nodeId === row.id).length}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb />

      <PageHeader
        title="Branches"
        description={`Locations and programs ${
          scope === 'direct' ? 'directly under' : 'anywhere inside'
        } ${selectedNode.name}.`}
        actions={
          canAddBranches && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          )
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches by name, city, area..."
        selects={[
          {
            id: 'scope',
            label: 'Scope',
            value: scope,
            onChange: (v) => setScope(v as 'direct' | 'all'),
            options: [
              { value: 'all', label: 'All inside' },
              { value: 'direct', label: 'Direct only' },
            ],
          },
          {
            id: 'type',
            label: 'Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: '', label: 'All' },
              { value: 'location', label: 'Locations' },
              { value: 'program', label: 'Programs' },
            ],
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
            Showing <strong>{filtered.length}</strong> of {branches.length} branches
          </span>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="GitBranch"
            title="No branches"
            description={
              branches.length === 0
                ? canAddBranches
                  ? `Add the first location or program under ${selectedNode.name}.`
                  : 'Pick a department or the organization root to manage branches.'
                : 'Adjust the filters or clear them to see more.'
            }
            actionLabel={
              branches.length === 0 && canAddBranches ? 'Add Branch' : undefined
            }
            onAction={
              branches.length === 0 && canAddBranches ? () => setAddOpen(true) : undefined
            }
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              patientCount={mockPatients.filter((p) => p.nodeId === node.id).length}
              staffCount={mockUsers.filter((u) => u.nodeId === node.id).length}
              href={`/dashboard/branches/${node.id}`}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          data={filtered}
          keyField="id"
          onRowClick={(row) => router.push(`/dashboard/branches/${row.id}`)}
        />
      )}

      <Modal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        title="Add branch"
        description={`Add a location or program under ${selectedNode.name}.`}
        size="lg"
      >
        <NodeForm
          parent={selectedNode}
          allowedTypes={['location', 'program']}
          defaultType="location"
          onSubmit={handleCreate}
          onCancel={() => setAddOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
