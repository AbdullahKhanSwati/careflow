import type { Medication } from '@/types';

// Mock daily medication schedule. Each entry has a fixed time; the Care tab
// orders by `scheduledTime` so the day reads top-to-bottom.

export const mockMedications: Medication[] = [
  // ─── John Anderson (pat-001) — Diabetes Type 2 ───
  {
    id: 'med-001',
    patientId: 'pat-001',
    name: 'Metformin',
    dosage: '500 mg',
    scheduledTime: '08:00',
    prerequisites: [
      {
        type: 'glucose',
        label: 'Blood glucose',
        instruction: 'Confirm fasting glucose is within range before dose.',
        unit: 'mg/dL',
        range: { min: 70, max: 180 },
      },
    ],
    notes: 'Take with breakfast.',
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-002',
    patientId: 'pat-001',
    name: 'Lisinopril',
    dosage: '10 mg',
    scheduledTime: '09:00',
    prerequisites: [
      {
        type: 'bp',
        label: 'Blood pressure',
        instruction: 'Hold dose if systolic < 90 mmHg.',
        systolic: { min: 90, max: 140 },
        diastolic: { min: 60, max: 90 },
      },
    ],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-003',
    patientId: 'pat-001',
    name: 'Metformin',
    dosage: '500 mg',
    scheduledTime: '20:00',
    prerequisites: [
      {
        type: 'glucose',
        label: 'Blood glucose',
        unit: 'mg/dL',
        range: { min: 70, max: 180 },
      },
    ],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },

  // ─── Sarah Mitchell (pat-002) — Hypertension ───
  {
    id: 'med-004',
    patientId: 'pat-002',
    name: 'Amlodipine',
    dosage: '5 mg',
    scheduledTime: '09:00',
    prerequisites: [
      {
        type: 'bp',
        label: 'Blood pressure',
        systolic: { min: 95, max: 140 },
        diastolic: { min: 60, max: 90 },
      },
    ],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-005',
    patientId: 'pat-002',
    name: 'Aspirin (low-dose)',
    dosage: '81 mg',
    scheduledTime: '21:00',
    prerequisites: [],
    notes: 'Take with food.',
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },

  // ─── Michael Chen (pat-003) — Post-surgery ───
  {
    id: 'med-006',
    patientId: 'pat-003',
    name: 'Cefalexin',
    dosage: '500 mg',
    scheduledTime: '08:00',
    prerequisites: [],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-007',
    patientId: 'pat-003',
    name: 'Ibuprofen',
    dosage: '400 mg',
    scheduledTime: '12:00',
    prerequisites: [],
    notes: 'PRN for pain — skip if pain ≤ 3/10.',
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-008',
    patientId: 'pat-003',
    name: 'Cefalexin',
    dosage: '500 mg',
    scheduledTime: '20:00',
    prerequisites: [],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },

  // ─── Emily Rodriguez (pat-004) — Prenatal ───
  {
    id: 'med-009',
    patientId: 'pat-004',
    name: 'Folic acid',
    dosage: '800 mcg',
    scheduledTime: '09:00',
    prerequisites: [],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-010',
    patientId: 'pat-004',
    name: 'Iron supplement',
    dosage: '65 mg',
    scheduledTime: '18:00',
    prerequisites: [],
    notes: 'Take with vitamin C for absorption.',
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },

  // ─── Robert Kim (pat-005) — Arthritis ───
  {
    id: 'med-011',
    patientId: 'pat-005',
    name: 'Methotrexate',
    dosage: '7.5 mg',
    scheduledTime: '10:00',
    prerequisites: [
      {
        type: 'temperature',
        label: 'Body temperature',
        instruction: 'Hold if fever — risk of immunosuppression.',
        unit: '°F',
        range: { min: 96.5, max: 99.5 },
      },
    ],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },

  // ─── James Wilson (pat-007) — Post-stroke ───
  {
    id: 'med-012',
    patientId: 'pat-007',
    name: 'Warfarin',
    dosage: '2 mg',
    scheduledTime: '18:00',
    prerequisites: [
      {
        type: 'bp',
        label: 'Blood pressure',
        systolic: { min: 100, max: 160 },
        diastolic: { min: 60, max: 95 },
      },
    ],
    notes: 'Monitor for bruising / bleeding.',
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-013',
    patientId: 'pat-007',
    name: 'Clopidogrel',
    dosage: '75 mg',
    scheduledTime: '09:00',
    prerequisites: [],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },

  // ─── Maria Garcia (pat-008) — Asthma ───
  {
    id: 'med-014',
    patientId: 'pat-008',
    name: 'Albuterol inhaler',
    dosage: '2 puffs',
    scheduledTime: '08:00',
    prerequisites: [
      {
        type: 'pulse',
        label: 'Heart rate',
        instruction: 'Hold if tachycardic.',
        unit: 'bpm',
        range: { min: 50, max: 110 },
      },
    ],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },

  // ─── David Brown (pat-009) — Cardiac ───
  {
    id: 'med-015',
    patientId: 'pat-009',
    name: 'Carvedilol',
    dosage: '12.5 mg',
    scheduledTime: '08:00',
    prerequisites: [
      {
        type: 'bp',
        label: 'Blood pressure',
        systolic: { min: 95, max: 140 },
        diastolic: { min: 60, max: 90 },
      },
      {
        type: 'pulse',
        label: 'Heart rate',
        unit: 'bpm',
        range: { min: 55, max: 100 },
      },
    ],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'med-016',
    patientId: 'pat-009',
    name: 'Carvedilol',
    dosage: '12.5 mg',
    scheduledTime: '20:00',
    prerequisites: [
      {
        type: 'bp',
        label: 'Blood pressure',
        systolic: { min: 95, max: 140 },
        diastolic: { min: 60, max: 90 },
      },
    ],
    createdAt: '2026-04-26T00:00:00Z',
    updatedAt: '2026-04-26T00:00:00Z',
  },
];
