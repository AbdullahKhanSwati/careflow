'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Users,
  Plus,
  Phone,
  Mail,
  Calendar,
  Heart,
  GitBranch,
  ArrowLeft,
  Building2,
  X,
  Briefcase,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton-loader';
import { Checkbox } from '@/components/ui/checkbox';
import { mockPatients, mockUsers, mockBranches } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import { cn } from '@/lib/utils';
import type { Patient, User as UserType, Branch } from '@/types';

interface StaffDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success } = useToast();
  const [staff, setStaff] = useState<UserType | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [staffBranch, setStaffBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assignPatientModalOpen, setAssignPatientModalOpen] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundStaff = mockUsers.find((u) => u.id === id);
      if (foundStaff) {
        const patients = mockPatients.filter((p) => foundStaff.assignedPatientIds.includes(p.id));
        const branch = mockBranches.find((b) => b.id === foundStaff.branchId);
        setStaff(foundStaff);
        setAssignedPatients(patients);
        setStaffBranch(branch || null);
        setSelectedPatientIds(foundStaff.assignedPatientIds);
      }
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  // Get available patients (from the same branch as staff)
  const availablePatients = mockPatients.filter((p) => 
    staff?.branchId && p.branchIds.includes(staff.branchId)
  );

  const handleAssignPatients = () => {
    if (!staff) return;
    
    const newPatients = mockPatients.filter((p) => selectedPatientIds.includes(p.id));
    setAssignedPatients(newPatients);
    setStaff({ ...staff, assignedPatientIds: selectedPatientIds });
    setAssignPatientModalOpen(false);
    success('Patients Updated', 'Patient assignments have been updated successfully.');
  };

  const handleRemovePatient = (patientId: string) => {
    if (!staff) return;
    const newIds = staff.assignedPatientIds.filter((id) => id !== patientId);
    setSelectedPatientIds(newIds);
    setAssignedPatients((prev) => prev.filter((p) => p.id !== patientId));
    setStaff({ ...staff, assignedPatientIds: newIds });
    success('Patient Removed', 'Patient has been unassigned from this staff member.');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <EmptyState
          icon="AlertCircle"
          title="Staff not found"
          description="The staff member you're looking for doesn't exist or has been removed."
          actionLabel="Back to Staff"
          onAction={() => router.push('/dashboard/staff')}
        />
      </div>
    );
  }

  const fullName = [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={`Staff ID: ${staff.id}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Staff', href: '/dashboard/staff' },
          { label: fullName },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Staff Info Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-2xl font-semibold text-accent">
                {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
                <StatusBadge status={staff.role} />
                <StatusBadge status={staff.status} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{staff.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Hired: {staff.admissionDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{staff.age} yrs, {staff.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground capitalize">{staff.maritalStatus}</span>
                </div>
                {staffBranch && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Link href={`/dashboard/branches/${staffBranch.id}`} className="text-primary hover:underline">
                      {staffBranch.title}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">{assignedPatients.length}</span>
              </div>
              <span className="text-sm text-muted-foreground">Assigned Patients</span>
            </div>
          </div>
        </div>
        {staff.notes && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium text-foreground mb-1">Notes</p>
            <p className="text-muted-foreground">{staff.notes}</p>
          </div>
        )}
      </div>

      {/* Assigned Patients Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assigned Patients ({assignedPatients.length})
          </h3>
          <Button size="sm" onClick={() => setAssignPatientModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Assign Patient
          </Button>
        </div>
        {assignedPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No patients assigned yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedPatients.map((patient) => {
              const patientFullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
              const isMainBranch = patient.mainBranchId === staff.branchId;
              return (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <Link href={`/dashboard/patients/${patient.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate hover:text-primary transition-colors">
                          {patientFullName}
                        </p>
                        {isMainBranch && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">Main</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.age} yrs, {patient.gender}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <StatusBadge status={patient.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemovePatient(patient.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Branch Info Card */}
      {staffBranch && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-accent" />
            Work Location
          </h3>
          <Link
            href={`/dashboard/branches/${staffBranch.id}`}
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground hover:text-primary transition-colors">{staffBranch.title}</p>
              <p className="text-sm text-muted-foreground">{staffBranch.city}, {staffBranch.state}</p>
            </div>
            <StatusBadge status={staffBranch.status} className="ml-auto" />
          </Link>
        </div>
      )}

      {/* Assign Patient Modal */}
      <Modal
        isOpen={assignPatientModalOpen}
        onClose={() => setAssignPatientModalOpen(false)}
        title="Assign Patients"
        description="Select patients to assign to this staff member. Only patients from the same branch are shown."
        size="md"
      >
        <div className="space-y-4">
          {availablePatients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No available patients in this branch.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availablePatients.map((patient) => {
                const patientFullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
                const isSelected = selectedPatientIds.includes(patient.id);
                const isMainBranch = patient.mainBranchId === staff.branchId;
                return (
                  <label
                    key={patient.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPatientIds((prev) => [...prev, patient.id]);
                        } else {
                          setSelectedPatientIds((prev) => prev.filter((id) => id !== patient.id));
                        }
                      }}
                    />
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{patientFullName}</p>
                        {isMainBranch && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Main Branch</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.age} yrs, {patient.gender}</p>
                    </div>
                    <StatusBadge status={patient.status} />
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setAssignPatientModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignPatients}>
              Save Assignments
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
