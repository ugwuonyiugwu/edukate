'use client';

import { trpc } from "@/trpc/client";
import { ArrowLeft, Globe,PlayIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const DocumentDetailView = ({ documentId, libraryId }: { documentId: number, libraryId: number }) => {
  // This hook pulls from the prefetched server cache instantly
  const { data: doc } = trpc.documents.getDocumentById.useQuery({ id: documentId });
  const utils = trpc.useUtils();
  const downloadMutation = trpc.documents.incrementDownloads.useMutation();

  if (!doc) return null; // Should not happen with prefetching

  const handleDownload = () => {
    downloadMutation.mutate({ id: doc.id }, { 
      onSuccess: () => utils.documents.getDocumentById.invalidate({ id: documentId }) 
    });
    window.open(doc.fileUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-12 animate-in fade-in duration-300">
      <Link href={`/libraries/${libraryId}`} className="flex items-center gap-2 text-gray-400 hover:text-black mb-10 transition-colors">
        <ArrowLeft size={20} /> <span className="font-bold">Back</span>
      </Link>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Metadata */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <p className="text-xs font-black uppercase text-gray-400 mb-2">Title</p>
            <div className="p-4 bg-gray-50 border border-gray-100 font-bold">{doc.name}</div>
        </div>
        <div>
            <p className="text-xs font-black uppercase text-gray-400 mb-2">Description</p>
            <div className="w-full p-6 bg-gray-50/50 border border-gray-100 text-gray-600 min-h-62.5 leading-relaxed text-lg font-medium">
                {doc.description ? (
                    doc.description.split(/(?=\d\.)/).map((item, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                        {item.trim()}
                    </div>
                    ))
                ) : (
                    "No description provided."
                )}
            </div>
        </div>           
          <div>
            <p className="text-xs font-black uppercase text-gray-400 mb-2">Topic</p>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl w-64 font-bold">{doc.subject}</div>
          </div>
        </div>

        {/* Right Side: Preview & Download */}
        <div className="lg:col-span-5 space-y-8">
          {doc.videoUrl ? (
            <Link 
              href={`${doc.videoUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
                <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-lg cursor-pointer">
                    <Image src={doc.thumbnailUrl || ""} alt="Preview" fill className="object-cover opacity-50" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                     <PlayIcon size={40}/>
                     <p className="text-sm mt-2 font-medium">click here to watch tutorial video</p>
                </div>
                </div>
            </Link>
          ) : (
            <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-lg cursor-pointer">
                <Image src={doc.thumbnailUrl || ""} alt="Preview" fill className="object-cover opacity-50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                     <PlayIcon size={40}/>
                     <p className="text-sm mt-2 font-medium">click here to watch tutorial video</p>
                </div>
            </div>
          )}
          
         

          <div className="space-y-4 px-2 mt-8 font-bold text-sm uppercase">
            <div className="flex justify-between w-48"><span>Downloads</span> <span>{doc.downloads}</span></div>
          </div>

          <div>
            <p className="text-xs font-black uppercase text-gray-400 mb-2">Visibility</p>
            <div className="flex items-center gap-2 p-4 border border-gray-100 rounded-xl">
              <Globe size={18} className="text-gray-400" />
              <span className="font-bold text-gray-700">public</span>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            className="w-full py-5 bg-[#22C55E] hover:bg-green-600 text-white font-black text-2xl rounded-2xl transition-all shadow-lg"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};