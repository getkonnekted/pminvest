import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  ExternalLink,
  Lock,
  Award
} from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
  sponsorName?: string;
  bonusAmount: number;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
  sponsorName = 'Treasure Crest Mortgage Advisory',
  bonusAmount
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(12);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setSecondsRemaining(12);
      setIsCompleted(false);
    } else {
      setIsPlaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (isOpen && isPlaying && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, secondsRemaining]);

  if (!isOpen) return null;

  const handleClaim = () => {
    onRewardGranted();
    onClose();
  };

  const progressPercent = Math.round(((12 - secondsRemaining) / 12) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-amber-500/40 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl text-white relative flex flex-col"
      >
        {/* Top Ad Network Banner */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase">
              REWARDED AD
            </span>
            <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
              {sponsorName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
            <div className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-amber-400 font-bold">
              {secondsRemaining > 0 ? `${secondsRemaining}s` : 'DONE'}
            </div>
          </div>
        </div>

        {/* Video Simulation Canvas */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-[#0f172a] p-6 flex flex-col justify-between overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Ad Sponsor Watermark */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider text-white uppercase">{sponsorName}</h4>
                <p className="text-[10px] text-amber-300/90 font-mono">Verified Prime Real Estate Sponsor</p>
              </div>
            </div>

            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> +₦{bonusAmount.toLocaleString()} 2X BOOST
            </span>
          </div>

          {/* Animated Main Visual */}
          <div className="relative z-10 text-center py-4 my-auto space-y-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 px-4 py-1.5 rounded-full"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-amber-200">
                Lekki Phase 2 Luxury Smart Villas — 28.4% APY
              </span>
            </motion.div>

            <h3 className="text-base sm:text-lg font-black text-slate-100 max-w-sm mx-auto leading-snug">
              Secure Your Capital Against Inflation With Contractual Title-Backed Mortgages
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Ad views generate zero platform cost and directly finance the ₦3,000 Free Starter Trial pool.
            </p>
          </div>

          {/* Progress Bar & Status */}
          <div className="relative z-10 space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>{isCompleted ? 'Reward Unlocked!' : 'Viewing Sponsor Video...'}</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={!isCompleted && secondsRemaining > 4}
            className={`text-xs px-3 py-2 rounded-lg font-semibold transition-all ${
              !isCompleted && secondsRemaining > 4 
                ? 'text-slate-600 cursor-not-allowed' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isCompleted ? 'Close' : `Skip in ${Math.max(0, secondsRemaining - 4)}s`}
          </button>

          {isCompleted ? (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleClaim}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>CLAIM +₦{bonusAmount.toLocaleString()} 2X BOOST</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Reward locks in {secondsRemaining}s</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
