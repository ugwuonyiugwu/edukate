import React from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  ShieldCheck, 
  Globe, 
  Trophy, 
  Award,
  ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const AboutPage = () => {
  return (
    <div className="bg-white text-slate-900 overflow-hidden font-sans">
      {/* 1. HERO SECTION: The Manifesto */}
      <section className="relative pt-24 pb-16 px-6 lg:pt-32">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8 transition-all hover:bg-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700">The Initiative</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            DEMOCRATIZING <br />
            <span className="text-slate-300">INTELLECT.</span>
          </h1>
          
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-light">
              We are dismantling the structural barriers to academic excellence. EduBridge is a 
              frontier for equitable education, turning passive resource access into a 
              merit-driven ecosystem.
            </p>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <div className="px-6 py-3 border-l-2 border-blue-600 bg-slate-50">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs uppercase text-slate-500 tracking-tighter">Open Access</p>
              </div>
              <div className="px-6 py-3 border-l-2 border-slate-900 bg-slate-50">
                <p className="text-2xl font-bold">Incentivized</p>
                <p className="text-xs uppercase text-slate-500 tracking-tighter">Learning Model</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PHILOSOPHY: The Problem & Solution */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold tracking-tight">The Educational Divide</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed text-lg">
              <p>
                Quality education has long been a privilege of the few. Despite a digital age, 
                premium resources and standardized testing remain geographically and 
                economically locked.
              </p>
              <p>
                Our mission is to serve as a **Global Repository**—a central hub where 
                underprivileged communities can access high-tier literary works and 
                rigorous performance assessments without financial friction.
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lightbulb className="text-blue-400" /> Our Strategic Pillars
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="font-mono text-blue-500">01</span>
                  <span>Facilitating collaborative inter-school classwork to bridge the experience gap.</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-mono text-blue-500">02</span>
                  <span>Providing a sanctuary for talented writers to broadcast their literary intellect.</span>
                </li>
                <li className="flex gap-4">
                  <span className="font-mono text-blue-500">03</span>
                  <span>Allocating scholarship grants to students facing systemic hardships.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE BLUEPRINT: Interactive Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 mb-12">The Ecosystem</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureItem 
              icon={<BookOpen className="w-8 h-8" />}
              title="Knowledge Repository"
              desc="A curated digital vault of textbooks and resources available anytime, anywhere."
            />
            <FeatureItem 
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Verified Assessment"
              desc="Standardized evaluation tools to identify strengths and bridge knowledge gaps."
            />
            <FeatureItem 
              icon={<Trophy className="w-8 h-8" />}
              title="Incentivized Merit"
              desc="A rewarding culture where high performance yields real-world prizes and recognition."
            />
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION: The Future */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="w-16 h-16 mx-auto mb-8 text-slate-300" />
          <h2 className="text-4xl font-bold mb-6 tracking-tight italic">
            "Fostering a culture of continuous learning and collective achievement."
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto">
            EduBridge is more than a repository. It is a commitment to ensuring every student, 
            regardless of their class, has the tools to change their trajectory.
          </p>
          <button className="group relative inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full overflow-hidden transition-all hover:pr-12 active:scale-95">
            <span className="font-bold">Partner with our Mission</span>
            <ArrowRight className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group space-y-4 py-8 border-t border-slate-100 hover:border-slate-900 transition-all duration-500">
      <div className="text-slate-400 group-hover:text-blue-600 transition-colors duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}