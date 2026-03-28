'use client';

import React, { useState } from 'react';
import { trpc } from "@/trpc/client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from "sonner";
import { UploadDropzone } from '@/app/utils/uploadthing';
import { 
  ArrowRight, Image as ImageIcon, Type, 
  Loader2, ChevronLeft, Zap, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const SubmissionView = ({ quizId }: { quizId: string }) => {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const utils = trpc.useUtils();
  
  // 1. Fetch quiz data and user's current submission count
  const [quiz] = trpc.quiz.getOne.useSuspenseQuery({ id: quizId });
  const { data: submissionCount = 0 } = trpc.quiz.getUserSubmissionCount.useQuery({ quizId });

  const submitMutation = trpc.quiz.submitWork.useMutation({
    onSuccess: () => {
      toast.success(`Question ${submissionCount + 1}/20 Submitted!`);
      setImageUrl(""); // Reset image for next question
      utils.quiz.getUserSubmissionCount.invalidate({ quizId });
      
      if (submissionCount + 1 >= 20) {
        router.push(`/quizathon/${quizId}`);
      }
    },
    onError: (err) => toast.error(err.message)
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    submitMutation.mutate({
      quizId,
      questionText: formData.get('question') as string,
      imageUrl: imageUrl || undefined,
      correctAnswer: formData.get('correct') as string,
      wrongAnswer1: formData.get('wrong1') as string,
      wrongAnswer2: formData.get('wrong2') as string,
      wrongAnswer3: formData.get('wrong3') as string,
    });
    e.currentTarget.reset(); // Clear form for next entry
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
               <Zap size={20} />
             </div>
             <div>
               <h2 className="text-sm font-black uppercase tracking-widest text-white">Question Intel {submissionCount}/20</h2>
               <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                 <div 
                   className="h-full bg-indigo-500 transition-all duration-500" 
                   style={{ width: `${(submissionCount / 20) * 100}%` }}
                 />
               </div>
             </div>
          </div>
          <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
            Exit Mission
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side: Question & Visuals */}
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900/40 border-slate-800 backdrop-blur-xl">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">
                <Type size={16} /> Question Data
              </label>
              <Textarea 
                name="question"
                required
                placeholder="Ex: What is the primary function of a reverse proxy?"
                className="bg-slate-950 border-slate-800 text-white min-h-[120px] rounded-xl"
              />
            </Card>

            <Card className="p-6 bg-slate-900/40 border-slate-800">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 mb-4">
                <ImageIcon size={16} /> Visual Intelligence
              </label>
              
              {imageUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/50">
                  <Image src={imageUrl} alt="Uploaded" fill className="object-cover" />
                  <button 
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white shadow-lg"
                  >
                    <ChevronLeft size={16} className="rotate-45" />
                  </button>
                </div>
              ) : (
               <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                    setImageUrl(res[0].url);
                    toast.success("Image secured!");
                }}
                onUploadError={(error: Error) => {
                    // Adding curly braces ensures the function returns 'void'
                    toast.error(`Upload failed: ${error.message}`);
                }}
                className="ut-label:text-indigo-400 ut-button:bg-indigo-600 border-slate-800 bg-slate-950/50"
                />
              )}
            </Card>
          </div>

          {/* Right Side: Answers */}
          <div className="space-y-6">
            <div className="space-y-4">
               <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                 <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] block mb-2">The Absolute Truth</label>
                 <Input name="correct" required placeholder="Correct answer..." className="bg-slate-950 border-emerald-500/30 text-white" />
               </div>

               {['1', '2', '3'].map((i) => (
                 <div key={i} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                   <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] block mb-2">Decoy Intelligence #{i}</label>
                   <Input name={`wrong${i}`} required placeholder="Wrong answer..." className="bg-slate-950 border-rose-500/30 text-white" />
                 </div>
               ))}
            </div>

            <Button 
              type="submit" 
              disabled={submitMutation.isPending}
              className="w-full h-20 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-indigo-500/20"
            >
              {submitMutation.isPending ? <Loader2 className="animate-spin" /> : (
                <span className="flex items-center gap-3">
                  Log Question {submissionCount + 1} <ArrowRight size={20} />
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};