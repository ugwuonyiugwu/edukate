import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Github, 
  Mail, 
  Send 
} from 'lucide-react';

export const  Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-primary p-1.5 rounded-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">EduKate</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Bridging the gap in global education through open access to resources, 
              performance-based rewards, and a supportive community for every student.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Facebook size={18} />} label="Facebook" />
              <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
              <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="#" icon={<Linkedin size={18} />} label="LinkedIn" />
              <SocialLink href="#" icon={<Github size={18} />} label="GitHub" />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Digital Library</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mock Assessments</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Scholarship Programs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Writer's Portal</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Partner Schools</a></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-white font-semibold mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Student Mentorship</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold">Stay Updated</h4>
            <p className="text-sm text-slate-400">
              Get the latest on new books and scholarship opportunities.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <Button size="sm" className="px-3">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p>© 2026 EduBridge Repository. Empowering students globally.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Systems Operational
            </span>
            <a href="#" className="hover:text-white transition-colors">English (US)</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 text-slate-400"
    >
      {icon}
    </a>
  );
}