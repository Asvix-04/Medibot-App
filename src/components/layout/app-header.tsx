'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/logo-icon';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <LogoIcon className="h-6 w-6 text-primary" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SidebarTrigger>
        <LogoIcon className="h-7 w-7 text-primary hidden md:block" />
        <h1 className="text-xl font-semibold text-foreground">MediAssistant</h1>
      </div>
      {/* Future additions like User Profile Dropdown can go here */}
    </header>
  );
}
