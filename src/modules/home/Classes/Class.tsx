'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { BookOpen, Zap, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Move configuration outside the component to prevent re-renders
const LEVELS = [
  {
    id: 'Basic',
    title: 'Basic Enrollment',
    desc: 'Foundational training for entry-level students. Master core concepts, terminology, and essential principles required to navigate the industry.',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
    btnColor: 'bg-[#EBF2FF] text-[#1044A5] hover:bg-blue-100'
  },
  {
    id: 'Mastery',
    title: 'Mastery Program',
    desc: 'Advanced application of theory. This tier focuses on critical thinking, complex problem solving, and shaping your personal professional expertise.',
    icon: Zap,
    color: 'bg-green-50 text-green-600',
    btnColor: 'bg-[#E7F9EE] text-[#1D7A42] hover:bg-green-100'
  },
  {
    id: 'Professional',
    title: 'Professional Tier',
    desc: 'The highest echelon of training. Direct access to industry-standard simulations, leadership strategies, and high-stakes certification preparation.',
    icon: Crown,
    color: 'bg-orange-50 text-orange-600',
    btnColor: 'bg-[#FFF3E5] text-[#B25E09] hover:bg-orange-100'
  }
];

// 1. The main exported component wrapped in Suspense for build safety
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

// 2. The actual content logic
const EnrollmentContent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#e5e7eb] flex flex-col items-center p-4 md:p-8 gap-6">
      {/* Banner Section */}
      <div className="max-w-6xl w-full">
        <div className="relative w-full aspect-1200/250 md:aspect-1200/180 overflow-hidden rounded-2xl shadow-lg border border-white/50">
          <Image 
            src="/backgroud-images/classbanner.png" 
            fill
            alt="Online Learning Promotional Banner"           
            priority           
            className="object-cover transition-transform duration-700 hover:scale-105" 
          />
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {LEVELS.map((level) => (
          <div 
            key={level.id} 
            className="group bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-16 h-16 ${level.color} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
              <level.icon size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight italic uppercase">
              {level.title}
            </h2>
            
            <p className="text-slate-500 leading-relaxed mb-8 text-sm font-medium">
              {level.desc}
            </p>
            
            <button 
              onClick={() => router.push(`/classes/academy?level=${level.id}`)}
              className={`mt-auto w-full py-4 rounded-xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.15em] transition-all shadow-md active:scale-95 ${level.btnColor}`}
            >
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};