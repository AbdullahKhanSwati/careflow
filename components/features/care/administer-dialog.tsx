'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  HeartPulse,
  Thermometer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import type {
  BloodPressurePrerequisite,
  Medication,
  MedicationPrerequisite,
  Patient,
  VitalPrerequisite,
  VitalReading,
} from '@/types';

interface AdministerDialogProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  medication: Medication;
  onConfirm: (readings: VitalReading[]) => void;
}

interface PrereqState {
  // For BP — two strings.
  systolic?: string;
  diastolic?: string;
  // For single-value vitals.
  value?: string;
}

const PREREQ_ICON: Record<MedicationPrerequisite['type'], React.ElementType> = {
  bp: HeartPulse,
  glucose: Droplet,
  temperature: Thermometer,
  pulse: Activity,
};

/**
 * Modal that gates a medication's administration behind any prerequisite
 * vital checks. The Confirm button stays disabled until every reading falls
 * inside the medication's normal range.
 */
export function AdministerDialog({
  open,
  onClose,
  patient,
  medication,
  onConfirm,
}: AdministerDialogProps) {
  const [state, setState] = useState<Record<string, PrereqState>>({});

  // Reset whenever the dialog reopens for a different medication.
  useMemo(() => {
    if (open) setState({});
  }, [open, medication.id]);

  const checks = medication.prerequisites.map((p, i) =>
    evaluate(p, state[i] ?? {})
  );
  const allValid = checks.every((c) => c.valid);
  const anyInvalid = checks.some((c) => c.entered && !c.valid);
  const anyEmpty = checks.some((c) => !c.entered);
  const canConfirm =
    medication.prerequisites.length === 0 || allValid;

  const handleChange = (
    index: number,
    patch: Partial<PrereqState>
  ) => {
    setState((prev) => ({ ...prev, [index]: { ...prev[index], ...patch } }));
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const readings: VitalReading[] = medication.prerequisites
      .map((p, i) => readingFromState(p, state[i] ?? {}))
      .filter((r): r is VitalReading => r !== null);
    onConfirm(readings);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Administer ${medication.name}`}
      description={`${medication.dosage} • Patient: ${patient.fullName}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Patient + medication summary */}
        <div className="rounded-lg bg-muted/40 border border-border p-4 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">Scheduled:</span>{' '}
              {medication.scheduledTime}
            </span>
            <span>
              <span className="font-medium text-foreground">Dose:</span>{' '}
              {medication.dosage}
            </span>
            {medication.notes && (
              <span className="basis-full">
                <span className="font-medium text-foreground">Note:</span>{' '}
                {medication.notes}
              </span>
            )}
          </div>
        </div>

        {medication.prerequisites.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>
              No pre-requisite vitals required. Confirm administration below.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">
              Pre-requisite checks
            </p>
            {medication.prerequisites.map((prereq, i) => (
              <PrereqCheckRow
                key={i}
                prereq={prereq}
                state={state[i] ?? {}}
                onChange={(patch) => handleChange(i, patch)}
                check={checks[i]}
              />
            ))}

            {anyInvalid && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  One or more readings are outside the safe range. Hold the
                  dose and re-check vitals before administering.
                </span>
              </div>
            )}
            {!anyInvalid && anyEmpty && (
              <p className="text-xs text-muted-foreground italic">
                Enter every reading above to enable administration.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={cn(
              canConfirm
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : ''
            )}
          >
            Confirm administer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface PrereqCheckRowProps {
  prereq: MedicationPrerequisite;
  state: PrereqState;
  onChange: (patch: Partial<PrereqState>) => void;
  check: ReturnType<typeof evaluate>;
}

function PrereqCheckRow({ prereq, state, onChange, check }: PrereqCheckRowProps) {
  const Icon = PREREQ_ICON[prereq.type];
  const status = check.entered
    ? check.valid
      ? 'ok'
      : 'bad'
    : 'idle';

  const ringClass =
    status === 'ok'
      ? 'border-emerald-500/30 bg-emerald-500/5'
      : status === 'bad'
        ? 'border-destructive/30 bg-destructive/5'
        : 'border-border bg-card';

  return (
    <div className={cn('rounded-lg border p-4', ringClass)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{prereq.label}</p>
          {prereq.instruction && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {prereq.instruction}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Normal range:{' '}
            <span className="font-medium text-foreground">
              {formatRange(prereq)}
            </span>
          </p>
        </div>
        {status !== 'idle' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              status === 'ok'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-destructive/15 text-destructive'
            )}
          >
            {status === 'ok' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {status === 'ok' ? 'In range' : 'Out of range'}
          </span>
        )}
      </div>

      {prereq.type === 'bp' ? (
        <div className="grid grid-cols-2 gap-3">
          <LabeledInput
            label="Systolic (mmHg)"
            value={state.systolic ?? ''}
            onChange={(v) => onChange({ systolic: v })}
          />
          <LabeledInput
            label="Diastolic (mmHg)"
            value={state.diastolic ?? ''}
            onChange={(v) => onChange({ diastolic: v })}
          />
        </div>
      ) : (
        <LabeledInput
          label={`Reading (${prereq.unit})`}
          value={state.value ?? ''}
          onChange={(v) => onChange({ value: v })}
        />
      )}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers

function evaluate(
  prereq: MedicationPrerequisite,
  state: PrereqState
): { entered: boolean; valid: boolean } {
  if (prereq.type === 'bp') return evaluateBP(prereq, state);
  return evaluateVital(prereq, state);
}

function evaluateBP(
  prereq: BloodPressurePrerequisite,
  state: PrereqState
): { entered: boolean; valid: boolean } {
  const sys = parseFloat(state.systolic ?? '');
  const dia = parseFloat(state.diastolic ?? '');
  const entered = !Number.isNaN(sys) && !Number.isNaN(dia);
  if (!entered) return { entered: false, valid: false };
  const valid =
    sys >= prereq.systolic.min &&
    sys <= prereq.systolic.max &&
    dia >= prereq.diastolic.min &&
    dia <= prereq.diastolic.max;
  return { entered, valid };
}

function evaluateVital(
  prereq: VitalPrerequisite,
  state: PrereqState
): { entered: boolean; valid: boolean } {
  const v = parseFloat(state.value ?? '');
  const entered = !Number.isNaN(v);
  if (!entered) return { entered: false, valid: false };
  const valid = v >= prereq.range.min && v <= prereq.range.max;
  return { entered, valid };
}

function formatRange(prereq: MedicationPrerequisite): string {
  if (prereq.type === 'bp') {
    return `${prereq.systolic.min}–${prereq.systolic.max} / ${prereq.diastolic.min}–${prereq.diastolic.max} mmHg`;
  }
  return `${prereq.range.min}–${prereq.range.max} ${prereq.unit}`;
}

function readingFromState(
  prereq: MedicationPrerequisite,
  state: PrereqState
): VitalReading | null {
  if (prereq.type === 'bp') {
    if (!state.systolic || !state.diastolic) return null;
    return {
      type: 'bp',
      value: `${state.systolic}/${state.diastolic}`,
      recordedAt: new Date().toISOString(),
    };
  }
  if (!state.value) return null;
  return {
    type: prereq.type,
    value: state.value,
    recordedAt: new Date().toISOString(),
  };
}
