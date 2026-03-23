'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/reusableavatar/avatar";
import { UploadSheet } from "@/components/reusableupload/upoadsheet";
import { DocumentMetadataForm } from "@/components/reusableDocumentMetadata/documentmetadata";
import { 
  FileText, LogOut, Plus, ArrowLeft, 
  Loader2, Edit3, Trash2, Settings2, Download, Heart
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/app/utils/uploadthing";

// Updated to match your actual database schema
export interface DocumentType {
  id: number;
  clerkId: string;
  name: string;
  subject: string;
  description: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  downloads: number; 
  likes: number;
  createdAt: Date | string | null;
}

export const LibraryPage = () => {
  const utils = trpc.useUtils();
  const router = useRouter();
  
  // Data Fetching
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: library, isLoading: isLibLoading } = trpc.documents.getLibrary.useQuery();
  const { data: realDocuments, isLoading: isDocsLoading } = trpc.documents.getMyDocuments.useQuery();
  
  // State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
  
  // Library Edit State
  const [isEditLibOpen, setIsEditLibOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThumb, setEditThumb] = useState<string | null>(null);

  // Calculate Cumulative Downloads for the UI Header
  const totalLibraryDownloads = realDocuments?.reduce((acc, doc) => acc + (doc.downloads || 0), 0) || 0;

  // Mutations
  const updateLibMutation = trpc.documents.updateLibrary.useMutation({
    onSuccess: () => {
      utils.documents.getLibrary.invalidate();
      setIsEditLibOpen(false);
    }
  });

  const deleteLibMutation = trpc.documents.deleteLibrary.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    }
  });

  const handleUploadComplete = (url: string) => {
    setUploadedFileUrl(url);
    setIsSheetOpen(false);
  };

  const handleFinalSuccess = () => {
    setUploadedFileUrl(null);
    setEditingDoc(null);
    utils.documents.getMyDocuments.invalidate();
  };

  const deleteDocMutation = trpc.documents.delete.useMutation({
    onSuccess: () => utils.documents.getMyDocuments.invalidate(),
    onError: (err) => alert(err.message),
  });

  const openEditLibrary = () => {
    if (library) {
      setEditName(library.name);
      setEditThumb(library.thumbnailUrl);
      setIsEditLibOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={35} height={35} />
          <span className="font-bold text-xl text-blue-700 tracking-tight">EduKate</span>
        </div>
        
        {(!uploadedFileUrl && !editingDoc) && (
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsSheetOpen(true)}
              className="text-blue px-3 md:px-4 h-9 md:h-10 flex items-center gap-2 font-bold transition-all shadow-md text-[10px] md:text-sm"
            >
              <Plus size={16} /> <span className="hidden md:inline">Upload Content</span>
            </Button>
          </div>
        )}
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {(!uploadedFileUrl && !editingDoc) && (
          <aside className="w-64 border-r border-gray-200 hidden lg:flex flex-col p-6 bg-white shrink-0">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 mb-6 border border-gray-100">
              <UserAvatar imageUrl={user?.imageUrl} name={user?.firstName} size={96} className="mb-3 ring-2 ring-white shadow-md" />
              <h3 className="font-bold text-gray-900 text-sm truncate w-full">{user?.firstName} {user?.lastName}</h3>
              <div className="flex items-center gap-1.5 mt-2 bg-blue-100 px-3 py-1 rounded-full">
                <Download size={12} className="text-blue-600" />
                <span className="text-[10px] text-blue-600 font-black">{totalLibraryDownloads} Total DLs</span>
              </div>
            </div>
            <nav className="space-y-1 flex-1">
              <button className="flex items-center gap-3 w-full p-3 bg-blue-600 text-white rounded-xl font-bold text-sm">
                <FileText size={18} /> My Library
              </button>
            </nav>
            <button className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm mt-auto">
              <LogOut size={18} /> Log Out
            </button>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {(uploadedFileUrl || editingDoc) ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => { setUploadedFileUrl(null); setEditingDoc(null); }} 
                  className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-xs md:text-sm"
                >
                  <ArrowLeft size={16} /> Back to Library
                </button>
                <DocumentMetadataForm 
                  fileUrl={uploadedFileUrl || editingDoc?.fileUrl || ""} 
                  initialData={editingDoc} 
                  onComplete={handleFinalSuccess} 
                />
              </div>
            ) : (
              <>
                {/* DYNAMIC LIBRARY HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                      {library?.thumbnailUrl ? (
                        <Image src={library.thumbnailUrl} alt="Library" fill className="object-cover" />
                      ) : (
                        <FileText className="text-white/40" size={32} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
                        {isLibLoading ? <Loader2 className="animate-spin" /> : (library?.name || "Personal Library")}
                      </h3>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                        {realDocuments?.length || 0} Documents curated
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openEditLibrary} className="rounded-xl border-gray-200 text-gray-600 font-bold h-11 px-4">
                      <Settings2 size={16} className="mr-2" /> Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => confirm("Warning: This will delete your library and all associated documents permanently. Continue?") && deleteLibMutation.mutate()} 
                      className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 font-bold h-11"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* DOCUMENTS TABLE */}
                <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="p-5 text-[11px] font-black uppercase text-gray-400 pl-8 tracking-wider">Document</th>
                          <th className="p-5 text-[11px] font-black uppercase text-gray-400 text-center tracking-wider">Uploaded</th>
                          <th className="p-5 text-[11px] font-black uppercase text-gray-400 text-center tracking-wider">Stats</th>
                          <th className="p-5 text-[11px] font-black uppercase text-gray-400 text-right pr-8 tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {isDocsLoading ? (
                          <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" /></td></tr>
                        ) : (
                          realDocuments?.map((doc, index) => (
                            <tr key={doc.id} className="group hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0">
                              <td className="p-5 pl-8">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-12 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0 shadow-sm">
                                    {doc.thumbnailUrl ? (
                                      <Image src={doc.thumbnailUrl} alt="thumb" fill className="object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <FileText size={20} className="text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-[300px]">{doc.name}</span>
                                    <span className="text-[10px] text-blue-600 uppercase font-black tracking-tighter mt-1">{doc.subject}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5 text-center text-xs font-bold text-gray-400">
                                {doc.createdAt ? format(new Date(doc.createdAt), "MMM d, yyyy") : "—"}
                              </td>
                              <td className="p-5">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1.5 text-gray-700 font-black">
                                    <Download size={14} className="text-emerald-500" />
                                    <span>{doc.downloads}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]">
                                    <Heart size={12} className="text-pink-400" />
                                    <span>{doc.likes}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-5 pr-8 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button 
                                    onClick={() => setEditingDoc({
                                      ...doc,
                                      thumbnailUrl: doc.thumbnailUrl ?? null,
                                      createdAt: doc.createdAt ?? null,
                                    } as DocumentType)} 
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                   >
                                    <Edit3 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => confirm("Delete this document?") && deleteDocMutation.mutate({ id: doc.id })} 
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    disabled={deleteDocMutation.isPending}
                                  >
                                    {deleteDocMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                        {realDocuments?.length === 0 && !isDocsLoading && (
                          <tr>
                            <td colSpan={4} className="p-20 text-center">
                              <div className="max-w-xs mx-auto flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                  <FileText className="text-gray-200" size={32} />
                                </div>
                                <p className="text-gray-400 font-bold">Your library is empty. Start by uploading your first document!</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* EDIT LIBRARY DIALOG */}
      <Dialog open={isEditLibOpen} onOpenChange={setIsEditLibOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[40px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Library Settings</DialogTitle>
            <DialogDescription className="font-medium text-gray-500">Customize how your collection appears to others.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Cover Image</label>
              <div className="w-full h-44 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden relative group transition-all hover:border-blue-200">
                {editThumb ? (
                  <>
                    <Image src={editThumb} alt="Preview" fill className="object-cover" />
                    <button onClick={() => setEditThumb(null)} className="absolute inset-0 bg-black/60 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm text-sm">Change Image</button>
                  </>
                ) : (
                  <UploadButton
                    endpoint="libraryThumbnailUploader"
                    onClientUploadComplete={(res) => setEditThumb(res[0].url)}
                    className="ut-button:bg-blue-600 ut-label:text-blue-600"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Library Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. Physics 101 Notes" className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold focus:ring-blue-600" />
            </div>
          </div>
          <Button 
            disabled={updateLibMutation.isPending} 
            onClick={() => updateLibMutation.mutate({ name: editName, thumbnailUrl: editThumb ?? undefined })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
          >
            {updateLibMutation.isPending ? <Loader2 className="animate-spin" /> : "Update Library"}
          </Button>
        </DialogContent>
      </Dialog>

      <UploadSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} onUploadComplete={handleUploadComplete} />
    </div>
  );
};