export * from './structures';
export * from './branches';
export * from './patients';
export * from './users';
export * from './providers';

import type { StatCard } from '@/types';

export const dashboardStats: StatCard[] = [
  {
    id: 'stat-1',
    title: 'Total Structures',
    value: 5,
    change: 25,
    changeType: 'increase',
    icon: 'Building2',
  },
  {
    id: 'stat-2',
    title: 'Active Branches',
    value: 10,
    change: 12,
    changeType: 'increase',
    icon: 'GitBranch',
  },
  {
    id: 'stat-3',
    title: 'Total Patients',
    value: '2,028',
    change: 8,
    changeType: 'increase',
    icon: 'Users',
  },
  {
    id: 'stat-4',
    title: 'Staff Members',
    value: 285,
    change: 3,
    changeType: 'decrease',
    icon: 'UserCog',
  },
];

export const recentActivity = [
  {
    id: 'act-1',
    action: 'New patient registered',
    details: 'Jennifer Lee at Manhattan Medical Center',
    time: '5 minutes ago',
    type: 'patient',
  },
  {
    id: 'act-2',
    action: 'Staff member added',
    details: 'Thomas Blake joined Brooklyn Health Hub',
    time: '1 hour ago',
    type: 'user',
  },
  {
    id: 'act-3',
    action: 'Branch status updated',
    details: 'Sacramento Health Center set to pending',
    time: '3 hours ago',
    type: 'branch',
  },
  {
    id: 'act-4',
    action: 'Structure created',
    details: 'Florida Region added to the system',
    time: '1 day ago',
    type: 'structure',
  },
  {
    id: 'act-5',
    action: 'Patient discharge',
    details: 'William Davis completed treatment',
    time: '2 days ago',
    type: 'patient',
  },
];
