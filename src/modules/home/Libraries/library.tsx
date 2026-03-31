'use client';

import { trpc } from "@/trpc/client";
import { Loader2, BookOpen, Search, Download, ArrowRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { UserAvatar } from "@/components/reusableavatar/avatar";

export default function DiscoveryPage() {
  // Data is prefetched, so 'libraries' will likely be available immediately
  const { data: libraries, isLoading } = trpc.documents.getAllLibraries.useQuery();
  const { data: user } = trpc.users.getOne.useQuery();
  const [search, setSearch] = useState("");

  const filteredLibs = libraries?.filter(lib => 
    lib.name.toLowerCase().includes(search.toLowerCase())
  );

  // Prefetching makes this mostly redundant, but good to keep as a fallback
  if (isLoading && !libraries) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#FAFAFA]">
      {/* Header Section */}

      <div className="max-w-7xl mx-auto px-2 sm:px-6 pt-6 md:flex items-center justify-between">
              <Link href="/dashboard" className="group flex items-center gap-2 text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all hover:text-indigo-600">
                <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                  <ChevronLeft size={16} />
                </div>
                <span>Home</span>
              </Link>
            </div>

      <div className="mb-12 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Explore Libraries
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Browse through cumulative knowledge shared by the community.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search by library name..." 
            className="pl-10 h-12 rounded-2xl border-gray-200 bg-white shadow-sm focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredLibs?.map((lib) => (
          <Link key={lib.id} href={`/libraries/${lib.id}`}>
            <div className="group bg-white p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              
              {/* Thumbnail Area */}
              <div className="relative h-44 w-full overflow-hidden bg-gray-100 mb-5">
                {lib.thumbnailUrl ? (
                  <Image 
                    src={lib.thumbnailUrl} 
                    alt={lib.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-600 to-indigo-700">
                    <BookOpen className="text-white/20" size={56} />
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="flex flex-col grow px-1">
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar of the library owner - You may want to update lib to include owner image */}
                  <UserAvatar imageUrl={user?.imageUrl} size={32} className="ring-2 ring-white shadow-sm shrink-0" />
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight pt-1">
                    {lib.name}
                  </h3>
                </div>
                
                {/* Steady Stats Container */}
                <div className="grid grid-cols-2 gap-16 py-4 border-y border-gray-50 mb-auto">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BookOpen size={16} className="text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">{lib.documents?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Download size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">{lib.totalDownloads || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">View Collection</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredLibs?.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
          <Search size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold text-lg">No collections match your search.</p>
          <button 
            onClick={() => setSearch("")} 
            className="mt-4 text-blue-600 font-bold hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}