"use client"
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState } from 'react'
import { HomeNavbar } from '../components/home-navbar';
import { HomeSidebar } from '../components/Homesidebar';

export const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  const [activeTitle, setActiveTitle] = useState("Dashboard");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <HomeSidebar setActiveTitle={setActiveTitle} activeTitle={activeTitle} />
        
        <SidebarInset className="flex flex-col flex-1">
          <HomeNavbar activeTitle={activeTitle} />
          <main >
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}