 import React from 'react'
 import Link from 'next/link'
 import Image from 'next/image'
import { Button } from '@/components/ui/button'

 
export const LandingPageNavbar = () => {
   return (
      <nav className="fixed top-0 left-0 right-0 h-14 bg-slate-50 flex justify-between items-center px-2 pr-5 z-50 border-b shadow-md">
        <Link href="/">
          <div className="p-4 flex items-center gap-1">
            <Image src="/logo.png" alt= "Logo" width={35} height={35} />
            <p className="text-xl font-semibold tracking-tight text-blue-800">EduKate </ p>  
          </div>
        </Link>
        <div className='flex items-center gap-7 text-xs font-medium'>
          <Link href="/">
             <div>Home</div>
          </Link>
          <Link href="/about">
             <div>About</div>
          </Link>
          <Link href="/faqs">
             <div>FAQS</div>
          </Link>
          <Link href="/contacts">
             <div>Contacts</div>
          </Link>
        </div>
        
        <Button
          variant="login"
          size="sm"
         >
          login
        </Button>
     </nav>
   )
 }
 
  
 