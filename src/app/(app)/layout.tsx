
'use client';

import type { PropsWithChildren } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, useSidebar } from '@/components/ui/sidebar';

export default function AppLayout({ children }: PropsWithChildren) {
  const { isMobile } = useSidebar();

  if (isMobile === undefined) {
    // Return null or a consistent placeholder skeleton during SSR and initial client render
    // This prevents hydration mismatches for layouts depending on isMobile state.
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-0 md:pl-[var(--sidebar-width-icon)] group-data-[sidebar-state=expanded]:md:pl-[var(--sidebar-width)] transition-[padding-left] duration-200 ease-linear">
        <AppHeader />
        <SidebarInset>
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
