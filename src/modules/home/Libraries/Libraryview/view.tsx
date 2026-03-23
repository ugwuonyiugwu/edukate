'use client';

import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Loader2, ArrowLeft, FileText, Download as DownloadIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DocumentDetailView } from "../Materialview/view";

interface LibraryDetailsViewProps {
  libraryId: number;
}

export const LibraryDetailsView = ({ libraryId }: LibraryDetailsViewProps) => {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const utils = trpc.useUtils();

  const { data: library, isLoading } = trpc.documents.getLibraryById.useQuery({ id: libraryId });
  const downloadMutation = trpc.documents.incrementDownloads.useMutation();

  if (docId) {
    return <DocumentDetailView documentId={Number(docId)} libraryId={libraryId} />;
  }

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!library || !library.documents) return <div className="p-10 text-center font-bold">No resources found.</div>;

  // --- FIX: LOGIC FOR GROUPING BY SUBJECT ---
  type DocumentType = typeof library.documents[number];
  
  const groupedBySubject = library.documents.reduce((acc: Record<string, DocumentType[]>, doc) => {
    // Normalizing the subject (Trim and Capitalize) to prevent "Physics" vs "physics" duplicates
    const subjectRaw = doc.subject?.trim() || "General Resources";
    const subject = subjectRaw.charAt(0).toUpperCase() + subjectRaw.slice(1).toLowerCase();
    
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(doc);
    return acc;
  }, {});

  const handleDownload = (e: React.MouseEvent, doc: DocumentType) => {
    e.preventDefault();
    e.stopPropagation();
    downloadMutation.mutate({ id: doc.id }, {
      onSuccess: () => utils.documents.getLibraryById.invalidate({ id: libraryId })
    });
    window.open(doc.fileUrl, '_blank');
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#FAFAFA]">
      <Link href="/libraries" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-bold text-sm">
        <ArrowLeft size={16} /> Back to Exploration
      </Link>

      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-16">{library.name}</h1>

      <div className="space-y-20">
        {/* 1. LOOP THROUGH SUBJECTS */}
        {Object.entries(groupedBySubject).map(([subject, docs]) => (
          <section key={subject} className="relative">
            {/* Header section matching error.jpg */}
            <div className="flex items-center justify-between mb-8 group">
              <h2 className="text-2xl font-black text-[#1e293b] tracking-tight capitalize">
                {subject}
              </h2>
              <div className="flex-1 mx-6 h-1 bg-gray-200/60" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {docs.length} {docs.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* 2. LOOP THROUGH DOCUMENTS IN THIS SUBJECT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {docs.map((doc) => (
                <div key={doc.id} className="group bg-white border border-gray-100/50 shadow-sm p-2 hover:shadow-xl transition-all duration-500">
                  <Link href={`/libraries/${libraryId}?docId=${doc.id}`} scroll={false}>
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100 mb-5 shadow-inner">
                      {doc.thumbnailUrl ? (
                        <Image 
                          src={doc.thumbnailUrl} 
                          alt={doc.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><FileText className="text-gray-300" size={48} /></div>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-[16px] mb-6 px-1 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h3>
                  </Link>

                  <button 
                    onClick={(e) => handleDownload(e, doc)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 hover:bg-black hover:text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all mb-3 shadow-sm active:scale-95"
                  >
                    <DownloadIcon size={14} /> Download PDF
                  </button>

                  <div className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest opacity-60">
                    {doc.downloads || 0} Downloads
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};