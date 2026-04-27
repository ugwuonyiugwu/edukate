// components/scholarships/ScholarshipSkeleton.tsx
export const ScholarshipSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm animate-pulse">
          <div className="flex justify-between mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
            <div className="w-20 h-7 bg-slate-100 rounded-full" />
          </div>
          <div className="h-6 w-3/4 bg-slate-100 rounded-md mb-3" />
          <div className="h-8 w-1/3 bg-slate-100 rounded-md mb-6" />
          <div className="space-y-2 mb-8">
            <div className="h-3 w-full bg-slate-50 rounded" />
            <div className="h-3 w-5/6 bg-slate-50 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-slate-50 rounded-xl" />
            <div className="w-12 h-12 bg-slate-50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};