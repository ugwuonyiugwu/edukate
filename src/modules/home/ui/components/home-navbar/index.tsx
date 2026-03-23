"use client"
import { SignedIn, UserButton } from '@clerk/nextjs'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface HomeNavbarProps {
  activeTitle: string;
}

export function HomeNavbar({ activeTitle }: HomeNavbarProps) {
  return (
    <nav className="flex h-16 items-center justify-between w-full px-4 md:px-8 bg-blue-600 border-b border-slate-100 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white" />
        
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          {activeTitle}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton appearance={{ elements: { avatarBox: "h-9 w-9 border-2 border-blue-50" } }} />
        </SignedIn>
      </div>
    </nav>
  )
}