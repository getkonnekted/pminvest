import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PayoutCountdownProps {
  targetDate?: string;
  fallbackDays?: number;
  className?: string;
  compact?: boolean;
  isLocked?: boolean;
  isCompleted?: boolean;
}

export const PayoutCountdown: React.FC<PayoutCountdownProps> = ({
  targetDate,
  fallbackDays = 7,
  className = '',
  compact = false,
  isLocked = false,
  isCompleted = false
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
    if (isLocked || isCompleted) return;

    const calculateTime = () => {
      const targetTime = targetDate
        ? new Date(targetDate).getTime()
        : Date.now() + fallbackDays * 24 * 60 * 60 * 1000;

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
  }, [targetDate, fallbackDays, isLocked, isCompleted]);

  if (isCompleted) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
          isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
        } ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>24 Weeks Matured</span>
      </span>
    );
  }

  if (isLocked) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
          isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
        } ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>Active · Collateralized</span>
      </span>
    );
  }

  if (timeLeft.isDue) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
          isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
        } ${className}`}
      >
        <span>Payout Ready</span>
      </span>
    );
  }

  if (compact) {
    return (
      <span
        className={`font-mono tabular-nums text-xs font-medium ${
          isChampagne ? 'text-[#18222B]' : 'text-[#F4F1EA]'
        } ${className}`}
      >
        {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m{' '}
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    );
  }

  const unitBox = isChampagne
    ? 'bg-white border border-[#E6E0D6] text-[#18222B]'
    : 'bg-[#0B1015] border border-[#222F3D] text-[#F4F1EA]';

  return (
    <div className={`inline-flex items-center gap-2 font-mono tabular-nums text-xs ${className}`}>
      <Clock className={`w-3.5 h-3.5 shrink-0 ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`} />
      <div className="flex items-center gap-1 font-semibold">
        <span className={`${unitBox} px-2 py-1 rounded-md`}>{timeLeft.days}d</span>
        <span className="opacity-40">:</span>
        <span className={`${unitBox} px-2 py-1 rounded-md`}>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span className="opacity-40">:</span>
        <span className={`${unitBox} px-2 py-1 rounded-md`}>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span className="opacity-40">:</span>
        <span className="bg-[#0B7A4E] text-white px-2 py-1 rounded-md">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
};
