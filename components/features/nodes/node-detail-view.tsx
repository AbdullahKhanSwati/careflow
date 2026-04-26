'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  GitBranch,
  Hash,
  Mail,
  MapPin,
  Phone,
  Plus,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mockPatients, mockProviders, mockUsers } from '@/lib/mock-data';
import {
  STATUS_OPTIONS,
  withAllOption,
} from '@/lib/constants';
import { getChildren } from '@/lib/utils/node-tree';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import {
  DetailHeaderCard,
  type DetailField,
} from '@/components/shared/detail-header-card';
import { StatRow, type Stat } from '@/components/shared/stat-row';
import { NodeIcon } from './node-icon';
import { NodeTypeBadge } from './node-type-badge';
import { NodeCard } from './node-card';
import { NodeForm, type NodeFormValues } from './node-form';
import { FilterBar } from '@/components/shared/filter-bar';
import type { Node } from '@/types';

interface NodeDetailViewProps {
  node: Node;
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * Reusable detail view rendered by both /dashboard/departments (showing the
 * sidebar-selected node) and /dashboard/departments/[id] (showing a specific
 * node addressed via URL). The component does NOT change the global selection
 * — clicks on child cards navigate to the relevant detail page.
 */
export function NodeDetailView({ node }: NodeDetailViewProps) {
  const router = useRouter();
  const { nodes, createNode, getNode } = useNodes();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddOpen, setAddOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const children = useMemo(
    () => getChildren(nodes, node.id),
    [nodes, node.id]
  );

  const filteredChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    return children.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [c.name, c.description ?? ''].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [children, search, typeFilter, statusFilter]);

  const counts = useMemo(() => {
    const subScope = nodes
      .filter((n) => n.id === node.id || n.path.includes(node.id))
      .map((n) => n.id);
    const ids = new Set(subScope);
    return {
      subDepartments: nodes.filter(
        (n) => ids.has(n.id) && n.type === 'department' && n.id !== node.id
      ).length,
      branches: nodes.filter(
        (n) => ids.has(n.id) && (n.type === 'location' || n.type === 'program')
      ).length,
      patients: mockPatients.filter((p) => ids.has(p.nodeId)).length,
      staff: mockUsers.filter((u) => ids.has(u.nodeId)).length,
      providers: mockProviders.filter((p) => ids.has(p.nodeId)).length,
    };
  }, [nodes, node.id]);

  const canAddChildren = node.type === 'root' || node.type === 'department';
  const parent = node.parentId ? getNode(node.parentId) : null;

  const navigateToChild = (child: Node) => {
    if (child.type === 'department') {
      router.push(`/dashboard/departments/${child.id}`);
    } else if (child.type === 'location' || child.type === 'program') {
      router.push(`/dashboard/branches/${child.id}`);
    }
  };

  const childCountFor = (childId: string) => {
    const subScope = nodes
      .filter((n) => n.id === childId || n.path.includes(childId))
      .map((n) => n.id);
    const ids = new Set(subScope);
    return {
      childCount: subScope.length - 1,
      patientCount: mockPatients.filter((p) => ids.has(p.nodeId)).length,
      staffCount:
        mockUsers.filter((u) => ids.has(u.nodeId)).length +
        mockProviders.filter((p) => ids.has(p.nodeId)).length,
    };
  };

  const handleCreate = async (values: NodeFormValues) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = createNode({
      type: values.type,
      parentId: node.id,
      name: values.name,
      description: values.description,
      status: values.status,
      code: values.code,
      notes: values.notes,
      address: values.address,
      city: values.city,
      contactNumber: values.contactNumber,
      email: values.email,
      schedule: values.schedule,
      area: values.area,
    });
    setSubmitting(false);
    setAddOpen(false);
    success(
      `${values.type[0].toUpperCase() + values.type.slice(1)} created`,
      `${created.name} added to ${node.name}.`
    );
  };

  const handleReset = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
  };

  const typeOptions: { value: string; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'department', label: 'Departments' },
    { value: 'location', label: 'Locations' },
    { value: 'program', label: 'Programs' },
  ];

  // Build the field list per node type. Only known/non-empty fields are
  // included so the grid stays tidy.
  const fields: DetailField[] = [];
  if (node.type === 'department' && node.code) {
    fields.push({ icon: Hash, label: 'Code', value: node.code });
  }
  if (node.type === 'location') {
    fields.push({
      icon: MapPin,
      value: `${node.address}, ${node.city}`,
    });
    fields.push({ icon: Phone, value: node.contactNumber });
    fields.push({ icon: Mail, value: node.email });
  }
  if (node.type === 'program') {
    if (node.area) fields.push({ icon: MapPin, value: node.area });
    if (node.schedule)
      fields.push({ icon: Calendar, label: 'Schedule', value: node.schedule });
    if (node.contactNumber)
      fields.push({ icon: Phone, value: node.contactNumber });
  }
  if (parent) {
    fields.push({
      icon: Building2,
      label: 'Parent',
      value: parent.name,
      muted: true,
    });
  }
  fields.push({
    icon: Calendar,
    label: 'Created',
    value: dateFmt.format(new Date(node.createdAt)),
    muted: true,
  });
  fields.push({
    icon: Calendar,
    label: 'Updated',
    value: dateFmt.format(new Date(node.updatedAt)),
    muted: true,
  });

  // Department-style notes only exist on department nodes.
  const notes = node.type === 'department' ? node.notes : undefined;

  // Counters shown below the header for nodes that can hold children.
  const stats: Stat[] = canAddChildren
    ? [
        {
          label: 'Sub-departments',
          value: counts.subDepartments,
          icon: Building2,
          tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        },
        {
          label: 'Branches',
          value: counts.branches,
          icon: GitBranch,
          tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
          label: 'Patients',
          value: counts.patients,
          icon: Users,
          tone: 'bg-primary/10 text-primary',
        },
        {
          label: 'Staff',
          value: counts.staff,
          icon: UserCog,
          tone: 'bg-accent/10 text-accent',
        },
        {
          label: 'Providers',
          value: counts.providers,
          icon: Stethoscope,
          tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb currentLabel={node.name} />

      <PageHeader
        title={node.name}
        description={
          node.type === 'root'
            ? 'Organization root — every department lives below.'
            : node.type === 'department'
              ? 'Department details and sub-nodes'
              : node.type === 'location'
                ? 'Location details'
                : 'Program details'
        }
        actions={
          canAddChildren && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sub-node
            </Button>
          )
        }
      />

      <DetailHeaderCard
        icon={
          <NodeIcon type={node.type} level={node.level} size="lg" />
        }
        title={node.name}
        subtitle={node.description}
        badges={
          <>
            <NodeTypeBadge type={node.type} level={node.level} />
            <StatusBadge status={node.status} />
          </>
        }
        fields={fields}
        notes={notes}
      />

      {stats.length > 0 && <StatRow stats={stats} />}

      {canAddChildren && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Sub-nodes
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {children.length} total
              </span>
            </h3>
          </div>

          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search sub-nodes by name or description..."
            selects={[
              {
                id: 'type',
                label: 'Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: typeOptions,
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
            hint={
              <span>
                Showing <strong>{filteredChildren.length}</strong> of{' '}
                {children.length} sub-nodes
              </span>
            }
          />

          {filteredChildren.length === 0 ? (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                icon="Building2"
                title={
                  children.length === 0
                    ? 'No sub-nodes yet'
                    : 'No sub-nodes match your filters'
                }
                description={
                  children.length === 0
                    ? `Add the first sub-node under ${node.name}.`
                    : 'Adjust the filters or clear them to see more.'
                }
                actionLabel={children.length === 0 ? 'Add Sub-node' : undefined}
                onAction={
                  children.length === 0 ? () => setAddOpen(true) : undefined
                }
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredChildren.map((child) => {
                const c = childCountFor(child.id);
                return (
                  <NodeCard
                    key={child.id}
                    node={child}
                    childCount={
                      child.type === 'department' ? c.childCount : undefined
                    }
                    patientCount={c.patientCount}
                    staffCount={c.staffCount}
                    onClick={() => navigateToChild(child)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {!canAddChildren && (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="AlertCircle"
            title="Leaf node"
            description="Locations and programs cannot contain sub-nodes — view them under Branches."
          />
        </div>
      )}

      <Modal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        title="Add sub-node"
        description={`Create a new sub-node under ${node.name}.`}
        size="lg"
      >
        <NodeForm
          parent={node}
          onSubmit={handleCreate}
          onCancel={() => setAddOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}

