'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SidebarSecondaryNav } from './sidebar-secondary-nav';
import { NodeTree } from './node-tree';

export const SIDEBAR_COLLAPSED_PX = 72;
export const SIDEBAR_EXPANDED_PX = 320;

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Application sidebar.
 *
 *   - md+ : permanent rail, collapsed (icon-only) by default. Hovering expands
 *           it without affecting the page layout (overlays content).
 *   - <md : slide-in drawer controlled by `isMobileOpen`, always at full width.
 *
 * The scrollbar is hidden on purpose so the rail stays clean.
 */
export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [isHoverExpanded, setHoverExpanded] = useState(false);

  // On mobile the drawer is always rendered at full width when open.
  // On desktop the rail is icon-only until hover.
  const expanded = isHoverExpanded;

  return (
    <>
      <div
        onClick={onMobileClose}
        className={cn(
          'fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden',
          'transition-opacity duration-200',
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden="true"
      />

      <aside
        onMouseEnter={() => setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        className={cn(
          'group fixed inset-y-0 left-0 z-50 flex flex-col',
          'bg-sidebar border-r border-sidebar-border shadow-sm',
          'transition-[width,transform] duration-300 ease-in-out',
          // Mobile: full-width drawer, slides in/out
          'w-[320px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, expands on hover
          'md:translate-x-0',
          expanded ? 'md:w-[320px]' : 'md:w-[72px]'
        )}
      >
        {/* Branding */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4 shrink-0">
          <Link
            href="/dashboard"
            onClick={onMobileClose}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
              C
            </div>
            <span
              className={cn(
                'font-bold text-lg text-sidebar-foreground whitespace-nowrap',
                'transition-all duration-200',
                expanded
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-2 pointer-events-none md:absolute'
              )}
            >
              CareFlow
            </span>
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className={cn(
              'md:hidden ml-auto inline-flex h-9 w-9 items-center justify-center',
              'rounded-lg text-muted-foreground hover:bg-foreground/5'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation — static nav + Nodes tree, scrollbar hidden */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide space-y-3">
          <SidebarSecondaryNav
            isExpanded={expanded}
            onNavigate={onMobileClose}
          />
          <Separator className="mx-3" />
          <NodeTree isExpanded={expanded} onSelect={onMobileClose} />
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 shrink-0">
          <Link
            href="/login"
            className={cn(
              'group/signout flex items-center gap-3 rounded-lg px-3 py-2.5',
              'text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive',
              'transition-colors'
            )}
            title={!expanded ? 'Sign Out' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                'text-sm font-medium whitespace-nowrap',
                'transition-all duration-200',
                expanded
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-2 pointer-events-none md:absolute'
              )}
            >
              Sign Out
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
