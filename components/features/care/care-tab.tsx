'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Droplet,
  HeartPulse,
  Pill,
  Thermometer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { useToast } from '@/components/providers/toast-provider';
import { mockMedications, mockPatients } from '@/lib/mock-data';
import { FilterBar } from '@/components/shared/filter-bar';
import { AdministerDialog } from './administer-dialog';
import { cn } from '@/lib/utils';
import type {
  AdministrationRecord,
  Medication,
  MedicationPrerequisite,
  Patient,
  VitalReading,
} from '@/types';

const PREREQ_ICON: Record<MedicationPrerequisite['type'], React.ElementType> = {
  bp: HeartPulse,
  glucose: Droplet,
  temperature: Thermometer,
  pulse: Activity,
};

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'administered', label: 'Administered' },
];

/**
 * Care round view. Shows every patient in the selected scope along with their
 * scheduled medications for the day. Each medication has an Administer flow
 * that gates dosing on any prerequisite vital checks.
 */
export function CareTab() {
  const { scopeIds } = useNodes();
  const { success } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [records, setRecords] = useState<Record<string, AdministrationRecord>>({});
  const [pickedMedication, setPickedMedication] = useState<{
    patient: Patient;
    medication: Medication;
  } | null>(null);

  // Patients inside the selected scope.
  const scopedPatients = useMemo(
    () => mockPatients.filter((p) => scopeIds.has(p.nodeId)),
    [scopeIds]
  );

  // Patient → meds (sorted by time).
  const patientMeds = useMemo(() => {
    const map = new Map<string, Medication[]>();
    for (const med of mockMedications) {
      if (!scopeIds.has(getPatientNode(med.patientId))) continue;
      const list = map.get(med.patientId) ?? [];
      list.push(med);
      map.set(med.patientId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    }
    return map;
  }, [scopeIds]);

  // Apply search + status filter.
  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedPatients.filter((p) => {
      if (q) {
        const meds = patientMeds.get(p.id) ?? [];
        const matches =
          p.fullName.toLowerCase().includes(q) ||
          meds.some((m) => m.name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (statusFilter) {
        const meds = patientMeds.get(p.id) ?? [];
        const matchesStatus = meds.some((m) => {
          const status = records[m.id]?.status ?? 'pending';
          return status === statusFilter;
        });
        if (!matchesStatus) return false;
      }
      return true;
    });
  }, [scopedPatients, patientMeds, search, statusFilter, records]);

  // Roll-up counters across the scope.
  const totals = useMemo(() => {
    let pending = 0;
    let administered = 0;
    let total = 0;
    for (const meds of patientMeds.values()) {
      total += meds.length;
      for (const m of meds) {
        const status = records[m.id]?.status ?? 'pending';
        if (status === 'administered') administered++;
        else pending++;
      }
    }
    return { total, pending, administered };
  }, [patientMeds, records]);

  const handleAdminister = (patient: Patient, medication: Medication) => {
    if (medication.prerequisites.length === 0) {
      // No checks — administer straight away.
      commitAdministration(medication, []);
      success(
        'Medication administered',
        `${medication.name} given to ${patient.fullName}.`
      );
      return;
    }
    setPickedMedication({ patient, medication });
  };

  const commitAdministration = (
    medication: Medication,
    readings: VitalReading[]
  ) => {
    setRecords((prev) => ({
      ...prev,
      [medication.id]: {
        medicationId: medication.id,
        status: 'administered',
        administeredAt: new Date().toISOString(),
        readings,
      },
    }));
  };

  const handleConfirm = (readings: VitalReading[]) => {
    if (!pickedMedication) return;
    commitAdministration(pickedMedication.medication, readings);
    success(
      'Medication administered',
      `${pickedMedication.medication.name} given to ${pickedMedication.patient.fullName}.`
    );
    setPickedMedication(null);
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
  };

  if (scopedPatients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EmptyState
          icon="Users"
          title="No patients in this scope"
          description="Pick a department, location or program from the sidebar that has patients registered."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile
          label="Doses scheduled"
          value={totals.total}
          tone="bg-primary/10 text-primary"
          icon={Pill}
        />
        <SummaryTile
          label="Pending"
          value={totals.pending}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          icon={Clock}
        />
        <SummaryTile
          label="Administered"
          value={totals.administered}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          icon={CheckCircle2}
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by patient or medication..."
        selects={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: STATUS_OPTIONS,
          },
        ]}
        onReset={handleReset}
        hint={
          <span>
            Showing <strong>{filteredPatients.length}</strong> of{' '}
            {scopedPatients.length} patients
          </span>
        }
      />

      {filteredPatients.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="Users"
            title="No matches"
            description="Adjust the filters or clear them to see more."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => {
            const meds = patientMeds.get(patient.id) ?? [];
            return (
              <PatientCareCard
                key={patient.id}
                patient={patient}
                medications={meds}
                records={records}
                onAdminister={(med) => handleAdminister(patient, med)}
              />
            );
          })}
        </div>
      )}

      {pickedMedication && (
        <AdministerDialog
          open
          onClose={() => setPickedMedication(null)}
          patient={pickedMedication.patient}
          medication={pickedMedication.medication}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

interface PatientCareCardProps {
  patient: Patient;
  medications: Medication[];
  records: Record<string, AdministrationRecord>;
  onAdminister: (medication: Medication) => void;
}

function PatientCareCard({
  patient,
  medications,
  records,
  onAdminister,
}: PatientCareCardProps) {
  const pending = medications.filter(
    (m) => (records[m.id]?.status ?? 'pending') === 'pending'
  ).length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {patient.fullName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              {patient.fullName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {patient.age} yrs · {patient.gender}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap',
            pending > 0
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
          )}
        >
          {pending > 0
            ? `${pending} due`
            : 'All administered'}
        </span>
      </div>

      <ul className="divide-y divide-border">
        {medications.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground italic">
            No medications scheduled.
          </li>
        ) : (
          medications.map((med) => (
            <MedicationRow
              key={med.id}
              medication={med}
              record={records[med.id]}
              onAdminister={() => onAdminister(med)}
            />
          ))
        )}
      </ul>
    </div>
  );
}

interface MedicationRowProps {
  medication: Medication;
  record?: AdministrationRecord;
  onAdminister: () => void;
}

function MedicationRow({ medication, record, onAdminister }: MedicationRowProps) {
  const administered = record?.status === 'administered';

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
            administered
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-primary/10 text-primary'
          )}
        >
          {administered ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Pill className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <p className="font-medium text-foreground truncate">
              {medication.name}{' '}
              <span className="text-muted-foreground font-normal">
                · {medication.dosage}
              </span>
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {medication.scheduledTime}
            </span>
          </div>

          {medication.prerequisites.length > 0 && !administered && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {medication.prerequisites.map((p, i) => {
                const Icon = PREREQ_ICON[p.type];
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                  >
                    <Icon className="h-3 w-3" />
                    {p.label}
                  </span>
                );
              })}
            </div>
          )}

          {medication.notes && !administered && (
            <p className="text-xs text-muted-foreground mt-1">
              {medication.notes}
            </p>
          )}

          {administered && record?.administeredAt && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Administered at{' '}
              {new Date(record.administeredAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {record.readings.length > 0 && (
                <>
                  {' · '}
                  {record.readings
                    .map((r) => `${r.type.toUpperCase()} ${r.value}`)
                    .join(', ')}
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {administered ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Administered
          </span>
        ) : (
          <Button onClick={onAdminister}>Administer</Button>
        )}
      </div>
    </li>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div
        className={cn(
          'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
          tone
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

// Lightweight memo helper — avoid re-walking nodes for every medication.
const patientNodeIndex = new Map<string, string>();
function getPatientNode(patientId: string): string {
  if (patientNodeIndex.has(patientId)) {
    return patientNodeIndex.get(patientId)!;
  }
  const found = mockPatients.find((p) => p.id === patientId)?.nodeId ?? '';
  patientNodeIndex.set(patientId, found);
  return found;
}
