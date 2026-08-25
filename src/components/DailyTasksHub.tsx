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
  Gift
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { DailyTask } from '../types';

export const DailyTasksHub: React.FC<{ onNavigateToInvest?: () => void }> = ({ onNavigateToInvest }) => {
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
    submitTaskProof,
    claimStreakBonus,
    simulateNextDay
  } = useAppState();

  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [modalType, setModalType] = useState<'inspect' | 'poll' | 'checkin' | 'share' | 'streak_celebration' | null>(null);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [shareProofText, setShareProofText] = useState<string>('');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

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

  if (!currentUser) return null;

  const progress = getUserProgress(currentUser.id);
  const activeWeeklyPayout = getUserActiveWeeklyPayout(currentUser.id);
  const dailyPool = getUserDailyPool(currentUser.id);
  const bonusRatePercentage = Math.round((settings.dailyTaskBonusRate ?? 0.05) * 100);

  const completedCount = progress.completedTaskIds.length;
  const totalTasks = dailyTasks.length;
  const instantTasks = dailyTasks.filter(t => t.verificationType === 'instant');
  const instantCompleted = instantTasks.filter(t => progress.completedTaskIds.includes(t.id)).length;

  const handleOpenTask = (task: DailyTask) => {
    setSelectedTask(task);
    if (task.category === 'inspection') setModalType('inspect');
    else if (task.category === 'pulse') {
      const prevAnswer = progress.pollAnswers ? progress.pollAnswers[task.id] : null;
      setSelectedPollOption(prevAnswer !== undefined ? prevAnswer : null);
      setModalType('poll');
    }
    else if (task.category === 'attendance') setModalType('checkin');
    else if (task.category === 'social_share') setModalType('share');
  };

  const handleInstantClaim = (taskId: string, answerIndex?: number) => {
    completeInstantTask(taskId, answerIndex);
    setModalType(null);
    setSelectedTask(null);
  };

  const handleProofSubmit = (taskId: string) => {
    if (!shareProofText.trim()) return;
    submitTaskProof(taskId, shareProofText);
    setShareProofText('');
    setModalType(null);
    setSelectedTask(null);
  };

  const getTaskIcon = (category: DailyTask['category']) => {
    switch (category) {
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

  const getCategoryBadge = (category: DailyTask['category'], share: number) => {
    switch (category) {
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
      {/* Top Banner: Tier & Reward Potential */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        {/* Background ambient pattern */}
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
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Investor Daily Yield Quests
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Complete quick property audits and attendance check-ins to claim your{' '}
              <strong className="text-amber-400 font-bold">{bonusRatePercentage}% daily task yield</strong> based on your active weekly investment payout.
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
                <span className="text-amber-400 font-bold">{bonusRatePercentage}% / day</span>
              </div>
            </div>

            {activeWeeklyPayout === 0 && onNavigateToInvest && (
              <button
                onClick={onNavigateToInvest}
                className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
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

          {progress.streakCount >= 7 && progress.streakBonusClaimedDate !== virtualDate && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={claimStreakBonus}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 animate-bounce"
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
          <h3 className="text-base font-bold text-slate-900">Today's Available Tasks</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {completedCount} of {totalTasks} tasks completed today ({instantCompleted}/{instantTasks.length} required for streak).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Fast Day Sim for Developer / Preview testing */}
          <button
            onClick={simulateNextDay}
            className="text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 font-mono transition-colors"
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
          const rewardAmount = getUserDailyTaskReward(currentUser.id, task);

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
                      {getCategoryBadge(task.category, task.rewardShare)}
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{task.title}</h4>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-600 block">
                      +₦{rewardAmount.toLocaleString()}
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
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed & Credited (+₦{rewardAmount.toLocaleString()})</span>
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

                {!isCompleted && !isPending && (
                  <button
                    onClick={() => handleOpenTask(task)}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
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

      {/* MODAL DIALOGS FOR TASKS */}
      <AnimatePresence>
        {modalType && selectedTask && (
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
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
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
                        +₦{getUserDailyTaskReward(currentUser.id, selectedTask).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInstantClaim(selectedTask.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
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
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
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
                        +₦{getUserDailyTaskReward(currentUser.id, selectedTask).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInstantClaim(selectedTask.id, selectedPollOption ?? 0)}
                      disabled={selectedPollOption === null}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
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
                    Verify your active vault participant status to maintain your weekly consistency streak and claim today's attendance allocation.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Streak:</span>
                      <span className="font-bold text-slate-800">{progress.streakCount} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Attendance Reward:</span>
                      <span className="font-bold text-emerald-600">+₦{getUserDailyTaskReward(currentUser.id, selectedTask).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInstantClaim(selectedTask.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                    id="btn_confirm_checkin_action"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Check-In & Claim ₦{getUserDailyTaskReward(currentUser.id, selectedTask).toLocaleString()}
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
                    Copy the invitation message with your referral code ({currentUser.referralCode}) and share with your network:
                  </p>

                  {/* Share Template Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono relative">
                    <p>
                      {selectedTask.detailsContent?.shareTemplate} <strong>{currentUser.referralCode}</strong>
                    </p>
                    <button
                      onClick={() => {
                        const text = `${selectedTask.detailsContent?.shareTemplate}${currentUser.referralCode}`;
                        navigator.clipboard.writeText(text);
                        setCopiedShare(true);
                        setTimeout(() => setCopiedShare(false), 2000);
                      }}
                      className="mt-2 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded flex items-center gap-1 font-sans transition-colors"
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
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
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
