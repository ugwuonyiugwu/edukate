"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const ChooseRolePage = () => {
  const router = useRouter();

  const handleChoice = (role: string) => {
    router.push(`/presign-up/sign-up?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-blue-700 flex flex-col items-center justify-center px-6 py-10 transition-all duration-500">
      
      {/* Header Section from your screenshot */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-20 h-20 bg-white backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
           <Link href="/" className="flex items-center gap-1">
        <Image src="/logo.png" alt="Logo" width={55} height={55} />
      </Link>
        </div>
        <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 tracking-tight">
          Welcome to EduKate 
        </h1>
        <p className="text-blue-100 text-lg md:text-xl font-medium opacity-90">
          Choose your Signup type to continue
        </p>
      </div>

      {/* Desktop Grid / Mobile Stack */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
        
        {/* Student Card */}
        <Card className="flex-1 border-none rounded-lg bg-white shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
          <CardContent className="p-10 flex flex-col items-center text-center h-full">
            <div className="w-20 h-20 bg-[#E8F0FE] rounded-3xl flex items-center justify-center mb-8">
              <GraduationCap size={40} className="text-[#0047FF]" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Apply as Student</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-10 grow">
              Join our training program as a student and start your journey towards a successful career in technology.
            </p>
            
            <Button 
              onClick={() => handleChoice("student")}
              className="w-full h-14 bg-[#D6E4FF] hover:bg-blue-100 text-[#0047FF] font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

        {/* Instructor Card */}
        <Card className="flex-1 border-none rounded-lg bg-white shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
          <CardContent className="p-10 flex flex-col items-center text-center h-full">
            <div className="w-20 h-20 bg-[#E7F9F0] rounded-3xl flex items-center justify-center mb-8">
              <Users size={40} className="text-[#10B981]" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Apply as Instructor</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-10 grow">
              Share your expertise and help shape the next generation of tech professionals.
            </p>
            
            <Button 
              onClick={() => {}}
              className="w-full h-14 bg-[#E2F7F0] hover:bg-emerald-100 text-[#10B981] font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Footer from your screenshot */}
      <div className="mt-16">
        <p className="text-white/80 text-lg">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-rose-500 font-bold hover:text-rose-800 decoration-2 ">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ChooseRolePage;