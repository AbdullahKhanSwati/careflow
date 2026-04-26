'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useNodes } from '@/components/providers/node-provider';
import { mockPatients } from '@/lib/mock-data';
import {
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  withAllOption,
} from '@/lib/constants';
import { FilterBar } from '@/components/shared/filter-bar';

/**
 * Compact patients tab embedded in the dashboard. Patients are scoped to the
 * selected node + descendants; clicking a row navigates to the full detail.
 */
export function PatientsTab() {
  const { selectedNode, scopeIds, getNode } = useNodes();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  const inScope = useMemo(
    () => mockPatients.filter((p) => scopeIds.has(p.nodeId)),
    [scopeIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inScope.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (genderFilter && p.gender !== genderFilter) return false;
      if (!q) return true;
      return [p.fullName, p.contactNumber, p.address]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [inScope, search, statusFilter, genderFilter]);

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setGenderFilter('');
  };

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search patients..."
        selects={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: withAllOption(STATUS_OPTIONS),
          },
          {
            id: 'gender',
            label: 'Gender',
            value: genderFilter,
            onChange: setGenderFilter,
            options: withAllOption(GENDER_OPTIONS),
          },
        ]}
        onReset={handleReset}
        hint={
          <span>
            Showing <strong>{filtered.length}</strong> of {inScope.length}{' '}
            patients in {selectedNode?.name}
          </span>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon="Users"
            title="No patients match"
            description={
              inScope.length === 0
                ? 'No patients registered in this scope.'
                : 'Adjust the filters or clear them to see more.'
            }
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {filtered.map((patient) => {
            const node = getNode(patient.nodeId);
            return (
              <Link
                key={patient.id}
                href={`/dashboard/patients/${patient.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {patient.fullName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">
                      {patient.fullName}
                    </p>
                    <StatusBadge status={patient.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="capitalize">
                      {patient.age} yrs · {patient.gender}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.contactNumber}
                    </span>
                    {node && (
                      <span className="hidden md:inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {node.name}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
