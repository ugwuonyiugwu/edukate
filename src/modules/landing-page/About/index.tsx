import React from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  ShieldCheck, 
  Trophy, 
  Award,
  ArrowRight
} from 'lucide-react';

// Types for the FeatureItem
interface FeatureProps {
  icon: React.ElementType;
  title: string;
  desc: string;
}

export const AboutPage = () => {
  return (
    <div className="bg-white text-slate-900 overflow-x-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 px-6 lg:pt-32">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8 transition-all hover:bg-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">The Initiative</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-12 break-words">
            DEMOCRATIZING <br />
            <span className="text-slate-200 hover:text-blue-600 transition-colors duration-700">INTELLECT.</span>
          </h1>
          
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-light max-w-xl">
              We are dismantling the structural barriers to academic excellence. EduBridge is a 
              frontier for equitable education, turning passive resource access into a 
              merit-driven ecosystem.
            </p>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <StatBlock value="100%" label="Open Access" color="border-blue-600" />
              <StatBlock value="Incentivized" label="Learning Model" color="border-slate-900" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PHILOSOPHY */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold tracking-tight">The Educational Divide</h2>
            <div className="space-y-6 text-slate-400 leading-relaxed text-lg">
              <p>
                Quality education has long been a privilege of the few. Despite a digital age, 
                premium resources and standardized testing remain geographically and 
                economically locked.
              </p>
              <p>
                Our mission is to serve as a <span className="text-white font-medium">Global Repository</span>—a central hub where 
                underprivileged communities can access high-tier literary works without financial friction.
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Lightbulb className="text-blue-400 w-5 h-5" /> Our Strategic Pillars
              </h3>
              <ul className="space-y-8">
                <Pillar number="01" text="Facilitating collaborative inter-school classwork to bridge the experience gap." />
                <Pillar number="02" text="Providing a sanctuary for talented writers to broadcast their literary intellect." />
                <Pillar number="03" text="Allocating scholarship grants to students facing systemic hardships." />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE BLUEPRINT */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-blue-600 mb-16 border-b border-blue-100 pb-4 inline-block">
            The Ecosystem
          </h2>
          
          <div className="grid md:grid-cols-3 gap-x-12 gap-y-16">
            <FeatureItem 
              icon={BookOpen}
              title="Knowledge Repository"
              desc="A curated digital vault of textbooks and resources available anytime, anywhere."
            />
            <FeatureItem 
              icon={ShieldCheck}
              title="Verified Assessment"
              desc="Standardized evaluation tools to identify strengths and bridge knowledge gaps."
            />
            <FeatureItem 
              icon={Trophy}
              title="Incentivized Merit"
              desc="A rewarding culture where high performance yields real-world prizes and recognition."
            />
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-32 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Award className="w-12 h-12 mx-auto mb-10 text-blue-600/20" />
          <h2 className="text-3xl md:text-5xl font-medium mb-8 tracking-tight italic text-slate-800">
            Fostering a culture of continuous learning and collective achievement.
          </h2>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto text-lg">
            EduBridge is more than a repository. It is a commitment to ensuring every student has the tools to change their trajectory.
          </p>
          <button className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full transition-all hover:bg-blue-700 active:scale-95">
            <span className="font-bold">Partner with our Mission</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}

// Sub-components for cleaner JSX
const StatBlock = ({ value, label, color }: { value: string, label: string, color: string }) => (
  <div className={`px-6 py-3 border-l-4 ${color} bg-slate-50 min-w-[140px]`}>
    <p className="text-2xl font-black">{value}</p>
    <p className="text-[10px] uppercase text-slate-500 tracking-widest font-bold">{label}</p>
  </div>
);

const Pillar = ({ number, text }: { number: string, text: string }) => (
  <li className="flex gap-4 items-start group">
    <span className="font-mono text-sm text-blue-500 pt-1 group-hover:scale-110 transition-transform">{number}</span>
    <span className="text-slate-300 group-hover:text-white transition-colors">{text}</span>
  </li>
);

function FeatureItem({ icon: Icon, title, desc }: FeatureProps) {
  return (
    <div className="group space-y-6">
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">
          {desc}
        </p>
      </div>
      <div className="w-0 group-hover:w-full h-[1px] bg-blue-600 transition-all duration-700" />
    </div>
  );
}