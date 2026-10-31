import React, { useState, useEffect } from 'react';
import { Lock, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { UserInvestment } from '../types';

interface InvestmentPayoutButtonProps {
  investment: UserInvestment;
  onPayout: (id: string) => void;
}

export const InvestmentPayoutButton: React.FC<InvestmentPayoutButtonProps> = ({
  investment,
  onPayout
}) => {
  const [diff, setDiff] = useState<number>(() => {
    if (!investment.nextPayoutDate) return 0;
    return new Date(investment.nextPayoutDate).getTime() - Date.now();
  });
  const [hasClicked, setHasClicked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute completed state strictly
  const isCompleted = investment.status === 'completed' || investment.weeksPaid >= investment.totalWeeks;

  // Anti-deficit duplicate guard: recently claimed within the last 60 seconds
  const isClaimedRecently = investment.lastPayoutDate 
    ? Date.now() - new Date(investment.lastPayoutDate).getTime() < 60 * 1000 
    : false;

  useEffect(() => {
    const updateDiff = () => {
      if (!investment.nextPayoutDate) {
        setDiff(0);
        return;
      }
      const remaining = new Date(investment.nextPayoutDate).getTime() - Date.now();
      setDiff(remaining);
    };

    updateDiff();
    const interval = setInterval(updateDiff, 1000);
    return () => clearInterval(interval);
  }, [investment.nextPayoutDate]);

  // Reset click state only when diff is positive and beyond due window
  useEffect(() => {
    if (diff > 60 * 1000) {
      setHasClicked(false);
      setIsProcessing(false);
    }
  }, [diff]);

  // Active ONLY on the last minute of countdown (<= 60,000 ms) or when due, NOT completed, NOT recently claimed, and NOT clicked
  const isLastMinuteOrDue = !isCompleted && !hasClicked && !isClaimedRecently && diff <= 60 * 1000;

  const handleClaim = () => {
    if (hasClicked || isProcessing || isCompleted || isClaimedRecently) return;
    setHasClicked(true);
    setIsProcessing(true);
    try {
      onPayout(investment.id);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCompleted) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed select-none"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Plan Completed ({investment.totalWeeks}/{investment.totalWeeks} Wks)</span>
      </button>
    );
  }

  // Active state during the final minute before clicking
  if (isLastMinuteOrDue) {
    const secondsRemaining = Math.max(0, Math.floor(diff / 1000));
    const isAutoRenew = Boolean(investment.autoReinvest);
    const rolloverIncrement = isAutoRenew ? Math.round(investment.weeklyPayout * 0.03) : 0;
    const payoutAmount = investment.weeklyPayout + rolloverIncrement;

    return (
      <button
        onClick={handleClaim}
        disabled={isProcessing}
        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-700/20 active:scale-95 cursor-pointer ring-2 ring-emerald-400/50 animate-pulse"
        id={`btn_credit_weekly_payout_${investment.id}`}
        title={isAutoRenew ? "Auto-Renew active: Claim weekly rollover payout with 3% increment" : "Active! Click once to credit your weekly yield and lock until next cycle"}
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
        )}
        <span>
          {isAutoRenew ? `Claim Rollover (+₦${payoutAmount.toLocaleString()})` : `Claim Due Yield (+₦${payoutAmount.toLocaleString()})`}
          {secondsRemaining > 0 && ` [${secondsRemaining}s]`}
        </span>
      </button>
    );
  }

  // Idle state (either before the last minute or once clicked and payout has processed)
  return (
    <button
      disabled
      className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed select-none opacity-80"
      id={`btn_credit_weekly_payout_${investment.id}`}
      title={hasClicked || isClaimedRecently ? "Payout claimed. Next Friday cycle scheduled." : "Payout button unlocks in the final minute of the cycle"}
    >
      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span>
        {hasClicked || isClaimedRecently
          ? `Payout Claimed — Idle (+₦${investment.weeklyPayout.toLocaleString()})`
          : `Payout Idle (Active In Last Minute) (+₦${investment.weeklyPayout.toLocaleString()})`}
      </span>
    </button>
  );
};
