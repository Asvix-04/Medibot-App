
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, BookOpenText, UserCircle2, X } from 'lucide-react'; // Added X
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { LogoIcon } from '@/components/icons/logo-icon';
import { Button } from '@/components/ui/button'; // Import Button
// import { cn } from '@/lib/utils'; // cn is not strictly needed here if not using it for conditional classes on root

const navItems = [
  { href: '/chatbot', label: 'AI Chatbot', icon: MessageSquare },
  { href: '/info-summarizer', label: 'Info Summarizer', icon: BookOpenText },
  { href: '/user-details', label: 'My Profile', icon: UserCircle2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state: desktopState, isMobile } = useSidebar(); 

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="items-center justify-between border-b py-3 hidden md:flex px-2"> {/* Ensure this is flex-row like */}
        <Link href="/chatbot" className="flex items-center gap-2 text-lg font-semibold">
          <LogoIcon className="h-7 w-7 text-primary" />
          <span className="text-foreground group-data-[collapsible=icon]:hidden">MediAssistant</span>
        </Link>
        {/* Add X button here, visible only on desktop when expanded */}
        {!isMobile && desktopState === 'expanded' && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="group-data-[collapsible=icon]:hidden h-7 w-7">
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, className: "capitalize" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* Optional SidebarFooter */}
    </Sidebar>
  );
}
