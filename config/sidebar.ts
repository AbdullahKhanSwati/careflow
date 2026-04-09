import type { SidebarMenuItem } from '@/types';

export const sidebarMenuItems: SidebarMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard',
  },
  {
    id: 'structures',
    label: 'Structures',
    icon: 'Building2',
    route: '/dashboard/structures',
  },
  {
    id: 'branches',
    label: 'Branches',
    icon: 'GitBranch',
    route: '/dashboard/branches',
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: 'Users',
    route: '/dashboard/patients',
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: 'UserCog',
    route: '/dashboard/staff',
  },
  {
    id: 'providers',
    label: 'Providers',
    icon: 'Stethoscope',
    route: '/dashboard/providers',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    route: '/dashboard/settings',
  },
];

export const sidebarConfig = {
  collapsedWidth: 72,
  expandedWidth: 260,
  transitionDuration: 200,
};
