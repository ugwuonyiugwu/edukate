"use client";
import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { BookOpen, Trophy, Users, PenTool, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, FacebookIcon, LucideFacebook } from "lucide-react";

// Update these paths to match your files in /public/images/
const slides = [
  { url: "/backgroud-images/image2.png", alt: "background" },
  { url: "/backgroud-images/image1.png", alt: "banner" },
  { url: "/backgroud-images/image3.png", alt: "library" },
];

export const HomePage = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        {/* 1. Optimized Carousel Background */}
        <Carousel
          plugins={[plugin.current]}
          className="h-full w-full"
          opts={{
            loop: true,
            duration: 60, // Slower, smoother slide transition
          }}
        >
          <CarouselContent className="ml-0 h-screen">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="relative pl-0 h-full w-full">
                <Image
                  src={slide.url}
                  alt={slide.alt}
                  fill
                  priority={index === 0} // Loads the first image instantly
                  className="object-cover"
                  sizes="100vw"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* 3. Responsive Content Layer */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight md:text-5xl lg:text-5xl">
            Welcome To <span className="text-blue-600">EduKate</span>
          </h1>
          <p className="mt-6 px-5 py-8 max-w-2xl text-lg text-white bg-blue-950/40 md:text-sm ">
            Bridging the gap between potential and opportunity. Access premium educational resources designed to level the playing field for students everywhere..
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="h-10 px-8 bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
        
      </section>
     {/* Features Grid */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<BookOpen className="w-6 h-6 text-blue-500" />}
                title="The Digital Vault"
                description="Unlimited access to thousands of textbooks and resources across all disciplines."
              />
              <FeatureCard 
                icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                title="Smart Assessments"
                description="Test your skills with interactive quizzes and earn prizes for high performance."
              />
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-green-500" />}
                title="Peer Support"
                description="Connect with mentors and students globally to share knowledge and solve problems."
              />
            </div>
          </div>
        </section>

        {/* The Mission Section */}
        <section className="px-6 py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Commitment to Equity</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="bg-white/10 p-2 rounded-full h-fit"><PenTool className="w-5 h-5 text-blue-300" /></div>
                  <div>
                    <h4 className="font-semibold">Platform for Writers</h4>
                    <p className="text-slate-400 text-sm">Giving talented creators a space to share literature with those who need it most.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="bg-white/10 p-2 rounded-full h-fit"><GraduationCap className="w-5 h-5 text-green-300" /></div>
                  <div>
                    <h4 className="font-semibold">Direct Scholarships</h4>
                    <p className="text-slate-400 text-sm">Providing financial support for students facing extreme economic challenges.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="h-2 w-24 bg-primary rounded-full" />
                <h3 className="text-2xl font-bold italic text-slate-200">
                  "Knowledge is the only resource that grows when shared. Our goal is to ensure geography doesn't limit potential."
                </h3>
                <p className="text-slate-500">— Founder's Statement</p>
              </div>
            </div>
          </div>
        </section>
      </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-none bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-md leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}