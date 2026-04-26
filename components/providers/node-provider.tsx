'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { mockNodes, ROOT_NODE_ID } from '@/lib/mock-data';
import {
  buildNodeTree,
  findNode,
  getNodeAncestors,
  getScopeIds,
} from '@/lib/utils/node-tree';
import type { Node, NodeTreeItem, NodeType } from '@/types';

// ==========================================
// NODE PROVIDER
// ==========================================
// Owns the canonical node list plus the UI state that follows the user across
// pages: which node is selected (drives every page's data scope), and which
// nodes are expanded in the sidebar tree. Both pieces of UI state are
// persisted to localStorage so the experience survives reloads.

const STORAGE_KEY_SELECTED = 'careflow:selectedNodeId';
const STORAGE_KEY_EXPANDED = 'careflow:expandedNodeIds';

interface CreateNodePayload {
  type: NodeType;
  parentId: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
  // Type-specific fields — only the relevant ones are read.
  code?: string;
  notes?: string;
  address?: string;
  city?: string;
  contactNumber?: string;
  email?: string;
  schedule?: string;
  area?: string;
  organizationName?: string;
}

interface NodeContextValue {
  nodes: Node[];
  tree: NodeTreeItem | null;
  rootNode: Node | null;

  selectedNodeId: string | null;
  selectedNode: Node | null;
  selectNode: (id: string) => void;

  expandedNodeIds: Set<string>;
  toggleExpand: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  expandPath: (id: string) => void;

  scopeIds: Set<string>; // selected node + descendants
  ancestors: Node[];

  createNode: (payload: CreateNodePayload) => Node;
  updateNode: (id: string, patch: Partial<Node>) => void;
  deleteNode: (id: string) => void;

  getNode: (id: string | null) => Node | null;
}

const NodeContext = createContext<NodeContextValue | undefined>(undefined);

function loadString(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function loadStringArray(key: string): string[] {
  const raw = loadString(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function persist(key: string, value: string | string[] | null) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else
      window.localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
  } catch {
    /* ignore quota / privacy-mode failures */
  }
}

export function NodeProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>(mockNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(ROOT_NODE_ID);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    () => new Set([ROOT_NODE_ID])
  );

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const storedSelected = loadString(STORAGE_KEY_SELECTED);
    if (storedSelected && mockNodes.some((n) => n.id === storedSelected)) {
      setSelectedNodeId(storedSelected);
    }
    const storedExpanded = loadStringArray(STORAGE_KEY_EXPANDED);
    if (storedExpanded.length > 0) {
      setExpandedNodeIds(new Set(storedExpanded));
    }
  }, []);

  useEffect(() => {
    persist(STORAGE_KEY_SELECTED, selectedNodeId);
  }, [selectedNodeId]);

  useEffect(() => {
    persist(STORAGE_KEY_EXPANDED, Array.from(expandedNodeIds));
  }, [expandedNodeIds]);

  const tree = useMemo(() => buildNodeTree(nodes), [nodes]);
  const rootNode = useMemo(
    () => nodes.find((n) => n.type === 'root') ?? null,
    [nodes]
  );
  const selectedNode = useMemo(
    () => findNode(nodes, selectedNodeId),
    [nodes, selectedNodeId]
  );
  const ancestors = useMemo(
    () => (selectedNodeId ? getNodeAncestors(nodes, selectedNodeId) : []),
    [nodes, selectedNodeId]
  );
  const scopeIds = useMemo(
    () =>
      selectedNodeId
        ? getScopeIds(nodes, selectedNodeId)
        : new Set<string>(),
    [nodes, selectedNodeId]
  );

  const selectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandNode = useCallback((id: string) => {
    setExpandedNodeIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const collapseNode = useCallback((id: string) => {
    setExpandedNodeIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * Expand every ancestor of `id` so the row is visible in the tree. We use
   * the freshest node list available.
   */
  const expandPath = useCallback(
    (id: string) => {
      const node = findNode(nodes, id);
      if (!node) return;
      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        for (const ancestorId of node.path) next.add(ancestorId);
        next.add(id);
        return next;
      });
    },
    [nodes]
  );

  const createNode = useCallback(
    (payload: CreateNodePayload): Node => {
      const parent = nodes.find((n) => n.id === payload.parentId);
      if (!parent) {
        throw new Error(`Parent node ${payload.parentId} not found`);
      }
      const id = `node-${payload.type}-${Date.now()}`;
      const now = new Date().toISOString();
      const path = [...parent.path, parent.id];
      const level = parent.level + 1;
      const status = payload.status ?? 'active';

      let next: Node;
      switch (payload.type) {
        case 'department':
          next = {
            id,
            type: 'department',
            parentId: parent.id,
            name: payload.name,
            description: payload.description,
            code: payload.code,
            notes: payload.notes,
            status,
            path,
            level,
            createdAt: now,
            updatedAt: now,
          };
          break;
        case 'location':
          next = {
            id,
            type: 'location',
            parentId: parent.id,
            name: payload.name,
            description: payload.description,
            address: payload.address ?? '',
            city: payload.city ?? '',
            contactNumber: payload.contactNumber ?? '',
            email: payload.email ?? '',
            status,
            path,
            level,
            createdAt: now,
            updatedAt: now,
          };
          break;
        case 'program':
          next = {
            id,
            type: 'program',
            parentId: parent.id,
            name: payload.name,
            description: payload.description,
            schedule: payload.schedule,
            area: payload.area,
            contactNumber: payload.contactNumber,
            status,
            path,
            level,
            createdAt: now,
            updatedAt: now,
          };
          break;
        case 'root':
          throw new Error('A new root node cannot be created.');
      }

      setNodes((prev) => [...prev, next]);
      // Make sure the parent is expanded so the new child is visible.
      setExpandedNodeIds((prev) => {
        if (prev.has(parent.id)) return prev;
        const nextSet = new Set(prev);
        nextSet.add(parent.id);
        return nextSet;
      });
      return next;
    },
    [nodes]
  );

  const updateNode = useCallback((id: string, patch: Partial<Node>) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? ({ ...n, ...patch, updatedAt: new Date().toISOString() } as Node)
          : n
      )
    );
  }, []);

  const deleteNode = useCallback(
    (id: string) => {
      const target = nodes.find((n) => n.id === id);
      if (!target || target.type === 'root') return;
      const removed = new Set<string>([id]);
      // Recursively delete descendants.
      for (const n of nodes) {
        if (n.path.includes(id)) removed.add(n.id);
      }
      setNodes((prev) => prev.filter((n) => !removed.has(n.id)));
      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        for (const removedId of removed) next.delete(removedId);
        return next;
      });
      setSelectedNodeId((prev) =>
        prev && removed.has(prev) ? target.parentId ?? ROOT_NODE_ID : prev
      );
    },
    [nodes]
  );

  const getNode = useCallback(
    (id: string | null) => findNode(nodes, id),
    [nodes]
  );

  const value: NodeContextValue = {
    nodes,
    tree,
    rootNode,
    selectedNodeId,
    selectedNode,
    selectNode,
    expandedNodeIds,
    toggleExpand,
    expandNode,
    collapseNode,
    expandPath,
    scopeIds,
    ancestors,
    createNode,
    updateNode,
    deleteNode,
    getNode,
  };

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
}

export function useNodes() {
  const ctx = useContext(NodeContext);
  if (!ctx) throw new Error('useNodes must be used inside a NodeProvider');
  return ctx;
}
