'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Calendar,
  Edit,
  Mail,
  Phone,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mockPatients, mockProviders } from '@/lib/mock-data';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import {
  DetailHeaderCard,
  type DetailField,
} from '@/components/shared/detail-header-card';
import { NodeIcon } from '@/components/features/nodes/node-icon';
import { NodeTypeBadge } from '@/components/features/nodes/node-type-badge';
import { ProviderForm } from '@/components/features/providers/provider-form';
import { cn } from '@/lib/utils';
import type { Provider } from '@/types';

interface ProviderDetailPageProps {
  params: Promise<{ id: string }>;
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export default function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success } = useToast();
  const { nodes, getNode } = useNodes();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    setProvider(mockProviders.find((p) => p.id === id) ?? null);
  }, [id]);

  const node = provider ? getNode(provider.nodeId) : null;
  const branchPatients = useMemo(
    () => (node ? mockPatients.filter((p) => p.nodeId === node.id) : []),
    [node]
  );

  const nodeOptions = useMemo(
    () =>
      nodes
        .filter((n) => n.type === 'location' || n.type === 'program')
        .map((n) => ({ value: n.id, label: n.name })),
    [nodes]
  );

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <EmptyState
          icon="AlertCircle"
          title="Provider not found"
          description="The provider you're looking for doesn't exist or has been removed."
          actionLabel="Back to Providers"
          onAction={() => router.push('/dashboard/providers')}
        />
      </div>
    );
  }

  const handleUpdate = async (
    data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt' | 'avatar'>
  ) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setProvider({
      ...provider,
      ...data,
      updatedAt: new Date().toISOString(),
    });
    setSubmitting(false);
    setEditOpen(false);
    success('Provider updated', `${data.fullName}'s details saved.`);
  };

  const handleDelete = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        `Delete ${provider.fullName}? This cannot be undone.`
      );
      if (!ok) return;
    }
    success('Provider deleted', `${provider.fullName} has been removed.`);
    router.push('/dashboard/providers');
  };

  const fields: DetailField[] = [
    { icon: Mail, value: provider.email, href: `mailto:${provider.email}` },
    { icon: Phone, value: provider.phone },
    {
      icon: BadgeCheck,
      label: 'License',
      value: <span className="font-mono">{provider.licenseNumber}</span>,
    },
    {
      icon: Briefcase,
      label: 'Experience',
      value:
        provider.yearsExperience !== undefined
          ? `${provider.yearsExperience} years`
          : '—',
    },
    {
      icon: Calendar,
      label: 'Joined',
      value: dateFmt.format(new Date(provider.createdAt)),
      muted: true,
    },
    {
      icon: Calendar,
      label: 'Updated',
      value: dateFmt.format(new Date(provider.updatedAt)),
      muted: true,
    },
  ];

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb currentLabel={provider.fullName} />

      <PageHeader
        title={provider.fullName}
        description={
          provider.yearsExperience !== undefined
            ? `${provider.specialty.charAt(0).toUpperCase() + provider.specialty.slice(1)} · ${provider.yearsExperience} years experience`
            : `${provider.specialty.charAt(0).toUpperCase() + provider.specialty.slice(1)}`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <DetailHeaderCard
        icon={
          <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Stethoscope className="h-7 w-7" />
          </div>
        }
        title={provider.fullName}
        subtitle={
          <span className="capitalize">
            {provider.specialty} specialist
          </span>
        }
        badges={<StatusBadge status={provider.status} />}
        fields={fields}
        notes={provider.notes || undefined}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {node && (
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h3 className="font-semibold text-foreground mb-4">Attached to</h3>
            <button
              onClick={() => router.push(`/dashboard/branches/${node.id}`)}
              className="w-full flex items-center gap-3 rounded-lg p-3 -m-3 hover:bg-muted/50 transition-colors text-left"
            >
              <NodeIcon type={node.type} level={node.level} size="md" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {node.name}
                </p>
                <NodeTypeBadge type={node.type} level={node.level} />
              </div>
            </button>
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Patients at this branch
            </h3>
            <span className="text-xs text-muted-foreground">
              {branchPatients.length}
            </span>
          </div>
          {branchPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No patients registered at this branch.
            </p>
          ) : (
            <ul className="space-y-2">
              {branchPatients.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  onClick={() => router.push(`/dashboard/patients/${p.id}`)}
                  className={cn(
                    'flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer',
                    'hover:bg-muted/50 transition-colors'
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">
                      {p.fullName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.age} yrs · {p.gender}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit provider"
        description={`Update ${provider.fullName}'s details.`}
        size="lg"
      >
        <ProviderForm
          initialData={provider}
          nodeOptions={nodeOptions}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
