'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Users,
  UserCog,
  Settings,
  LogOut,
  Activity,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sidebarMenuItems, sidebarConfig } from '@/config/sidebar';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  GitBranch,
  Users,
  UserCog,
  Settings,
  Activity,
  Stethoscope,
};

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        'fixed left-0 top-0 z-40 h-screen',
        'bg-sidebar border-r border-sidebar-border',
        'transition-all duration-300 ease-in-out',
        'flex flex-col',
        isExpanded ? 'w-64' : 'w-[72px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            C
          </div>
          <span
            className={cn(
              'font-bold text-xl text-sidebar-foreground whitespace-nowrap',
              'transition-all duration-300',
              isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
            )}
          >
            CareFlow
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {sidebarMenuItems.map((item) => {
            const Icon = iconMap[item.icon] || Activity;
            const isActive =
              pathname === item.route ||
              (item.route !== '/dashboard' && pathname.startsWith(item.route));

            return (
              <li key={item.id}>
                <Link
                  href={item.route}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5',
                    'transition-all duration-200',
                    'relative overflow-hidden',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
                  )}
                  
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive && 'text-sidebar-primary'
                    )}
                  />
                  <span
                    className={cn(
                      'whitespace-nowrap font-medium',
                      'transition-all duration-300',
                      isExpanded
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-4 pointer-events-none absolute'
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {/* Badge */}
                  {item.badge && isExpanded && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/login"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5',
            'text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive',
            'transition-all duration-200'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span
            className={cn(
              'whitespace-nowrap font-medium',
              'transition-all duration-300',
              isExpanded
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-4 pointer-events-none absolute'
            )}
          >
            Sign Out
          </span>
        </Link>
      </div>
    </aside>
  );
}
