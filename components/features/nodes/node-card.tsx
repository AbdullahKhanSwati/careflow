'use client';

import Link from 'next/link';
import { Mail, MapPin as MapPinIcon, Phone, Users, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNodeColor } from '@/lib/constants/node-colors';
import { StatusBadge } from '@/components/ui/status-badge';
import { NodeIcon } from './node-icon';
import { NodeTypeBadge } from './node-type-badge';
import type { Node } from '@/types';

interface NodeCardProps {
  node: Node;
  patientCount?: number;
  staffCount?: number;
  childCount?: number;
  /** Optional link wrapping the card. */
  href?: string;
  /** If provided the card becomes a button calling this. */
  onClick?: () => void;
  /** Marks the card visually as the currently selected node. */
  active?: boolean;
  className?: string;
}

/**
 * Reusable card used by Departments, Branches and dashboard summary views to
 * render any kind of node consistently. Visuals are derived from the node's
 * type so the colour scheme is automatic.
 */
export function NodeCard({
  node,
  patientCount,
  staffCount,
  childCount,
  href,
  onClick,
  active,
  className,
}: NodeCardProps) {
  const tokens = getNodeColor(node.type, node.level);

  const meta: { icon: React.ElementType; label: string }[] = [];
  if (node.type === 'location') {
    meta.push(
      { icon: MapPinIcon, label: `${node.address}, ${node.city}` },
      { icon: Phone, label: node.contactNumber },
      { icon: Mail, label: node.email }
    );
  } else if (node.type === 'program') {
    if (node.area) meta.push({ icon: MapPinIcon, label: node.area });
    if (node.schedule) meta.push({ icon: Phone, label: `Schedule: ${node.schedule}` });
    if (node.contactNumber) meta.push({ icon: Phone, label: node.contactNumber });
  } else if ((node.type === 'department' || node.type === 'root') && node.description) {
    meta.push({ icon: MapPinIcon, label: node.description });
  }

  const body = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5',
        'transition-all duration-200',
        active
          ? cn(tokens.ring, 'ring-2 border-transparent shadow-md')
          : 'border-border hover:border-foreground/10 hover:shadow-md',
        (href || onClick) && 'cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 transition-opacity',
          tokens.accentBar,
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        )}
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <NodeIcon type={node.type} level={node.level} size="md" />
        <div className="flex flex-col items-end gap-2">
          <NodeTypeBadge type={node.type} level={node.level} />
          <StatusBadge status={node.status} />
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-1 truncate">{node.name}</h3>
      {meta[0] && <MetaLine icon={meta[0].icon} label={meta[0].label} />}

      {(patientCount !== undefined ||
        staffCount !== undefined ||
        childCount !== undefined) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-border text-sm">
          {childCount !== undefined && (
            <Stat
              icon={<MapPinIcon className="h-4 w-4 text-muted-foreground" />}
              label={childCount === 1 ? 'sub-node' : 'sub-nodes'}
              value={childCount}
            />
          )}
          {patientCount !== undefined && (
            <Stat
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              label={patientCount === 1 ? 'patient' : 'patients'}
              value={patientCount}
            />
          )}
          {staffCount !== undefined && (
            <Stat
              icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
              label={staffCount === 1 ? 'staff' : 'staff'}
              value={staffCount}
            />
          )}
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href}>{body}</Link>;
  if (onClick)
    return (
      <button type="button" onClick={onClick} className="text-left w-full">
        {body}
      </button>
    );
  return body;
}

function MetaLine({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
      <Icon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
      {label}
    </p>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
