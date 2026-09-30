import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Send, 
  Check, 
  Lock, 
  Wallet, 
  RotateCw, 
  TrendingUp, 
  Share2, 
  Globe, 
  Trophy, 
  HelpCircle,
  FileCheck,
  Building,
  UserCheck,
  X
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { DailyTask } from '../types';
import { getWatMillisecondsUntilMidnight, formatWatCountdown, getWatDate } from '../lib/watTime';

export const DailyTasksHub: React.FC<{ onNavigateToInvest?: () => void; onOpenRegisterModal?: () => void }> = ({ 
  onNavigateToInvest,
  onOpenRegisterModal
}) => {
  const { 
    currentUser, 
    dailyTasks, 
    taskSubmissions,
    investments,
    transactions,
    getUserProgress,
    completeInstantTask,
    submitTaskProof,
    claimStreakBonus,
    toggleAutoReinvest,
    submitKyc
  } = useAppState();

  // West Africa Time (WAT) Midnight Countdown
  const [msUntilMidnight, setMsUntilMidnight] = useState<number>(() => getWatMillisecondsUntilMidnight());
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  // Social Proof Submission Modal State
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);
  const [proofPlatform, setProofPlatform] = useState<string>('WhatsApp Status');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofNotes, setProofNotes] = useState<string>('');

  // KYC Quick Submit Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [kycFullName, setKycFullName] = useState<string>(currentUser?.name || '');
  const [kycIdType, setKycIdType] = useState<string>('National ID (NIN)');
  const [kycIdNumber, setKycIdNumber] = useState<string>('');

  // 1-second live countdown to midnight WAT
  useEffect(() => {
    const updateCountdown = () => {
      setMsUntilMidnight(getWatMillisecondsUntilMidnight());
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const watTimer = formatWatCountdown(msUntilMidnight);
  const nowWat = getWatDate();
  const watTimeDisplay = nowWat.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const progress = currentUser ? getUserProgress(currentUser.id) : {
    userId: 'guest',
    currentDate: '2026-09-30',
    completedTaskIds: [],
    pendingSubmissionTaskIds: [],
    streakCount: 0,
    adBoostedTaskIds: []
  };

  // Real In-App Account Verification Checks against Live Database
  const activeInvestments = currentUser 
    ? investments.filter(i => i.userId === currentUser.id && i.status === 'active')
    : [];
  const hasActivePlan = activeInvestments.length > 0;
  const hasAutoCompounding = activeInvestments.some(i => i.autoReinvest === true);
  const isKycVerified = currentUser?.kycStatus === 'verified';
  const isKycPending = currentUser?.kycStatus === 'pending';

  // Check if KYC bounty has ever been claimed
  const hasClaimedKycBounty = transactions.some(
    t => t.userId === currentUser?.id && t.description?.includes('KYC Identity Verification Bounty')
  ) || progress.completedTaskIds.includes('task_kyc_bounty');

  // Attendance & Consecutive Streak
  const hasCheckedInToday = progress.completedTaskIds.includes('task_daily_attendance');
  const currentStreak = progress.streakCount || 0;
  const isMilestoneClaimable = currentStreak >= 7 && progress.streakBonusClaimedDate !== progress.currentDate;

  // Social Advocacy URL & Pitch
  const referralCode = currentUser?.referralCode || 'PM-INVEST';
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://treasurehomes.ng';
  const sharePitch = `I am earning steady weekly yields backed by physical real estate with PM Invest & Treasure Homes! Join with my referral code: ${referralCode} at ${originUrl}`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(sharePitch)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(originUrl)}&text=${encodeURIComponent(sharePitch)}`;
    window.open(url, '_blank');
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(sharePitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    const compositeProof = `[${proofPlatform}] Link/Details: ${proofUrl.trim()}${proofNotes ? ` | Notes: ${proofNotes.trim()}` : ''}`;
    const success = submitTaskProof('task_social_advocacy', compositeProof);
    if (success) {
      setIsProofModalOpen(false);
      setProofUrl('');
      setProofNotes('');
    }
  };

  const handleSubmitKycForm = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc(kycFullName, kycIdType, kycIdNumber);
    setIsKycModalOpen(false);
  };

  return (
    <div className="space-y-6" id="daily_tasks_hub_container">
      {/* HEADER SECTION WITH REAL WAT RESET CLOCK */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-2xl p-6 text-white border border-amber-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-slate-950" />
                Verified Accountability System
              </span>
              <span className="bg-slate-800/80 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                WAT (UTC+1)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Daily Investor Quests & Milestone Hub
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Complete real investor actions, advocate for the community, and maintain an unbroken 7-day streak to claim cash dividends.
            </p>
          </div>

          {/* REAL MIDNIGHT WAT RESET CLOCK */}
          <div className="bg-slate-900/90 border border-amber-400/30 rounded-xl p-4 shrink-0 shadow-md backdrop-blur-xs w-full lg:w-auto">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>WAT Midnight Reset</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Lagos {watTimeDisplay}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono">
              <div className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-center">
                <span className="text-lg font-black text-amber-400">{String(watTimer.hours).padStart(2, '0')}</span>
                <span className="block text-[8px] text-slate-400 uppercase">Hours</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">:</span>
              <div className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-center">
                <span className="text-lg font-black text-amber-400">{String(watTimer.minutes).padStart(2, '0')}</span>
                <span className="block text-[8px] text-slate-400 uppercase">Mins</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">:</span>
              <div className="bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1 text-center animate-pulse">
                <span className="text-lg font-black text-amber-300">{String(watTimer.seconds).padStart(2, '0')}</span>
                <span className="block text-[8px] text-slate-400 uppercase">Secs</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-2 font-sans">
              Daily quests refresh automatically at 00:00 WAT
            </p>
          </div>
        </div>
      </div>

      {/* CONSECUTIVE DAILY ATTENDANCE & 7-DAY ₦1,500 MILESTONE TRACKER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Consecutive Attendance Tracker
              </h3>
              <span className="bg-amber-100 text-amber-900 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
                {currentStreak} / 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Genuinely resets back to Day 1 if a calendar day (WAT) is skipped. Hit Day 7 to unlock the <strong>₦1,500 Milestone Bonus</strong>.
            </p>
          </div>

          {/* Quick Check-in action */}
          <div>
            {!currentUser ? (
              <button
                onClick={onOpenRegisterModal}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Sign In to Track Streak
              </button>
            ) : hasCheckedInToday ? (
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Checked In for Today (+₦100)</span>
              </div>
            ) : (
              <button
                onClick={() => completeInstantTask('task_daily_attendance')}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                id="btn_checkin_attendance"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Check In for Day {Math.min(7, currentStreak + 1)} (+₦100)</span>
              </button>
            )}
          </div>
        </div>

        {/* 7-DAY PROGRESS VISUALIZER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 my-4">
          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
            const isCompleted = currentStreak >= dayNum;
            const isCurrent = currentStreak + 1 === dayNum && !hasCheckedInToday;
            const isMilestone = dayNum === 7;

            return (
              <div
                key={dayNum}
                className={`relative rounded-xl p-3 border transition-all flex flex-col items-center justify-between text-center ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/40'
                    : isMilestone
                    ? 'bg-amber-500/10 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
                }`}
              >
                <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                  <span>DAY {dayNum}</span>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isMilestone ? (
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}
                </div>

                <div className="my-1.5">
                  {isMilestone ? (
                    <span className="font-mono font-black text-amber-600 text-xs sm:text-sm block">
                      ₦1,500
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-xs block">
                      +₦100
                    </span>
                  )}
                </div>

                <span className="text-[9px] uppercase tracking-wider font-semibold">
                  {isCompleted ? 'Completed' : isCurrent ? 'Next Up' : isMilestone ? 'Jackpot' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>

        {/* DAY 7 MILESTONE UNLOCK BANNER */}
        {isMilestoneClaimable && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md mt-4 animate-bounce">
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-white shrink-0" />
              <div>
                <h4 className="font-black text-sm">7-Day Consistency Milestone Reached!</h4>
                <p className="text-xs text-slate-900">
                  You have completed 7 consecutive calendar days. Claim your ₦1,500 cash reward now!
                </p>
              </div>
            </div>
            <button
              onClick={() => claimStreakBonus()}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs uppercase px-4 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
              id="btn_claim_streak_milestone"
            >
              Claim ₦1,500 Cash Bonus
            </button>
          </div>
        )}
      </div>

      {/* REAL IN-APP ACCOUNT VERIFICATION TASKS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Real In-App Account Verification Quests
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tied directly to live database state. Uninvested or unverified accounts cannot claim rewards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* QUEST 1: ACTIVE PORTFOLIO QUEST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                  ACTIVE CAPITAL
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  +₦300 Daily
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">Active Portfolio Daily Yield</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Live database check: only accounts with at least one active real estate investment plan can claim daily portfolio yields.
              </p>

              {/* Status display */}
              <div className="my-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Portfolio Status</span>
                {hasActivePlan ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {activeInvestments.length} Active Plan{activeInvestments.length > 1 ? 's' : ''} Backing Account
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    0 Active Plans (Claim Locked)
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {progress.completedTaskIds.includes('task_active_portfolio') ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Claimed Today (+₦300)</span>
                </div>
              ) : hasActivePlan ? (
                <button
                  onClick={() => completeInstantTask('task_active_portfolio')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  id="btn_claim_active_portfolio"
                >
                  Claim Portfolio Yield (+₦300)
                </button>
              ) : (
                <button
                  onClick={onNavigateToInvest}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Activate Investment Plan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* QUEST 2: DAILY REINVESTMENT QUEST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="bg-amber-50 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-200">
                  AUTO COMPOUND
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  +₦250 Daily
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">Daily Reinvestment Quest</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Reward for compounding wealth. Enable Auto-Reinvestment on any of your active plans to claim this daily bonus.
              </p>

              {/* Status display */}
              <div className="my-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Compounding Status</span>
                {hasAutoCompounding ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Auto-Compounding Enabled (Active)
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                    <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                    Auto-Compounding OFF
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {progress.completedTaskIds.includes('task_auto_reinvest') ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Claimed Today (+₦250)</span>
                </div>
              ) : hasAutoCompounding ? (
                <button
                  onClick={() => completeInstantTask('task_auto_reinvest')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  id="btn_claim_auto_reinvest"
                >
                  Claim Compounding Bonus (+₦250)
                </button>
              ) : hasActivePlan ? (
                <button
                  onClick={() => {
                    const firstPlan = activeInvestments[0];
                    if (firstPlan) toggleAutoReinvest(firstPlan.id);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Enable Auto-Compounding Now
                </button>
              ) : (
                <button
                  onClick={onNavigateToInvest}
                  className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2 rounded-xl cursor-not-allowed"
                  disabled
                >
                  Requires Active Plan
                </button>
              )}
            </div>
          </div>

          {/* QUEST 3: KYC COMPLETION BOUNTY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="bg-purple-50 text-purple-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-purple-200">
                  COMPLIANCE BOUNTY
                </span>
                <span className="text-xs font-mono font-bold text-purple-700">
                  ₦1,000 One-Time
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">KYC Completion Bounty</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Instant cash reward credited when your government identity document is audited and approved by compliance.
              </p>

              {/* Status display */}
              <div className="my-3.5 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">KYC Standing</span>
                {isKycVerified ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Government ID Verified
                  </span>
                ) : isKycPending ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                    Under Compliance Review
                  </span>
                ) : (
                  <span className="text-slate-600 font-bold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Unverified (Action Required)
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {hasClaimedKycBounty ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified & Claimed (₦1,000)</span>
                </div>
              ) : isKycVerified ? (
                <button
                  onClick={() => completeInstantTask('task_kyc_bounty')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  id="btn_claim_kyc_bounty"
                >
                  Claim ₦1,000 KYC Bounty
                </button>
              ) : isKycPending ? (
                <button
                  disabled
                  className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2 rounded-xl cursor-not-allowed"
                >
                  Awaiting Admin Approval
                </button>
              ) : (
                <button
                  onClick={() => setIsKycModalOpen(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Submit KYC for ₦1,000</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REAL SOCIAL ADVOCACY & PROOF-OF-WORK BOUNTIES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Real Social Advocacy & Proof-of-Work Bounty
              </h3>
              <span className="bg-amber-100 text-amber-900 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200">
                ₦500 Per Approved Post
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              One-tap native sharing for WhatsApp and Telegram. Submit your post proof for live audit in the Admin Panel.
            </p>
          </div>

          <button
            onClick={() => setIsProofModalOpen(true)}
            className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
            id="btn_open_submit_proof_modal"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Proof for Admin Audit</span>
          </button>
        </div>

        {/* NATIVE ONE-TAP SHARING TOOLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {/* WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-left shadow-2xs"
            id="btn_share_whatsapp"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                WA
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-800">
                  Share to WhatsApp
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Broadcast to status or investor groups
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Telegram Share */}
          <button
            onClick={handleShareTelegram}
            className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-950 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-left shadow-2xs"
            id="btn_share_telegram"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                TG
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block group-hover:text-sky-800">
                  Share to Telegram
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Post to real estate & finance channels
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Copy Pitch & Link */}
          <button
            onClick={handleCopyPitch}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer group text-left shadow-2xs"
            id="btn_copy_pitch_link"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-base shadow-xs">
                {copiedPitch ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {copiedPitch ? 'Copied to Clipboard!' : 'Copy Invite Pitch'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Code: <strong className="text-slate-800 font-mono">{referralCode}</strong>
                </span>
              </div>
            </div>
            <span className="text-[10px] text-amber-600 font-bold uppercase">
              {copiedPitch ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>

        {/* User's recent submissions log */}
        {taskSubmissions.filter(s => s.userId === currentUser?.id).length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Your Advocacy Submissions Audit Status
            </h5>
            <div className="space-y-2">
              {taskSubmissions
                .filter(s => s.userId === currentUser?.id)
                .slice(0, 3)
                .map((sub) => (
                  <div key={sub.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                      <p className="font-mono text-[11px] text-slate-700 truncate max-w-md mt-0.5">
                        {sub.proof}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-emerald-600">+₦{sub.rewardAmount}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        sub.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {sub.status === 'pending' ? 'UNDER AUDIT' : sub.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT PROOF MODAL */}
      {isProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest block">Admin Audit Desk</span>
                <h3 className="text-base font-bold text-slate-900">Submit Advocacy Proof (₦500)</h3>
              </div>
              <button 
                onClick={() => setIsProofModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Social Media Platform</label>
                <select
                  value={proofPlatform}
                  onChange={(e) => setProofPlatform(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="WhatsApp Status">WhatsApp Status (Screenshot Proof)</option>
                  <option value="Telegram Channel">Telegram Group / Channel</option>
                  <option value="Twitter/X">Twitter / X Post</option>
                  <option value="Facebook">Facebook Post / Group</option>
                  <option value="LinkedIn">LinkedIn Post</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proof Link or Screenshot URL / Post Details</label>
                <input
                  type="text"
                  required
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="e.g. https://x.com/username/status/123... or paste image link / view count note"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Additional Verification Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="e.g. Broadcasted to 450 contacts on my status with active engagement"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
                Submissions are sent directly to the <strong>Admin Control Centre</strong> for manual compliance audit. Approved submissions credit <strong>₦500</strong> directly to your available balance.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProofModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  Submit for Compliance Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK KYC SUBMIT MODAL */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-widest block">Identity Compliance</span>
                <h3 className="text-base font-bold text-slate-900">Submit KYC Verification (₦1,000 Bounty)</h3>
              </div>
              <button 
                onClick={() => setIsKycModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitKycForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name (as shown on ID)</label>
                <input
                  type="text"
                  required
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  placeholder="e.g. Babatunde Olumide Adeleke"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Government ID Type</label>
                <select
                  value={kycIdType}
                  onChange={(e) => setKycIdType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-sans focus:outline-none focus:border-amber-500"
                >
                  <option value="National ID (NIN)">National Identity Number (NIN)</option>
                  <option value="Voter ID">Permanent Voter's Card (PVC)</option>
                  <option value="International Passport">International Passport</option>
                  <option value="Driver License">FRSC Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Document Identification Number</label>
                <input
                  type="text"
                  required
                  value={kycIdNumber}
                  onChange={(e) => setKycIdNumber(e.target.value)}
                  placeholder="e.g. 58392019482"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-[11px] text-purple-900">
                Your ID verification ensures anti-fraud compliance and priority withdrawal clearance. Once approved by the compliance team in the Admin Panel, you can claim the <strong>₦1,000 cash bounty</strong> directly into your wallet.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Identification Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
