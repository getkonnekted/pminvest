import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  content: string;
  example?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  content,
  example,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  return (
    <div className={`inline-flex items-center relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Information on ${title}`}
        className="w-4 h-4 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer ml-1 shrink-0 border border-slate-200"
      >
        <Info className="w-2.5 h-2.5" />
      </button>

      {/* Desktop Floating Popover */}
      {isOpen && !isMobile && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white rounded-xl p-3 shadow-xl z-50 text-xs border border-slate-700 animate-fadeIn pointer-events-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
            <span className="font-bold text-amber-400">{title}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-slate-200 leading-relaxed font-normal">{content}</p>
          {example && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 font-mono">
              <strong>Example:</strong> {example}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}

      {/* Mobile Drawer / Bottom Modal */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center z-50 p-0 animate-fadeIn">
          <div className="bg-white rounded-t-2xl w-full p-5 shadow-2xl border-t border-slate-200 max-h-[75vh] overflow-y-auto animate-slideUp">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">{content}</p>
            {example && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800 mb-0.5">Quick Example</span>
                <span>{example}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
