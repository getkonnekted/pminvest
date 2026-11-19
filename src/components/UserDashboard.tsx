import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Clock, 
  CreditCard,
  Building,
  UploadCloud,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Info,
  Sparkles,
  Flame,
  Award,
  ExternalLink,
  Zap,
  Menu,
  X,
  Loader2,
  RotateCw,
  PlusCircle,
  ArrowRight,
  Link2,
  Check,
  MessageSquare,
  Activity,
  Maximize2,
  BarChart2,
  MapPin,
  Shield,
  FileCheck,
  Landmark
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { INVESTMENT_PLANS, InvestmentPlan, UserInvestment } from '../types';
import { NIGERIAN_BANKS, resolveNigerianAccount } from '../lib/paystack';
import { PmLogo } from './PmLogo';
import { PayoutCountdown } from './PayoutCountdown';
import { InvestmentPayoutButton } from './InvestmentPayoutButton';
import { CommunityBanner } from './CommunityBanner';
import { UaeDeedModal } from './UaeDeedModal';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';
import { InsufficientFundsModal } from './InsufficientFundsModal';
import { MultilingualPitchModal } from './MultilingualPitchModal';
import { PWAInstallButton } from './PWAInstallButton';
import { UaeFlag } from './UaeFlag';
import { LiveTradingSimulationCard } from './LiveTradingSimulationCard';
import { LivePropertyTradingModal } from './LivePropertyTradingModal';
import { recordInvestorProtectionEvent } from '../lib/supabase';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { formatPhoneDisplay, getWhatsAppStatusInfo } from '../lib/phoneSanitizer';

const AutoRenewControl: React.FC<{ investment: UserInvestment; onToggle: (id: string) => void }> = ({ investment, onToggle }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const lockUntil = investment.autoReinvestLockedUntil ? new Date(investment.autoReinvestLockedUntil).getTime() : 0;
  const isLocked = lockUntil > now;
  const increment = Math.round(investment.weeklyPayout * 0.03);

  return (
    <div className="flex items-center justify-between bg-[#06080e]/90 border border-amber-500/20 rounded-xl p-2.5 my-2">
      <div className="flex items-center gap-2">
        <RotateCw className={`w-3.5 h-3.5 ${investment.autoReinvest ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'}`} />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#f7ecd5] block leading-tight">Auto-Renew</span>
            <span className="text-[9px] font-mono font-semibold tracking-wider bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-sm border border-amber-500/30 uppercase">+3% on Payout</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {isLocked
              ? `Locked until payout: ${new Date(lockUntil).toLocaleDateString()} ${new Date(lockUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : investment.autoReinvest
                ? `Active: +3% increment (+₦${increment.toLocaleString()}) on each eligible weekly payout`
                : `Enable rollover for a 3% increment (+₦${increment.toLocaleString()}/wk)`}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggle(investment.id)}
        disabled={isLocked}
        aria-pressed={Boolean(investment.autoReinvest)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${investment.autoReinvest ? 'bg-amber-500' : 'bg-slate-700'}`}
        id={`toggle_autoreinvest_${investment.id}`}
        title={isLocked ? `Auto-Renew locked until ${new Date(lockUntil).toLocaleString()}` : 'Toggle Auto-Renew to rollover weekly payouts with 3% increment'}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${investment.autoReinvest ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

export const UserDashboard: React.FC = () => {
  const { 
    currentUser, 
    investments, 
    transactions, 
    users, 
    settings,
    dailyTasks,
    getUserProgress,
    getUserDailyPool,
    getUserActiveWeeklyPayout,
    submitDeposit, 
    processAutomatedDeposit,
    submitWithdrawal, 
    purchaseInvestment, 
    topUpAndPurchaseInvestment,
    toggleAutoReinvest,
    rolloverInvestment,
    processSingleInvestmentPayout,
    successMsg,
    errorMsg,
    clearMessages,
    formatLiquidityReserve,
    isDbLoaded,
    supabaseStatus,
    refreshFromSupabase
  } = useAppState();

  const { 
    optimisticPurchasePlan, 
    isSyncing, 
    pendingQueueLength 
  } = useSupabaseSync();

  const [activeTab, setActiveTab] = useState<'overview' | 'invest' | 'finance' | 'referrals'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isRefreshingInvestments, setIsRefreshingInvestments] = useState<boolean>(false);

  const handleRefreshInvestments = async () => {
    setIsRefreshingInvestments(true);
    try {
      if (refreshFromSupabase) {
        await refreshFromSupabase();
      }
    } catch {
      // Handled in context
    } finally {
      setTimeout(() => setIsRefreshingInvestments(false), 900);
    }
  };

  const menuItems: {
    id: 'overview' | 'invest' | 'finance' | 'referrals';
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Wallet, returns & active holdings',
      icon: TrendingUp,
    },
    {
      id: 'invest',
      label: 'Properties',
      description: 'Dubai offerings from ₦15,000',
      icon: Building,
    },
    {
      id: 'finance',
      label: 'Wallet',
      description: 'Deposit & bank withdrawal',
      icon: Wallet,
    },
    {
      id: 'referrals',
      label: 'Partners',
      description: '7.5% weekly referral override',
      icon: Users,
    }
  ];
  
  // Manual Reserve Deposit state
  const [depAmount, setDepAmount] = useState<string>('');
  const [depMethod, setDepMethod] = useState<string>('Bank Transfer (Treasure Homes Reserve)');
  const [depDetails, setDepDetails] = useState<string>('');
  
  // Real Receipt Upload states
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Withdrawal state
  const [withAmount, setWithAmount] = useState<string>('');
  const [withDetails, setWithDetails] = useState<string>('');
  const [selectedBankCode, setSelectedBankCode] = useState<string>('999992'); // Default OPay
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [accountResolution, setAccountResolution] = useState<{ verified: boolean; name: string } | null>(null);

  // Auto-resolve Nigerian bank account whenever account number or bank changes
  useEffect(() => {
    const cleaned = bankAccountNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      const res = resolveNigerianAccount(cleaned, selectedBankCode, currentUser?.name);
      if (res.success && res.accountName) {
        setAccountResolution({ verified: true, name: res.accountName });
        const selectedBank = NIGERIAN_BANKS.find(b => b.code === selectedBankCode);
        setWithDetails(`${selectedBank?.name || 'Bank'} - ${cleaned} - ${res.accountName}`);
      } else {
        setAccountResolution(null);
      }
    } else {
      setAccountResolution(null);
    }
  }, [bankAccountNumber, selectedBankCode, currentUser?.name]);

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem('pm_prefill_deposit');
      if (prefill) {
        setDepAmount(prefill);
        setActiveTab('finance');
        sessionStorage.removeItem('pm_prefill_deposit');
        setTimeout(() => {
          document.getElementById('deposit_form_container')?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    } catch {
      // ignore
    }
  }, []);

  // Candlestick Trading Simulation Terminal State
  const [isTradingTerminalOpen, setIsTradingTerminalOpen] = useState<boolean>(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAccount2, setCopiedAccount2] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  const faqItems = [
    {
      question: "How do I add money to my wallet?",
      answer: "Go to the 'Deposit & Withdraw' tab, copy our official bank account details, and make a transfer from your bank app. Then upload your transfer receipt. Your wallet will be credited within 10 to 30 minutes."
    },
    {
      question: "How do weekly payouts work?",
      answer: "Each property plan runs for 24 weeks. Your first payout is due 7 days after purchase; later payouts follow the same 7-day cycle and are credited to your wallet. You can withdraw eligible funds to your bank account."
    },
    {
      question: "What is Auto-Renew and weekly payout rollover?",
      answer: "Auto-Renew means investors choose to rollover their weekly payouts and are entitled to a 3% increment on each payout rolled over (calculated on each weekly payout, not the entire plan)."
    },
    {
      question: "How do I withdraw cash to my bank?",
      answer: "Go to 'Deposit & Withdraw', enter the amount you want to withdraw, and choose your bank account. Your money will arrive in your bank account within a few hours."
    },
    {
      question: "Is my money safe?",
      answer: `Yes. PM Invest is backed by real building projects and maintains a dedicated cash reserve of over ₦${formatLiquidityReserve(0)} in bank reserve to ensure every payout is made on time.`
    }
  ];

  if (!currentUser) return null;

  // Calculate stats with memoization for rock-solid stability and zero flickering
  const userInvestments = useMemo(() => investments.filter(i => i.userId === currentUser.id), [investments, currentUser.id]);
  const activeInvestments = useMemo(() => userInvestments.filter(i => i.status === 'active'), [userInvestments]);
  const completedInvestments = useMemo(() => userInvestments.filter(i => i.status === 'completed'), [userInvestments]);
  
  const totalInvested = useMemo(() => userInvestments.reduce((sum, i) => sum + i.cost, 0), [userInvestments]);
  const totalEarnedPayouts = useMemo(() => transactions
    .filter(t => t.userId === currentUser.id && t.type === 'payout' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0), [transactions, currentUser.id]);
  const totalReferralBonus = useMemo(() => transactions
    .filter(t => t.userId === currentUser.id && t.type === 'referral_bonus' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0), [transactions, currentUser.id]);

  const pendingDeposits = useMemo(() => transactions
    .filter(t => t.userId === currentUser.id && t.type === 'deposit' && t.status === 'pending'), [transactions, currentUser.id]);
  const pendingWithdrawals = useMemo(() => transactions
    .filter(t => t.userId === currentUser.id && t.type === 'withdrawal' && t.status === 'pending'), [transactions, currentUser.id]);

  // Real Investor status: Paid to top up wallet (not marketing, deposit completed)
  const userPaidDeposits = useMemo(() => transactions.filter(t => 
    t.userId === currentUser.id && 
    t.type === 'deposit' && 
    t.status === 'completed' && 
    !t.isMarketing
  ), [transactions, currentUser.id]);
  const totalPaidTopup = useMemo(() => userPaidDeposits.reduce((sum, t) => sum + t.amount, 0), [userPaidDeposits]);
  const isRealInvestor = totalPaidTopup > 0;
  const hasFundingActivity = totalPaidTopup > 0 || currentUser.walletBalance > 0;

  const referredUsers = useMemo(() => users.filter(u => u.referredByCode === currentUser.referralCode), [users, currentUser.referralCode]);

  // Rock-solid memoized Recent Transactions for user
  const userRecentTransactions = useMemo(() => {
    return transactions
      .filter(t => t.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [transactions, currentUser.id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://treasurehomes.ng';
    const link = `${origin}/?ref=${currentUser.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt <= 0) return;
    const proofToSubmit = receiptUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60';
    submitDeposit(amt, depMethod, depDetails, proofToSubmit);

    // Non-blocking Investor Protection audit
    recordInvestorProtectionEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      eventType: 'deposit_receipt_uploaded',
      amount: amt,
      details: {
        paymentMethod: depMethod,
        accountDetails: depDetails,
        hasProof: !!receiptUrl
      }
    });

    setDepAmount('');
    setDepDetails('');
    setReceiptFile(null);
    setReceiptUrl('');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withAmount);
    if (isNaN(amt) || amt <= 0) return;

    let targetDetails = withDetails;
    if (!targetDetails.trim() && bankAccountNumber.trim()) {
      const selectedBank = NIGERIAN_BANKS.find(b => b.code === selectedBankCode);
      targetDetails = `${selectedBank?.name || 'Bank'} - ${bankAccountNumber} - ${accountResolution?.name || currentUser?.name || 'Account Holder'}`;
    }

    const success = submitWithdrawal(amt, targetDetails);
    if (success) {
      // Non-blocking Investor Protection audit
      recordInvestorProtectionEvent({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        eventType: 'withdrawal_requested',
        amount: amt,
        details: {
          accountDetails: targetDetails
        }
      });

      setWithAmount('');
      setWithDetails('');
      setBankAccountNumber('');
    }
  };

  const [investingPlanId, setInvestingPlanId] = useState<string | null>(null);
  const [justActivatedPlanId, setJustActivatedPlanId] = useState<string | null>(null);
  const [activatedPlanModal, setActivatedPlanModal] = useState<{ plan: InvestmentPlan; nextPayoutDate: string } | null>(null);
  const [viewingDeedInvestment, setViewingDeedInvestment] = useState<UserInvestment | null>(null);
  const [sampleDeedPlan, setSampleDeedPlan] = useState<InvestmentPlan | null>(null);
  const [shortfallPlan, setShortfallPlan] = useState<InvestmentPlan | null>(null);

  const handlePurchase = async (plan: InvestmentPlan) => {
    if (investingPlanId) return; // Prevent double-triggering while animating

    const currentBal = Math.max(0, currentUser?.walletBalance || 0);
    if (currentBal < plan.cost) {
      setShortfallPlan(plan);
      return;
    }

    setInvestingPlanId(plan.id);

    try {
      // Optimistic instant purchase with background auto-retrying persistence
      const success = await optimisticPurchasePlan(plan);
      setInvestingPlanId(null);
      if (success) {
        setJustActivatedPlanId(plan.id);
        const nextDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        setActivatedPlanModal({ plan, nextPayoutDate: nextDate });

        setTimeout(() => {
          setJustActivatedPlanId(null);
        }, 3000);
      }
    } catch {
      setInvestingPlanId(null);
    }
  };

  return (
    <div className="w-full text-slate-100 p-1 selection:bg-amber-500/30 selection:text-amber-200" id="user_dashboard_container">
      {/* Alert Banner for Global messages */}
      {successMsg && (
        <div className="mb-5 bg-[#061811] border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xl shadow-emerald-950/20 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-emerald-400 hover:text-emerald-300 text-xs font-mono px-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 bg-[#180a0c] border border-rose-500/40 text-rose-200 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xl shadow-rose-950/20 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-rose-400 hover:text-rose-300 text-xs font-mono px-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Deactivated Notice Banner */}
      {currentUser.isDeactivated && (
        <div className="mb-5 bg-[#180a0c] border border-rose-500/50 text-rose-200 p-4 rounded-2xl flex items-start gap-3 text-xs shadow-2xl animate-fadeIn">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-rose-300">
              Account Deactivated by Administration
            </h4>
            <p className="text-rose-200/90 leading-relaxed font-normal">
              Your account has been placed on administrative hold. New plan purchases, deposit credits, and withdrawal requests are temporarily paused. Existing capital and recorded payouts remain intact. Please contact compliance or platform administration to resolve this hold.
            </p>
          </div>
        </div>
      )}


      {/* Real Investor vs Unfunded Status Bar */}
      {isRealInvestor ? (
        <div className="mb-5 pm-card rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0B7A4E] shrink-0" />
            <span>
              <strong className="font-semibold">Verified Investor</strong> ·{' '}
              <span className="font-mono tabular-nums text-[#0B7A4E] font-medium">
                ₦{totalPaidTopup.toLocaleString()}
              </span>{' '}
              funded
            </span>
          </div>
          <span className="text-[11px] opacity-65">Friday settlement active</span>
        </div>
      ) : currentUser.walletBalance > 0 ? null : (
        <div className="mb-5 pm-card rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-[#9A7B3E] shrink-0" />
            <span>Fund your wallet to acquire a Dubai property stake from ₦15,000.</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className="bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer whitespace-nowrap"
            id="btn_unfunded_lead_topup"
          >
            Fund Wallet
          </button>
        </div>
      )}

      <CommunityBanner />

      {/* Clean Executive Tab Bar */}
      <div className="mb-6 border-b border-[var(--pm-border)] flex items-center justify-between gap-3 overflow-x-auto">
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Dashboard sections">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  clearMessages();
                  setIsMenuOpen(false);
                }}
                className={`relative px-3.5 py-3 text-xs sm:text-[13px] font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
                  isActive
                    ? 'border-[#0B7A4E] text-[#0B7A4E]'
                    : 'border-transparent opacity-65 hover:opacity-100'
                }`}
                id={`tab_desktop_${item.id}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {(isSyncing || pendingQueueLength > 0) && (
          <span className="shrink-0 hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono opacity-65 pb-1">
            <RotateCw className="w-3 h-3 animate-spin" />
            <span>{pendingQueueLength > 0 ? `Syncing (${pendingQueueLength})` : 'Syncing'}</span>
          </span>
        )}
      </div>

      {/* TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* In-App Mobile PWA Installation Prompt */}
          <PWAInstallButton variant="banner" />

          {/* Flat Single-Elevation KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="pm-card rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-[0.1em] opacity-65 font-medium">Wallet Balance</p>
              <h3 className="text-2xl font-semibold font-mono tabular-nums mt-1.5">
                ₦{currentUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-[11px] opacity-60 block mt-1">Available to withdraw</span>
            </div>

            <div className="pm-card rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-[0.1em] opacity-65 font-medium">Invested Capital</p>
              <h3 className="text-2xl font-semibold font-mono tabular-nums mt-1.5">
                ₦{activeInvestments.reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
              </h3>
              <span className="text-[11px] text-[#0B7A4E] font-medium block mt-1">
                {activeInvestments.length} active {activeInvestments.length === 1 ? 'asset' : 'assets'}
              </span>
            </div>

            <div className="pm-card rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-[0.1em] opacity-65 font-medium">Total Profit</p>
              <h3 className="text-2xl font-semibold font-mono tabular-nums text-[#0B7A4E] mt-1.5">
                ₦{totalEarnedPayouts.toLocaleString()}
              </h3>
              <span className="text-[11px] opacity-60 block mt-1">Paid to wallet</span>
            </div>

            <div className="pm-card rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-[0.1em] opacity-65 font-medium">Partner Bonus</p>
              <h3 className="text-2xl font-semibold font-mono tabular-nums mt-1.5">
                ₦{totalReferralBonus.toLocaleString()}
              </h3>
              <span className="text-[11px] text-[#9A7B3E] font-medium block mt-1">7.5% weekly override</span>
            </div>
          </div>

          <LiveTradingSimulationCard
            variant="compact"
            onExpandTerminal={() => setIsTradingTerminalOpen(true)}
            className="pm-card"
          />

          {/* Active Holdings */}
          <div className="pm-card rounded-2xl p-5 sm:p-6">
            <div id="active_investments_section" className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[var(--pm-border)]">
              <div className="flex items-center gap-2.5">
                <h3 className="font-serif text-xl sm:text-2xl font-semibold">
                  Active Holdings ({activeInvestments.length})
                </h3>
                <button
                  type="button"
                  onClick={handleRefreshInvestments}
                  disabled={isRefreshingInvestments}
                  className="p-1.5 rounded-lg border border-[var(--pm-border)] opacity-70 hover:opacity-100 transition-opacity disabled:opacity-40 cursor-pointer"
                  title="Refresh"
                  aria-label="Refresh holdings"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshingInvestments ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <span className="text-[11px] font-mono opacity-60 hidden sm:inline">
                DLD · DIFC SPV
              </span>
            </div>

            <div className="space-y-4">
              {/* SKELETON SCREEN LOADER: Mimics property card layout while investment data is being fetched/synchronized */}
              {(!isDbLoaded || supabaseStatus === 'loading' || isRefreshingInvestments) ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-mono px-1">
                    <span className="flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Syncing UAE Property Stakes &amp; Title Records...
                    </span>
                    <span className="text-[11px] text-slate-500">Dubai Land Department Registry</span>
                  </div>
                  <PropertyCardSkeleton count={Math.max(activeInvestments.length, 2)} variant="investment" />
                </div>
              ) : activeInvestments.length === 0 ? (
                <div className="text-center py-12 bg-[#06080e]/90 rounded-2xl border border-dashed border-amber-500/25 p-6">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
                    <Building className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#f7ecd5]">No active property investments yet.</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Acquire your first fractional co-ownership stake in Dubai Marina, JVC, DIFC, or Creek Harbour starting from ₦15,000 to receive weekly Friday payouts.
                  </p>
                  <button
                    onClick={() => setActiveTab('invest')}
                    className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95"
                  >
                    Explore UAE Properties →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeInvestments.map((inv) => {
                    const percentComplete = (inv.weeksPaid / inv.totalWeeks) * 100;
                    const autoRenewLockUntil = inv.autoReinvestLockedUntil ? new Date(inv.autoReinvestLockedUntil).getTime() : 0;
                    const isAutoRenewLocked = autoRenewLockUntil > Date.now();
                    const matchPlan = INVESTMENT_PLANS.find(p => p.id === inv.planId || p.name.toLowerCase() === (inv.planName || '').toLowerCase());
                    const propName = inv.propertyName || matchPlan?.propertyName || matchPlan?.name || inv.planName;
                    const propImg = inv.propertyImage || matchPlan?.propertyImage || '/properties/marina_bay_residences.jpg';
                    const propAddr = inv.propertyAddress || matchPlan?.propertyAddress || 'Plot 392-581, Marina Promenade, Dubai Marina, Dubai, UAE';
                    const deedCode = inv.deedReferenceCode || `UAE-DLD-2026-${inv.id.slice(-6).toUpperCase()}`;

                    return (
                      <div key={inv.id} className="cv-auto bg-gradient-to-b from-[#0e1424] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl hover:border-amber-400/50 transition-all">
                        {/* Brand background watermark */}
                        <div className="absolute right-2 top-2 opacity-5 pointer-events-none">
                          <Building className="w-24 h-24 text-amber-400" />
                        </div>

                        <div>
                          {/* Property Header with Thumbnail */}
                          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-amber-500/15">
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-amber-500/30 shadow-md relative bg-slate-900">
                              <img 
                                src={propImg} 
                                alt={propName}
                                className="w-full h-full object-cover" 
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-sm font-black text-[#f7ecd5] uppercase tracking-tight truncate">
                                  {propName}
                                </span>
                                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-sm font-bold text-[9px] shrink-0 font-mono tracking-wider uppercase">
                                  ACTIVE DEED
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate mt-0.5">
                                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate">{propAddr}</span>
                              </div>
                              <div className="text-[10px] text-amber-400/70 font-mono mt-0.5">
                                Deed Ref: {deedCode}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 my-2 text-xs border-b border-amber-500/15 pb-3">
                            <div>
                              <span className="text-slate-400 block font-light text-[11px]">Invested Capital</span>
                              <span className="text-sm font-bold text-white font-mono">₦{inv.cost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-light text-[11px]">Total Returns (24w)</span>
                              <span className="text-sm font-bold text-amber-400 font-mono">₦{inv.totalReturns.toLocaleString()}</span>
                            </div>
                            <div className="col-span-2 pt-1.5 border-t border-amber-500/10 flex items-center justify-between">
                              <div>
                                <span className="text-slate-400 block font-light text-[10px]">Weekly Friday Payout</span>
                                <span className="text-sm font-extrabold text-emerald-400 font-mono">₦{inv.weeklyPayout.toLocaleString()} / week</span>
                              </div>
                              {inv.autoReinvest && (
                                <div className="text-right">
                                  <span className="text-[10px] text-amber-300 font-bold flex items-center justify-end gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400" /> With +3% Rollover:
                                  </span>
                                  <span className="text-xs font-bold text-emerald-400 font-mono">
                                    ₦{(inv.weeklyPayout + Math.round(inv.weeklyPayout * 0.03)).toLocaleString()} / week
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="my-2.5">
                            <div className="flex justify-between text-[11px] mb-1 font-mono text-slate-400">
                              <span>Cycle Progress</span>
                              <span className="text-amber-400">Week {inv.weeksPaid} of {inv.totalWeeks} Paid</span>
                            </div>
                            <div className="w-full bg-[#06080e] h-2 rounded-full overflow-hidden border border-amber-500/15">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percentComplete}%` }}
                              />
                            </div>
                          </div>

                          {/* Live Payout Countdown Timer */}
                          <div className="my-2">
                            <PayoutCountdown 
                              targetDate={inv.nextPayoutDate} 
                              isCompleted={inv.status === 'completed' || inv.weeksPaid >= inv.totalWeeks}
                              isLocked={inv.isTimerLocked || currentUser?.isTimerLocked} 
                            />
                          </div>

                          <AutoRenewControl investment={inv} onToggle={toggleAutoReinvest} />

                          {/* Official Deed Button */}
                          <button
                            type="button"
                            onClick={() => setViewingDeedInvestment(inv)}
                            className="w-full mt-3 py-2 px-3 rounded-lg border border-[var(--pm-border-strong)] hover:bg-[var(--pm-surface-subtle)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="View DLD Co-Ownership Deed"
                          >
                            <Award className="w-3.5 h-3.5 text-[#0B7A4E]" />
                            <span>View Title Deed</span>
                          </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[10px] text-slate-400 font-mono">
                            <span>Invested: {new Date(inv.createdAt).toLocaleDateString()}</span>
                          </div>
                          <InvestmentPayoutButton
                            investment={inv}
                            onPayout={processSingleInvestmentPayout}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Plans & Rollover Section */}
            {completedInvestments.length > 0 && (
              <div className="mt-6 pt-5 border-t border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7ecd5] font-mono">
                      Completed Plans ({completedInvestments.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Eligible for Rollover (+3% Weekly Payout Increment)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {completedInvestments.map(inv => {
                    const rolloverBonus = Math.round(inv.weeklyPayout * 0.03);
                    return (
                      <div key={inv.id} className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between shadow-lg">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[#f7ecd5] uppercase tracking-wider">{inv.planName}</span>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                              Completed ({inv.totalWeeks} Wks)
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-300 my-2 py-2 border-y border-amber-500/15">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-light">Weekly Payout</span>
                              <span className="font-bold text-white font-mono">₦{inv.weeklyPayout.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-400 font-semibold block">Rollover Yield (+3%)</span>
                              <span className="font-bold text-emerald-400 font-mono">₦{(inv.weeklyPayout + rolloverBonus).toLocaleString()} / wk</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[9px] text-slate-400">
                            +₦{rolloverBonus.toLocaleString()} bonus on weekly payouts
                          </span>
                          <button
                            type="button"
                            onClick={() => rolloverInvestment(inv.id)}
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                            id={`btn_rollover_${inv.id}`}
                            title="Rollover this plan into a fresh 24-week cycle with 3% weekly increment"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Rollover Plan</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User History List */}
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#070a12] border border-amber-500/25 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-base font-bold text-[#f7ecd5] uppercase tracking-wider mb-4 border-b border-amber-500/20 pb-3 font-mono">
              Recent Transactions
            </h3>

            {userRecentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No transaction history found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-300">
                  <thead>
                    <tr className="border-b border-amber-500/20 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="pb-2.5 font-mono">Date</th>
                      <th className="pb-2.5">Type</th>
                      <th className="pb-2.5">Description</th>
                      <th className="pb-2.5 text-right">Amount</th>
                      <th className="pb-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10">
                    {userRecentTransactions.map((tx) => {
                      let typeColor = 'text-amber-400';
                      if (tx.type === 'deposit') typeColor = 'text-emerald-400';
                      if (tx.type === 'referral_bonus') typeColor = 'text-amber-300';
                      if (tx.type === 'withdrawal' && tx.status === 'completed') typeColor = 'text-rose-400';

                      return (
                        <tr key={tx.id} className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className={`py-3 font-semibold capitalize whitespace-nowrap ${typeColor}`}>
                            {tx.type.replace('_', ' ')}
                          </td>
                          <td className="py-3 text-slate-300 text-[11px] max-w-xs truncate">
                            {tx.description}
                          </td>
                          <td className="py-3 text-right font-bold font-mono text-white whitespace-nowrap">
                            ₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                          </td>
                          <td className="py-3 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                              tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                              tx.status === 'pending' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                              'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}>
                              {tx.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROPERTIES TAB */}
      {activeTab === 'invest' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[var(--pm-border)]">
            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold">Dubai Property Offerings</h3>
              <p className="text-xs opacity-65 mt-0.5">24-week tenure · Weekly Friday cash returns</p>
            </div>
            <span className="text-xs font-mono opacity-70">
              Wallet: ₦{(currentUser.walletBalance || 0).toLocaleString()}
            </span>
          </div>

          <LiveTradingSimulationCard
            onExpandTerminal={() => setIsTradingTerminalOpen(true)}
            className="pm-card"
          />

          {(!isDbLoaded || supabaseStatus === 'loading' || isRefreshingInvestments) ? (
            <PropertyCardSkeleton count={3} variant="plan" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INVESTMENT_PLANS.map((plan) => {
                const isAffordable = currentUser.walletBalance >= plan.cost;
                return (
                  <article
                    key={plan.id}
                    className={`cv-auto pm-card rounded-2xl flex flex-col justify-between overflow-hidden transition-colors duration-200 ${
                      justActivatedPlanId === plan.id
                        ? 'ring-2 ring-[#0B7A4E]'
                        : investingPlanId === plan.id
                        ? 'ring-2 ring-[#9A7B3E]'
                        : ''
                    }`}
                  >
                    {/* Clean Full-Bleed Architectural Photo (Zero Corner Pills, Theme-Immune Scrim Text) */}
                    <div className="relative h-44 w-full overflow-hidden bg-[#18222B] group">
                      <img
                        src={plan.propertyImage}
                        alt={plan.propertyName || plan.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                      <div className="pm-photo-overlay absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                        <span className="text-xs font-medium truncate">{plan.propertyType}</span>
                        <span className="pm-photo-sub text-[11px] font-mono tabular-nums shrink-0">
                          {plan.occupancyRate}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3.5">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide opacity-60 font-medium">
                            {plan.propertyLocation.split(',')[0]} · DLD Verified
                          </p>
                          <h4 className="font-serif text-xl font-semibold mt-0.5 leading-snug">
                            {plan.propertyName || plan.name}
                          </h4>
                          <p className="text-[11px] font-mono opacity-60 mt-1 truncate">
                            Makani {plan.makaniNumber} · {plan.cadastralId}
                          </p>
                        </div>

                        {/* Flat Hairline Ledger */}
                        <div className="border-y border-[var(--pm-border)] py-3 space-y-2 text-xs">
                          <div className="flex justify-between items-baseline">
                            <span className="opacity-65">Capital</span>
                            <span className="font-mono text-sm font-semibold tabular-nums">
                              ₦{plan.cost.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="opacity-65">Friday Payout</span>
                            <span className="font-mono text-sm font-semibold tabular-nums text-[#0B7A4E]">
                              ₦{plan.weeklyPayout.toLocaleString()}/wk
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="opacity-65">24-Week Return</span>
                            <span className="font-mono text-sm font-semibold tabular-nums text-[#9A7B3E]">
                              ₦{plan.totalReturns.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {isAffordable ? (
                          <button
                            onClick={() => handlePurchase(plan)}
                            disabled={investingPlanId === plan.id}
                            className="w-full py-2.5 px-4 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            id={`btn_purchase_${plan.id}`}
                          >
                            {justActivatedPlanId === plan.id ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Activated</span>
                              </>
                            ) : investingPlanId === plan.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Activating…</span>
                              </>
                            ) : (
                              `Acquire · ₦${plan.cost.toLocaleString()}`
                            )}
                          </button>
                        ) : (
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => setShortfallPlan(plan)}
                              className="w-full py-2.5 px-4 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                              id={`btn_fund_wallet_${plan.id}`}
                            >
                              <Wallet className="w-3.5 h-3.5 shrink-0" />
                              <span>Top Up ₦{(plan.cost - (currentUser.walletBalance || 0)).toLocaleString()}</span>
                            </button>
                            <div className="flex items-center justify-between text-[11px] font-mono opacity-65 px-0.5">
                              <span>Wallet: ₦{(currentUser.walletBalance || 0).toLocaleString()}</span>
                              <span>Shortfall: ₦{(plan.cost - (currentUser.walletBalance || 0)).toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setSampleDeedPlan(plan)}
                          className="w-full py-2 px-3 rounded-lg text-xs font-medium opacity-75 hover:opacity-100 hover:bg-[var(--pm-surface-subtle)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-[#9A7B3E]" />
                          <span>Preview Title Deed</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FINANCE (DEPOSIT & WITHDRAWAL) TAB */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="deposit_form_container">
          {/* DEPOSIT MODULE (DIRECT BANK TRANSFER & RECEIPT PROOF) */}
          <div className="pm-card rounded-2xl p-6 space-y-5">
            <div className="border-b border-[var(--pm-border)] pb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-semibold flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-[#0B7A4E]" />
                  Deposit Funds
                </h3>
                <p className="text-xs opacity-65 mt-0.5">
                  Transfer to either reserve account below and upload your receipt. Credited within 10–30 minutes.
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#0B7A4E] shrink-0">Bank Transfer</span>
            </div>

            <div className="space-y-4">
              {/* Treasure Homes Reserve Accounts */}
                <div className="space-y-2.5">
                  <div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">
                    Reserve Bank Accounts
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Account 1: PAGA */}
                    <div className="pm-card-subtle p-3.5 rounded-xl space-y-1.5 text-xs relative overflow-hidden">
                      <div className="text-[10px] font-mono uppercase tracking-wider opacity-55">
                        Account 1
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bank Name:</span>
                        <span className="font-semibold text-white">PAGA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Name:</span>
                        <span className="font-semibold text-white">EZE JUDE TREASURE</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-amber-500/15">
                        <span className="text-slate-400">Account No:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-400 font-mono text-sm">0001327256</span>
                          {copiedAccount ? (
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider font-mono">Copied!</span>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('0001327256');
                                setCopiedAccount(true);
                                setTimeout(() => setCopiedAccount(false), 2000);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Copy Account Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account 2: Moniepoint */}
                    <div className="pm-card-subtle p-3.5 rounded-xl space-y-1.5 text-xs relative overflow-hidden">
                      <div className="text-[10px] font-mono uppercase tracking-wider opacity-55">
                        Account 2
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bank Name:</span>
                        <span className="font-semibold text-white">Moniepoint</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Name:</span>
                        <span className="font-semibold text-white">EZE JUDE TREASURE</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-amber-500/15">
                        <span className="text-slate-400">Account No:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-400 font-mono text-sm">6814600103</span>
                          {copiedAccount2 ? (
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider font-mono">Copied!</span>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('6814600103');
                                setCopiedAccount2(true);
                                setTimeout(() => setCopiedAccount2(false), 2000);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Copy Account Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Transfer Amount (₦)</label>
                    <input 
                      type="number" 
                      value={depAmount}
                      onChange={(e) => setDepAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Payment Method</label>
                    <select 
                      value={depMethod}
                      onChange={(e) => setDepMethod(e.target.value)}
                      className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    >
                      <option>Bank Transfer (Treasure Homes Reserve)</option>
                      <option>USDT-TRC20 Stablecoin Account</option>
                      <option>Naira Cards (Instant Gateway)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Sender Bank & Name / Transaction Reference</label>
                    <input 
                      type="text" 
                      value={depDetails}
                      onChange={(e) => setDepDetails(e.target.value)}
                      placeholder="e.g. Access Bank - John Doe Transfer"
                      className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>

                  {/* Receipt Upload with Drag & Drop & Click */}
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-400 font-medium">Attach Receipt / Payment Proof</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        dragActive 
                          ? 'border-amber-400 bg-amber-500/10' 
                          : 'border-amber-500/30 bg-[#06080e] hover:border-amber-400 hover:bg-[#0b101c]'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="receipt-upload-input" 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="receipt-upload-input" className="cursor-pointer block space-y-1.5">
                        <UploadCloud className="w-6 h-6 text-[#0B7A4E] mx-auto" />
                        <div className="text-xs opacity-80">
                          {receiptFile ? (
                            <span className="font-semibold text-[#0B7A4E] font-mono text-[11px] break-all">
                              Selected: {receiptFile.name}
                            </span>
                          ) : (
                            <span>Drop receipt here, or <strong className="text-[#0B7A4E] hover:underline">browse files</strong></span>
                          )}
                        </div>
                        <p className="text-[10px] opacity-55">PNG, JPG, or PDF (Max 5MB)</p>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                    id="btn_submit_deposit"
                  >
                    Submit Deposit Receipt
                  </button>
                </form>
              </div>

            {/* List of User Pending Deposits */}
            {pendingDeposits.length > 0 && (
              <div className="pt-3 border-t border-[var(--pm-border)] space-y-2">
                <h4 className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                  <Clock className="w-3.5 h-3.5 text-[#9A7B3E]" /> Pending Deposits ({pendingDeposits.length})
                </h4>
                {pendingDeposits.map(t => (
                  <div key={t.id} className="pm-card-subtle p-3 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold font-mono">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{t.paymentMethod} · {new Date(t.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-[10px] text-[#9A7B3E] font-mono uppercase font-semibold">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WITHDRAWAL MODULE */}
          <div className="pm-card rounded-2xl p-6 space-y-5">
            <div className="border-b border-[var(--pm-border)] pb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl font-semibold flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-[#9A7B3E]" />
                  Withdraw to Bank
                </h3>
                <p className="text-xs opacity-65 mt-0.5">
                  Minimum withdrawal ₦{settings.minWithdrawal.toLocaleString()}. Settled directly to your Nigerian bank account.
                </p>
              </div>
              <span className="text-[11px] font-medium opacity-65 shrink-0">NIBSS</span>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Withdrawal Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-amber-400 text-sm">₦</span>
                  <input 
                    type="number" 
                    value={withAmount}
                    onChange={(e) => setWithAmount(e.target.value)}
                    placeholder={`Min ₦${settings.minWithdrawal.toLocaleString()}`}
                    min={settings.minWithdrawal}
                    className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2.5 px-3 pl-8 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Destination Nigerian Bank Selector */}
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Select Destination Nigerian Bank</label>
                <select
                  value={selectedBankCode}
                  onChange={(e) => setSelectedBankCode(e.target.value)}
                  className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code} className="bg-slate-900 text-white">
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 10-Digit NUBAN Account Number */}
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">10-Digit NUBAN Account Number</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 0123456789"
                  className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2.5 px-3 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Live NIBSS Account Resolution Indicator */}
              {accountResolution && (
                <div className="bg-[#061811] border border-emerald-500/30 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block font-mono">Account Name Verified (NIBSS)</span>
                    <span className="font-bold text-white">{accountResolution.name}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer bg-[#0B7A4E] hover:bg-[#08633E] text-white"
                id="btn_submit_withdrawal"
              >
                {settings.automatedPayouts ? (
                  <span>Withdraw ₦{Number(withAmount || 0).toLocaleString()}</span>
                ) : (
                  <span>Request Bank Withdrawal</span>
                )}
              </button>
            </form>

            {/* List of User Pending Withdrawals */}
            {pendingWithdrawals.length > 0 && (
              <div className="pt-3 border-t border-[var(--pm-border)] space-y-2">
                <h4 className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                  <Clock className="w-3.5 h-3.5 text-[#9A7B3E]" /> Pending Withdrawals ({pendingWithdrawals.length})
                </h4>
                {pendingWithdrawals.map(t => (
                  <div key={t.id} className="pm-card-subtle p-3 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold font-mono">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">To: {t.accountDetails}</p>
                      {t.gatewayReference && (
                        <p className="text-[10px] font-mono text-[#0B7A4E] mt-0.5">Ref: {t.gatewayReference}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#9A7B3E] font-mono uppercase font-semibold">
                      Processing
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* REFERRAL TAB */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          <div className="pm-card rounded-2xl p-6 text-center max-w-3xl mx-auto space-y-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold">Partner Program</h3>
              <p className="text-xs opacity-65 mt-1">
                Earn a 7.5% weekly override on every Friday payout credited to your invited investors.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <div className="pm-card-subtle inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs">
                <span className="opacity-65">Code:</span>
                <strong className="font-mono text-sm font-semibold tracking-wider">{currentUser.referralCode}</strong>
                <button
                  onClick={handleCopyCode}
                  className="text-[#0B7A4E] hover:underline font-semibold flex items-center gap-1 cursor-pointer ml-1"
                  title="Copy code"
                >
                  {copiedCode ? 'Copied' : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy invite link"
              >
                {copiedLink ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Link2 className="w-3.5 h-3.5" /> Copy Invite Link</>}
              </button>

              <button
                type="button"
                onClick={() => setIsPitchModalOpen(true)}
                className="pm-btn-secondary font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                id="btn_user_whatsapp_multilingual_pitch"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#0B7A4E]" />
                <span>Share Pitch (6 Languages)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="pm-card rounded-xl p-5 text-center">
              <p className="text-xs opacity-65">Invited Partners</p>
              <h3 className="text-3xl font-mono font-semibold mt-1">{referredUsers.length}</h3>
            </div>

            <div className="pm-card rounded-xl p-5 text-center">
              <p className="text-xs opacity-65">Downline Capital</p>
              <h3 className="text-3xl font-mono font-semibold mt-1">
                ₦{investments
                  .filter(inv => referredUsers.some(ru => ru.id === inv.userId) && inv.status === 'active')
                  .reduce((sum, inv) => sum + inv.cost, 0)
                  .toLocaleString()}
              </h3>
            </div>

            <div className="pm-card rounded-xl p-5 text-center">
              <p className="text-xs opacity-65">Override Earned</p>
              <h3 className="text-3xl font-mono font-semibold text-[#0B7A4E] mt-1">₦{totalReferralBonus.toLocaleString()}</h3>
            </div>
          </div>

          {/* List of Referred Users */}
          <div className="pm-card rounded-2xl p-6">
            <h3 className="font-serif text-xl font-semibold mb-4 border-b border-[var(--pm-border)] pb-3">
              Downline ({referredUsers.length})
            </h3>
            {referredUsers.length === 0 ? (
              <p className="text-xs opacity-60 text-center py-6">No referrals yet. Share your invite link to start earning.</p>
            ) : (
              <div className="space-y-3">
                {referredUsers.map(ru => {
                  const ruInvestments = investments.filter(inv => inv.userId === ru.id && inv.status === 'active');
                  return (
                    <div key={ru.id} className="pm-card-subtle p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                      <div>
                        <p className="font-semibold">{ru.name}</p>
                        <p className="text-[11px] opacity-60 font-mono mt-0.5">Joined {new Date(ru.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className="opacity-60 block text-[10px]">Active Plans</span>
                          <span className="font-semibold font-mono">
                            {ruInvestments.length > 0 
                              ? `${ruInvestments.length} (₦${ruInvestments.reduce((s, i) => s + i.cost, 0).toLocaleString()})`
                              : 'None'
                            }
                          </span>
                        </div>
                        {ruInvestments.length > 0 && (
                          <span className="text-[#0B7A4E] font-mono text-[11px] font-semibold">
                            +₦{(ruInvestments.reduce((s, i) => s + i.weeklyPayout, 0) * 0.5).toLocaleString()}/wk
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Investment FAQ Accordion Section */}
      <div className="mt-12 pt-8 border-t border-[var(--pm-border)]">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="text-center">
            <h3 className="font-serif text-2xl font-semibold">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-2.5">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="pm-card rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-xs sm:text-sm focus:outline-none cursor-pointer"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 opacity-55 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#0B7A4E]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 text-xs opacity-75 leading-relaxed border-t border-[var(--pm-border)]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POST-INVESTMENT ACTIVATION MODAL */}
      {activatedPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="pm-card rounded-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden animate-scaleUp">
            <button
              onClick={() => setActivatedPlanModal(null)}
              className="absolute top-4 right-4 opacity-60 hover:opacity-100 p-1.5 rounded-lg transition-opacity cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#0B7A4E]/12 text-[#0B7A4E] rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#0B7A4E]">
                Contract Activated
              </span>

              <h3 className="font-serif text-2xl font-semibold mt-1">
                {activatedPlanModal.plan.name}
              </h3>
              <p className="text-xs opacity-65 mt-1">
                Your 24-week property deed is active and scheduled for Friday payouts.
              </p>
            </div>

            {/* Contract Highlights */}
            <div className="my-5 bg-[#06080e]/90 border border-amber-500/30 rounded-2xl p-4 space-y-2.5 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Invested Capital:</span>
                <span className="font-extrabold text-white text-sm font-mono">₦{activatedPlanModal.plan.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Weekly Direct Payout:</span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">₦{activatedPlanModal.plan.weeklyPayout.toLocaleString()} / wk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Total Returns (24 Weeks):</span>
                <span className="font-extrabold text-amber-400 text-sm font-mono">₦{activatedPlanModal.plan.totalReturns.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-amber-500/20">
                <PayoutCountdown targetDate={activatedPlanModal.nextPayoutDate} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const plan = activatedPlanModal.plan;
                  const deedInv: UserInvestment = {
                    id: 'inv_' + Date.now(),
                    userId: currentUser.id,
                    userName: currentUser.name,
                    planId: plan.id,
                    planName: plan.name,
                    propertyName: plan.propertyName || plan.name,
                    propertyLocation: plan.propertyLocation || 'Dubai Marina, Dubai, UAE',
                    propertyAddress: plan.propertyAddress || 'Plot 392-581, Marina Promenade, Dubai Marina, Dubai, UAE',
                    propertyImage: plan.propertyImage || '/properties/marina_bay_residences.jpg',
                    propertyType: plan.propertyType || 'Executive Studio Waterfront Stake',
                    occupancyRate: plan.occupancyRate || '98.4%',
                    deedTier: plan.deedTier || `${plan.name} Title Deed`,
                    cadastralId: plan.cadastralId || 'DLD-CAD-392-581',
                    makaniNumber: plan.makaniNumber || '12845 76291',
                    deedReferenceCode: `DLD-REG-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    cost: plan.cost,
                    weeklyPayout: plan.weeklyPayout,
                    totalReturns: plan.totalReturns,
                    weeksPaid: 0,
                    totalWeeks: plan.weeksDuration || 24,
                    status: 'active',
                    createdAt: new Date().toISOString()
                  };
                  setViewingDeedInvestment(deedInv);
                  setActivatedPlanModal(null);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>📜 Receive & Inspect Title Deed</span>
              </button>

              <button
                onClick={() => {
                  setActivatedPlanModal(null);
                  setActiveTab('overview');
                  setTimeout(() => {
                    document.getElementById('active_investments_section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full py-2.5 rounded-xl bg-[#06080e] hover:bg-[#111728] border border-amber-500/30 text-amber-300 font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                id="btn_modal_go_portfolio"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>View in My Portfolio</span>
              </button>

              <button
                onClick={() => setActivatedPlanModal(null)}
                className="w-full py-2 rounded-xl border border-amber-500/20 hover:bg-white/5 text-slate-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Done / Explore More Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official UAE Property Deed & Backing Documents Modal */}
      <UaeDeedModal
        isOpen={!!viewingDeedInvestment || !!sampleDeedPlan}
        onClose={() => {
          setViewingDeedInvestment(null);
          setSampleDeedPlan(null);
        }}
        investment={
          viewingDeedInvestment || 
          (sampleDeedPlan ? {
            id: 'sample_' + sampleDeedPlan.id,
            userId: currentUser.id,
            userName: currentUser.name,
            planId: sampleDeedPlan.id,
            planName: sampleDeedPlan.name,
            propertyName: sampleDeedPlan.propertyName,
            propertyLocation: sampleDeedPlan.propertyLocation,
            propertyAddress: sampleDeedPlan.propertyAddress,
            propertyImage: sampleDeedPlan.propertyImage,
            propertyType: sampleDeedPlan.propertyType,
            occupancyRate: sampleDeedPlan.occupancyRate,
            deedTier: sampleDeedPlan.deedTier,
            cadastralId: sampleDeedPlan.cadastralId,
            makaniNumber: sampleDeedPlan.makaniNumber,
            deedReferenceCode: `DLD-SAMPLE-${sampleDeedPlan.id.toUpperCase()}`,
            cost: sampleDeedPlan.cost,
            weeklyPayout: sampleDeedPlan.weeklyPayout,
            totalReturns: sampleDeedPlan.totalReturns,
            weeksPaid: 0,
            totalWeeks: sampleDeedPlan.weeksDuration || 24,
            status: 'active',
            createdAt: new Date().toISOString()
          } : null)
        }
      />


      {/* Insufficient Funds Modal */}
      {shortfallPlan && (
        <InsufficientFundsModal
          isOpen={!!shortfallPlan}
          onClose={() => setShortfallPlan(null)}
          plan={shortfallPlan}
          walletBalance={currentUser.walletBalance || 0}
          onNavigateToDeposit={(amount) => {
            setShortfallPlan(null);
            setDepAmount(amount.toString());
            setActiveTab('finance');
            setTimeout(() => {
              document.getElementById('deposit_form_container')?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }}
        />
      )}

      {/* Multilingual Pitch Modal */}
      <MultilingualPitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        marketerName={currentUser.name}
        referralCode={currentUser.referralCode}
        referralLink={typeof window !== 'undefined' ? `${window.location.origin}/?ref=${currentUser.referralCode}` : `https://treasurehomes.ng/?ref=${currentUser.referralCode}`}
      />

      {/* Live Property Candlestick Trading Terminal Modal */}
      <LivePropertyTradingModal
        isOpen={isTradingTerminalOpen}
        onClose={() => setIsTradingTerminalOpen(false)}
        userInvestments={activeInvestments}
        onExplorePlans={() => {
          setIsTradingTerminalOpen(false);
          setActiveTab('invest');
        }}
      />
    </div>
  );
};
