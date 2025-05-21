
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, BookOpenText, UserCircle2, X } from 'lucide-react'; 
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
import { Button } from '@/components/ui/button'; 

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
      {/* This SidebarHeader is for DESKTOP view. It's hidden on mobile. */}
      <SidebarHeader className="items-center justify-between border-b py-3 hidden md:flex px-2"> 
        <Link href="/chatbot" className="flex items-center gap-2 text-lg font-semibold text-foreground group-data-[collapsible=icon]:hidden">
          <LogoIcon className="h-7 w-7 text-primary" />
          <span className="text-foreground group-data-[collapsible=icon]:hidden">Medibot</span>
        </Link>
        
        {/* Show X to close button only on desktop when sidebar is expanded */}
        {desktopState === 'expanded' && !isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="group-data-[collapsible=icon]:hidden h-7 w-7"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
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
    </Sidebar>
  );
}
