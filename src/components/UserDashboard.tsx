import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  FileText, 
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
import { CommunityBanner, WHATSAPP_COMMUNITY_URL } from './CommunityBanner';
import { UaeDeedModal } from './UaeDeedModal';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';
import { InsufficientFundsModal } from './InsufficientFundsModal';
import { MultilingualPitchModal } from './MultilingualPitchModal';
import { PWAInstallButton } from './PWAInstallButton';
import { UaeFlag } from './UaeFlag';
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
    submitKyc,
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

  const [activeTab, setActiveTab] = useState<'overview' | 'invest' | 'finance' | 'referrals' | 'kyc'>('overview');
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

  // Dashboard Menu Items for Hamburger & Tab Navigation
  const menuItems: {
    id: 'overview' | 'invest' | 'finance' | 'referrals' | 'kyc';
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Your wallet, weekly profits & active plans',
      icon: TrendingUp,
    },
    {
      id: 'invest',
      label: 'Acquire Stakes',
      description: 'Choose a property plan starting from ₦30,000',
      icon: Sparkles,
      badge: <span className="border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm">FROM ₦30K</span>
    },
    {
      id: 'finance',
      label: 'Deposit & Withdraw',
      description: 'Add money to wallet or send cash to your bank',
      icon: Wallet,
    },
    {
      id: 'referrals',
      label: 'Partner Share (7.5%)',
      description: 'Invite institutional co-investors and earn 7.5% weekly',
      icon: Users,
      badge: <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm">7.5%</span>
    },
    {
      id: 'kyc',
      label: 'Identity Verification',
      description: 'Verify your ID for fast bank withdrawals',
      icon: FileText,
      badge: currentUser?.kycStatus === 'verified' ? (
        <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-sm uppercase">Verified</span>
      ) : currentUser?.kycStatus === 'pending' ? (
        <span className="border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-sm uppercase">Pending</span>
      ) : (
        <span className="border border-slate-700 bg-slate-800 text-slate-400 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-sm uppercase">Unverified</span>
      )
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

  // KYC state
  const [kycName, setKycName] = useState<string>(currentUser?.name || '');
  const [kycType, setKycType] = useState<string>('National ID Card');
  const [kycNumber, setKycNumber] = useState<string>('');

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

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc(kycName, kycType, kycNumber);
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

      {/* KYC Alert banner if unverified */}
      {currentUser.kycStatus === 'unverified' && (
        <div className="mb-5 bg-gradient-to-r from-[#141006] via-[#0d0f17] to-[#0c101c] border border-amber-500/35 text-amber-200 px-4 py-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#f7ecd5] text-sm">Please Verify Your ID</p>
              <p className="text-slate-400 mt-0.5">Verify your ID so you can withdraw money to your bank account anytime without clearance delays.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('kyc')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all self-start sm:self-auto shrink-0 text-xs shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
            id="btn_kyc_alert_action"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* Real Investor vs Unfunded Lead Status Callout */}
      {isRealInvestor ? (
        <div className="mb-5 bg-gradient-to-r from-[#071710] via-[#091b14] to-[#06120c] border border-emerald-500/35 text-emerald-200 px-4 py-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase font-mono tracking-wider text-emerald-300">VERIFIED REAL INVESTOR</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">₦{totalPaidTopup.toLocaleString()} Paid Top-Up</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">Your wallet is backed by completed real funds. Every Friday property yield will be credited to this balance.</p>
            </div>
          </div>
          <span className="text-[10px] text-amber-300 bg-[#06080e] border border-amber-500/30 px-3 py-1 rounded-xl font-mono font-semibold self-start sm:self-auto shrink-0 shadow-sm">
            TREASURE HOMES SECURED
          </span>
        </div>
      ) : currentUser.walletBalance > 0 ? null : (
        <div className="mb-5 bg-gradient-to-r from-[#171206] via-[#10141f] to-[#0a0d16] border border-amber-500/35 text-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 font-bold font-mono">⚡</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase tracking-wide text-amber-300">UNFUNDED LEAD ACCOUNT</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">Awaiting First Deposit</span>
              </div>
              <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">Add money to your wallet to become a <strong className="text-emerald-400">Verified Real Investor</strong> and start receiving cash payouts in your bank every Friday.</p>
            </div>
          </div>
          <button type="button" onClick={() => setActiveTab('finance')} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all self-start sm:self-auto shrink-0 shadow-md cursor-pointer whitespace-nowrap active:scale-95" id="btn_unfunded_lead_topup">Top Up Wallet Now →</button>
        </div>
      )}

      {/* Official WhatsApp & Telegram Community Invitation Banner */}
      <CommunityBanner />

      {/* Responsive Hamburger Navigation Bar & Dropdown Drawer */}
      <div className="mb-6 bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#06080e] hover:bg-[#111728] border border-amber-500/30 active:scale-95 text-[#f7ecd5] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0"
            id="btn_dashboard_hamburger"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
            <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse hidden xs:inline" />
          </button>

          {/* Current Active Section Badge */}
          <div className="flex items-center gap-1.5 bg-[#06080e] border border-amber-500/25 px-3 py-1.5 rounded-xl text-slate-200 text-xs font-bold truncate">
            <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-mono hidden sm:inline">Active:</span>
            {(() => {
              const currentItem = menuItems.find(m => m.id === activeTab) || menuItems[0];
              const CurrentIcon = currentItem.icon;
              return (
                <div className="flex items-center gap-1.5 truncate">
                  <CurrentIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[#f7ecd5] font-extrabold truncate">{currentItem.label}</span>
                </div>
              );
            })()}
          </div>

          {/* Desktop Navigation Tabs (visible on wide screens) */}
          <div className="hidden lg:flex items-center gap-1 border-l border-amber-500/20 pl-3 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); clearMessages(); setIsMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold border border-amber-400 shadow-md shadow-amber-500/15' 
                      : 'text-slate-400 hover:text-amber-200 hover:bg-amber-500/10'
                  }`}
                  id={`tab_desktop_${item.id}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950 font-bold' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Real-time sync badge */}
          {(isSyncing || pendingQueueLength > 0) && (
            <div className="shrink-0 flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 animate-pulse">
                <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span>{pendingQueueLength > 0 ? `Syncing (${pendingQueueLength})` : 'Cloud Sync...'}</span>
              </span>
            </div>
          )}
        </div>

        {/* Mobile / Expanded Hamburger Drawer with clean quick-navigation cards */}
        {isMenuOpen && (
          <div className="mt-3 pt-3 border-t border-amber-500/15 animate-fadeIn">
            <div className="px-1 mb-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <PmLogo className="w-5 h-5" />
                <span className="font-bold text-amber-300 uppercase tracking-wider">PM Invest Menus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-semibold">{menuItems.length} Available</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                      clearMessages();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                      isActive 
                        ? 'bg-gradient-to-b from-[#141b2d] to-[#0c1220] border-amber-400/80 shadow-md ring-1 ring-amber-400/40' 
                        : 'bg-[#06080e] hover:bg-[#0f1422] border-amber-500/20 hover:border-amber-500/40'
                    }`}
                    id={`menu_item_${item.id}`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm' 
                        : 'bg-[#0f1422] text-amber-400 group-hover:bg-amber-500/20'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold ${isActive ? 'text-[#f7ecd5] font-extrabold' : 'text-slate-200'}`}>
                          {item.label}
                        </span>
                        {item.badge}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-500/15 flex items-center justify-between text-xs text-slate-400">
              <span>Wallet: <strong className="text-amber-300 font-mono font-bold">₦{currentUser?.walletBalance.toLocaleString()}</strong></span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Close Menu ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* In-App Mobile PWA Installation Prompt */}
          <PWAInstallButton variant="banner" />

          {/* Top Quick Stats Grid in Luxury Obsidian & Brushed Gold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium font-sans uppercase tracking-wider">Wallet Balance</p>
                <h3 className="text-xl sm:text-2xl font-black text-[#f7ecd5] font-mono mt-1">₦{currentUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <span className="text-[10px] text-amber-400 font-medium font-sans">Ready to withdraw to your bank</span>
              </div>
              <div className="w-11 h-11 bg-[#06080e] border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400 shadow-md">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium font-sans uppercase tracking-wider">Money in Properties</p>
                <h3 className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                  ₦{activeInvestments.reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold font-sans">{activeInvestments.length} Active UAE Assets</span>
              </div>
              <div className="w-11 h-11 bg-[#06080e] border border-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-400 shadow-md">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium font-sans uppercase tracking-wider">Total Profit Collected</p>
                <h3 className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">₦{totalEarnedPayouts.toLocaleString()}</h3>
                <span className="text-[10px] text-slate-400 font-sans">Paid into your wallet</span>
              </div>
              <div className="w-11 h-11 bg-[#06080e] border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400 shadow-md">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-2xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium font-sans uppercase tracking-wider">Referral Bonus</p>
                <h3 className="text-xl sm:text-2xl font-black text-[#f7ecd5] font-mono mt-1">₦{totalReferralBonus.toLocaleString()}</h3>
                <span className="text-[10px] text-emerald-400 font-semibold font-sans">7.5% weekly bonus active</span>
              </div>
              <div className="w-11 h-11 bg-[#06080e] border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400 shadow-md">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Active Investments Registry */}
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#070a12] border border-amber-500/25 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div id="active_investments_section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-amber-500/20 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                  <h3 className="text-base font-black text-[#f7ecd5] uppercase tracking-wider font-mono">
                    My Active Investments ({activeInvestments.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleRefreshInvestments}
                    disabled={isRefreshingInvestments}
                    className="p-1 rounded-lg bg-[#06080e] border border-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Refresh investment status from Supabase"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRefreshingInvestments ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified UAE property deeds, payout schedules, and cadastral co-ownership records.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded-sm uppercase tracking-wider font-bold">
                  DLD VERIFIED
                </span>
                <span className="hidden sm:inline border border-amber-500/30 bg-amber-500/10 text-amber-300 px-2 py-1 rounded-sm uppercase tracking-wider font-bold">
                  DIFC SPV ESCROW
                </span>
              </div>
            </div>

            {/* Institutional DIFC SPV Trust & DLD Cadastral Verification Ledger */}
            <div className="bg-[#06080e]/95 border border-amber-500/20 rounded-xl p-4 my-3 text-xs shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono font-bold uppercase tracking-wider text-[#f7ecd5] text-[11px]">
                    DIFC SPV Trust &amp; Dubai Land Department (DLD) Registry
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    SPV Structure: DIFC Law No. 4
                  </span>
                  <span className="hidden sm:inline text-amber-500/40">|</span>
                  <span className="text-amber-300/80">Custodian: Treasure Homes Prime SPV</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-[11px] text-slate-300">
                <div className="bg-[#090d18] border border-amber-500/15 p-2.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Asset Freehold Title</span>
                  <p className="font-semibold text-[#f7ecd5]">DLD Registered Co-Ownership</p>
                  <p className="text-[10px] text-slate-400">Every fractional stake is backed by registered real estate titles in Dubai.</p>
                </div>

                <div className="bg-[#090d18] border border-amber-500/15 p-2.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Rental Yield Clearing</span>
                  <p className="font-semibold text-emerald-400">Friday Automated Settlements</p>
                  <p className="text-[10px] text-slate-400">24-week distribution schedule settled directly via secure banking escrow.</p>
                </div>

                <div className="bg-[#090d18] border border-amber-500/15 p-2.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Cadastral Makani Audit</span>
                  <p className="font-semibold text-amber-300">Official Municipal Geotag</p>
                  <p className="text-[10px] text-slate-400">Directly inspect title deeds, cadastral plot numbers, and escrow certificates.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
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
                    Acquire your first fractional co-ownership stake in Dubai Marina, DIFC, or Creek Harbour starting from ₦30,000 to receive weekly Friday payouts.
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

                          {/* Official Deed & Documents Button */}
                          <button
                            type="button"
                            onClick={() => setViewingDeedInvestment(inv)}
                            className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
                            title="View official DLD Co-Ownership Deed and backing contracts"
                          >
                            <Award className="w-4 h-4 text-slate-950" />
                            <span>📜 View Official Deed &amp; Property Documents</span>
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

      {/* INVEST / BUY PLANS TAB */}
      {activeTab === 'invest' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-6 shadow-2xl text-center max-w-3xl mx-auto backdrop-blur-md">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <UaeFlag size="xs" />
              <span>UAE Prime Real Estate Portfolio</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#f7ecd5] tracking-wide uppercase font-mono">UAE Institutional Property Plans</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto leading-relaxed">
              Acquire institutional co-ownership in verified luxury assets across Dubai Marina, DIFC, Palm Jumeirah, and Creek Harbour. All plans run for <strong className="text-amber-400">24 weeks</strong> with cash payouts paid into your wallet every Friday.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-[#06080e] px-4 py-1.5 rounded-full border border-amber-500/30 text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Backed by <strong className="text-amber-300">Dubai Land Department (DLD)</strong> Title Deeds &amp; Sovereign SPV Trust</span>
            </div>
          </div>

          {(!isDbLoaded || supabaseStatus === 'loading' || isRefreshingInvestments) ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono px-1">
                <span className="flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Synchronizing Dubai Land Department Property Offerings...
                </span>
                <span className="text-[11px] text-slate-500 font-mono">DLD Cadastral Registry</span>
              </div>
              <PropertyCardSkeleton count={3} variant="plan" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INVESTMENT_PLANS.map((plan) => {
                const isAffordable = currentUser.walletBalance >= plan.cost;
              return (
                <div 
                  key={plan.id} 
                  className={`cv-auto bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border rounded-2xl flex flex-col justify-between shadow-2xl transition-all duration-300 relative overflow-hidden ${
                    justActivatedPlanId === plan.id
                      ? 'border-emerald-500 ring-4 ring-emerald-500/30 shadow-2xl scale-[1.01]'
                      : investingPlanId === plan.id
                        ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl scale-[1.005]'
                        : isAffordable ? 'border-amber-500/30 hover:border-amber-400 hover:shadow-amber-500/10' : 'border-amber-500/15 opacity-90'
                  }`}
                >
                  {/* Property Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900 group">
                    <img 
                      src={plan.propertyImage} 
                      alt={plan.propertyName || plan.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-[#06080e]/40 to-transparent" />
                    <div className="absolute top-3 left-3 bg-[#06080e]/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <UaeFlag size="xs" />
                      <span>{plan.propertyLocation.split(',')[0]}</span>
                    </div>
                    <div className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-widest font-mono shadow-sm ${
                      justActivatedPlanId === plan.id ? 'bg-emerald-500 text-white animate-pulse' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'
                    }`}>
                      {justActivatedPlanId === plan.id ? 'ACTIVATED' : 'DLD VERIFIED'}
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                      <span className="font-semibold text-slate-200 truncate pr-2">{plan.propertyType}</span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0">
                        {plan.occupancyRate} Occupancy
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Property Name & Verified Address */}
                      <div className="mb-3">
                        <h4 className="text-lg font-black text-[#f7ecd5] uppercase tracking-tight">{plan.propertyName || plan.name}</h4>
                        <div className="flex items-start gap-1 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug text-slate-400 line-clamp-2">{plan.propertyAddress}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] font-mono">
                          <span className="bg-[#06080e] border border-amber-500/20 text-slate-300 px-2 py-0.5 rounded">
                            Makani: {plan.makaniNumber}
                          </span>
                          <span className="bg-[#06080e] border border-amber-500/20 text-slate-300 px-2 py-0.5 rounded">
                            Cadastral: {plan.cadastralId}
                          </span>
                        </div>
                      </div>

                      {/* Yield Numbers */}
                      <div className="my-4 bg-[#06080e]/90 border border-amber-500/20 p-3.5 rounded-xl space-y-2.5 shadow-inner">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-400 font-medium">Invested Capital:</span>
                          <span className="text-base font-black text-white font-mono">₦{plan.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-slate-400 font-medium">Weekly Friday Cash Payout:</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">₦{plan.weeklyPayout.toLocaleString()} / wk</span>
                        </div>
                        <div className="h-px bg-amber-500/15 w-full" />
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-amber-300 font-bold">Total Returns (24 Weeks):</span>
                          <span className="text-base font-black text-amber-400 font-mono">₦{plan.totalReturns.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Deed Guarantee Notice & Preview Button */}
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => setSampleDeedPlan(plan)}
                          className="w-full text-center py-2 px-3 rounded-xl bg-[#06080e] hover:bg-[#111728] border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-amber-400"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Preview Title Deed &amp; Backing Documents</span>
                        </button>
                      </div>
                    </div>

                    {isAffordable ? (
                      <button
                        onClick={() => handlePurchase(plan)}
                        disabled={investingPlanId === plan.id}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden active:scale-95 cursor-pointer ${
                          justActivatedPlanId === plan.id
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                            : investingPlanId === plan.id
                              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md animate-pulse cursor-wait'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer'
                        }`}
                        id={`btn_purchase_${plan.id}`}
                      >
                        {justActivatedPlanId === plan.id ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                            <span>Plan Activated!</span>
                          </>
                        ) : investingPlanId === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span className="tracking-widest">Activating Contract...</span>
                          </>
                        ) : (
                          `Invest ₦${plan.cost.toLocaleString()}`
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setShortfallPlan(plan)}
                          className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#06080e] hover:bg-[#111728] border border-amber-500/40 text-amber-300 flex items-center justify-center gap-2 shadow-sm hover:border-amber-400 transition-all cursor-pointer active:scale-95 font-sans"
                          id={`btn_fund_wallet_${plan.id}`}
                          title="Insufficient funds in wallet. Click to top up."
                        >
                          <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Top Up ₦{(plan.cost - (currentUser.walletBalance || 0)).toLocaleString()} to Invest</span>
                        </button>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-0.5">
                          <span>Wallet: <strong className={currentUser.walletBalance === 0 ? "text-rose-400 font-bold" : "text-white"}>₦{(currentUser.walletBalance || 0).toLocaleString()}</strong></span>
                          <span>Shortfall: <strong className="text-rose-400 font-bold">₦{(plan.cost - (currentUser.walletBalance || 0)).toLocaleString()}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-5 backdrop-blur-md">
            <div className="border-b border-amber-500/20 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  How to Add Money
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transfer from your bank app to either of our official accounts below. Enter the amount you sent and upload your receipt screenshot. Your wallet will be funded within 10 to 30 minutes.
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-emerald-300">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>DIRECT BANK TRANSFER</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Treasure Homes Reserve Accounts */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>OFFICIAL BANK ACCOUNTS FOR PAYMENT</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Account 1: PAGA */}
                    <div className="bg-[#06080e] border border-amber-500/30 p-3.5 rounded-xl space-y-1.5 text-xs relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-300 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-bl-lg border-l border-b border-amber-500/30">
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
                    <div className="bg-[#06080e] border border-amber-500/30 p-3.5 rounded-xl space-y-1.5 text-xs relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-bl-lg border-l border-b border-emerald-500/30">
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
                        <UploadCloud className="w-6 h-6 text-amber-400 mx-auto animate-bounce-slow" />
                        <div className="text-xs text-slate-300">
                          {receiptFile ? (
                            <span className="font-bold text-amber-400 font-mono text-[11px] break-all">
                              Selected: {receiptFile.name}
                            </span>
                          ) : (
                            <span>Drag and drop your receipt here, or <strong className="text-amber-400 hover:underline">browse files</strong></span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">Supports PNG, JPG, or PDF (Max 5MB)</p>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-950/20 cursor-pointer active:scale-95"
                    id="btn_submit_deposit"
                  >
                    I Have Sent The Money (Submit Receipt)
                  </button>
                </form>
              </div>

            {/* List of User Pending Deposits */}
            {pendingDeposits.length > 0 && (
              <div className="pt-3 border-t border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Deposit Approvals ({pendingDeposits.length})
                </h4>
                {pendingDeposits.map(t => (
                  <div key={t.id} className="bg-[#06080e] border border-amber-500/20 p-3 rounded-xl text-xs flex justify-between items-center shadow-inner">
                    <div>
                      <p className="font-bold text-white font-mono">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.paymentMethod} - {new Date(t.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-[9px] bg-amber-500/15 text-amber-300 px-2 py-0.5 border border-amber-500/30 rounded-full font-mono uppercase tracking-widest animate-pulse font-bold">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WITHDRAWAL MODULE */}
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-5 backdrop-blur-md">
            <div className="border-b border-amber-500/20 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <ArrowUpRight className="w-5 h-5 text-rose-400" />
                  Send Money to Your Bank
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter how much you want to withdraw and choose your bank. Your money will arrive in your bank account within a few hours.
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#06080e] border border-amber-500/25 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>BANK WITHDRAWAL</span>
              </div>
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
                className={`w-full py-3 rounded-xl text-xs uppercase tracking-wider font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 ${
                  settings.automatedPayouts 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-950/20' 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/10'
                }`}
                id="btn_submit_withdrawal"
              >
                {settings.automatedPayouts ? (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Withdraw Cash to My Bank (₦{Number(withAmount || 0).toLocaleString()})</span>
                  </>
                ) : (
                  <span>Withdraw Cash to My Bank</span>
                )}
              </button>
            </form>

            {/* List of User Pending Withdrawals */}
            {pendingWithdrawals.length > 0 && (
              <div className="pt-3 border-t border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Disbursals ({pendingWithdrawals.length})
                </h4>
                {pendingWithdrawals.map(t => (
                  <div key={t.id} className="bg-[#06080e] border border-amber-500/20 p-3 rounded-xl text-xs flex justify-between items-center shadow-inner">
                    <div>
                      <p className="font-bold text-white font-mono">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">To: {t.accountDetails}</p>
                      {t.gatewayReference && (
                        <p className="text-[9px] font-mono text-emerald-400 mt-0.5">Ref: {t.gatewayReference}</p>
                      )}
                    </div>
                    <span className="text-[9px] bg-amber-500/15 text-amber-300 px-2 py-0.5 border border-amber-500/30 rounded-full font-mono uppercase tracking-widest animate-pulse font-bold">
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
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-6 shadow-2xl text-center max-w-3xl mx-auto space-y-3 backdrop-blur-md">
            <h3 className="text-lg font-bold text-[#f7ecd5] tracking-wide uppercase flex items-center justify-center gap-2 font-mono">
              <Users className="w-5 h-5 text-amber-400" />
              Invite Friends, Earn Cash Every Friday
            </h3>
            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
              Share your invite link with friends. Whenever they get paid their weekly profit, you automatically receive 7.5% cash sent straight to your wallet!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <div className="bg-[#06080e] inline-flex items-center gap-2 border border-amber-500/30 px-3.5 py-2 rounded-xl text-sm shadow-inner">
                <span className="text-slate-400 text-xs">My Code:</span>
                <strong className="text-amber-400 font-mono text-sm tracking-wider font-extrabold">{currentUser.referralCode}</strong>
                <button 
                  onClick={handleCopyCode}
                  className="bg-[#111728] hover:bg-[#1a233a] border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="Copy code only"
                >
                  {copiedCode ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                </button>
              </div>

              <button 
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/10 transition-all cursor-pointer active:scale-95"
                title="Copy direct invite link with referral code attached"
              >
                {copiedLink ? <><Check className="w-3.5 h-3.5" /> Link Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy Direct Invite Link</>}
              </button>

              <button 
                type="button"
                onClick={() => setIsPitchModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all cursor-pointer active:scale-95"
                title="Share your pitch on WhatsApp in 6 regional languages"
                id="btn_user_whatsapp_multilingual_pitch"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                <span>Share on WhatsApp (6 Languages)</span>
              </button>

              <a 
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-emerald-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all cursor-pointer active:scale-95"
                title="Join Official WhatsApp Group for live daily updates"
                id="btn_user_join_whatsapp_group"
              >
                <span>Join Official WhatsApp Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-2xl p-5 text-center shadow-xl">
              <p className="text-xs text-slate-400 font-medium">Friends Joined</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">{referredUsers.length}</h3>
              <p className="text-[10px] text-amber-400 font-medium mt-1">Signed up with your link</p>
            </div>

            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-2xl p-5 text-center shadow-xl">
              <p className="text-xs text-slate-400 font-medium">Friends' Active Money</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
                ₦{investments
                  .filter(inv => referredUsers.some(ru => ru.id === inv.userId) && inv.status === 'active')
                  .reduce((sum, inv) => sum + inv.cost, 0)
                  .toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Total working in property plans</p>
            </div>

            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/20 rounded-2xl p-5 text-center shadow-xl">
              <p className="text-xs text-slate-400 font-medium">Total Referral Cash Earned</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">₦{totalReferralBonus.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-400 font-medium mt-1">Paid directly to your wallet</p>
            </div>
          </div>

          {/* List of Referred Users */}
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-[#f7ecd5] uppercase tracking-wider mb-4 border-b border-amber-500/20 pb-3 font-mono">
              My Referral Downline ({referredUsers.length})
            </h3>
            {referredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">You have not referred any users yet. Share your referral code to start earning!</p>
            ) : (
              <div className="space-y-3">
                {referredUsers.map(ru => {
                  const ruInvestments = investments.filter(inv => inv.userId === ru.id && inv.status === 'active');
                  return (
                    <div key={ru.id} className="bg-[#06080e] border border-amber-500/20 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs shadow-inner">
                      <div>
                        <p className="font-semibold text-white">{ru.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Signed up on: {new Date(ru.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Active Investments</span>
                          <span className="font-bold text-amber-400 font-mono">
                            {ruInvestments.length > 0 
                              ? `${ruInvestments.length} plan(s) (₦${ruInvestments.reduce((s, i) => s + i.cost, 0).toLocaleString()})`
                              : 'None'
                            }
                          </span>
                        </div>
                        {ruInvestments.length > 0 && (
                          <div className="bg-emerald-500/15 px-2.5 py-1 rounded-lg text-emerald-300 font-mono text-[9px] border border-emerald-500/30 font-bold">
                            +₦{(ruInvestments.reduce((s, i) => s + i.weeklyPayout, 0) * 0.5).toLocaleString()}/wk Bonus
                          </div>
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

      {/* KYC TAB */}
      {activeTab === 'kyc' && (
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-6 backdrop-blur-md">
          <div className="border-b border-amber-500/20 pb-3">
            <h3 className="text-base font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 font-mono">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Verify Your Identity
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              We verify every investor to protect your money and make sure your bank withdrawals are sent to the right person.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-[#06080e] border border-amber-500/20 p-4 rounded-xl shadow-inner">
              <span className="text-[10px] text-slate-400 font-mono block">Status</span>
              <span className={`text-xs font-bold uppercase tracking-wider mt-1 block font-mono ${
                currentUser.kycStatus === 'verified' ? 'text-emerald-400 font-bold' :
                currentUser.kycStatus === 'pending' ? 'text-amber-400 font-bold animate-pulse' :
                currentUser.kycStatus === 'rejected' ? 'text-rose-400 font-bold' :
                'text-slate-400 font-bold'
              }`}>
                {currentUser.kycStatus}
              </span>
            </div>

            <div className="bg-[#06080e] border border-amber-500/20 p-4 rounded-xl shadow-inner">
              <span className="text-[10px] text-slate-400 font-mono block">Daily Clearance Limit</span>
              <span className="text-xs font-bold text-white mt-1 block font-mono">
                {currentUser.kycStatus === 'verified' ? '₦1,000,000' : '₦100,000'}
              </span>
            </div>

            <div className="bg-[#06080e] border border-amber-500/20 p-4 rounded-xl shadow-inner">
              <span className="text-[10px] text-slate-400 font-mono block">Verification Speed</span>
              <span className="text-xs font-bold text-amber-400 mt-1 block font-sans">
                {currentUser.kycStatus === 'verified' ? 'Priority 2 Hours' : 'Standard 24-48 Hours'}
              </span>
            </div>
          </div>

          {currentUser.kycStatus === 'unverified' || currentUser.kycStatus === 'rejected' ? (
            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={kycName}
                    onChange={(e) => setKycName(e.target.value)}
                    placeholder="Same as document"
                    className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Identification Document Type</label>
                  <select 
                    value={kycType}
                    onChange={(e) => setKycType(e.target.value)}
                    className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option>National ID Card (NIN)</option>
                    <option>International Passport</option>
                    <option>Driver's License</option>
                    <option>Voters Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Document Number / Unique ID</label>
                <input 
                  type="text" 
                  value={kycNumber}
                  onChange={(e) => setKycNumber(e.target.value)}
                  placeholder="e.g. NIN-84739284729"
                  className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div className="bg-[#06080e] p-5 rounded-xl border border-dashed border-amber-500/30 text-center space-y-2">
                <UploadCloud className="w-7 h-7 text-amber-400 mx-auto" />
                <p className="text-xs text-[#f7ecd5] font-semibold">Upload Photo of ID Document</p>
                <p className="text-[10px] text-slate-400">Please attach a clear photo or screenshot of your ID card.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
                id="btn_submit_kyc"
              >
                Submit My ID for Verification
              </button>
            </form>
          ) : currentUser.kycStatus === 'pending' ? (
            <div className="bg-[#171206] border border-amber-500/35 p-6 rounded-2xl text-center space-y-3">
              <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-[#f7ecd5]">Under Verification Review</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you. Your details ({currentUser.kycDetails?.idType}: {currentUser.kycDetails?.idNumber}) are being audited by the Treasure Homes Compliance team.
              </p>
            </div>
          ) : (
            <div className="bg-[#061811] border border-emerald-500/35 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-300">Identity Verified</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Excellent. Your account is fully compliant under Treasure Homes regulatory mandates. Standard limit of ₦1,000,000/day is unlocked.
              </p>
              <div className="text-[11px] font-mono text-slate-200 bg-[#06080e] p-4 rounded-xl border border-emerald-500/20 inline-block text-left text-xs">
                <p>• Verified Legal Name: {currentUser.kycDetails?.fullName}</p>
                <p>• Verified ID: {currentUser.kycDetails?.idType} ({currentUser.kycDetails?.idNumber})</p>
              </div>
            </div>
          )}

          {/* Active WhatsApp Number & Verified Dispatch Channel Card */}
          <div className="bg-[#06080e] border border-amber-500/25 rounded-2xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#f7ecd5] uppercase tracking-wider font-mono">
                    Active WhatsApp Dispatch Channel
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Official phone number designated for automated Friday distributions &amp; official deeds
                  </p>
                </div>
              </div>
              {(() => {
                const waInfo = getWhatsAppStatusInfo(currentUser.whatsappStatus);
                return (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${waInfo.badgeClass}`}>
                    <span>{waInfo.icon}</span>
                    <span>{waInfo.label}</span>
                  </span>
                );
              })()}
            </div>

            <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Registered Active WhatsApp</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {formatPhoneDisplay(currentUser.phone)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-emerald-400 block font-semibold">Priority Delivery Channel</span>
                <span className="text-[11px] text-slate-300 font-mono">Encrypted 256-bit</span>
              </div>
            </div>

            {/* Clear Value Proposition */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-300 block font-semibold mb-0.5">Value Guarantee:</strong>
                Receive instant Friday yield receipts and deed documents directly to your WhatsApp inbox every Friday at 12:00 PM without manual follow-up.
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Investment FAQ Accordion Section */}
      <div className="mt-12 pt-8 border-t border-amber-500/20">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold text-[#f7ecd5] uppercase tracking-widest flex items-center justify-center gap-2 font-mono">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Frequently Asked Questions</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Common questions about adding money, seven-day payouts, and bank withdrawals.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-gradient-to-b from-[#0c101c] to-[#070a12] border border-amber-500/20 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/40 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-200 hover:bg-amber-500/5 transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-amber-500/15 bg-[#06080e]/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── POST-INVESTMENT CELEBRATION MODAL ─── */}
      {activatedPlanModal && (
        <div className="fixed inset-0 z-50 bg-[#06080e]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#0e1424] via-[#0a0f1d] to-[#06080e] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-amber-400/50 shadow-2xl relative overflow-hidden animate-scaleUp">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400" />
            
            <button
              onClick={() => setActivatedPlanModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 text-slate-950 mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-slate-950" />
              </div>

              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                Contract Activated
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-[#f7ecd5] uppercase tracking-tight mt-3 font-mono">
                {activatedPlanModal.plan.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your investment is secured and generating structured mortgage yield.
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
    </div>
  );
};
