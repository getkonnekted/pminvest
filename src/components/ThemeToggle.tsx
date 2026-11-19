import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { toggleTheme, isChampagne } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors duration-150 cursor-pointer active:scale-95 ${
        isChampagne
          ? 'bg-white border-[#E6E0D6] text-[#18222B] hover:bg-[#F3EFE8]'
          : 'bg-[#121922] border-[#222F3D] text-[#F4F1EA] hover:bg-[#18222E]'
      } ${className}`}
      title={isChampagne ? 'Dark' : 'Light'}
      aria-label={isChampagne ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isChampagne ? (
        <Moon className="w-4 h-4" strokeWidth={1.75} />
      ) : (
        <Sun className="w-4 h-4" strokeWidth={1.75} />
      )}
    </button>
  );
};

export default ThemeToggle;
