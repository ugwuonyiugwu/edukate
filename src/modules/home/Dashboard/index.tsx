'use client';
import { trpc } from "@/trpc/client";
import { BookOpen, Trophy, GraduationCap, Loader2, Image as ImageIcon } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/app/utils/uploadthing";
import Image from "next/image";

interface CarouselFrameProps {
  children: React.ReactNode;
  className?: string;
}

const CarouselFrame = ({ children, className = "" }: CarouselFrameProps) => (
  <div className={`embla__slide flex-[0_0_100%] min-w-0 h-40 rounded-3xl p-6 ${className}`}>
    <div className="w-full h-full flex flex-col justify-center">
      {children}
    </div>
  </div>
);

export const DashboardView = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  
  // Data Fetching
  const { data: user } = trpc.users.getOne.useQuery();
  const { data: library, isLoading: isLibLoading } = trpc.documents.getLibrary.useQuery();

  // Library Creation States
  const [isLibDialogOpen, setIsLibDialogOpen] = useState(false);
  const [libName, setLibName] = useState("");
  const [libThumbnail, setLibThumbnail] = useState<string | null>(null);

  // Mutations
  const createLibMutation = trpc.documents.createLibrary.useMutation({
    onSuccess: () => {
      utils.documents.getLibrary.invalidate();
      setIsLibDialogOpen(false);
      router.push("/library");
    },
  });

  // Embla Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  // Intercept Library Link if no library exists
  const handleLibraryClick = (e: React.MouseEvent) => {
    if (!isLibLoading && library === null) {
      e.preventDefault();
      setIsLibDialogOpen(true);
    }
  };

  const handleCreateLibrary = () => {
    createLibMutation.mutate({
      name: libName,
      thumbnailUrl: libThumbnail ?? undefined,
    });
  };

  const recentItems = [
    { id: '1', title: 'Fundamentals of History', initial: 'H', color: 'text-blue-600' },
    { id: '2', title: 'New School Physics', initial: 'P', color: 'text-blue-800' },
    { id: '3', title: 'Chemical Analysis', initial: 'C', color: 'text-blue-900' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" suppressHydrationWarning> Welcome {user?.username || user?.firstName || 'User'}, </h1>
          <p className="text-gray-500 text-sm mt-1">The only way to do great work is to love what you do!</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-2xl border border-blue-100 shadow-sm mb-5 text-right shrink-0">
          <p className="text-[10px] font-bold uppercase text-gray-500">User Point Balance</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-blue-700">{user?.points ?? 0}</span>
            <span className="text-xl">💎</span>
          </div>
        </div>
      </div>

      {/* Embla Carousel */}
      <div className="embla mb-10 group relative" ref={emblaRef}>
        <div className="embla__container flex">
          <CarouselFrame className="bg-purple-600 shadow-lg mx-36 md:h-60 shadow-purple-100">
            <div className="flex items-center gap-4 text-white">
              <Trophy size={48} className="opacity-80" />
              <div>
                <h3 className="text-xl font-bold">New Quizathon Live!</h3>
                <p className="text-sm opacity-90">Test your skills in Advanced Web Security today.</p>
                <button className="mt-3 bg-white text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full">Join Now</button>
              </div>
            </div>
          </CarouselFrame>

          <CarouselFrame className="bg-linear-to-r from-blue-600 mx-36 md:h-60 to-blue-500 shadow-lg shadow-blue-100">
            <div className="flex items-center gap-4 text-white">
              <BookOpen size={48} className="opacity-80" />
              <div>
                <h3 className="text-xl font-bold">Pick Up Where You Left Off</h3>
                <p className="text-sm opacity-90">Continue Intro to Quantum Computing.</p>
                <button className="mt-3 bg-white text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full">Continue Reading</button>
              </div>
            </div>
          </CarouselFrame>

          <CarouselFrame className="bg-emerald-600 shadow-lg md:h-60 shadow-emerald-100">
            <div className="flex items-center gap-4 text-white">
              <GraduationCap size={48} className="opacity-80" />
              <div>
                <h3 className="text-xl font-bold">Scholarship Update</h3>
                <p className="text-sm opacity-90">Apply before June 30th.</p>
                <button className="mt-3 bg-white text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full">View Requirements</button>
              </div>
            </div>
          </CarouselFrame>
        </div>

        <div className="absolute bottom-[-16] left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full border border-white/50 transition-all ${
                index === selectedIndex ? 'bg-black w-6' : 'bg-neutral-700 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <section className="mb-10">
        <h3 className="text-lg font-bold mb-4">Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-2 mb-4"><Trophy size={18} /><span className="font-semibold">Quizathon</span></div>
            <div className="flex items-end gap-3"><span className="text-3xl font-bold">10%</span></div>
          </div>

          <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-blue-700"><BookOpen size={18} /><span className="font-semibold">Courses</span></div>
            <div className="flex items-end gap-3"><span className="text-3xl font-bold text-blue-800">{user?.courseProgress ?? 0}</span></div>
          </div>

          {/* Library Card */}
          <Link href="/library" onClick={handleLibraryClick}>
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-100 transition-all hover:border-blue-200 cursor-pointer active:scale-95">
              <div className="flex items-center justify-between mb-4 text-blue-600">
                <span className="font-semibold">My library</span>
                {isLibLoading && <Loader2 size={14} className="animate-spin" />}
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-blue-600">
                  {library?.documents?.length || 0}
                </span>
                <p className="text-[10px] text-gray-400 leading-tight pb-1">
                  {library ? `Welcome to ${library.name}` : "Click to initialize"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Recents & Updates */}
      <div className="grid grid-row-1 md:grid-row-2 gap-10">
        <section>
          <h3 className="text-lg font-bold mb-4">Recents</h3>
          <div className="bg-amber-600 border border-gray-100 rounded-2xl shadow-sm overflow-hidden w-full">
            {recentItems.map((item, idx) => (
              <div key={item.id} className={`flex items-center p-4 gap-4 ${idx !== recentItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className={`text-xl font-black w-8 ${item.color}`}>{item.initial}</span>
                <div className="h-8 w-1px bg-gray-200" />
                <span className="font-medium text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* --- INITIALIZATION DIALOG --- */}
      <Dialog open={isLibDialogOpen} onOpenChange={setIsLibDialogOpen}>
        <DialogContent className="sm:max-w-106.25 rounded-[32px] p-8 border-none shadow-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Setup Your Library</DialogTitle>
            <DialogDescription className="text-gray-500">
              Create a name and cover for your study vault to begin.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Thumbnail Upload Box */}
            <div className="w-full h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group">
              {libThumbnail ? (
                <>
                  <Image src={libThumbnail} alt="Cover" fill className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setLibThumbnail(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full text-[10px] px-2 hover:bg-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="text-gray-300" size={32} />
                  <UploadButton
                    endpoint="libraryThumbnailUploader"
                    onClientUploadComplete={(res) => setLibThumbnail(res[0].url)}
                    appearance={{
                      button: "bg-blue-600 text-xs font-bold rounded-full px-4 py-2 h-auto",
                      allowedContent: "hidden"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Library Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Library Name</label>
              <Input 
                placeholder="e.g. My Science Library" 
                value={libName}
                onChange={(e) => setLibName(e.target.value)}
                className="rounded-xl border-gray-100 bg-gray-50 py-6 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleCreateLibrary}
              disabled={!libName || createLibMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-blue-100"
            >
              {createLibMutation.isPending ? <Loader2 className="animate-spin" /> : "Create & Continue"}
            </Button>
            <Button variant="ghost" onClick={() => setIsLibDialogOpen(false)} className="text-gray-400 font-bold">
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}