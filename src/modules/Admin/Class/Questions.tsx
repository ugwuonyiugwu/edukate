'use client';

import { useState, useEffect, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Plus, Trash2, Save, 
  BookOpen, GraduationCap, CheckCircle2, Loader2,
  Sigma, Image as ImageIcon, X
} from 'lucide-react';
import { toast } from "sonner";
import { useUploadThing } from '@/app/utils/uploadthing';

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import Image from 'next/image';

type UIQuestion = {
  id?: string;
  classId: string;
  type: "CLASSWORK" | "TEST";
  text: string;
  imageUrl?: string | null;
  options: string[];
  correctAnswer: number;
  createdAt?: Date | null;
};

type QuestionValue = string | number | string[] | null;

const formatMath = (str: string) => {
  if (!str) return "";
  return str.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
};

export const CurriculumManagerClient = ({ classId }: { classId: string }) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"CLASSWORK" | "TEST">("CLASSWORK");
  const [isUploading, setIsUploading] = useState(false);

  // Pending Files State (Stores actual File objects until Sync)
  const [pendingFiles, setPendingFiles] = useState<Map<number, File>>(new Map());

  const [classDetails] = trpc.classes.getById.useSuspenseQuery({ id: classId });
  const [dbQuestions] = trpc.questions.getQuestions.useSuspenseQuery({ 
    classId, 
    type: activeTab 
  });

  const [draftQuestions, setDraftQuestions] = useState<UIQuestion[] | null>(null);

  // --- FIX: Wrap questions in useMemo to stabilize dependencies ---
  const questions = useMemo(() => {
    return draftQuestions ?? (dbQuestions as UIQuestion[]) ?? [];
  }, [draftQuestions, dbQuestions]);

  const { startUpload } = useUploadThing("imageUploader");

  // --- Mutations ---
  const saveMutation = trpc.questions.saveQuestions.useMutation({
    onSuccess: () => {
      utils.questions.getQuestions.invalidate({ classId, type: activeTab });
      toast.success(`${activeTab} Registry Updated`);
      setDraftQuestions(null);
      setPendingFiles(new Map());
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteImageMutation = trpc.questions.deleteImage.useMutation();

  // --- Handlers ---
  const handleTabChange = (tab: "CLASSWORK" | "TEST") => {
    setActiveTab(tab);
    setDraftQuestions(null);
    setPendingFiles(new Map());
  };

  const addQuestion = () => {
    setDraftQuestions([
      ...questions, 
      { text: "", imageUrl: null, options: ["", "", "", ""], correctAnswer: 0, classId, type: activeTab }
    ]);
  };

  const removeQuestion = async (index: number) => {
    const questionToRemove = questions[index];
    
    if (questionToRemove.imageUrl && !questionToRemove.imageUrl.startsWith('blob:')) {
      deleteImageMutation.mutate({ url: questionToRemove.imageUrl });
    }

    const next = questions.filter((_, i) => i !== index);
    setDraftQuestions(next);
    
    const nextFiles = new Map(pendingFiles);
    nextFiles.delete(index);
    setPendingFiles(nextFiles);
  };

  const updateQuestion = (index: number, field: keyof UIQuestion, value: QuestionValue) => {
    const next = [...questions];
    next[index] = { ...next[index], [field]: value } as UIQuestion;
    setDraftQuestions(next);
  };

  const handleFileSelect = (index: number, file: File) => {
    const localPreview = URL.createObjectURL(file);
    updateQuestion(index, "imageUrl", localPreview);
    setPendingFiles(prev => new Map(prev).set(index, file));
    toast.info("Image added to draft");
  };

  const removeImage = (index: number, url: string) => {
    if (!url.startsWith('blob:')) {
      deleteImageMutation.mutate({ url });
    }
    
    updateQuestion(index, "imageUrl", null);
    const nextFiles = new Map(pendingFiles);
    nextFiles.delete(index);
    setPendingFiles(nextFiles);
  };

  const handleSync = async () => {
    setIsUploading(true);
    try {
      const finalQuestions = JSON.parse(JSON.stringify(questions)) as UIQuestion[];

      for (const [index, file] of Array.from(pendingFiles.entries())) {
        const res = await startUpload([file]);
        if (res?.[0]) {
          finalQuestions[index].imageUrl = res[0].url;
        }
      }

      await saveMutation.mutateAsync({ 
        classId, 
        type: activeTab, 
        questions: finalQuestions.map(({ text, options, correctAnswer, imageUrl }) => ({ 
          text, 
          options, 
          correctAnswer, 
          imageUrl: imageUrl ?? null 
        })) 
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync images or data.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const next = [...questions];
    const nextOptions = [...next[qIdx].options];
    nextOptions[oIdx] = value;
    next[qIdx] = { ...next[qIdx], options: nextOptions };
    setDraftQuestions(next);
  };

  useEffect(() => {
    if (draftQuestions) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "Unsaved changes detected.";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        // Clean up blob URLs to prevent memory leaks
        questions.forEach(q => {
          if (q.imageUrl?.startsWith('blob:')) {
             URL.revokeObjectURL(q.imageUrl);
          }
        });
      };
    }
  }, [draftQuestions, questions]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="font-black uppercase text-slate-900 tracking-tight leading-none">
                {classDetails.title}
              </h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                Registry: {activeTab} {draftQuestions && "• Unsaved Edits"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSync}
            disabled={saveMutation.isPending || isUploading || !draftQuestions}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            { (saveMutation.isPending || isUploading) ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} />} 
            { isUploading ? "Uploading..." : "Sync Changes" }
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex p-1.5 bg-slate-200/50 rounded-2xl mb-8 border border-slate-200">
          <button onClick={() => handleTabChange("CLASSWORK")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CLASSWORK' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            <BookOpen size={16} /> Classwork
          </button>
          <button onClick={() => handleTabChange("TEST")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'TEST' ? 'bg-white text-purple-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            <GraduationCap size={16} /> Final Exam
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative group animate-in fade-in slide-in-from-bottom-3 duration-300">
              <button onClick={() => removeQuestion(qIdx)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-xs font-black shrink-0">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1 space-y-4">
                      <textarea 
                        placeholder="Question text (use 1/2 for fractions)"
                        className="w-full bg-transparent border-none text-lg outline-none font-bold text-slate-900 focus:ring-0 p-0 resize-none placeholder:text-slate-200"
                        value={q.text}
                        onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                      />

                      <div className="flex flex-col gap-3">
                        {q.imageUrl ? (
                          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-100 group/img aspect-video bg-slate-50">
                            <Image 
                              src={q.imageUrl} 
                              alt="Question Diagram" 
                              fill
                              className="object-contain"
                              unoptimized={q.imageUrl.startsWith('blob:')}
                            />
                            <button 
                              onClick={() => removeImage(qIdx, q.imageUrl!)}
                              className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-all opacity-0 group-hover/img:opacity-100 z-20"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              id={`file-${qIdx}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(qIdx, file);
                              }}
                            />
                            <button 
                              onClick={() => document.getElementById(`file-${qIdx}`)?.click()}
                              className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border-none hover:bg-slate-200 transition-all w-fit flex items-center gap-2"
                            >
                              <ImageIcon size={14}/> Add Diagram
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {q.text.includes('/') && (
                    <div className="ml-12 flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit border border-blue-100">
                      <Sigma size={12} />
                      <span className="text-[10px] font-black uppercase tracking-tighter mr-2">Math Preview:</span>
                      <InlineMath math={formatMath(q.text)} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="space-y-2">
                      <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${q.correctAnswer === oIdx ? 'border-blue-500 bg-blue-50/20' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}>
                        <button 
                          onClick={() => updateQuestion(qIdx, "correctAnswer", oIdx)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${q.correctAnswer === oIdx ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'border-slate-300 bg-white'}`}
                        >
                          {q.correctAnswer === oIdx && <CheckCircle2 size={14} className="text-white" />}
                        </button>
                        <input 
                          className="bg-transparent border-none w-full text-lg outline-none font-bold text-slate-700 focus:ring-0"
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        />
                      </div>
                      {opt.includes('/') && (
                        <div className="px-4 flex items-center gap-2 text-slate-400">
                          <span className="text-[9px] font-bold uppercase tracking-widest">Math:</span>
                          <InlineMath math={formatMath(opt)} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={addQuestion}
            className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black uppercase tracking-widest flex flex-col items-center gap-2 hover:bg-white hover:border-blue-400 hover:text-blue-500 transition-all group shadow-sm"
          >
            <div className="p-3 bg-slate-100 rounded-full group-hover:bg-blue-50 transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-[10px] tracking-[0.2em]">Add Entry to {activeTab}</span>
          </button>
        </div>
      </div>
    </div>
  );
};