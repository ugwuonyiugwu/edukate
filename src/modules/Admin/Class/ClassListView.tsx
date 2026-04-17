'use client';

import { useState, useEffect, useMemo } from 'react';
import { trpc } from "@/trpc/client";
import { Plus, X, Loader2, ImageIcon, FileText, Youtube, Trash2, Edit3, Calendar, Upload, BookOpen, Users } from 'lucide-react';
import { toast } from "sonner";
import { useUploadThing } from "@/app/utils/uploadthing";
import Image from 'next/image';
import { format } from "date-fns";
import Link from 'next/link';

type AcademicLevel = "Basic" | "Mastery" | "Professional";

interface ClassSession {
  id: string;
  title: string;
  subject: string;
  level: AcademicLevel | string;
  pointsRequired: number;
  examDelayDays: number; 
  createdAt: Date | string | null;
  thumbnailUrl?: string | null;
  pdfUrl?: string | null;
  youtubeUrl?: string | null;
}

export const AdminClassListView = () => {
  const [mounted, setMounted] = useState(false); // Fix for Hydration Error
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingThumb, setExistingThumb] = useState("");
  const [existingPdf, setExistingPdf] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [tick, setTick] = useState(0);

  const { startUpload: uploadThumb } = useUploadThing("classImage");
  const { startUpload: uploadPdf } = useUploadThing("classPdf");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTick((prev) => prev + 1), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const utils = trpc.useUtils();
  const [classesData] = trpc.classes.getAll.useSuspenseQuery({});
  
  const classesList = useMemo(() => classesData as unknown as (ClassSession & { _count?: { enrollments: number } })[], [classesData]);
  const editingClass = useMemo(() => editingId ? classesList.find(c => c.id === editingId) : null, [editingId, classesList]);

  const createMutation = trpc.classes.create.useMutation({
    onSuccess: () => { utils.classes.getAll.invalidate(); toast.success("Registry Live!"); closeModal(); },
    onError: (err) => { toast.error(err.message); setIsUploading(false); }
  });

  const updateMutation = trpc.classes.update.useMutation({
    onSuccess: () => { utils.classes.getAll.invalidate(); toast.success("Session Updated!"); closeModal(); },
    onError: (err) => { toast.error(err.message); setIsUploading(false); }
  });

  const deleteMutation = trpc.classes.delete.useMutation({
    onSuccess: () => { utils.classes.getAll.invalidate(); toast.error("Session Purged"); }
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setThumbFile(null);
    setPdfFile(null);
    setExistingThumb("");
    setExistingPdf("");
    setIsUploading(false);
  };

  const openEditModal = (c: ClassSession) => {
    setEditingId(c.id);
    setExistingThumb(c.thumbnailUrl || "");
    setExistingPdf(c.pdfUrl || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const f = new FormData(e.currentTarget);
    
    let finalThumbUrl = existingThumb;
    let finalPdfUrl = existingPdf;

    try {
      if (thumbFile) {
        const thumbRes = await uploadThumb([thumbFile]);
        if (thumbRes) finalThumbUrl = thumbRes[0].url;
      }
      if (pdfFile) {
        const pdfRes = await uploadPdf([pdfFile]);
        if (pdfRes) finalPdfUrl = pdfRes[0].url;
      }

      const data = {
        title: f.get('topic') as string,
        subject: f.get('subject') as string,
        level: f.get('level') as AcademicLevel,
        points: Number(f.get('points')),
        examDelayDays: Number(f.get('examDelayDays')),
        thumbnailUrl: finalThumbUrl,
        pdfUrl: finalPdfUrl,
        youtubeUrl: (f.get('youtube') as string) || "",
        description: ""
      };

      if (editingId) {
        updateMutation.mutate({ id: editingId, ...data });
      } else {
        createMutation.mutate(data);
      }
    } catch (err) {
      toast.error("Deployment Failed");
      setIsUploading(false);
    }
  };

  const getCycleCountdown = (createdAt: Date | string | null, delayDays: number) => {
    if (!createdAt || delayDays <= 0) return null;
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const cycleMs = delayDays * 24 * 60 * 60 * 1000;
    const elapsed = Math.max(0, now - start);
    const remainingInCycle = cycleMs - (elapsed % cycleMs);
    const d = Math.floor(remainingInCycle / (24 * 60 * 60 * 1000));
    const h = Math.floor((remainingInCycle % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const m = Math.floor((remainingInCycle % (60 * 60 * 1000)) / (60 * 1000));
    return { d, h, m, percent: (remainingInCycle / cycleMs) * 100 };
  };

  const thStyle = "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">Registry Management</h2>
          <p className="text-xs font-bold text-slate-400">Manage student access and curriculum deployments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg"
        >
          <Plus size={18} /> New Session
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className={thStyle}>Preview</th>
              <th className={thStyle}>Session Details</th>
              <th className={thStyle}>Cycle Reset</th>
              <th className={thStyle}>Enrolled</th>
              <th className={thStyle}>Category</th>
              <th className={thStyle}>Academy</th>
              <th className={thStyle + " text-right"}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classesList.map((c) => {
              // Only calculate countdown after mounting to prevent SSR mismatch
              const countdown = mounted ? getCycleCountdown(c.createdAt, c.examDelayDays) : null;
              return (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-10 overflow-hidden rounded-md border border-slate-200 shadow-sm">
                      {c.thumbnailUrl ? <Image src={c.thumbnailUrl} alt="" fill className="object-cover" /> : <ImageIcon size={16} className="m-auto mt-2 text-slate-300"/>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{c.subject}</span>
                      <span className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{c.title}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">ID: {c.id.slice(0,8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Render a placeholder if not mounted to avoid mismatch */}
                    {!mounted ? (
                        <div className="h-1.5 w-28 bg-slate-100 rounded-full animate-pulse" />
                    ) : countdown ? (
                      <div className="flex flex-col gap-1 w-28">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${countdown.percent}%` }}/>
                        </div>
                        <div className="text-[10px] font-black text-slate-700 tabular-nums">
                          {countdown.d}d {countdown.h}h {countdown.m}m
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-green-500 uppercase px-2 py-1 bg-green-50 rounded-md">Open</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                      <Users size={14} className="text-slate-400"/>
                      {c._count?.enrollments ?? 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${
                        c.level === 'Professional' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        c.level === 'Mastery' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {c.level}
                    </span>
                  </td>
                  <td className="py-4">
                    <Link 
                        href={`/admin/classes/${c.id}/curriculum`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md"
                    >
                        <BookOpen size={12}/> Manage Tests
                    </Link>
                  </td>
                  <td className="pr-3 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(c)} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={16} /></button>
                      <button onClick={() => confirm("Purge this session?") && deleteMutation.mutate({ id: c.id })} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-baseline-last justify-center bg-slate-900/60 backdrop-blur-md px-4">
          <div className="bg-white mt-10 w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <h3 className="font-black uppercase tracking-tighter text-slate-900 text-xl">
                  {editingId ? "Update Registry" : "New Deployment"}
                </h3>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
            </header>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8 py-6 px-6 bg-slate-50 rounded-[32px] border border-slate-100">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><ImageIcon size={14}/>Thumbnail </label>
                  <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer">
                    {thumbFile || existingThumb ? (
                      <>
                        <Image src={thumbFile ? URL.createObjectURL(thumbFile) : existingThumb} alt="" fill className="object-cover" />
                        <button type="button" onClick={() => {setThumbFile(null); setExistingThumb("");}} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full z-10"><X size={12}/></button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                        <Upload size={20} className="text-slate-400" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center gap-2"><FileText size={14}/> PDF Resource</label>
                  <div className={`relative h-24 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${pdfFile || existingPdf ? 'bg-white border-green-200 shadow-sm' : 'border-slate-300 bg-white'}`}>
                    {pdfFile || existingPdf ? (
                      <div className="flex items-center gap-3 p-4 w-full">
                        <div className="bg-red-50 p-2 rounded-lg text-red-500"><FileText size={20}/></div>
                        <span className="text-[10px] font-black text-slate-600 uppercase truncate max-w-[100px]">{pdfFile ? pdfFile.name : 'Staged PDF'}</span>
                        <button type="button" onClick={() => {setPdfFile(null); setExistingPdf("");}} className="ml-auto text-red-500"><Trash2 size={14}/></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-1 cursor-pointer w-full h-full justify-center">
                        <Upload size={18} className="text-slate-400" />
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input name="subject" defaultValue={editingClass?.subject} placeholder="Subject" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                <input name="topic" defaultValue={editingClass?.title} placeholder="Topic" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>

              <div className="space-y-2">
                <input name="youtube" defaultValue={editingClass?.youtubeUrl || ""} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" placeholder="YouTube Stream URL" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Fixed Select Box with better padding for the arrow */}
                <select 
                  name="level" 
                  defaultValue={editingClass?.level || "Basic"} 
                  className="w-full p-4 pr-10 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option value="Basic">Basic</option>
                  <option value="Mastery">Mastery</option>
                  <option value="Professional">Professional</option>
                </select>
                <input name="examDelayDays" type="number" defaultValue={editingClass?.examDelayDays || 0} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" placeholder="Days" />
                <input name="points" type="number" defaultValue={editingClass?.pointsRequired} placeholder="Points" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" />
              </div>

              <button 
                type="submit" 
                disabled={isUploading || createMutation.isPending || updateMutation.isPending}
                className="w-full bg-slate-900 text-white h-16 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {(isUploading || createMutation.isPending || updateMutation.isPending) ? (
                  <><Loader2 className="animate-spin"/> {isUploading ? "Uploading Storage..." : "Processing..."}</>
                ) : (editingId ? "Save Changes" : "Deploy Session")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};