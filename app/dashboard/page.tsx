'use client';

import { HeartPulse, UserCog, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/custom-tabs';
import { useNodes } from '@/components/providers/node-provider';
import { mockPatients, mockProviders, mockUsers } from '@/lib/mock-data';
import { NavigationBreadcrumb } from '@/components/shared/navigation-breadcrumb';
import { PatientsTab } from '@/components/features/dashboard/patients-tab';
import { StaffTab } from '@/components/features/dashboard/staff-tab';
import { CareTab } from '@/components/features/care/care-tab';
import type { StatCard as StatCardType } from '@/types';

export default function DashboardPage() {
  const { selectedNode, scopeIds, nodes } = useNodes();

  if (!selectedNode) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="No node selected"
        description="Pick a node from the sidebar to see its dashboard."
      />
    );
  }

  const scopedPatients = mockPatients.filter((p) => scopeIds.has(p.nodeId));
  const scopedStaff = mockUsers.filter((u) => scopeIds.has(u.nodeId));
  const scopedProviders = mockProviders.filter((p) => scopeIds.has(p.nodeId));
  const scopedBranches = nodes.filter(
    (n) => scopeIds.has(n.id) && (n.type === 'location' || n.type === 'program')
  );
  const scopedDepartments = nodes.filter(
    (n) =>
      scopeIds.has(n.id) && n.type === 'department' && n.id !== selectedNode.id
  );

  const stats: StatCardType[] = [
    {
      id: 'stat-departments',
      title: 'Departments',
      value: scopedDepartments.length,
      icon: 'Building2',
    },
    {
      id: 'stat-branches',
      title: 'Branches',
      value: scopedBranches.length,
      icon: 'GitBranch',
    },
    {
      id: 'stat-patients',
      title: 'Patients',
      value: scopedPatients.length,
      icon: 'Users',
    },
    {
      id: 'stat-staff',
      title: 'Staff',
      value: scopedStaff.length,
      icon: 'UserCog',
    },
    {
      id: 'stat-providers',
      title: 'Providers',
      value: scopedProviders.length,
      icon: 'Stethoscope',
    },
  ];

  return (
    <div className="space-y-8">
      <NavigationBreadcrumb />

      <PageHeader
        title="Overview"
        description={`Snapshot of everything inside ${selectedNode.name}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <section className="space-y-4">
        <Tabs defaultValue="patients">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="patients">
              <Users className="h-4 w-4 mr-2" />
              Patients
              <span className="ml-2 text-xs text-muted-foreground">
                {scopedPatients.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="staff">
              <UserCog className="h-4 w-4 mr-2" />
              Staff
              <span className="ml-2 text-xs text-muted-foreground">
                {scopedStaff.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="care">
              <HeartPulse className="h-4 w-4 mr-2" />
              Care
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <PatientsTab />
          </TabsContent>
          <TabsContent value="staff">
            <StaffTab />
          </TabsContent>
          <TabsContent value="care">
            <CareTab />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

