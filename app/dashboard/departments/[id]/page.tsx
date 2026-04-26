'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { NodeDetailView } from '@/components/features/nodes/node-detail-view';

interface DepartmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DepartmentDetailPage({
  params,
}: DepartmentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getNode, expandPath } = useNodes();

  const node = getNode(id);

  // Make sure the node is visible in the sidebar tree when arriving here.
  useEffect(() => {
    if (node) expandPath(node.id);
  }, [node, expandPath]);

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <EmptyState
          icon="AlertCircle"
          title="Department not found"
          description="The department you're looking for doesn't exist or has been removed."
          actionLabel="Back to Departments"
          onAction={() => router.push('/dashboard/departments')}
        />
      </div>
    );
  }

  if (node.type !== 'department' && node.type !== 'root') {
    // Locations and programs live under /dashboard/branches/[id].
    router.replace(`/dashboard/branches/${node.id}`);
    return null;
  }

  return <NodeDetailView node={node} />;
}
