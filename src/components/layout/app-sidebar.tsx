
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, BookOpenText, UserCircle2 } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { LogoIcon } from '@/components/icons/logo-icon';
// Removed X icon and Button import as the close button in this header is being removed.

const navItems = [
  { href: '/chatbot', label: 'AI Chatbot', icon: MessageSquare },
  { href: '/info-summarizer', label: 'Info Summarizer', icon: BookOpenText },
  { href: '/user-details', label: 'My Profile', icon: UserCircle2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  // const { toggleSidebar, state: desktopState, isMobile } = useSidebar(); // toggleSidebar, desktopState, isMobile no longer needed here

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      {/* This SidebarHeader is for DESKTOP view. It's hidden on mobile. */}
      {/* The "X" button to close has been removed from here. Closing is handled by AppHeader's Menu button. */}
      <SidebarHeader className="items-center justify-start border-b py-3 hidden md:flex px-2">
        <Link href="/chatbot" className="flex items-center gap-2 text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
          <LogoIcon className="h-7 w-7 text-primary" />
          <span className="text-foreground group-data-[collapsible=icon]:hidden">Medibot</span>
        </Link>
        {/* Removed the X button that was here */}
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
    </Sidebar>
  );
}
