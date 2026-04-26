'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// NAVIGATION BREADCRUMB
// ==========================================
// Pure URL-based breadcrumb that reflects "where am I in the app" — never
// touches node selection. Selection lives in the sidebar Nodes tree.
//
// Pages with dynamic detail views (e.g. /dashboard/branches/[id]) pass a
// `currentLabel` so the last crumb can show the entity name instead of the
// raw URL segment.

const SEGMENT_LABEL: Record<string, string> = {
  dashboard: 'Dashboard',
  departments: 'Departments',
  branches: 'Branches',
  patients: 'Patients',
  staff: 'Staff',
  providers: 'Providers',
  settings: 'Settings',
};

interface NavigationBreadcrumbProps {
  /** Override the label shown on the last crumb (e.g. an entity name). */
  currentLabel?: string;
  className?: string;
}

interface Crumb {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

export function NavigationBreadcrumb({
  currentLabel,
  className,
}: NavigationBreadcrumbProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs: Crumb[] = [];
  let acc = '';
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    const fallback = SEGMENT_LABEL[seg];

    let label: string;
    if (isLast && currentLabel) {
      label = currentLabel;
    } else if (fallback) {
      label = fallback;
    } else {
      // Dynamic id segment — skip rendering its raw value as a crumb when
      // the caller didn't supply a label.
      return;
    }

    crumbs.push({
      label,
      href: isLast ? undefined : acc,
      icon: i === 0 ? Home : undefined,
    });
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex flex-wrap items-center gap-1 text-sm text-muted-foreground',
        className
      )}
    >
      {crumbs.map((crumb, index) => {
        const Icon = crumb.icon;
        const isLast = index === crumbs.length - 1;

        const content = (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors',
              isLast
                ? 'text-foreground font-medium bg-muted/60'
                : 'hover:text-foreground hover:bg-muted'
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span className="truncate max-w-[200px]">{crumb.label}</span>
          </span>
        );

        return (
          <Fragment key={`${crumb.label}-${index}`}>
            {crumb.href ? (
              <Link href={crumb.href}>{content}</Link>
            ) : (
              content
            )}
            {!isLast && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
