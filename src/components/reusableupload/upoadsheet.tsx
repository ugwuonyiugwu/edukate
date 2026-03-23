'use client';
import React from 'react';
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { useUploadThing } from "@/app/utils/uploadthing";

interface UploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void; 
  title?: string;
}

export const UploadSheet = ({ 
  isOpen, 
  onClose, 
  onUploadComplete,
  title = "Upload Content"
}: UploadSheetProps) => {

  // Initialize the hook
  const { startUpload, isUploading } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        onUploadComplete(res[0].ufsUrl);
      }
    },
    onUploadError: (error) => {
      alert(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Trigger the upload immediately after selection
    await startUpload([file]);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out transform ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="max-w-2xl mx-auto bg-white rounded-t-[2.5rem] p-8 md:p-12 shadow-2xl relative border-t border-gray-100 text-center">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full" />
          
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>

          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-colors ${isUploading ? 'bg-blue-100 animate-pulse' : 'bg-blue-50'}`}>
            {isUploading ? (
              <Loader2 className="text-blue-600 w-8 h-8 animate-spin" />
            ) : (
              <Upload className="text-blue-600 w-8 h-8" />
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {isUploading ? "Uploading..." : title}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {isUploading ? "Please wait while we process your PDF." : "Select your PDF to start the process."}
          </p>
          
          {/* Custom File Trigger */}
          <div className="relative">
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              id="pdf-input-trigger" 
              onChange={handleFileSelection}
              disabled={isUploading}
            />
            <label 
              htmlFor="pdf-input-trigger" 
              className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl shadow-blue-100 ${
                isUploading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              }`}
            >
              {isUploading ? (
                <>Processing...</>
              ) : (
                <>
                  <FileText size={20} />
                  Choose PDF File
                </>
              )}
            </label>
          </div>

          <p className="mt-6 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            Supported format: PDF (Max 16MB)
          </p>
        </div>
      </div>
    </>
  );
};