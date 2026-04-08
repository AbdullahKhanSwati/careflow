'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  GitBranch,
  Plus,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton-loader';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/custom-accordion';
import { BranchForm } from '@/components/features/branches/branch-form';
import { mockStructures, mockBranches } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import { cn } from '@/lib/utils';
import type { Structure, Branch } from '@/types';
import Link from 'next/link';

interface StructureDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StructureDetailPage({ params }: StructureDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success } = useToast();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const foundStructure = mockStructures.find((s) => s.id === id);
      const structureBranches = mockBranches.filter((b) => b.structureId === id);
      setStructure(foundStructure || null);
      setBranches(structureBranches);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  const handleCreateBranch = async (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt' | 'structureId' | 'patientCount' | 'userCount'>) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newBranch: Branch = {
      ...data,
      id: `br-${Date.now()}`,
      structureId: id,
      patientCount: 0,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setBranches((prev) => [newBranch, ...prev]);
    setIsModalOpen(false);
    setIsSubmitting(false);
    success('Branch Created', `${data.name} has been added to this structure.`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <EmptyState
          icon="AlertCircle"
          title="Structure not found"
          description="The structure you're looking for doesn't exist or has been removed."
          actionLabel="Back to Structures"
          onAction={() => router.push('/dashboard/structures')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={structure.name}
        description={structure.description}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Structures', href: '/dashboard/structures' },
          { label: structure.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </div>
        }
      />

      {/* Structure Info Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {structure.name}
                </h2>
                <StatusBadge status={structure.status} />
              </div>
              <p className="text-muted-foreground mb-4">{structure.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Region Code:</span>
                  <span className="font-medium text-foreground">
                    {structure.regionCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Branches:</span>
                  <span className="font-medium text-foreground">
                    {branches.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {structure.notes && (
            <div className="lg:max-w-sm p-4 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium text-foreground mb-1">Notes</p>
              <p className="text-muted-foreground">{structure.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Branches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Branches ({branches.length})
          </h3>
        </div>

        {branches.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              icon="GitBranch"
              title="No branches yet"
              description="Add your first branch to this structure to start managing patients and staff."
              actionLabel="Add Branch"
              onAction={() => setIsModalOpen(true)}
            />
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {branches.map((branch) => (
              <AccordionItem key={branch.id} value={branch.id}>
                <AccordionTrigger value={branch.id}>
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <GitBranch className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-medium text-foreground truncate">
                        {branch.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{branch.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mr-4">
                    <StatusBadge status={branch.status} />
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{branch.patientCount} patients</span>
                      <span>{branch.userCount} staff</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent value={branch.id}>
                  <div className="pt-2 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {branch.contactNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{branch.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/branches/${branch.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Branch"
        description={`Add a new branch to ${structure.name}`}
        size="lg"
      >
        <BranchForm
          onSubmit={handleCreateBranch}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
