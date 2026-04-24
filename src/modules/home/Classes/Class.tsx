'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { BookOpen, Zap, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LEVELS = [
  {
    id: 'Basic',
    title: 'Basic Tier',
    desc: 'Comprehensive foundational training for SS1 students. Master the core senior secondary concepts and essential subject principles required to excel in higher classes.',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
    btnColor: 'bg-[#EBF2FF] text-[#1044A5] hover:bg-blue-100'
  },
  {
    id: 'Mastery',
    title: 'Mastery Tier',
    desc: 'Comprehensive coverage of the SS2 curriculum. This tier bridges the gap between core fundamentals and advanced exam preparation, focusing on in-depth topic analysis and practical application.',
    icon: Zap,
    color: 'bg-green-50 text-green-600',
    btnColor: 'bg-[#E7F9EE] text-[#1D7A42] hover:bg-green-100'
  },
  {
    id: 'Professional',
    title: 'Professional Tier',
    desc: 'The ultimate preparation for SS3 scholars. Focused on advanced curriculum mastery, intensive WAEC/NECO/JAMB simulations, and strategic pathways for university entry.',
    icon: Crown,
    color: 'bg-orange-50 text-orange-600',
    btnColor: 'bg-[#FFF3E5] text-[#B25E09] hover:bg-orange-100'
  }
];

export const ClassEnrollmentGrid = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#e5e7eb]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    }>
      <EnrollmentContent />
    </Suspense>
  );
};

const EnrollmentContent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#e5e7eb] flex flex-col items-center p-4 sm:p-6 lg:p-8 gap-6">
      
      {/* Banner Section - Optimized for all screen shapes */}
      <div className="max-w-7xl w-full">
        <div className="relative w-full overflow-hidden rounded-lg shadow-lg border border-white/50 
          aspect-3/1     /* Mobile (Square-ish) */
          sm:aspect-3/1   /* Large Phones/Small Tablets */
          lg:aspect-6/1   /* Large Desktop */
          min-h-160px    /* Never let it get too thin */
        ">
          <Image 
            src="/backgroud-images/classbanner.png" 
            fill
            alt="Online Learning Promotional Banner"           
            priority           
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="object-cover transition-transform duration-700 hover:scale-105" 
          />
        </div>
      </div>

      {/* Grid Section - Adjusted for Tablet (iPad) breakpoints */}
      <div className="max-w-7xl w-full grid grid-cols-1 
        sm:grid-cols-2    /* Two columns for iPads in portrait */
        lg:grid-cols-3    /* Three columns for Large Screens/iPad Landscape */
        gap-4 md:gap-6 mb-12"
      >
        {LEVELS.map((level) => (
          <div 
            key={level.id} 
            className="group bg-white border border-blue-200 rounded-xl p-6 lg:p-8 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-14 h-14 lg:w-16 lg:h-16 ${level.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
              <level.icon size={28} className="lg:w-8 lg:h-8" />
            </div>
            
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">
              {level.title}
            </h2>
            
            <p className="text-slate-500 leading-relaxed mb-8 text-xs lg:text-sm font-medium">
              {level.desc}
            </p>
            
            <button 
              onClick={() => router.push(`/classes/academy?level=${level.id}`)}
              className={`mt-auto w-full py-3 lg:py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] transition-all shadow-md active:scale-95 ${level.btnColor}`}
            >
              Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};