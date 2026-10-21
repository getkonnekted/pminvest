import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', compact = false }) => {
  const { theme, toggleTheme, isChampagne } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-300 cursor-pointer active:scale-95 ${
          isChampagne
            ? 'bg-[#ede5d8] border-[#c5a059]/40 text-[#8a6828] hover:bg-[#e4dac9] shadow-xs'
            : 'bg-[#0c101c] border-amber-500/30 text-amber-300 hover:bg-[#141b2e] shadow-md hover:border-amber-400/60'
        } ${className}`}
        title={`Switch to ${isChampagne ? 'Obsidian Gold' : 'Champagne Light'} Theme`}
        aria-label="Toggle Luxury Theme"
      >
        {isChampagne ? (
          <Moon className="w-4 h-4 text-[#8a6828]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-300" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer active:scale-95 ${
        isChampagne
          ? 'bg-gradient-to-r from-[#fbf8f2] to-[#f4ede2] border-[#c5a059]/40 text-[#5c4618] hover:border-[#b38f46] shadow-sm'
          : 'bg-gradient-to-r from-[#0c101c] via-[#090d18] to-[#070a12] border-amber-500/30 text-amber-200 hover:border-amber-400/60 shadow-lg'
      } ${className}`}
      title={`Switch to ${isChampagne ? 'Obsidian Gold' : 'Champagne Light'} Theme`}
      aria-label="Toggle Luxury Theme"
    >
      <div
        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform duration-300 ${
          isChampagne
            ? 'bg-[#eadecc] text-[#8a6828]'
            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
        }`}
      >
        {isChampagne ? (
          <Sun className="w-3.5 h-3.5 text-[#8a6828]" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-amber-300" />
        )}
      </div>

      <div className="flex flex-col text-left leading-none">
        <span
          className={`text-[9px] uppercase font-mono font-bold tracking-wider ${
            isChampagne ? 'text-[#8a6828]' : 'text-amber-400'
          }`}
        >
          {isChampagne ? 'Champagne Light' : 'Obsidian Gold'}
        </span>
        <span
          className={`text-[8px] ${
            isChampagne ? 'text-stone-500' : 'text-slate-400'
          }`}
        >
          Tap to switch
        </span>
      </div>

      <Sparkles
        className={`w-3 h-3 transition-opacity duration-300 ${
          isChampagne ? 'text-[#c5a059] opacity-75' : 'text-amber-400 opacity-60'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
