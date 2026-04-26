'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { NodeDetailView } from '@/components/features/nodes/node-detail-view';

export default function DepartmentsPage() {
  const { selectedNode } = useNodes();

  if (!selectedNode) {
    return (
      <EmptyState
        icon="AlertCircle"
        title="No node selected"
        description="Pick a node from the Nodes tree in the sidebar."
      />
    );
  }

  return <NodeDetailView node={selectedNode} />;
}
