'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  GitBranch,
  Users,
  UserCog,
  Activity,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { dashboardStats, recentActivity, mockStructures, mockBranches } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const activityIcons: Record<string, React.ElementType> = {
  patient: Users,
  user: UserCog,
  branch: GitBranch,
  structure: Building2,
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your agency operations and key metrics"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Structures */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Structures</h3>
                <p className="text-sm text-muted-foreground">
                  Regional groupings
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/structures"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockStructures.slice(0, 4).map((structure) => (
              <Link
                key={structure.id}
                href={`/dashboard/structures/${structure.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{structure.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {structure.branchCount} branches
                    </p>
                  </div>
                </div>
                <StatusBadge status={structure.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">
                  Latest updates across your agency
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((activity) => {
              const Icon = activityIcons[activity.type] || Activity;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.details}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Branches */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <GitBranch className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Active Branches</h3>
              <p className="text-sm text-muted-foreground">
                Top performing branches by patient count
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/branches"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockBranches
              .filter((b) => b.status === 'active')
              .slice(0, 6)
              .map((branch) => (
                <Link
                  key={branch.id}
                  href={`/dashboard/branches/${branch.id}`}
                  className={cn(
                    'group rounded-lg border border-border p-4',
                    'hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
                    'transition-all duration-200'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <GitBranch className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <StatusBadge status={branch.status} />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1 truncate">
                    {branch.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">{branch.city}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {branch.patientCount}
                      </span>
                      <span className="text-muted-foreground">patients</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {branch.userCount}
                      </span>
                      <span className="text-muted-foreground">staff</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
