import React, { useState } from 'react';
import { AlertCircle, Wallet, ArrowRight, X, Building, Copy, Check, ShieldCheck } from 'lucide-react';
import { InvestmentPlan } from '../types';

interface InsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InvestmentPlan | null;
  walletBalance: number;
  onNavigateToDeposit?: (amountToFund: number) => void;
}

export const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
  isOpen,
  onClose,
  plan,
  walletBalance,
  onNavigateToDeposit
}) => {
  const [copiedPaga, setCopiedPaga] = useState(false);
  const [copiedMoniepoint, setCopiedMoniepoint] = useState(false);

  if (!isOpen || !plan) return null;

  const currentBal = Math.max(0, walletBalance || 0);
  const shortfall = Math.max(0, plan.cost - currentBal);

  const handleCopy = (accountNo: string, isPaga: boolean) => {
    navigator.clipboard.writeText(accountNo);
    if (isPaga) {
      setCopiedPaga(true);
      setTimeout(() => setCopiedPaga(false), 2000);
    } else {
      setCopiedMoniepoint(true);
      setTimeout(() => setCopiedMoniepoint(false), 2000);
    }
  };

  const handleProceedToDeposit = () => {
    onClose();
    if (onNavigateToDeposit) {
      onNavigateToDeposit(shortfall);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#0f1422] via-[#090d18] to-[#06080e] border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Alert Badge */}
        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Action Required
              </span>
              <span className="text-[11px] font-mono text-rose-400 font-bold">
                {currentBal === 0 ? '₦0.00 Wallet' : 'Low Balance'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#f7ecd5] uppercase tracking-wide font-mono mt-0.5">
              Insufficient Wallet Balance
            </h3>
          </div>
        </div>

        {/* Selected Property Preview */}
        <div className="mt-4 p-3 rounded-2xl bg-[#06080e] border border-amber-500/25 flex items-center gap-3">
          <img 
            src={plan.propertyImage} 
            alt={plan.propertyName || plan.name}
            className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-black text-[#f7ecd5] uppercase truncate">
                {plan.propertyName || plan.name}
              </h4>
              <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">
                24 Wks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {plan.propertyLocation}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-300">
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Weekly: <strong className="text-emerald-400">₦{plan.weeklyPayout.toLocaleString()}</strong>
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Total: <strong className="text-amber-400">₦{plan.totalReturns.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Card with Exact Shortfall */}
        <div className="mt-4 bg-[#0a0e1a] border border-amber-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Property Acquisition Cost:</span>
            <span className="text-white font-mono font-extrabold text-sm">₦{plan.cost.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Your Current Wallet Balance:</span>
            <span className={`font-mono font-extrabold text-sm ${currentBal === 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              ₦{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-px bg-amber-500/20 w-full" />

          <div className="flex justify-between items-center bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-rose-950/40 border border-amber-500/40 p-3 rounded-xl">
            <div>
              <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider font-mono">
                Balance Required to Top Up:
              </span>
              <span className="text-[11px] text-slate-400">
                {currentBal === 0 ? 'Fund full property capital' : 'Wallet shortfall deficit'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg sm:text-xl font-black text-rose-300 font-mono block">
                ₦{shortfall.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase font-mono">
                Shortfall Due
              </span>
            </div>
          </div>
        </div>

        {/* Escrow Rule Note */}
        <div className="mt-3 text-[11px] text-slate-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Properties cannot be acquired with zero or low balance. Transfer the exact shortfall of <strong className="text-amber-300 font-mono">₦{shortfall.toLocaleString()}</strong> into our verified reserve accounts to activate your Dubai Land Department title deed and begin receiving payouts every Friday.
          </p>
        </div>

        {/* Quick Bank Accounts for Direct Transfer */}
        <div className="mt-4 space-y-2">
          <span className="text-[11px] font-bold text-[#f7ecd5] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Treasure Homes Bank Accounts</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Account 1: PAGA */}
            <div className="bg-[#06080e] border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">PAGA • EZE JUDE TREASURE</span>
                <span className="font-mono font-bold text-amber-300 text-sm">0001327256</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('0001327256', true)}
                className="p-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg text-amber-300 transition-colors cursor-pointer"
                title="Copy Paga Account"
              >
                {copiedPaga ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Account 2: Moniepoint */}
            <div className="bg-[#06080e] border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Moniepoint • EZE JUDE TREASURE</span>
                <span className="font-mono font-bold text-emerald-300 text-sm">6814600103</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('6814600103', false)}
                className="p-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg text-emerald-300 transition-colors cursor-pointer"
                title="Copy Moniepoint Account"
              >
                {copiedMoniepoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2.5">
          {onNavigateToDeposit ? (
            <button
              type="button"
              onClick={handleProceedToDeposit}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Wallet className="w-4 h-4 text-slate-950" />
              <span>Fund ₦{shortfall.toLocaleString()} to Acquire Plan</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>I Understand • Fund Wallet First</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
