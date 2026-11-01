import React, { useState } from 'react';

interface PmLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  variant?: 'gold' | 'monochrome';
  imageUrl?: string;
}

// Official Platform Logo: 3D Architectural Monogram with Emerald, Sapphire & Gold Facets
export const PLATFORM_LOGO_IMAGE = '/assets/pm-logo-official.png';

export const PmLogo: React.FC<PmLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  showText = false,
  textColor = "text-white",
  subtextColor = "text-slate-400",
  imageUrl
}) => {
  const [imgError, setImgError] = useState(false);
  const activeImage = !imgError ? (imageUrl || PLATFORM_LOGO_IMAGE) : null;

  return (
    <div className="inline-flex items-center gap-3">
      {activeImage ? (
        <div 
          className={`shrink-0 relative overflow-hidden rounded-[22%] bg-[#07090E] border border-[#B8964E]/35 shadow-md flex items-center justify-center transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_0_16px_rgba(212,175,55,0.3)] ${className}`}
          style={size ? { width: size, height: size } : undefined}
        >
          <img
            src={activeImage}
            alt="PM Invest Official Architectural Logo"
            className="w-full h-full object-contain select-none"
            loading="eager"
            decoding="async"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div 
          className={`shrink-0 rounded-xl bg-[#07090E] border border-[#B8964E]/40 flex items-center justify-center font-mono font-black text-xs text-[#D4AF37] ${className}`}
          style={size ? { width: size, height: size } : undefined}
        >
          PM
        </div>
      )}

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 leading-none">
            <span className={`text-base sm:text-lg font-black tracking-[0.2em] uppercase font-mono ${textColor}`}>
              PM INVEST
            </span>
          </div>
          <span className={`text-[9px] uppercase tracking-[0.25em] font-mono font-medium mt-1 ${subtextColor}`}>
            TREASURE HOMES · DIFC
          </span>
        </div>
      )}
    </div>
  );
};
