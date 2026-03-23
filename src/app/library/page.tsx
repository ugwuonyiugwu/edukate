import { LibraryPage } from '@/modules/Library'
import { HydrateClient } from '@/trpc/server'
import React from 'react'

const page = () => {
  return (
    <HydrateClient>
       <LibraryPage/>
    </HydrateClient>
   
  )
}

export default page
