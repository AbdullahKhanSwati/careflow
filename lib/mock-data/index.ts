export * from './nodes';
export * from './patients';
export * from './users';
export * from './providers';
export * from './medications';

import type { StatCard } from '@/types';

export const dashboardStats: StatCard[] = [
  {
    id: 'stat-1',
    title: 'Departments',
    value: 5,
    change: 25,
    changeType: 'increase',
    icon: 'Building2',
  },
  {
    id: 'stat-2',
    title: 'Branches',
    value: 7,
    change: 12,
    changeType: 'increase',
    icon: 'MapPin',
  },
  {
    id: 'stat-3',
    title: 'Patients',
    value: 12,
    change: 8,
    changeType: 'increase',
    icon: 'Users',
  },
  {
    id: 'stat-4',
    title: 'Staff Members',
    value: 13,
    change: 3,
    changeType: 'increase',
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
    details: 'Thomas Blake joined Manhattan Medical Center',
    time: '1 hour ago',
    type: 'user',
  },
  {
    id: 'act-3',
    action: 'Branch status updated',
    details: 'Brooklyn Health Hub set to active',
    time: '3 hours ago',
    type: 'location',
  },
  {
    id: 'act-4',
    action: 'Department created',
    details: 'Specialty Care added under Clinical Services',
    time: '1 day ago',
    type: 'department',
  },
  {
    id: 'act-5',
    action: 'Program updated',
    details: 'Mobile Outreach LA schedule revised',
    time: '2 days ago',
    type: 'program',
  },
];
