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

  // 1. Fetch the Library Data
  const { data: library, isLoading } = trpc.documents.getLibraryById.useQuery({ id: libraryId });

  // 2. Mutation for downloads
  const downloadMutation = trpc.documents.incrementDownloads.useMutation();

  const handleDownload = (e: React.MouseEvent, docId: number, fileUrl: string, fileName: string) => {
    e.preventDefault();
    e.stopPropagation();

    downloadMutation.mutate(
      { id: docId },
      {
        onSuccess: () => {
          utils.documents.getLibraryById.invalidate({ id: libraryId });
        },
      }
    );

    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ROUTING LOGIC ---
  // If docId exists in URL, show the Detail View instead of the Grid
  if (docId) {
    return <DocumentDetailView documentId={Number(docId)} libraryId={libraryId} />;
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!library || !library.documents || library.documents.length === 0) {
    return <div className="p-10 text-center font-bold">Library not found or is empty.</div>;
  }

  // --- OPTIONAL: GROUPING BY SUBJECT ---
  type DocumentType = typeof library.documents[number];
  const groupedBySubject = library.documents.reduce((acc: Record<string, DocumentType[]>, doc) => {
    const subject = doc.subject || "General Resources";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#FAFAFA]">
      <Link
        href="/libraries"
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-bold text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Back to Exploration
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{library.name}</h1>
        <p className="text-gray-500 font-medium mt-2">
          {library.documents.length} resources available.
        </p>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedBySubject).map(([subject, docs]) => (
          <section key={subject}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-black text-gray-800 tracking-tight">{subject}</h2>
              <div className="h-0.5 grow bg-gray-200/50 rounded-full" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {docs.length} Items
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white border border-gray-100 shadow-sm p-4 hover:shadow-xl transition-all duration-300 rounded-[30px] flex flex-col"
                >
                  {/* Wrap thumbnail and title in a link to trigger DocumentDetailView */}
                  <Link href={`/libraries/${libraryId}?docId=${doc.id}`} scroll={false}>
                    <div className="relative h-40 w-full rounded-[22px] overflow-hidden bg-gray-50 mb-4 cursor-pointer">
                      {doc.thumbnailUrl ? (
                        <Image
                          src={doc.thumbnailUrl}
                          alt={doc.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                          <FileText className="text-blue-200" size={40} />
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-4 h-10 leading-tight hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h3>
                  </Link>

                  <button
                    onClick={(e) => handleDownload(e, doc.id, doc.fileUrl, doc.name)}
                    disabled={downloadMutation.isPending}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-xl text-[11px] font-black uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DownloadIcon size={14} />
                    Download PDF
                  </button>

                  <div className="mt-3 text-[10px] text-center text-gray-400 font-bold uppercase tracking-tighter">
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