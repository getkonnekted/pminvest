import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Building2, ShieldCheck } from 'lucide-react';
import { CelebrationType } from '../lib/celebration';

interface GlowState {
  active: boolean;
  type: CelebrationType;
  id: number;
}

export const CelebrationGlowOverlay: React.FC = () => {
  const [glow, setGlow] = useState<GlowState | null>(null);

  useEffect(() => {
    const handleCelebration = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: CelebrationType; timestamp: number }>;
      const type = customEvent.detail?.type || 'investment';

      setGlow({
        active: true,
        type,
        id: Date.now()
      });

      const timer = setTimeout(() => {
        setGlow(prev => (prev?.id === customEvent.detail?.timestamp ? null : prev));
      }, 3200);

      return () => clearTimeout(timer);
    };

    window.addEventListener('luxury-celebration-glow', handleCelebration);
    return () => window.removeEventListener('luxury-celebration-glow', handleCelebration);
  }, []);

  if (!glow) return null;

  const isReg = glow.type === 'registration';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {/* Outer ambient golden/emerald vignette pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0"
          style={{
            background: isReg
              ? 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, rgba(16, 185, 129, 0.12) 60%, rgba(6, 11, 22, 0) 100%)'
              : 'radial-gradient(circle at 50% 35%, rgba(212, 175, 55, 0.18) 0%, rgba(16, 185, 129, 0.14) 50%, rgba(6, 11, 22, 0) 100%)',
            boxShadow: 'inset 0 0 100px rgba(245, 158, 11, 0.25), inset 0 0 60px rgba(16, 185, 129, 0.2)'
          }}
        />

        {/* Floating subtle celebratory banner pill */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-950 via-[#0e1628] to-slate-950 border border-amber-400/60 shadow-2xl shadow-amber-500/20 backdrop-blur-xl"
          >
            {isReg ? (
              <>
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-amber-300 tracking-wider uppercase font-mono">
                    Welcome to PM Invest
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">
                    Account verified &amp; ready for UAE property co-investment
                  </span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400 ml-1" />
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-emerald-300 tracking-wider uppercase font-mono">
                    Property Contract Activated
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">
                    24-Week tenure registered · First Friday cash payout queued
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 ml-1" />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
export default CelebrationGlowOverlay;
