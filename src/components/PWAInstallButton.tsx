import React, { useState } from 'react';
import { Smartphone, Download, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' | 'banner'; className?: string }> = ({
  variant = 'compact',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, suppress the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className={`p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#0c1424] to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-[#f7ecd5] uppercase tracking-wide font-mono">
                Install PM Invest App
              </p>
              <p className="text-[11px] text-slate-300">
                1-tap access from your phone home screen for Friday payouts
              </p>
            </div>
          </div>
          <button
            onClick={install}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            id="btn_pwa_install_banner"
          >
            Install
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer ${className}`}
        id="btn_pwa_install_header"
        title="Install PM Invest App on your home screen"
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit doesn't fire beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1424] hover:bg-[#111a30] border border-amber-500/30 text-amber-300 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer ${className}`}
          id="btn_pwa_install_ios"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Install on iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#0e1628] to-[#070b14] border border-amber-500/40 p-5 shadow-2xl text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#f7ecd5] uppercase font-mono">
                    Install on iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add PM Invest directly to your home screen
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-[#06080e] p-3.5 rounded-xl border border-amber-500/20 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                    1
                  </span>
                  <div className="flex-1 text-slate-200">
                    Tap the <strong className="text-white">Share</strong> button in your Safari bottom toolbar:
                    <div className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                      <Share className="w-3 h-3" />
                      <span className="text-[10px]">Share</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                    2
                  </span>
                  <div className="flex-1 text-slate-200">
                    Scroll down and tap <strong className="text-amber-300">Add to Home Screen</strong>:
                    <div className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      <PlusSquare className="w-3 h-3" />
                      <span className="text-[10px]">Add to Home Screen</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 font-mono">
                    3
                  </span>
                  <div className="flex-1 text-slate-200">
                    Tap <strong className="text-white">Add</strong> in top-right corner. The PM Invest gold icon will appear on your home screen!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-2.5 text-xs font-black text-slate-950 uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export default PWAInstallButton;
