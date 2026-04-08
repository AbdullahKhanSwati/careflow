'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StructureForm } from '@/components/features/structures/structure-form';
import { structuresColumns } from '@/components/features/structures/structures-columns';
import { mockStructures } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import type { Structure } from '@/types';

export default function StructuresPage() {
  const router = useRouter();
  const { success } = useToast();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStructures(mockStructures);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
    success('Structure Created', `${data.name} has been created successfully.`);
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

      <DataTable
        columns={structuresColumns}
        data={structures}
        keyField="id"
        onRowClick={handleRowClick}
        searchable
        searchPlaceholder="Search structures..."
        searchFields={['name', 'regionCode', 'description']}
        emptyTitle="No structures yet"
        emptyDescription="Get started by creating your first structure."
        emptyIcon="Building2"
        loading={isLoading}
      />

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
