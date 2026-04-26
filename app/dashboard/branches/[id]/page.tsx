'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  UserCog,
  Users as UsersIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable } from '@/components/ui/data-table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/custom-tabs';
import { useNodes } from '@/components/providers/node-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mockPatients, mockUsers } from '@/lib/mock-data';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import {
  DetailHeaderCard,
  type DetailField,
} from '@/components/shared/detail-header-card';
import { StatRow, type Stat } from '@/components/shared/stat-row';
import { NodeIcon } from '@/components/features/nodes/node-icon';
import { NodeTypeBadge } from '@/components/features/nodes/node-type-badge';
import { PatientForm } from '@/components/features/patients/patient-form';
import { UserForm } from '@/components/features/users/user-form';
import type { Patient, TableColumn, User } from '@/types';

interface BranchDetailPageProps {
  params: Promise<{ id: string }>;
}

const patientColumns: TableColumn<Patient>[] = [
  {
    key: 'fullName',
    header: 'Patient',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-primary">
            {row.fullName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.fullName}</p>
          <p className="text-sm text-muted-foreground">{row.contactNumber}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'age',
    header: 'Age',
    sortable: true,
    render: (value) => <span>{String(value)} yrs</span>,
  },
  {
    key: 'gender',
    header: 'Gender',
    sortable: true,
    render: (value) => <span className="capitalize">{String(value)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value as Patient['status']} />,
  },
];

const userColumns: TableColumn<User>[] = [
  {
    key: 'fullName',
    header: 'Staff Member',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-accent">
            {row.fullName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{row.fullName}</p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  { key: 'phone', header: 'Phone', sortable: false },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    render: (value) => <StatusBadge status={value as User['role']} />,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => <StatusBadge status={value as User['status']} />,
  },
];

export default function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success } = useToast();
  const { getNode, deleteNode } = useNodes();

  const node = getNode(id);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPatients(mockPatients.filter((p) => p.nodeId === id));
    setUsers(mockUsers.filter((u) => u.nodeId === id));
  }, [id]);

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <EmptyState
          icon="AlertCircle"
          title="Branch not found"
          description="The branch you're looking for doesn't exist or has been removed."
          actionLabel="Back to Branches"
          onAction={() => router.push('/dashboard/branches')}
        />
      </div>
    );
  }

  if (node.type !== 'location' && node.type !== 'program') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <EmptyState
          icon="AlertCircle"
          title="Not a branch"
          description="Only locations and programs can be opened from this page."
          actionLabel="Back to Branches"
          onAction={() => router.push('/dashboard/branches')}
        />
      </div>
    );
  }

  const handleCreatePatient = async (
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'nodeId'>
  ) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const next: Patient = {
      ...data,
      id: `pat-${Date.now()}`,
      nodeId: node.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPatients((prev) => [next, ...prev]);
    setPatientModalOpen(false);
    setSubmitting(false);
    success('Patient added', `${data.fullName} registered at ${node.name}.`);
  };

  const handleCreateUser = async (
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'nodeId' | 'avatar'>
  ) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const next: User = {
      ...data,
      id: `usr-${Date.now()}`,
      nodeId: node.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers((prev) => [next, ...prev]);
    setUserModalOpen(false);
    setSubmitting(false);
    success('Staff added', `${data.fullName} joined ${node.name}.`);
  };

  const handleDelete = () => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Delete ${node.name}? This cannot be undone.`);
      if (!ok) return;
    }
    deleteNode(node.id);
    router.push('/dashboard/branches');
    success('Branch deleted', `${node.name} has been removed.`);
  };

  return (
    <div className="space-y-6">
      <NavigationBreadcrumb currentLabel={node.name} />

      <PageHeader
        title={node.name}
        description={
          node.type === 'location'
            ? `${node.city ?? ''}`
            : node.area || 'Outreach program'
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline">
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
        icon={<NodeIcon type={node.type} level={node.level} size="lg" />}
        title={node.name}
        subtitle={node.description}
        badges={
          <>
            <NodeTypeBadge type={node.type} level={node.level} />
            <StatusBadge status={node.status} />
          </>
        }
        fields={buildBranchFields(node)}
      />

      <StatRow
        stats={[
          {
            label: 'Patients',
            value: patients.length,
            icon: UsersIcon,
            tone: 'bg-primary/10 text-primary',
          },
          {
            label: 'Staff',
            value: users.length,
            icon: UserCog,
            tone: 'bg-accent/10 text-accent',
          },
        ]}
      />

      <Tabs defaultValue="patients">
        <TabsList>
          <TabsTrigger value="patients">
            <UsersIcon className="h-4 w-4 mr-2" />
            Patients ({patients.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            <UserCog className="h-4 w-4 mr-2" />
            Staff ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setPatientModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
            {patients.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon="Users"
                  title="No patients yet"
                  description={`Register the first patient at ${node.name}.`}
                  actionLabel="Add Patient"
                  onAction={() => setPatientModalOpen(true)}
                />
              </div>
            ) : (
              <DataTable
                columns={patientColumns}
                data={patients}
                keyField="id"
                searchable
                searchPlaceholder="Search patients..."
                searchFields={['fullName', 'contactNumber', 'address']}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setUserModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
            {users.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon="UserCog"
                  title="No staff yet"
                  description={`Add the first staff member to ${node.name}.`}
                  actionLabel="Add Staff"
                  onAction={() => setUserModalOpen(true)}
                />
              </div>
            ) : (
              <DataTable
                columns={userColumns}
                data={users}
                keyField="id"
                searchable
                searchPlaceholder="Search staff..."
                searchFields={['fullName', 'email', 'phone']}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        title="Add patient"
        description={`Register a new patient at ${node.name}.`}
        size="lg"
      >
        <PatientForm
          onSubmit={handleCreatePatient}
          onCancel={() => setPatientModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Add staff member"
        description={`Add a new staff member to ${node.name}.`}
        size="lg"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setUserModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * Build the field grid for the branch detail header. Only fields with a real
 * value are included so the layout stays tidy regardless of node type.
 */
function buildBranchFields(
  node: import('@/types').LocationNode | import('@/types').ProgramNode
): DetailField[] {
  const fields: DetailField[] = [];

  if (node.type === 'location') {
    fields.push({
      icon: MapPin,
      value: `${node.address}, ${node.city}`,
    });
    fields.push({ icon: Phone, value: node.contactNumber });
    fields.push({
      icon: Mail,
      value: node.email,
      href: `mailto:${node.email}`,
    });
  } else {
    if (node.area) fields.push({ icon: MapPin, value: node.area });
    if (node.schedule)
      fields.push({
        icon: Calendar,
        label: 'Schedule',
        value: node.schedule,
      });
    if (node.contactNumber)
      fields.push({ icon: Phone, value: node.contactNumber });
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

  return fields;
}
