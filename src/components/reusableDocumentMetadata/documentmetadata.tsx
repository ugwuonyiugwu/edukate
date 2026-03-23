'use client';
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2, Edit2, FileText } from "lucide-react";
import Image from "next/image";
import { UploadButton } from "@/app/utils/uploadthing"; 
import { ClientUploadedFileData } from "uploadthing/types";

interface DocumentType {
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

interface DocumentMetadataFormProps {
  fileUrl: string;
  thumbnailUrl?: string | null;
  initialData?: DocumentType | null;
  onComplete: () => void;
}

export const DocumentMetadataForm = ({ fileUrl, thumbnailUrl, initialData, onComplete }: DocumentMetadataFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Editable Thumbnail State
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(initialData?.thumbnailUrl || thumbnailUrl || null);
  const [showUploader, setShowUploader] = useState(false);

  const createDocument = trpc.documents.create.useMutation({ 
    onSuccess: () => onComplete() 
  });
  
  const updateDocument = trpc.documents.update.useMutation({ 
    onSuccess: () => onComplete() 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateDocument.mutate({
        id: initialData.id,
        name,
        subject,
        description,
        thumbnailUrl: currentThumbnail, // Now updates properly
      });
    } else {
      createDocument.mutate({
        name,
        subject,
        description,
        fileUrl,
        thumbnailUrl: currentThumbnail || undefined,
      });
    }
  };

  const isLoading = createDocument.isPending || updateDocument.isPending;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
        {initialData ? "Edit Details" : "Finalize Upload"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* EDITABLE THUMBNAIL SECTION */}
        <div className="border border-gray-100 bg-gray-50/50 p-5 rounded-2xl">
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Document Thumbnail</label>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            {/* Thumbnail Preview */}
            <div className="shrink-0">
              {currentThumbnail ? (
                <div className="relative w-28 h-36 rounded-xl overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                  <Image src={currentThumbnail} alt="Thumbnail" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-28 h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <FileText size={32} strokeWidth={1} />
                  <span className="text-[10px] font-bold mt-2">No Image</span>
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="flex-1 space-y-3 w-full sm:w-auto">
              {currentThumbnail && !showUploader && (
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowUploader(true)} 
                    className="gap-2 text-xs font-bold rounded-lg border-gray-200"
                  >
                    <Edit2 size={14} /> Change
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentThumbnail(null)} 
                    className="gap-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} /> Remove
                  </Button>
                </div>
              )}

              {(!currentThumbnail || showUploader) && (
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-inner">
                  <p className="text-[10px] font-bold text-blue-600 mb-2 uppercase">Upload Custom Cover</p>
                  <UploadButton
                    endpoint="thumbnailUploader"
                    onClientUploadComplete={(res: ClientUploadedFileData<unknown>[]) => {
                     const url = res?.[0]?.ufsUrl || res?.[0]?.url; 
                      if (url) {
                        setCurrentThumbnail(url);
                        setShowUploader(false);
                      }
                    }}
                    onUploadError={(error: Error) => alert(error.message)}
                    appearance={{
                      button: "bg-blue-600 hover:bg-blue-700 text-sm font-bold w-full rounded-xl transition-all h-10 after:bg-blue-400",
                      allowedContent: "hidden",
                    }}
                  />
                  {showUploader && (
                    <Button 
                      variant="link" 
                      onClick={() => setShowUploader(false)}
                      className="text-xs text-gray-400 mt-2 p-0 h-auto w-full"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Title</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
              placeholder="Document title..."
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Subject</label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
              placeholder="e.g. Science"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium min-h-32 transition-all resize-none"
              placeholder="Write a brief summary..."
            />
          </div>
        </div>

        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {initialData ? "Save Changes" : "Publish Document"}
        </Button>
      </form>
    </div>
  );
};