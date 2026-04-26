'use client';

import { Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNodes } from '@/components/providers/node-provider';
import { NodeTreeItemRow } from './node-tree-item';

interface NodeTreeProps {
  /**
   * When false the rail is icon-only and the tree shouldn't be rendered.
   */
  isExpanded: boolean;
  onSelect?: () => void;
}

/**
 * Sidebar Nodes section — the canonical place to pick which node the rest of
 * the application is scoped to. Every node type is rendered (departments,
 * locations, programs) with its colour. Hidden when the rail is icon-only
 * (would be unusable without labels).
 */
export function NodeTree({ isExpanded, onSelect }: NodeTreeProps) {
  const { tree, rootNode } = useNodes();

  if (!tree || !rootNode) return null;

  return (
    <div className="px-3">
      <div
        className={cn(
          'flex items-center gap-2 px-1 pb-2 pt-1',
          'text-xs font-semibold uppercase tracking-wider text-muted-foreground'
        )}
      >
        <Network className="h-3.5 w-3.5" />
        <span
          className={cn(
            'transition-opacity duration-200',
            isExpanded ? 'opacity-100' : 'opacity-0'
          )}
        >
          Nodes
        </span>
      </div>

      {isExpanded && (
        <ul role="tree" className="space-y-0.5">
          <NodeTreeItemRow item={tree} depth={0} onSelect={onSelect} />
        </ul>
      )}
    </div>
  );
}
