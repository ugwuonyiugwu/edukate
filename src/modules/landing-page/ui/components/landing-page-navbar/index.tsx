"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle 
} from '@/components/ui/sheet'

export const LandingPageNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'FAQS', href: '/faqs' },
    { name: 'Contacts', href: '/contacts' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-slate-50 flex justify-between items-center px-4 md:px-8 z-50 border-b shadow-md">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-1">
        <Image src="/logo.png" alt="Logo" width={35} height={35} />
        <p className="text-xl font-semibold tracking-tight text-blue-800">EduKate</p>
      </Link>

      {/* Desktop Navigation */}
      <div className='hidden md:flex items-center gap-7 text-xs font-medium'>
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} className="hover:text-blue-600 transition-colors">
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Login Button (Visible on all screens, or hide on mobile if preferred) */}
        <Button variant="login" size="sm">
          login
        </Button>

        {/* Mobile Menu (Sheet) */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] pt-12">
              <SheetTitle className="text-left mb-4">Navigation</SheetTitle>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium hover:text-blue-800 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <Button variant="login" size="sm" className="mt-4 w-full">
                  Login
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}