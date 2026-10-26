import React from 'react';

interface UaeFlagProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Crisp vector UAE / Dubai Flag component.
 * Replaces Unicode 🇦🇪 emoji to prevent Windows/Android browsers from falling back to raw "AE" letters.
 */
export const UaeFlag: React.FC<UaeFlagProps> = ({ className = '', size = 'sm' }) => {
  const sizeClasses = {
    xs: 'w-3.5 h-2.5',
    sm: 'w-4 h-3',
    md: 'w-5 h-3.5',
    lg: 'w-6 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[2px] shadow-xs border border-white/20 align-middle ${sizeClasses} ${className}`}
      title="United Arab Emirates (Dubai)"
      aria-label="UAE / Dubai Flag"
    >
      <svg
        viewBox="0 0 600 300"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Top: Green */}
        <rect width="600" height="100" fill="#00732f" />
        {/* Middle: White */}
        <rect y="100" width="600" height="100" fill="#ffffff" />
        {/* Bottom: Black */}
        <rect y="200" width="600" height="100" fill="#000000" />
        {/* Hoist (Left): Red */}
        <rect width="150" height="300" fill="#fe0000" />
      </svg>
    </span>
  );
};

export default UaeFlag;
