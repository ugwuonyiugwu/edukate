// @/components/reusable/UserAvatar.tsx
import Image from "next/image";

interface UserAvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size?: number; // Size in pixels
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = ({ 
  imageUrl, 
  name, 
  size = 40, 
  className = "", 
  onClick 
}: UserAvatarProps) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const fontSize = size / 2.5;

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm transition-all ${
        onClick ? "cursor-pointer active:scale-95" : ""
      } ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        minWidth: `${size}px` 
      }}
    >
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={name || "User"} 
          fill 
          sizes={`${size}px`} 
          className="object-cover" 
        />
      ) : (
        <div 
          className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold uppercase"
          style={{ fontSize: `${fontSize}px` }}
        >
          {initials}
        </div>
      )}
      
      {className.includes("editable") && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
           <span className="text-white text-[10px] font-bold">CHANGE</span>
        </div>
      )}
    </div>
  );
};