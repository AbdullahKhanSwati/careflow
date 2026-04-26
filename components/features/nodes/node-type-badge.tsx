'use client';

import { cn } from '@/lib/utils';
import { getNodeColor } from '@/lib/constants/node-colors';
import type { NodeType } from '@/types';

interface NodeTypeBadgeProps {
  type: NodeType;
  level?: number;
  className?: string;
}

const TYPE_LABEL: Record<NodeType, string> = {
  root: 'Organization',
  department: 'Department',
  location: 'Location',
  program: 'Program',
};

/** Small pill that names the node type and uses the type's accent palette. */
export function NodeTypeBadge({ type, level = 1, className }: NodeTypeBadgeProps) {
  const tokens = getNodeColor(type, level);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-[11px] font-medium uppercase tracking-wide',
        tokens.soft,
        tokens.softText,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', tokens.accentBar)} />
      {TYPE_LABEL[type]}
    </span>
  );
}
