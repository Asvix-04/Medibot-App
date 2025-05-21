
'use client';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/logo-icon';
import { Menu } from 'lucide-react'; // Only Menu icon needed here
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { isMobile, state: desktopState } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger asChild>
          <Button variant="ghost" size="icon" className="focus-visible:ring-sidebar-ring">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SidebarTrigger>
        
        <LogoIcon
          className={cn("h-7 w-7 text-primary", 
            isMobile ? "" : (desktopState === "expanded" ? "" : "hidden") 
        )} />
        <h1 className="text-xl font-semibold text-foreground">
          MediAssistant
        </h1>
      </div>
    </header>
  );
}
