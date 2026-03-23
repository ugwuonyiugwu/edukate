'use client';
import { trpc } from "@/trpc/client";
import { useForm } from "react-hook-form";
import { Camera, MapPin } from "lucide-react";
import Image from "next/image";

export const ProfileForm = () => {
  const utils = trpc.useUtils();
  const { data: user } = trpc.users.getOne.useQuery();
  
  const update = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      utils.users.getOne.invalidate();
      alert("Profile updated!");
    }
  });

  const { register, handleSubmit } = useForm({
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      school: user?.school ?? "",
      gender: user?.gender ?? "",
      dateOfBirth: user?.dateOfBirth ?? "",
      state: user?.state ?? "", 
    }
  });

  return (
   
    <div className="min-h-screen bg-white sm:bg-gray-100/50 sm:py-10"> 
      <div className="max-w-2xl mx-auto bg-white sm:shadow-md sm:rounded-3xl sm:border border-gray-100 overflow-hidden">
        
        <div className="p-5 sm:p-10">
          
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <div className="relative">
              <Image
                src={user?.imageUrl ?? "/profile-default.png"}
                alt="User Profile"
                width={112} 
                height={112} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md" 
              />
              <button type="button" className="absolute bottom-0 right-0 bg-[#2b5a9e] p-2 sm:p-2.5 rounded-full border-2 border-white text-white">
                <Camera size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <h2 className="mt-4 font-bold text-xl sm:text-2xl text-[#1a1a1a] uppercase tracking-wide text-center">
              {user?.firstName ?? "User"} {user?.lastName ?? "Profile"}
            </h2>

            <div className="mt-2 flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-1 rounded-full border border-yellow-200">
              <span className="text-2xl sm:text-2xl text-blue-700 font-bold">{user?.points ?? 0} </span>
               <span className="text-xl ">💎</span>
            </div>
          </div>

          <form onSubmit={handleSubmit((data) => update.mutate(data))} className="space-y-5 sm:space-y-6">
            <hr className="mb-6 sm:mb-8 border-gray-100" />
            
            {/* Grid Layout - Stacks on mobile, 2 columns on tablet+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1">First Name:</label>
                <input {...register("firstName")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1">Last Name:</label>
                <input {...register("lastName")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1">Email: <span className="text-red-500">*</span></label>
                <input value={user?.email || ""} disabled className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1 flex items-center gap-1">
                  <MapPin size={12} /> State of Origin:
                </label>
                <input {...register("state")} placeholder="e.g. Lagos" className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1">Contact Number: <span className="text-red-500">*</span></label>
              <div className="flex gap-2 sm:gap-3">
                <div className="w-16 sm:w-20 flex items-center justify-center border border-gray-200 rounded-xl bg-gray-100 text-gray-400 text-xs sm:text-sm font-medium">
                  +234
                </div>
                <input {...register("phoneNumber")} className="flex-1 border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1">School:</label>
              <input {...register("school")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1">Gender:</label>
                <select {...register("gender")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 ml-1">Date of Birth:</label>
                <input type="date" {...register("dateOfBirth")} className="w-full border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            {/* Sticky/Fixed Buttons on Mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-10">
              <button 
                type="submit" 
                disabled={update.isPending}
                className="order-1 sm:order-2 flex-1 bg-[#1e4e8c] text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-70"
              >
                {update.isPending ? "Saving..." : "Save Profile"}
              </button>
              <button type="button" className="order-2 sm:order-1 flex-1 bg-white text-gray-400 font-bold py-4 rounded-xl border border-gray-100 active:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}