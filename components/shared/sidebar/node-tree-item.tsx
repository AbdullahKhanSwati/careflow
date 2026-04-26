'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNodeColor, NODE_TYPE_LABEL } from '@/lib/constants/node-colors';
import { useNodes } from '@/components/providers/node-provider';
import { NodeIcon } from '@/components/features/nodes/node-icon';
import type { NodeTreeItem as TreeItemType } from '@/types';

const INDENT_PX_PER_LEVEL = 14;
const MAX_INDENT_LEVELS = 6; // beyond this, indent stops growing

interface NodeTreeItemProps {
  item: TreeItemType;
  depth: number;
  onSelect?: () => void;
}

/**
 * Recursive sidebar tree row. Shows every node type (departments, locations,
 * programs) coloured by type/depth. Click selects (drives global scope);
 * chevron toggles expansion.
 */
export function NodeTreeItemRow({
  item,
  depth,
  onSelect,
}: NodeTreeItemProps) {
  const {
    selectedNodeId,
    selectNode,
    expandedNodeIds,
    toggleExpand,
  } = useNodes();
  const node = item.node;

  const isExpanded = expandedNodeIds.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const tokens = getNodeColor(node.type, node.level);
  const hasChildren = item.children.length > 0;

  const indentPx = Math.min(depth, MAX_INDENT_LEVELS) * INDENT_PX_PER_LEVEL;

  const handleSelect = () => {
    selectNode(node.id);
    onSelect?.();
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand(node.id);
  };

  return (
    <li>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
          if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
            toggleExpand(node.id);
          }
          if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
            toggleExpand(node.id);
          }
        }}
        title={`${node.name} • ${NODE_TYPE_LABEL[node.type]}`}
        className={cn(
          'group relative flex items-center gap-2 rounded-lg pr-2 py-1.5',
          'cursor-pointer select-none transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          isSelected
            ? cn(tokens.soft, tokens.softText, 'font-medium')
            : cn(
                'text-sidebar-foreground/80',
                tokens.hover,
                'hover:text-sidebar-foreground'
              )
        )}
        style={{ paddingLeft: `${indentPx + 6}px` }}
      >
        {isSelected && (
          <span
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full',
              tokens.accentBar
            )}
          />
        )}

        <button
          type="button"
          onClick={handleChevronClick}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          tabIndex={-1}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded transition-transform shrink-0',
            'hover:bg-foreground/5',
            !hasChildren && 'invisible',
            isExpanded && 'rotate-90'
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <NodeIcon
          type={node.type}
          level={node.level}
          size="xs"
          variant={isSelected ? 'solid' : 'soft'}
        />

        <span className="flex-1 truncate text-sm">{node.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group" className="space-y-0.5 mt-0.5">
          {item.children.map((child) => (
            <NodeTreeItemRow
              key={child.node.id}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
