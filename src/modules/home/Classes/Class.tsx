'use client';

import React from 'react';
import Image from 'next/image';
import { BookOpen, Zap, Crown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export const ClassEnrollmentGrid = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#e5e7eb] flex flex-col items-center p-6 gap-6">
      <div className="max-w-5xl w-full mb-6">
        <Image 
          src="/backgroud-images/classbanner.png" 
          width={1200} 
          height={150} // Image height based on your snippet
          alt="Online Learning Promotional Banner"          
          priority          
          className="w-full h-auto rounded-lg shadow-md object-cover" 
        />
      </div>

          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-5">
        {LEVELS.map((level) => (
          <div key={level.id} className="bg-white border border-blue-100 rounded-lg p-6 flex flex-col shadow-lg">
            <div className={`w-14 h-14 ${level.color} rounded-lg flex items-center justify-center mb-5`}>
              <level.icon size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{level.title}</h2>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm">
              {level.desc}
            </p>
            <button 
              onClick={() => router.push(`/classes/academy?level=${level.id}`)}
              className={`mt-auto w-full py-3 rounded-lg flex items-center justify-center gap-3 text-sm font-bold transition-all ${level.btnColor}`}
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};