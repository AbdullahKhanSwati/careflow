'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// ==========================================
// DETAIL HEADER CARD
// ==========================================
// Reusable header used by every detail view in the app — keeps department,
// branch, patient and provider pages visually consistent.
//
// Layout: icon · (title + badges + subtitle + 3-col field grid)  ·  notes
// On smaller breakpoints the notes panel stacks below the main content.
//
// Each field is rendered as a single icon + value row (the icon implies the
// field, optional `label` may be shown inline before the value).

export interface DetailField {
  icon: React.ElementType;
  /** Optional inline label displayed before the value, e.g. "License:". */
  label?: string;
  value: React.ReactNode;
  /** When set, the value renders as a link. */
  href?: string;
  /** Highlight the value as muted (e.g. dates). */
  muted?: boolean;
}

interface DetailHeaderCardProps {
  icon: React.ReactNode;
  title: string;
  /** Short text rendered between the title row and the field grid. */
  subtitle?: React.ReactNode;
  /** Status / type pills shown next to the title. */
  badges?: React.ReactNode;
  fields: DetailField[];
  notes?: string;
  notesTitle?: string;
  className?: string;
}

export function DetailHeaderCard({
  icon,
  title,
  subtitle,
  badges,
  fields,
  notes,
  notesTitle = 'Notes',
  className,
}: DetailHeaderCardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-card p-5 sm:p-6',
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* Left: icon + title + fields */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="shrink-0">{icon}</div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              {badges && (
                <div className="flex flex-wrap items-center gap-2">{badges}</div>
              )}
            </div>

            {subtitle && (
              <p className="text-sm text-muted-foreground text-pretty">
                {subtitle}
              </p>
            )}

            {fields.length > 0 && (
              <div className="grid gap-x-6 gap-y-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((field, i) => (
                  <Field key={i} {...field} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: notes panel */}
        {notes && (
          <aside
            className={cn(
              'lg:w-72 lg:shrink-0',
              'rounded-lg bg-muted/40 border border-border/60',
              'p-4'
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              {notesTitle}
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {notes}
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, value, href, muted }: DetailField) {
  const valueClass = cn(
    'min-w-0 flex-1 break-words',
    muted ? 'text-muted-foreground' : 'text-foreground',
    href && 'text-primary hover:underline'
  );

  const content = (
    <span className={valueClass}>
      {label && (
        <span className="text-muted-foreground mr-1.5">{label}:</span>
      )}
      {value}
    </span>
  );

  return (
    <div className="flex items-start gap-2.5 text-sm min-w-0">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      {href ? (
        <Link href={href} className="min-w-0 flex-1">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
