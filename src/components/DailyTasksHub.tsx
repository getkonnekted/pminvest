import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  CheckCircle2, 
  Clock, 
  Building2, 
  BarChart3, 
  CalendarCheck, 
  Share2, 
  Sparkles, 
  ChevronRight, 
  Award, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Copy,
  ExternalLink,
  Send,
  X,
  RefreshCw,
  Gift,
  HelpCircle,
  Video,
  Zap,
  Lock,
  Wallet,
  Coins
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { DailyTask } from '../types';
import { SponsoredQuizModal } from './SponsoredQuizModal';
import { RewardedAdModal } from './RewardedAdModal';

export const DailyTasksHub: React.FC<{ onNavigateToInvest?: () => void; onOpenRegisterModal?: () => void }> = ({ 
  onNavigateToInvest,
  onOpenRegisterModal
}) => {
  const { 
    currentUser, 
    dailyTasks, 
    taskSubmissions,
    settings,
    virtualDate,
    getUserActiveWeeklyPayout, 
    getUserDailyPool, 
    getUserDailyTaskReward, 
    getUserProgress,
    completeInstantTask,
    applyRewardedAdBoost,
    submitTaskProof,
    claimStreakBonus,
    claimGuestTrialEarnings,
    simulateNextDay
  } = useAppState();

  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [modalType, setModalType] = useState<'inspect' | 'poll' | 'checkin' | 'share' | 'quiz' | null>(null);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [shareProofText, setShareProofText] = useState<string>('');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  // Rewarded Video Ad Modal State
  const [isAdModalOpen, setIsAdModalOpen] = useState<boolean>(false);
  const [adTargetTaskId, setAdTargetTaskId] = useState<string | null>(null);
  const [guestTrialEarnings, setGuestTrialEarnings] = useState<number>(() => {
    return Number(localStorage.getItem('pm_guest_trial_earnings') || 0);
  });

  // 24h Countdown timer to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // When user is logged in, check if they have uncredited guest trial earnings
  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem('pm_guest_trial_earnings');
      if (stored && Number(stored) > 0) {
        claimGuestTrialEarnings();
        setGuestTrialEarnings(0);
      }
    }
  }, [currentUser]);

  const progress = currentUser ? getUserProgress(currentUser.id) : {
    userId: 'guest',
    currentDate: virtualDate,
    completedTaskIds: [],
    pendingSubmissionTaskIds: [],
    adBoostedTaskIds: [],
    streakCount: 1,
    pollAnswers: {},
    totalFreeEarningsWithdrawn: 0
  };

  const activeWeeklyPayout = currentUser ? getUserActiveWeeklyPayout(currentUser.id) : 0;
  const dailyPool = currentUser ? getUserDailyPool(currentUser.id) : (settings.dailyTaskBaseReward || 200) * 4;
  const bonusRatePercentage = Math.round((settings.dailyTaskBonusRate ?? 0.05) * 100);

  const completedCount = progress.completedTaskIds.length;
  const totalTasks = dailyTasks.length;
  const instantTasks = dailyTasks.filter(t => t.verificationType === 'instant');
  const instantCompleted = instantTasks.filter(t => progress.completedTaskIds.includes(t.id)).length;

  const freeStarterCap = settings.freeStarterWithdrawalLimit || 3000;
  const freeWithdrawn = progress.totalFreeEarningsWithdrawn || 0;
  const remainingFreeAllowance = Math.max(0, freeStarterCap - freeWithdrawn);
  const isStarterUser = activeWeeklyPayout === 0;

  const handleOpenTask = (task: DailyTask) => {
    setSelectedTask(task);
    if (task.category === 'quiz') setModalType('quiz');
    else if (task.category === 'inspection') setModalType('inspect');
    else if (task.category === 'pulse') {
      const prevAnswer = progress.pollAnswers ? progress.pollAnswers[task.id] : null;
      setSelectedPollOption(prevAnswer !== undefined ? prevAnswer : null);
      setModalType('poll');
    }
    else if (task.category === 'attendance') setModalType('checkin');
    else if (task.category === 'social_share') setModalType('share');
  };

  const handleInstantClaim = (taskId: string, answerIndex?: number) => {
    if (!currentUser) {
      // Guest Trial Mode: Accumulate in guest trial storage
      const task = dailyTasks.find(t => t.id === taskId);
      const reward = task?.fixedReward || 200;
      const newGuestTotal = guestTrialEarnings + reward;
      localStorage.setItem('pm_guest_trial_earnings', String(newGuestTotal));
      setGuestTrialEarnings(newGuestTotal);
      setModalType(null);
      setSelectedTask(null);
      return;
    }

    completeInstantTask(taskId, answerIndex);
    setModalType(null);
    setSelectedTask(null);
  };

  const handleTriggerAdBoost = (taskId: string) => {
    setAdTargetTaskId(taskId);
    setIsAdModalOpen(true);
  };

  const handleAdRewardGranted = () => {
    if (adTargetTaskId) {
      if (currentUser) {
        applyRewardedAdBoost(adTargetTaskId);
      } else {
        const bonus = 200; // 2x guest bonus
        const newTotal = guestTrialEarnings + bonus;
        localStorage.setItem('pm_guest_trial_earnings', String(newTotal));
        setGuestTrialEarnings(newTotal);
      }
    }
  };

  const handleProofSubmit = (taskId: string) => {
    if (!shareProofText.trim()) return;
    if (!currentUser) {
      if (onOpenRegisterModal) onOpenRegisterModal();
      return;
    }
    submitTaskProof(taskId, shareProofText);
    setShareProofText('');
    setModalType(null);
    setSelectedTask(null);
  };

  const getTaskIcon = (category: DailyTask['category']) => {
    switch (category) {
      case 'quiz':
        return <HelpCircle className="w-5 h-5 text-amber-500" />;
      case 'inspection':
        return <Building2 className="w-5 h-5 text-amber-500" />;
      case 'pulse':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'attendance':
        return <CalendarCheck className="w-5 h-5 text-emerald-500" />;
      case 'social_share':
        return <Share2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const getCategoryBadge = (category: DailyTask['category'], share: number, sponsorBadge?: string) => {
    if (sponsorBadge) {
      return (
        <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-600 fill-amber-500" /> {sponsorBadge}
        </span>
      );
    }
    switch (category) {
      case 'quiz':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sponsored Quiz
          </span>
        );
      case 'inspection':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Site Audit ({Math.round(share * 100)}%)
          </span>
        );
      case 'pulse':
        return (
          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Market Pulse ({Math.round(share * 100)}%)
          </span>
        );
      case 'attendance':
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Daily Check-In ({Math.round(share * 100)}%)
          </span>
        );
      case 'social_share':
        return (
          <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Growth Bounty
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="daily_tasks_hub_container">
      {/* GUEST UNREGISTERED EARNINGS BANNER */}
      {!currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-5 rounded-2xl shadow-lg border border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              ₦
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                GUEST TRIAL REWARD HUB
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
                Earn Up to ₦{freeStarterCap.toLocaleString()} Free Without Any Investment!
              </h3>
              <p className="text-xs text-slate-900/90 max-w-lg">
                Complete daily site tasks & trivia. Your accumulated trial balance (<strong>₦{guestTrialEarnings.toLocaleString()}</strong>) unlocks immediately upon creating a free account.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRegisterModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs tracking-wider uppercase shadow-xl transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            id="btn_guest_claim_account"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Create Free Account to Claim ₦{guestTrialEarnings.toLocaleString()}</span>
          </button>
        </motion.div>
      )}

      {/* ₦3,000 STARTER TRIAL MILESTONE BANNER (FOR LOGGED IN STARTERS) */}
      {currentUser && isStarterUser && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/40 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  FREE STARTER TRIAL
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Withdrawn: ₦{freeWithdrawn.toLocaleString()} / ₦{freeStarterCap.toLocaleString()} Max
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                Free Starter Cashout: ₦{remainingFreeAllowance.toLocaleString()} Remaining
              </h3>
              <p className="text-xs text-slate-400 max-w-lg">
                You can withdraw up to ₦{freeStarterCap.toLocaleString()} from free daily tasks without depositing. Ready for uncapped yields?
              </p>
            </div>
          </div>

          {onNavigateToInvest && (
            <button
              onClick={onNavigateToInvest}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer transition-all hover:scale-105"
            >
              <TrendingUp className="w-4 h-4 text-slate-950" />
              <span>UPGRADE PLAN FOR UNLIMITED YIELDS</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner: Tier & Reward Potential */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {progress.streakCount}-Day Streak Active
              </span>

              <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Reset: {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>

              <span className="inline-flex items-center gap-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full text-xs font-bold font-mono">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                2X Rewarded Ad Boosts Available
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Daily Real Estate Yield & Trivia Hub
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Complete daily site audits, market polls, and sponsored corporate trivia. Ad views and corporate sponsors fund 100% of guest & starter yields with zero deduction from fund reserves.
            </p>
          </div>

          {/* Right Card: User Daily Rate Calculation */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between shrink-0 min-w-[260px]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                Your Calculated Daily Task Pool
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                ₦{dailyPool.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">/ day</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/80 text-[11px] text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Weekly Payout Backing:</span>
                <span className="font-bold text-white">₦{activeWeeklyPayout.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Daily Multiplier:</span>
                <span className="text-amber-400 font-bold">{isStarterUser ? 'Base Starter Tier' : `${bonusRatePercentage}% / day`}</span>
              </div>
            </div>

            {activeWeeklyPayout === 0 && onNavigateToInvest && currentUser && (
              <button
                onClick={onNavigateToInvest}
                className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                id="btn_boost_daily_pool"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Boost Daily Task Pool
              </button>
            )}
          </div>
        </div>

        {/* 7-Day Consistency Streak Progress */}
        <div className="mt-6 pt-5 border-t border-slate-700/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                7-Day Consistency Milestone ({progress.streakCount}/7 Days)
              </span>
            </div>

            <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              Unlock ₦{(settings.dailyTaskStreakBonus || 1500).toLocaleString()} Jackpot Bonus on Day 7
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isPassed = day <= progress.streakCount;
              const isCurrent = day === progress.streakCount + 1 && instantCompleted < instantTasks.length;
              const isTargetDay7 = day === 7;

              return (
                <div 
                  key={day}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                    isPassed
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                      : isCurrent
                      ? 'bg-slate-800 text-amber-400 border-amber-500/50 font-semibold ring-1 ring-amber-400/30'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
                  }`}
                >
                  <span className="text-[9px] uppercase font-mono tracking-wider block">Day</span>
                  <span className="text-xs sm:text-sm font-extrabold font-mono flex items-center gap-0.5">
                    {day}
                    {isPassed && <CheckCircle2 className="w-3 h-3 text-slate-950 inline" />}
                    {isTargetDay7 && !isPassed && <Gift className="w-3 h-3 text-amber-400 inline" />}
                  </span>
                </div>
              );
            })}
          </div>

          {currentUser && progress.streakCount >= 7 && progress.streakBonusClaimedDate !== virtualDate && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={claimStreakBonus}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 animate-bounce cursor-pointer"
                id="btn_claim_streak_jackpot"
              >
                <Flame className="w-4 h-4 fill-slate-950" /> Claim ₦{(settings.dailyTaskStreakBonus || 1500).toLocaleString()} Streak Jackpot!
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Today's Available Tasks & Quizzes</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {completedCount} of {totalTasks} tasks completed today ({instantCompleted}/{instantTasks.length} required for streak).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Fast Day Sim for Developer / Preview testing */}
          <button
            onClick={simulateNextDay}
            className="text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 font-mono transition-colors cursor-pointer"
            title="Advance virtual date by 24h to test midnight task reset"
            id="btn_sim_next_day_user"
          >
            <RefreshCw className="w-3 h-3" /> Advance Day (Test Reset)
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dailyTasks.map((task) => {
          const isCompleted = progress.completedTaskIds.includes(task.id);
          const isPending = progress.pendingSubmissionTaskIds.includes(task.id);
          const isAdBoosted = progress.adBoostedTaskIds?.includes(task.id);
          const baseReward = currentUser ? getUserDailyTaskReward(currentUser.id, task) : (task.fixedReward || 200);
          const displayReward = isAdBoosted ? baseReward * 2 : baseReward;

          return (
            <div 
              key={task.id}
              className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                isCompleted 
                  ? 'border-emerald-200 bg-emerald-50/20 shadow-xs' 
                  : isPending
                  ? 'border-amber-200 bg-amber-50/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
              id={`task_card_${task.id}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getTaskIcon(task.category)}
                    </div>
                    <div>
                      {getCategoryBadge(task.category, task.rewardShare, task.sponsorBadge)}
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{task.title}</h4>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-600 block">
                      +₦{displayReward.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono uppercase">
                      {task.verificationType === 'instant' ? 'Instant Credit' : 'Admin Audited'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {task.subtitle}
                </p>
              </div>

              {/* Action Button & Status */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Claimed (+₦{displayReward.toLocaleString()})</span>
                  </div>
                ) : isPending ? (
                  <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />
                    <span>Submitted (Audit in progress)</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 font-medium">
                    {task.verificationType === 'instant' ? '⚡ 1-Minute Automated Verification' : '📋 Verification requires link or note'}
                  </div>
                )}

                {/* Boost Button for completed tasks not yet boosted */}
                {isCompleted && !isAdBoosted && (
                  <button
                    onClick={() => handleTriggerAdBoost(task.id)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    title="Watch 12s ad to double your reward"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-600" />
                    <span>Double (+₦{baseReward.toLocaleString()})</span>
                  </button>
                )}

                {isCompleted && isAdBoosted && (
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-600 fill-purple-600" /> 2X Ad Boosted
                  </span>
                )}

                {!isCompleted && !isPending && (
                  <button
                    onClick={() => handleOpenTask(task)}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 cursor-pointer"
                    id={`btn_open_task_${task.id}`}
                  >
                    <span>{task.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SPONSORED QUIZ MODAL */}
      {selectedTask && selectedTask.category === 'quiz' && (
        <SponsoredQuizModal
          isOpen={modalType === 'quiz'}
          onClose={() => { setModalType(null); setSelectedTask(null); }}
          task={selectedTask}
          rewardAmount={currentUser ? getUserDailyTaskReward(currentUser.id, selectedTask) : (selectedTask.fixedReward || 200)}
          onCompleteQuiz={(score, passed) => {
            if (currentUser) {
              completeInstantTask(selectedTask.id);
            } else {
              const base = selectedTask.fixedReward || 200;
              const newTotal = guestTrialEarnings + base;
              localStorage.setItem('pm_guest_trial_earnings', String(newTotal));
              setGuestTrialEarnings(newTotal);
            }
          }}
          onWatchRewardedAd={() => {
            handleTriggerAdBoost(selectedTask.id);
          }}
          hasWatchedAd={progress.adBoostedTaskIds?.includes(selectedTask.id)}
        />
      )}

      {/* REWARDED AD VIDEO MODAL */}
      <RewardedAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onRewardGranted={handleAdRewardGranted}
        bonusAmount={200}
      />

      {/* MODAL DIALOGS FOR TASKS */}
      <AnimatePresence>
        {modalType && selectedTask && selectedTask.category !== 'quiz' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative"
              id="task_interactive_modal"
            >
              {/* Close Button */}
              <button
                onClick={() => { setModalType(null); setSelectedTask(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                id="btn_close_task_modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 1. PROPERTY INSPECTION MODAL */}
              {modalType === 'inspect' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500" />
                    <span className="text-[11px] font-mono uppercase font-bold text-amber-600">Daily Site Inspection Audit</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedTask.detailsContent?.headline || selectedTask.title}
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-bold text-slate-800">{selectedTask.detailsContent?.location}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500">Structural Milestone:</span>
                      <span className="font-bold text-emerald-600">{selectedTask.detailsContent?.progressPercentage}% Completed</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedTask.detailsContent?.progressPercentage || 80}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-1">
                    {selectedTask.detailsContent?.paragraphs?.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{selectedTask.detailsContent?.keyTakeaway}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Inspection Yield</span>
                      <span className="text-base font-bold font-mono text-slate-900">
                        +₦{(currentUser ? getUserDailyTaskReward(currentUser.id, selectedTask) : (selectedTask.fixedReward || 200)).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInstantClaim(selectedTask.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      id="btn_confirm_inspection_claim"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete & Claim Yield
                    </button>
                  </div>
                </div>
              )}

              {/* 2. MARKET PULSE POLL MODAL */}
              {modalType === 'poll' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span className="text-[11px] font-mono uppercase font-bold text-blue-600">Daily Market Sentiment Poll</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {selectedTask.detailsContent?.pollQuestion}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Vote to cast your insight. Results help shape future real estate acquisition allocations.
                  </p>

                  <div className="space-y-2">
                    {selectedTask.detailsContent?.pollOptions?.map((opt, idx) => {
                      const isSelected = selectedPollOption === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPollOption(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-500/30'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.text}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Survey Reward</span>
                      <span className="text-base font-bold font-mono text-slate-900">
                        +₦{(currentUser ? getUserDailyTaskReward(currentUser.id, selectedTask) : (selectedTask.fixedReward || 200)).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInstantClaim(selectedTask.id, selectedPollOption ?? 0)}
                      disabled={selectedPollOption === null}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      id="btn_submit_poll_vote"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Submit Vote & Claim
                    </button>
                  </div>
                </div>
              )}

              {/* 3. DAILY CHECK-IN MODAL */}
              {modalType === 'checkin' && (
                <div className="space-y-4 text-center">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                    <CalendarCheck className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Daily Investor Check-In
                  </h3>

                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Verify your active status to maintain your consistency streak and claim today's attendance allocation.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Streak:</span>
                      <span className="font-bold text-slate-800">{progress.streakCount} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Attendance Reward:</span>
                      <span className="font-bold text-emerald-600">+₦{(currentUser ? getUserDailyTaskReward(currentUser.id, selectedTask) : (selectedTask.fixedReward || 200)).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInstantClaim(selectedTask.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    id="btn_confirm_checkin_action"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Check-In & Claim ₦{(currentUser ? getUserDailyTaskReward(currentUser.id, selectedTask) : (selectedTask.fixedReward || 200)).toLocaleString()}
                  </button>
                </div>
              )}

              {/* 4. SOCIAL SHARE MODAL */}
              {modalType === 'share' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-purple-500" />
                    <span className="text-[11px] font-mono uppercase font-bold text-purple-600">Community Growth Bounty</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    Share PM Invest & Earn ₦{selectedTask.fixedReward || 500} Bonus
                  </h3>

                  <p className="text-xs text-slate-600">
                    Copy the invitation message with your referral code ({currentUser?.referralCode || 'PM_STARTER'}) and share with your network:
                  </p>

                  {/* Share Template Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono relative">
                    <p>
                      {selectedTask.detailsContent?.shareTemplate} <strong>{currentUser?.referralCode || 'PM_STARTER'}</strong>
                    </p>
                    <button
                      onClick={() => {
                        const code = currentUser?.referralCode || 'PM_STARTER';
                        const text = `${selectedTask.detailsContent?.shareTemplate}${code}`;
                        navigator.clipboard.writeText(text);
                        setCopiedShare(true);
                        setTimeout(() => setCopiedShare(false), 2000);
                      }}
                      className="mt-2 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded flex items-center gap-1 font-sans transition-colors cursor-pointer"
                      id="btn_copy_share_template"
                    >
                      <Copy className="w-3 h-3" /> {copiedShare ? 'Copied to Clipboard!' : 'Copy Share Template'}
                    </button>
                  </div>

                  {/* Proof input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 block">
                      Submit Proof (Post Link, Screenshot note, or Group Name):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://x.com/myaccount/status/... or Posted to Real Estate Group"
                      value={shareProofText}
                      onChange={(e) => setShareProofText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Bounty Bonus</span>
                      <span className="text-base font-bold font-mono text-slate-900">
                        +₦{selectedTask.fixedReward || 500}
                      </span>
                    </div>

                    <button
                      onClick={() => handleProofSubmit(selectedTask.id)}
                      disabled={!shareProofText.trim()}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      id="btn_submit_share_proof"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Proof
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
