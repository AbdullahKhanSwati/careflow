'use client';

import { Building2, MapPin, Network, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNodeColor } from '@/lib/constants/node-colors';
import type { NodeType } from '@/types';

const ICON: Record<NodeType, React.ElementType> = {
  root: Network,
  department: Building2,
  location: MapPin,
  program: Sparkles,
};

interface NodeIconProps {
  type: NodeType;
  level?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'soft' | 'solid';
  className?: string;
}

const SIZE_BOX = {
  xs: 'h-7 w-7 rounded-md',
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
};

const SIZE_ICON = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

/**
 * Square icon container coloured according to the node type & depth. Shared
 * between the sidebar tree row, the page header, and node cards.
 */
export function NodeIcon({
  type,
  level = 1,
  size = 'sm',
  variant = 'soft',
  className,
}: NodeIconProps) {
  const tokens = getNodeColor(type, level);
  const Icon = ICON[type];

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0',
        SIZE_BOX[size],
        variant === 'solid'
          ? cn(tokens.solid, tokens.solidText)
          : cn(tokens.soft, tokens.softText),
        className
      )}
    >
      <Icon className={SIZE_ICON[size]} />
    </div>
  );
}
