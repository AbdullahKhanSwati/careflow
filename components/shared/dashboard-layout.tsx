'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout shell for every authenticated page. The desktop sidebar is icon-only
 * and overlays content when hover-expanded, so the main canvas reserves a
 * fixed gutter equal to the collapsed rail width. The padding is hardcoded
 * rather than driven by a CSS variable, because Tailwind 4's JIT scanner can
 * pick the arbitrary-CSS-variable form up as a class candidate and emit a
 * broken rule for it.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="md:pl-[72px]">
        <Header onMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
