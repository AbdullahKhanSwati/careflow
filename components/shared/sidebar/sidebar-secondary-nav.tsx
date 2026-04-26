'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Building2,
  GitBranch,
  LayoutDashboard,
  Settings,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  GitBranch,
  Users,
  UserCog,
  Settings,
  Activity,
  Stethoscope,
};

export interface SecondaryNavItem {
  id: string;
  label: string;
  icon: keyof typeof ICON_MAP;
  route: string;
}

/**
 * Static section of the sidebar. Selection of the active node lives in the
 * Nodes tree below — these entries simply navigate to scope-aware pages.
 */
export const SECONDARY_NAV: SecondaryNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', route: '/dashboard' },
  { id: 'departments', label: 'Departments', icon: 'Building2', route: '/dashboard/departments' },
  { id: 'branches', label: 'Branches', icon: 'GitBranch', route: '/dashboard/branches' },
  { id: 'patients', label: 'Patients', icon: 'Users', route: '/dashboard/patients' },
  { id: 'staff', label: 'Staff', icon: 'UserCog', route: '/dashboard/staff' },
  { id: 'providers', label: 'Providers', icon: 'Stethoscope', route: '/dashboard/providers' },
  { id: 'settings', label: 'Settings', icon: 'Settings', route: '/dashboard/settings' },
];

interface SidebarSecondaryNavProps {
  isExpanded: boolean;
  onNavigate?: () => void;
}

export function SidebarSecondaryNav({
  isExpanded,
  onNavigate,
}: SidebarSecondaryNavProps) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1 px-3">
      {SECONDARY_NAV.map((item) => {
        const Icon = ICON_MAP[item.icon] ?? Activity;
        const isActive =
          pathname === item.route ||
          (item.route !== '/dashboard' && pathname.startsWith(item.route));

        return (
          <li key={item.id}>
            <Link
              href={item.route}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5',
                'transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-sidebar-primary" />
              )}
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive && 'text-sidebar-primary'
                )}
              />
              <span
                className={cn(
                  'whitespace-nowrap text-sm font-medium transition-all duration-200',
                  isExpanded
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 pointer-events-none absolute'
                )}
              >
                {item.label}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
