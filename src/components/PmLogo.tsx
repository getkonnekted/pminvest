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

// Official Platform Logo: Clean transparent PM Invest logo without any background
export const PLATFORM_LOGO_IMAGE = '/assets/pm-logo-official.png';
export const PLATFORM_LOGO_FULL = '/assets/pm-logo-full.png';

export const PmLogo: React.FC<PmLogoProps> = ({ 
  className = "h-10 w-auto", 
  size,
  showText = false,
  textColor = "text-white",
  subtextColor = "text-slate-400",
  variant = 'mark',
  imageUrl
}) => {
  const [imgError, setImgError] = useState(false);
  const defaultImg = variant === 'full' ? PLATFORM_LOGO_FULL : PLATFORM_LOGO_IMAGE;
  const activeImage = !imgError ? (imageUrl || defaultImg) : null;

  return (
    <div className="inline-flex items-center gap-3">
      {activeImage ? (
        <div 
          className={`shrink-0 flex items-center justify-center ${className}`}
          style={size ? { height: size, width: 'auto' } : undefined}
        >
          <img
            src={activeImage}
            alt="PM Invest Official Logo"
            className="h-full w-auto object-contain select-none block"
            loading="eager"
            decoding="async"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div 
          className={`shrink-0 flex items-center justify-center font-mono font-black text-xs text-[#0D8E5B] ${className}`}
          style={size ? { height: size, width: 'auto' } : undefined}
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
