
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, BookOpenText, UserCircle2 } from 'lucide-react'; // Added UserCircle2
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LogoIcon } from '@/components/icons/logo-icon';

const navItems = [
  { href: '/chatbot', label: 'AI Chatbot', icon: MessageSquare },
  { href: '/info-summarizer', label: 'Info Summarizer', icon: BookOpenText },
  { href: '/user-details', label: 'My Profile', icon: UserCircle2 }, // Added User Details link
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="items-center justify-center border-b py-3 hidden md:flex">
        <Link href="/chatbot" className="flex items-center gap-2 text-lg font-semibold">
          <LogoIcon className="h-7 w-7 text-primary" />
          <span className="text-foreground group-data-[collapsible=icon]:hidden">MediAssistant</span>
        </Link>
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
