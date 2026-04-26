import type {
  ContainerNodeType,
  LeafNodeType,
  Node,
  NodeTreeItem,
  NodeType,
} from '@/types';

// ==========================================
// NODE TREE UTILITIES
// ==========================================
// All helpers operate on a flat `Node[]` list. The list is the source of truth;
// the tree is rebuilt on demand. This keeps mutations cheap (one `setNodes`
// call from the provider) while still giving us a recursive structure for the
// sidebar.

/**
 * Build a tree rooted at the given node id (defaults to the root). Children
 * are sorted by name within each level so the sidebar order is stable.
 */
export function buildNodeTree(
  nodes: Node[],
  rootId?: string
): NodeTreeItem | null {
  const byParent = new Map<string | null, Node[]>();
  for (const n of nodes) {
    const list = byParent.get(n.parentId) ?? [];
    list.push(n);
    byParent.set(n.parentId, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const root =
    (rootId ? nodes.find((n) => n.id === rootId) : null) ??
    nodes.find((n) => n.type === 'root') ??
    null;
  if (!root) return null;

  const visit = (node: Node): NodeTreeItem => ({
    node,
    children: (byParent.get(node.id) ?? []).map(visit),
  });

  return visit(root);
}

export function findNode(nodes: Node[], id: string | null): Node | null {
  if (!id) return null;
  return nodes.find((n) => n.id === id) ?? null;
}

/**
 * Returns the chain root → ... → node (inclusive). Useful for breadcrumbs.
 */
export function getNodeAncestors(nodes: Node[], nodeId: string): Node[] {
  const target = findNode(nodes, nodeId);
  if (!target) return [];
  const chain = [...target.path, target.id];
  return chain
    .map((id) => findNode(nodes, id))
    .filter((n): n is Node => n !== null);
}

/**
 * Direct children of a node (no recursion).
 */
export function getChildren(nodes: Node[], parentId: string): Node[] {
  return nodes.filter((n) => n.parentId === parentId);
}

/**
 * Direct children matching the given types — used by the sidebar (departments
 * only) and the branches page (locations + programs).
 */
export function getChildrenByType(
  nodes: Node[],
  parentId: string,
  types: NodeType[]
): Node[] {
  const allowed = new Set<NodeType>(types);
  return nodes.filter((n) => n.parentId === parentId && allowed.has(n.type));
}

/**
 * Every descendant of the given node (excluding the node itself). Uses the
 * materialised `path` so it stays O(n) regardless of depth.
 */
export function getDescendants(nodes: Node[], nodeId: string): Node[] {
  return nodes.filter((n) => n.path.includes(nodeId));
}

/**
 * The given node and every descendant.
 */
export function getNodeAndDescendants(nodes: Node[], nodeId: string): Node[] {
  return nodes.filter((n) => n.id === nodeId || n.path.includes(nodeId));
}

/**
 * Set of node ids that fall under the given root (inclusive). Cheap membership
 * checks for filtering patients/staff.
 */
export function getScopeIds(nodes: Node[], nodeId: string): Set<string> {
  return new Set(getNodeAndDescendants(nodes, nodeId).map((n) => n.id));
}

/**
 * Container node types that can have children. Used to drive add-child UI.
 */
export const CONTAINER_TYPES: ContainerNodeType[] = ['root', 'department'];
export const LEAF_TYPES: LeafNodeType[] = ['location', 'program'];

export function isContainer(type: NodeType): type is ContainerNodeType {
  return type === 'root' || type === 'department';
}

export function isLeaf(type: NodeType): type is LeafNodeType {
  return type === 'location' || type === 'program';
}

/**
 * Which child types is the given node allowed to create?
 *   - root        → department only (per requirements)
 *   - department  → department, location, program
 *   - location    → none
 *   - program     → none
 */
export function allowedChildTypes(type: NodeType): NodeType[] {
  switch (type) {
    case 'root':
      return ['department'];
    case 'department':
      return ['department', 'location', 'program'];
    case 'location':
    case 'program':
      return [];
  }
}
