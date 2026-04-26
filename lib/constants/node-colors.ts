import type { NodeType } from '@/types';

// ==========================================
// NODE COLOR SCHEME
// ==========================================
// Three distinct palettes, one per "role" in the tree, so users can identify
// a node's kind at a glance:
//
//   - Root         → indigo  (the organization itself, unique top)
//   - Department   → blue    (every department, regardless of nesting depth)
//   - Location     │
//   - Program      │ → emerald (both are "branches" — same shared palette)
//
// The same tokens are reused everywhere a node is rendered (sidebar tree row,
// page cards, badges, dots, breadcrumbs).
//
// Tokens:
//   solid       : full-saturation icon / dot color
//   solidText   : foreground used on the solid background
//   soft        : subtle tinted background (icon container, hover)
//   softText    : matching foreground on the soft background
//   ring        : focus / active border
//   accentBar   : 1-px or 2-px vertical bar for the active state
//   hover       : sidebar-row hover background

export interface NodeColorTokens {
  label: string;
  solid: string;
  solidText: string;
  soft: string;
  softText: string;
  ring: string;
  accentBar: string;
  hover: string;
}

const ROOT: NodeColorTokens = {
  label: 'Organization',
  solid: 'bg-indigo-600 dark:bg-indigo-500',
  solidText: 'text-white',
  soft: 'bg-indigo-500/10 dark:bg-indigo-400/10',
  softText: 'text-indigo-600 dark:text-indigo-300',
  ring: 'ring-indigo-500/40',
  accentBar: 'bg-indigo-500',
  hover: 'hover:bg-indigo-500/10',
};

const DEPARTMENT: NodeColorTokens = {
  label: 'Department',
  solid: 'bg-sky-600 dark:bg-sky-500',
  solidText: 'text-white',
  soft: 'bg-sky-500/10 dark:bg-sky-400/10',
  softText: 'text-sky-700 dark:text-sky-300',
  ring: 'ring-sky-500/40',
  accentBar: 'bg-sky-500',
  hover: 'hover:bg-sky-500/10',
};

// Locations and programs share the same palette — both are "branches" where
// real work happens, distinct from organizational containers above them.
const BRANCH: NodeColorTokens = {
  label: 'Branch',
  solid: 'bg-emerald-600 dark:bg-emerald-500',
  solidText: 'text-white',
  soft: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  softText: 'text-emerald-700 dark:text-emerald-300',
  ring: 'ring-emerald-500/40',
  accentBar: 'bg-emerald-500',
  hover: 'hover:bg-emerald-500/10',
};

/**
 * Resolve the visual tokens for a node.
 *
 * The `level` parameter is accepted for API stability but no longer affects
 * the colour — every department renders in the same blue, regardless of how
 * deeply nested it is.
 */
export function getNodeColor(type: NodeType, _level = 1): NodeColorTokens {
  // `_level` kept in the signature so existing call-sites continue to work.
  void _level;
  switch (type) {
    case 'root':
      return ROOT;
    case 'department':
      return DEPARTMENT;
    case 'location':
    case 'program':
      return BRANCH;
  }
}

export const NODE_TYPE_LABEL: Record<NodeType, string> = {
  root: 'Organization',
  department: 'Department',
  location: 'Location',
  program: 'Program',
};

// Lucide icon name for each node type — kept distinct so a location can be
// told apart from a program even though they share a palette.
export const NODE_TYPE_ICON: Record<NodeType, string> = {
  root: 'Network',
  department: 'Building2',
  location: 'MapPin',
  program: 'Sparkles',
};
