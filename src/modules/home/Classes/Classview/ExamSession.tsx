'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { trpc } from "@/trpc/client";
import { 
  Trophy, ArrowLeft, Loader2, Lock, 
  Timer, ChevronLeft, ChevronRight, RefreshCcw 
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- KATEX IMPORTS ---
import 'katex/dist/katex.min.css';
import katex from 'katex';

export const ExamSession = ({ classId, mode }: { classId: string, mode: string }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // --- DATA FETCHING ---
  const { data: existingResult, isLoading: checkingStatus } = trpc.questions.getExistingResult.useQuery(
    { classId },
    { enabled: mode === 'exam' } 
  );
  const [classData] = trpc.classes.getById.useSuspenseQuery({ id: classId });
  const [allQuestions] = trpc.questions.getByClassId.useSuspenseQuery({ classId });

  const submitMutation = trpc.questions.submitExam.useMutation();

  // --- STATE ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); 
  const [isFinished, setIsFinished] = useState(false);

  // --- HYDRATION FIX ---
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- SMART MATH RENDERING HELPER ---
  const renderMath = useCallback((text: string) => {
    if (!text) return "";

    // 1. Handle Explicit LaTeX (wrapped in $...$)
    if (text.includes('$')) {
      const parts = text.split(/(\$.*?\$)/g);
      return parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          try {
            const html = katex.renderToString(formula, { throwOnError: false });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch { return <span key={index}>{part}</span>; }
        }
        return <span key={index}>{part}</span>;
      });
    }

    // 2. Auto-Detect Plain Text Fractions (e.g., "1/2" or "2 5/6")
    const fractionRegex = /(\d+\s+\d+\/\d+|\d+\/\d+)/g;
    const parts = text.split(fractionRegex);

    return parts.map((part, index) => {
      if (part.match(fractionRegex)) {
        try {
          let formula = part.trim();
          if (formula.includes(' ')) {
            const [whole, frac] = formula.split(/\s+/);
            const [num, den] = frac.split('/');
            formula = `${whole}\\frac{${num}}{${den}}`;
          } else {
            const [num, den] = formula.split('/');
            formula = `\\frac{${num}}{${den}}`;
          }
          const html = katex.renderToString(formula, { throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="mx-0.5" />;
        } catch { return <span key={index}>{part}</span>; }
      }
      return <span key={index}>{part}</span>;
    });
  }, []);

  // --- LOGIC: RANDOMIZE & LIMIT ---
  const sessionQuestions = useMemo(() => {
    if (!mounted) return [];
    return [...allQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
  }, [allQuestions, mounted]);

  const currentQuestion = sessionQuestions[currentIndex];

  // --- LOGIC: CALCULATION ---
  const score = useMemo(() => {
    let correct = 0;
    sessionQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  }, [answers, sessionQuestions]);

  // --- LOGIC: SUBMISSION ---
  const handleFinalSubmit = useCallback(async () => {
    if (isFinished) return;
    if (mode === 'exam') {
      try {
        await submitMutation.mutateAsync({ classId, score, total: sessionQuestions.length });
      } catch { console.error("Submission failed."); }
    }
    setIsFinished(true);
  }, [isFinished, mode, submitMutation, classId, score, sessionQuestions.length]);

  // --- LOGIC: TIMER ---
  useEffect(() => {
    if (!mounted || mode !== 'exam' || isFinished) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          handleFinalSubmit(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [mode, isFinished, handleFinalSubmit, mounted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- RENDERING ---
  if (!mounted || checkingStatus) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00A884]" /></div>;
  }

  if (existingResult && mode === 'exam' && !isFinished) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F0F2F5] p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <Lock className="text-amber-600 mx-auto mb-4" size={40} />
          <h2 className="text-xl font-black text-slate-800 uppercase">Exam Completed</h2>
          <p className="text-slate-500 text-sm mt-2">You have already submitted your exam for this class.</p>
          <div className="my-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Previous Score</p>
            <p className="text-2xl font-black text-[#00A884]">{existingResult.score} / {existingResult.total}</p>
          </div>
          <button onClick={() => router.push('/classes')} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F0F2F5] p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
          <Trophy className="text-[#00A884] mx-auto mb-6" size={48} />
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Session Finished</h2>
          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Score</p>
              <p className="text-2xl font-black text-slate-800">{score} / {sessionQuestions.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">Accuracy</p>
              <p className="text-2xl font-black text-slate-800">{Math.round((score / (sessionQuestions.length || 1)) * 100)}%</p>
            </div>
          </div>
          <div className="space-y-3">
            {mode !== 'exam' && (
              <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#00A884] text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
                <RefreshCcw size={16} /> Retake Practice
              </button>
            )}
            <button onClick={() => router.push('/classes')} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase">
              Exit to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#F0F2F5] font-sans overflow-hidden">
      <header className="h-14 md:h-16 bg-[#00A884] flex items-center justify-between px-4 md:px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-2 text-white">
          <button onClick={() => router.back()} className="hover:bg-black/10 p-1 rounded transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-80 leading-none">
              {classData?.title || "Examination"}
            </p>
            <h1 className="text-[10px] md:text-xs font-black uppercase tracking-tight">
              Question {currentIndex + 1} of {sessionQuestions.length}
            </h1>
          </div>
        </div>
        
        {mode === 'exam' && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-black/10'}`}>
            <Timer size={14} className="text-white" />
            <span className="text-[10px] md:text-xs font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
        <div className="w-full max-w-5xl bg-white rounded-sm shadow-sm border border-slate-200 p-6 md:p-12">
          <h2 className="text-[#2D3748] text-base md:text-2xl font-semibold leading-relaxed mb-8 md:mb-12">
            {renderMath(currentQuestion?.text)}
          </h2>

          <div className="space-y-4 md:space-y-6">
            {(currentQuestion?.options || []).map((optionText: string, idx: number) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestion.id] === idx;

              return (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
                  className="group flex items-start gap-3 md:gap-5 text-left w-full"
                >
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] md:text-sm font-bold text-slate-400 min-w-4.5">({letter})</span>
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#00A884] bg-[#00A884]" : "border-slate-300"
                    }`}>
                      {isSelected && <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <span className={`text-sm md:text-lg font-medium ${isSelected ? "text-[#00A884]" : "text-slate-600"}`}>
                    {renderMath(optionText)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 shrink-0 p-3 md:p-4 shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col gap-3 md:gap-4">
          <div className="flex flex-wrap gap-1 justify-center py-1">
            {sessionQuestions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-6 h-5 md:w-7 md:h-6 rounded-sm text-[9px] md:text-[10px] font-bold border transition-all ${
                  currentIndex === idx ? "bg-white border-slate-400 text-slate-800 ring-1 ring-slate-400" :
                  answers[q.id] !== undefined ? "bg-[#00A884] border-[#00A884] text-white" : "bg-[#F56565] border-[#F56565] text-white"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => { if(confirm("Are you sure you want to submit?")) handleFinalSubmit() }}
              disabled={submitMutation.isPending}
              className="bg-[#00A884] text-white px-3 md:px-8 py-2 rounded text-[8px] md:text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Submitting...' : `Submit ${mode}`}
            </button>
            
            <div className="flex gap-2">
               <button
                 disabled={currentIndex === 0}
                 onClick={() => setCurrentIndex(prev => prev - 1)}
                 className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 bg-emerald-600 text-white text-[8px] md:text-[10px] font-black uppercase rounded shadow-md disabled:opacity-30"
               >
                 <ChevronLeft size={12} /> Prev
               </button>
               <button
                 disabled={currentIndex === sessionQuestions.length - 1}
                 onClick={() => setCurrentIndex(prev => prev + 1)}
                 className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 bg-emerald-600 text-white text-[8px] md:text-[10px] font-black uppercase rounded shadow-md disabled:opacity-30"
               >
                 Next <ChevronRight size={12} />
               </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};