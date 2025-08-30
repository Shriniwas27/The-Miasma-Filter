'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListVideo, Podcast, User, Settings, LogOut, Bell } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Browse', icon: ListVideo },
  { href: '/go-live', label: 'Go Live', icon: Podcast },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center">
            <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/100/100" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="hidden group-data-[state=expanded]:block">
                <p className="font-semibold text-sm">John Doe</p>
                <p className="text-xs text-muted-foreground">john.doe@email.com</p>
            </div>
            <LogOut className="h-5 w-5 ml-auto text-muted-foreground hover:text-foreground cursor-pointer hidden group-data-[state=expanded]:block"/>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
