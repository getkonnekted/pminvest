import React, { useState, useEffect } from 'react';
import { Clock, Zap, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PayoutCountdownProps {
  targetDate?: string;
  fallbackDays?: number;
  className?: string;
  compact?: boolean;
  isLocked?: boolean;
}

export const PayoutCountdown: React.FC<PayoutCountdownProps> = ({ 
  targetDate, 
  fallbackDays = 7, 
  className = "",
  compact = false,
  isLocked = false
}) => {
  const { isChampagne } = useTheme();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isDue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isDue: false });

  useEffect(() => {
    if (isLocked) return;

    const calculateTime = () => {
      let targetTime: number;
      if (targetDate) {
        targetTime = new Date(targetDate).getTime();
      } else {
        targetTime = Date.now() + fallbackDays * 24 * 60 * 60 * 1000;
      }

      const diff = targetTime - Date.now();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isDue: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isDue: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, fallbackDays, isLocked]);

  if (isLocked) {
    if (compact) {
      return (
        <span className={`inline-flex items-center gap-1 font-mono text-emerald-700 font-bold text-[11px] ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Cycle Active • Collateralized</span>
        </span>
      );
    }
    return (
      <div className={`inline-flex items-center gap-1.5 ${isChampagne ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'} font-mono text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs ${className}`}>
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span className="font-sans font-bold">Cycle Active • Fully Collateralized</span>
      </div>
    );
  }

  if (timeLeft.isDue) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${isChampagne ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'} font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${className}`}>
        <Zap className="w-3 h-3 text-emerald-500 animate-pulse" />
        <span>Yield Ready to Claim</span>
      </div>
    );
  }

  const isFinalMinute = !timeLeft.isDue && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  if (isFinalMinute) {
    if (compact) {
      return (
        <span className={`font-mono text-emerald-600 font-bold animate-pulse ${className}`}>
          {timeLeft.seconds}s (Payout Active)
        </span>
      );
    }
    return (
      <div className={`flex items-center gap-2 ${isChampagne ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'} rounded-lg px-2.5 py-1.5 text-xs font-mono animate-pulse ${className}`}>
        <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-bounce" />
        <span className="text-[10px] text-emerald-800 font-sans font-bold uppercase tracking-wider">Final Minute:</span>
        <div className="flex items-center gap-1 font-bold">
          <span className="bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded text-[11px]">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
        <span className="text-[10px] text-emerald-700 font-sans font-bold uppercase ml-1">Payout Button Active</span>
      </div>
    );
  }

  if (compact) {
    return (
      <span className={`font-mono ${isChampagne ? 'text-amber-800' : 'text-amber-400'} font-bold ${className}`}>
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${
      isChampagne 
        ? 'bg-white/95 border border-[#c5a059]/40 text-slate-900 shadow-sm' 
        : 'bg-[#0c101c]/90 border border-amber-500/30 text-amber-200 shadow-inner'
    } rounded-xl px-3 py-2 text-xs font-mono ${className}`}>
      <Clock className={`w-3.5 h-3.5 ${isChampagne ? 'text-amber-700' : 'text-amber-400'} shrink-0`} />
      <span className={`text-[10px] ${isChampagne ? 'text-slate-700 font-bold' : 'text-amber-300'} font-sans uppercase tracking-wider`}>Next Payout in:</span>
      <div className="flex items-center gap-1 font-bold">
        <span className={`${isChampagne ? 'bg-[#f4ede0] text-slate-900 border border-[#c5a059]/30' : 'bg-[#131b2e] text-amber-300 border border-amber-500/20'} px-2 py-0.5 rounded text-[11px] font-mono font-bold`}>{timeLeft.days}d</span>
        <span className={isChampagne ? 'text-slate-500' : 'text-amber-400/60'}>:</span>
        <span className={`${isChampagne ? 'bg-[#f4ede0] text-slate-900 border border-[#c5a059]/30' : 'bg-[#131b2e] text-amber-300 border border-amber-500/20'} px-2 py-0.5 rounded text-[11px] font-mono font-bold`}>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span className={isChampagne ? 'text-slate-500' : 'text-amber-400/60'}>:</span>
        <span className={`${isChampagne ? 'bg-[#f4ede0] text-slate-900 border border-[#c5a059]/30' : 'bg-[#131b2e] text-amber-300 border border-amber-500/20'} px-2 py-0.5 rounded text-[11px] font-mono font-bold`}>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span className={isChampagne ? 'text-slate-500' : 'text-amber-400/60'}>:</span>
        <span className={`${isChampagne ? 'bg-amber-600 text-white shadow-xs' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'} px-2 py-0.5 rounded text-[11px] font-mono`}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};
