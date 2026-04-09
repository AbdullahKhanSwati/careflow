'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  UserCog,
  Plus,
  Phone,
  Mail,
  Calendar,
  Heart,
  GitBranch,
  ArrowLeft,
  Building2,
  Star,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton-loader';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { mockPatients, mockUsers, mockBranches } from '@/lib/mock-data';
import { useToast } from '@/components/providers/toast-provider';
import { cn } from '@/lib/utils';
import type { Patient, User as UserType, Branch } from '@/types';

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { success } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assignedStaff, setAssignedStaff] = useState<UserType[]>([]);
  const [patientBranches, setPatientBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignStaffModalOpen, setAssignStaffModalOpen] = useState(false);
  const [assignBranchModalOpen, setAssignBranchModalOpen] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [newMainBranchId, setNewMainBranchId] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundPatient = mockPatients.find((p) => p.id === id);
      if (foundPatient) {
        const staff = mockUsers.filter((u) => foundPatient.assignedStaffIds.includes(u.id));
        const branches = mockBranches.filter((b) => foundPatient.branchIds.includes(b.id));
        setPatient(foundPatient);
        setAssignedStaff(staff);
        setPatientBranches(branches);
        setSelectedStaffIds(foundPatient.assignedStaffIds);
        setSelectedBranchIds(foundPatient.branchIds);
        setNewMainBranchId(foundPatient.mainBranchId);
      }
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  // Get available staff (from patient's branches only)
  const availableStaff = mockUsers.filter((u) => 
    patient?.branchIds.includes(u.branchId) && u.status === 'active'
  );

  // Get all branches for assignment
  const allBranches = mockBranches.filter((b) => b.status === 'active');

  const handleAssignStaff = () => {
    if (!patient) return;
    
    const newStaff = mockUsers.filter((u) => selectedStaffIds.includes(u.id));
    setAssignedStaff(newStaff);
    setPatient({ ...patient, assignedStaffIds: selectedStaffIds });
    setAssignStaffModalOpen(false);
    success('Staff Updated', 'Staff assignments have been updated successfully.');
  };

  const handleAssignBranch = () => {
    if (!patient) return;
    
    const newBranches = mockBranches.filter((b) => selectedBranchIds.includes(b.id));
    setPatientBranches(newBranches);
    setPatient({ 
      ...patient, 
      branchIds: selectedBranchIds,
      mainBranchId: newMainBranchId || selectedBranchIds[0] 
    });
    setAssignBranchModalOpen(false);
    success('Branches Updated', 'Branch assignments have been updated successfully.');
  };

  const handleRemoveStaff = (staffId: string) => {
    if (!patient) return;
    const newIds = patient.assignedStaffIds.filter((id) => id !== staffId);
    setSelectedStaffIds(newIds);
    setAssignedStaff((prev) => prev.filter((s) => s.id !== staffId));
    setPatient({ ...patient, assignedStaffIds: newIds });
    success('Staff Removed', 'Staff member has been unassigned.');
  };

  const handleRemoveBranch = (branchId: string) => {
    if (!patient || patient.branchIds.length <= 1) return;
    const newIds = patient.branchIds.filter((id) => id !== branchId);
    const newMainBranch = branchId === patient.mainBranchId ? newIds[0] : patient.mainBranchId;
    setSelectedBranchIds(newIds);
    setNewMainBranchId(newMainBranch);
    setPatientBranches((prev) => prev.filter((b) => b.id !== branchId));
    setPatient({ ...patient, branchIds: newIds, mainBranchId: newMainBranch });
    success('Branch Removed', 'Patient has been removed from the branch.');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
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

  const fullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
  const mainBranch = mockBranches.find((b) => b.id === patient.mainBranchId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={`Patient ID: ${patient.id}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Patients', href: '/dashboard/patients' },
          { label: fullName },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Patient Info Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl font-semibold text-primary">
                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
                <StatusBadge status={patient.status} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{patient.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Admitted: {patient.admissionDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{patient.age} yrs, {patient.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground capitalize">{patient.maritalStatus}</span>
                </div>
                {mainBranch && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Link href={`/dashboard/branches/${mainBranch.id}`} className="text-primary hover:underline">
                      {mainBranch.title}
                    </Link>
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Main</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {patient.medicalNotes && (
            <div className="lg:max-w-sm p-4 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium text-foreground mb-1">Medical Notes</p>
              <p className="text-muted-foreground">{patient.medicalNotes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Staff Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <UserCog className="h-5 w-5 text-accent" />
              Assigned Staff ({assignedStaff.length})
            </h3>
            <Button size="sm" onClick={() => setAssignStaffModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Assign
            </Button>
          </div>
          {assignedStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCog className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No staff assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedStaff.map((staff) => {
                const staffFullName = [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(' ');
                return (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <Link href={`/dashboard/staff/${staff.id}`} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-accent">
                          {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground hover:text-accent transition-colors">{staffFullName}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={staff.role} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveStaff(staff.id)}
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

        {/* Assigned Branches Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Branches ({patientBranches.length})
            </h3>
            <Button size="sm" onClick={() => setAssignBranchModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Branch
            </Button>
          </div>
          {patientBranches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No branches assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patientBranches.map((branch) => {
                const isMainBranch = branch.id === patient.mainBranchId;
                return (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <Link href={`/dashboard/branches/${branch.id}`} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground hover:text-primary transition-colors">{branch.title}</p>
                          {isMainBranch && (
                            <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              <Star className="h-3 w-3" />
                              Main
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{branch.city}, {branch.state}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={branch.status} />
                      {patientBranches.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveBranch(branch.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assign Staff Modal */}
      <Modal
        isOpen={assignStaffModalOpen}
        onClose={() => setAssignStaffModalOpen(false)}
        title="Assign Staff"
        description="Select staff members to assign to this patient. Only staff from the patient's branches are shown."
        size="md"
      >
        <div className="space-y-4">
          {availableStaff.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No available staff in patient&apos;s branches.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableStaff.map((staff) => {
                const staffFullName = [staff.firstName, staff.middleName, staff.lastName].filter(Boolean).join(' ');
                const isSelected = selectedStaffIds.includes(staff.id);
                const staffBranch = mockBranches.find((b) => b.id === staff.branchId);
                return (
                  <label
                    key={staff.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      isSelected ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStaffIds((prev) => [...prev, staff.id]);
                        } else {
                          setSelectedStaffIds((prev) => prev.filter((id) => id !== staff.id));
                        }
                      }}
                    />
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-accent">
                        {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{staffFullName}</p>
                      <p className="text-sm text-muted-foreground">{staffBranch?.title}</p>
                    </div>
                    <StatusBadge status={staff.role} />
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setAssignStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignStaff}>
              Save Assignments
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Branch Modal */}
      <Modal
        isOpen={assignBranchModalOpen}
        onClose={() => setAssignBranchModalOpen(false)}
        title="Manage Branches"
        description="Select branches for this patient. The main branch is where primary care is provided."
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {allBranches.map((branch) => {
              const isSelected = selectedBranchIds.includes(branch.id);
              const isMain = newMainBranchId === branch.id;
              return (
                <div
                  key={branch.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const newIds = [...selectedBranchIds, branch.id];
                        setSelectedBranchIds(newIds);
                        if (newIds.length === 1) {
                          setNewMainBranchId(branch.id);
                        }
                      } else {
                        if (selectedBranchIds.length > 1) {
                          const newIds = selectedBranchIds.filter((id) => id !== branch.id);
                          setSelectedBranchIds(newIds);
                          if (newMainBranchId === branch.id) {
                            setNewMainBranchId(newIds[0]);
                          }
                        }
                      }
                    }}
                  />
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{branch.title}</p>
                    <p className="text-sm text-muted-foreground">{branch.city}, {branch.state}</p>
                  </div>
                  {isSelected && (
                    <Button
                      variant={isMain ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewMainBranchId(branch.id)}
                      className="shrink-0"
                    >
                      {isMain ? (
                        <>
                          <Star className="h-3 w-3 mr-1" />
                          Main
                        </>
                      ) : (
                        'Set as Main'
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setAssignBranchModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignBranch} disabled={selectedBranchIds.length === 0}>
              Save Branches
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
