'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CircleUser,
  Edit,
  IdCard,
  MapPin,
  Phone,
  Stethoscope,
  Trash2,
  VenusAndMars,
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
import { PatientForm } from '@/components/features/patients/patient-form';
import type { Patient } from '@/types';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success } = useToast();
  const { getNode } = useNodes();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const found = mockPatients.find((p) => p.id === id) ?? null;
    setPatient(found);
  }, [id]);

  const node = patient ? getNode(patient.nodeId) : null;
  const careTeam = useMemo(
    () => (node ? mockProviders.filter((p) => p.nodeId === node.id) : []),
    [node]
  );

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <EmptyState
          icon="AlertCircle"
          title="Patient not found"
          description="The patient you're looking for doesn't exist or has been removed."
          actionLabel="Back to Patients"
          onAction={() => router.push('/dashboard/patients')}
        />
      </div>
    );
  }

  const handleUpdate = async (
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'nodeId'>
  ) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setPatient({
      ...patient,
      ...data,
      updatedAt: new Date().toISOString(),
    });
    setSubmitting(false);
    setEditOpen(false);
    success('Patient updated', `${data.fullName}'s details saved.`);
  };

  const handleDelete = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        `Delete ${patient.fullName}? This cannot be undone.`
      );
      if (!ok) return;
    }
    success('Patient deleted', `${patient.fullName} has been removed.`);
    router.push('/dashboard/patients');
  };

  const fields: DetailField[] = [
    { icon: Phone, value: patient.contactNumber },
    { icon: MapPin, value: patient.address },
    {
      icon: VenusAndMars,
      label: 'Gender',
      value: <span className="capitalize">{patient.gender}</span>,
    },
    { icon: CircleUser, label: 'Age', value: `${patient.age} years` },
    {
      icon: IdCard,
      label: 'Patient ID',
      value: patient.id,
      muted: true,
    },
    {
      icon: Calendar,
      label: 'Registered',
      value: dateFmt.format(new Date(patient.createdAt)),
      muted: true,
    },
  ];

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb currentLabel={patient.fullName} />

      <PageHeader
        title={patient.fullName}
        description={`${patient.age} years old, ${patient.gender}`}
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
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
            {patient.fullName.charAt(0)}
          </div>
        }
        title={patient.fullName}
        subtitle={`${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} · ${patient.age} years`}
        badges={<StatusBadge status={patient.status} />}
        fields={fields}
        notes={patient.medicalNotes || undefined}
        notesTitle="Medical notes"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {node && (
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h3 className="font-semibold text-foreground mb-4">Branch</h3>
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
            <h3 className="font-semibold text-foreground">Care team</h3>
            <span className="text-xs text-muted-foreground">
              {careTeam.length} provider{careTeam.length === 1 ? '' : 's'}
            </span>
          </div>
          {careTeam.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No providers attached at this branch yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {careTeam.map((provider) => (
                <li
                  key={provider.id}
                  onClick={() =>
                    router.push(`/dashboard/providers/${provider.id}`)
                  }
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-4 w-4 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {provider.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {provider.specialty}
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
        title="Edit patient"
        description={`Update ${patient.fullName}'s details.`}
        size="lg"
      >
        <PatientForm
          initialData={patient}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}
