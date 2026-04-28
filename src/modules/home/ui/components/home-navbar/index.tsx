"use client"

import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserAvatar } from '@/components/reusableavatar/avatar';

interface HomeNavbarProps {
  activeTitle: string;
}

export function HomeNavbar({ activeTitle }: HomeNavbarProps) {
  return (
    <nav className="flex h-16 items-center justify-between w-full px-4 md:px-8 bg-blue-600 border-b border-slate-100 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
       
        <div className="flex items-center justify-center min-w-10 min-h-10">
          <SidebarTrigger className="text-white hover:bg-blue-700 transition-colors" />
        </div>
        
        <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight truncate max-w-45 sm:max-w-none">
          {activeTitle}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <UserAvatar/>
      </div>
    </nav>
  )
}