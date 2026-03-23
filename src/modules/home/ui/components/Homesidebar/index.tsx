"use client"

import { 
  LayoutDashboard, 
  User, 
  Library, 
  Trophy, 
  GraduationCap, 
  Bell, 
  LifeBuoy, 
  LogOut, 
  School,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image";
import Link from "next/link"; // [!code ++]
import { SignOutButton } from "@clerk/nextjs";

interface HomeSidebarProps {
  activeTitle: string;
  setActiveTitle: (title: string) => void;
}

// 1. Added URLs to your navigation items
const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "User Profile", icon: User, url: "/profile" },
  { title: "Library", icon: Library, url: "/libraries" },
  { title: "Quizathon", icon: Trophy, url: "/dashboard/quizathon" },
  { title: "Scholarship", icon: GraduationCap, url: "/dashboard/scholarship" },
  { title: "Notification", icon: Bell, url: "/dashboard/notifications" },
  { title: "Class", icon: School, url: "/dashboard/class" },
]

export const HomeSidebar = ({ setActiveTitle, activeTitle }: HomeSidebarProps) => {
  return (
    <Sidebar className="border-none bg-[#121212] text-zinc-500 z-50 shadow-none">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div>
            <Image src="/logo.png" alt="logo" width={35} height={35} />
          </div>
          <span className="font-bold text-xl text-blue-700 tracking-tight">
            EduKate
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
               {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  onClick={() => setActiveTitle(item.title)}
                  isActive={activeTitle === item.title}
                  className="py-6 text-md transition-all rounded-md hover:bg-zinc-800 hover:text-zinc-200 data-[active=true]:bg-zinc-900 data-[active=true]:text-white"
                >
                  <Link href={item.url}>
                    {/* Wrap everything inside the Link in a single div to satisfy 'asChild' */}
                    <div className="flex items-center w-full"> 
                      <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                        activeTitle === item.title ? 'text-blue-500' : 'text-zinc-600'
                      }`} />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-zinc-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="py-4 text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300 transition-colors">
              <Link href="/help">
                <LifeBuoy className="h-4 w-4 mr-2" />
                <span>Help/Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {/* For Log Out, we usually don't need a Link, but keep it a button */}
            <SidebarMenuButton className="py-4 text-zinc-600 hover:bg-red-950/20 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              <SignOutButton>
                <span>Log out</span>
              </SignOutButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}