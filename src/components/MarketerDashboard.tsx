import React, { useState } from 'react';
import { 
  Users, 
  Share2, 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Building, 
  Flame, 
  ExternalLink, 
  Zap, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Check, 
  MessageSquare, 
  PhoneCall, 
  Search, 
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Menu,
  X,
  Award,
  MapPin,
  RotateCw,
  Eye,
  Briefcase
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { INVESTMENT_PLANS, InvestmentPlan, UserInvestment } from '../types';
import { PmLogo } from './PmLogo';
import { CommunityBanner } from './CommunityBanner';
import { PayoutCountdown } from './PayoutCountdown';
import { UaeDeedModal } from './UaeDeedModal';
import { InsufficientFundsModal } from './InsufficientFundsModal';
import { MultilingualPitchModal } from './MultilingualPitchModal';
import { PWAInstallButton } from './PWAInstallButton';
import { UaeFlag } from './UaeFlag';

export const MarketerDashboard: React.FC = () => {
  const { 
    currentUser, 
    users, 
    transactions, 
    investments, 
    settings,
    purchaseInvestment,
    successMsg, 
    errorMsg, 
    clearMessages,
    formatLiquidityReserve,
    isDbLoaded,
    supabaseStatus
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'buy_plans' | 'downline' | 'presentation' | 'tools'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchDownline, setSearchDownline] = useState('');
  const [selectedPlanCalc, setSelectedPlanCalc] = useState<InvestmentPlan>(INVESTMENT_PLANS[0]);
  const [viewingDeedInvestment, setViewingDeedInvestment] = useState<UserInvestment | null>(null);
  const [justAcquiredPlanId, setJustAcquiredPlanId] = useState<string | null>(null);
  const [shortfallPlan, setShortfallPlan] = useState<InvestmentPlan | null>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<{ name: string; phone?: string; email?: string } | null>(null);

  if (!currentUser) return null;

  // Calculate Marketer-Specific Performance & Commissions
  const myDownline = users.filter(u => u.referredByCode === currentUser.referralCode);

  // Determine Real Investors vs Unfunded Leads in Downline
  const downlineWithStats = myDownline.map(lead => {
    const leadDeposits = transactions.filter(t => 
      t.userId === lead.id && 
      t.type === 'deposit' && 
      t.status === 'completed' && 
      !t.isMarketing
    );
    const totalDeposited = leadDeposits.reduce((sum, t) => sum + t.amount, 0);
    const isRealPaidInvestor = totalDeposited > 0;
    const leadInvestments = investments.filter(inv => inv.userId === lead.id && inv.status === 'active' && !inv.isMarketing);
    
    return {
      ...lead,
      totalDeposited,
      isRealPaidInvestor,
      activePlansCount: leadInvestments.length
    };
  });

  const realPaidDownline = downlineWithStats.filter(l => l.isRealPaidInvestor);
  const unfundedLeads = downlineWithStats.filter(l => !l.isRealPaidInvestor);
  const totalDownlineVolume = realPaidDownline.reduce((sum, l) => sum + l.totalDeposited, 0);

  // Marketer Real Earned Commissions (7.5% referral bonuses + task rewards)
  const earnedCommissions = transactions
    .filter(t => t.userId === currentUser.id && (t.type === 'referral_bonus' || t.type === 'task_reward') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Marketer Available Commission Cash (Real Withdrawable Cash)
  const availableCommissionCash = Math.max(0, currentUser.walletBalance);

  // Allocated Promotional Canvassing Demo Budget
  const promotionalDemoBudget = currentUser.marketingAllocatedBalance || 0;

  // Active Marketer Canvassing Investments
  const marketerInvestments = investments.filter(inv => inv.userId === currentUser.id);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://treasurehomes.ng';
  const referralLink = `${originUrl}/?ref=${currentUser.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredDownline = downlineWithStats.filter(l => {
    const q = searchDownline.toLowerCase().trim();
    if (!q) return true;
    return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.phone && l.phone.includes(q));
  });

  const openDeedForPlan = (plan: InvestmentPlan) => {
    const mockInvestment: UserInvestment = {
      id: `canvas_${plan.id}`,
      userId: currentUser.id,
      userName: currentUser.name,
      planId: plan.id,
      planName: plan.propertyName || plan.name,
      propertyName: plan.propertyName || plan.name,
      propertyLocation: plan.propertyLocation,
      propertyAddress: plan.propertyAddress,
      propertyImage: plan.propertyImage,
      propertyType: plan.propertyType,
      occupancyRate: plan.occupancyRate,
      deedTier: plan.deedTier,
      cadastralId: plan.cadastralId,
      makaniNumber: plan.makaniNumber,
      deedReferenceCode: `DLD-DXB-CANVAS-${plan.id.slice(-6).toUpperCase()}-2026`,
      cost: plan.cost,
      weeklyPayout: plan.weeklyPayout,
      totalReturns: plan.totalReturns,
      weeksPaid: 0,
      totalWeeks: plan.weeksDuration,
      status: 'active',
      createdAt: new Date().toISOString(),
      isMarketing: true
    };
    setViewingDeedInvestment(mockInvestment);
  };

  const handleAcquirePropertyPlan = (plan: InvestmentPlan) => {
    const currentBal = Math.max(0, currentUser.walletBalance || 0);
    if (currentBal < plan.cost) {
      setShortfallPlan(plan);
      return;
    }

    const success = purchaseInvestment(plan.id);
    if (success) {
      setJustAcquiredPlanId(plan.id);
      setTimeout(() => setJustAcquiredPlanId(null), 3000);
    }
  };

  const menuItems: {
    id: 'overview' | 'buy_plans' | 'downline' | 'presentation' | 'tools';
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'Your commission metrics, active capital & pipeline',
      icon: TrendingUp
    },
    {
      id: 'buy_plans',
      label: 'Buy Plans (From ₦30k)',
      description: 'Acquire property plans from the 24-week UAE luxury catalog',
      icon: Building2,
      badge: (
        <span className="bg-amber-500 text-slate-950 font-mono text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
          From ₦30k
        </span>
      )
    },
    {
      id: 'downline',
      label: 'Downline Leads',
      description: 'Track real investors vs unfunded leads with WhatsApp follow-up',
      icon: Users,
      badge: realPaidDownline.length > 0 ? (
        <span className="bg-emerald-500 text-slate-950 font-mono text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
          {realPaidDownline.length} Paid
        </span>
      ) : (
        <span className="bg-slate-800 text-amber-300 font-mono text-[9px] px-1.5 py-0.2 rounded-full">
          {myDownline.length}
        </span>
      )
    },
    {
      id: 'presentation',
      label: 'Client Presentation',
      description: 'Interactive client returns calculator & property plans',
      icon: Sparkles
    },
    {
      id: 'tools',
      label: 'Pitch & Broadcast',
      description: 'One-click WhatsApp broadcast & marketing invite link',
      icon: Share2
    }
  ];

  return (
    <div className="space-y-6 text-slate-100" id="marketer_dashboard_container">
      {/* Top Global Alerts */}
      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xl animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-emerald-400 hover:text-emerald-300 text-xs font-mono px-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xl animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-rose-400 hover:text-rose-300 text-xs font-mono px-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Official Marketer Portal Header Banner (Obsidian Gold & Sovereign UAE Aesthetic) */}
      <div className="bg-gradient-to-r from-[#0c101c] via-[#090d18] to-[#120a24] border border-amber-500/30 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Building2 className="w-56 h-56 text-amber-400" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-purple-500/30 to-amber-500/20 text-purple-300 border border-purple-500/40 font-mono text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Briefcase className="w-3 h-3 text-amber-400" />
                ACCREDITED SALES PARTNER PORTAL
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                7.5% Weekly Override Active
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <UaeFlag size="xs" />
                <span>UAE DLD Backed</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#f7ecd5] font-mono">
              Welcome, <span className="text-amber-400">{currentUser.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your official executive portal for verified Dubai real estate co-investment. Showcase verified DLD Title Deeds on your device, share your invite code, manage investor portfolios, and collect 7.5% Friday commissions.
            </p>
          </div>

          {/* Quick Referral Invite Box */}
          <div className="bg-[#06080e]/90 border border-amber-500/30 p-4 rounded-xl shrink-0 w-full sm:w-auto shadow-xl space-y-2.5">
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono font-bold block">
              Your Partner Invite Code
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg tracking-widest text-[#f7ecd5] bg-[#0c101c] px-3.5 py-1.5 rounded-lg border border-amber-500/30 shadow-inner">
                {currentUser.referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <Share2 className="w-3 h-3 text-amber-400" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedLeadForPitch(null);
                  setIsPitchModalOpen(true);
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                id="btn_marketer_whatsapp_pitch"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp Pitch</span>
              </button>
            </div>

            <div className="pt-1.5 border-t border-amber-500/20">
              <PWAInstallButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      </div>

      {/* Community Banner */}
      <CommunityBanner />

      {/* Responsive Hamburger Navigation Bar & Dropdown Drawer */}
      <div className="mb-6 bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#06080e] hover:bg-[#111728] border border-amber-500/30 active:scale-95 text-[#f7ecd5] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 lg:hidden"
            id="btn_marketer_hamburger"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
            <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>

          {/* Current Active Section Badge */}
          <div className="flex items-center gap-1.5 bg-[#06080e] border border-amber-500/25 px-3 py-1.5 rounded-xl text-slate-200 text-xs font-bold truncate lg:hidden">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono">Active:</span>
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

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1 border-l border-amber-500/20 pl-3 overflow-x-auto w-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setActiveTab(item.id); clearMessages(); setIsMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold border border-amber-400 shadow-md shadow-amber-500/15'
                      : 'text-slate-400 hover:text-amber-200 hover:bg-amber-500/10'
                  }`}
                  id={`tab_marketer_desktop_${item.id}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950 font-bold' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                  {item.badge}
                </button>
              );
            })}
          </div>

        </div>

        {/* Mobile Expanded Drawer with Quick-Navigation Cards */}
        {isMenuOpen && (
          <div className="mt-3 pt-3 border-t border-amber-500/15 animate-fadeIn lg:hidden">
            <div className="px-1 mb-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <PmLogo className="w-5 h-5" />
                <span className="font-bold text-amber-300 uppercase tracking-wider">Marketer Suite Menus</span>
              </div>
              <span className="text-amber-400 font-semibold">{menuItems.length} Menus</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
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
                    id={`menu_marketer_item_${item.id}`}
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
              <span>Withdrawable Cash: <strong className="text-emerald-400 font-mono font-bold">₦{availableCommissionCash.toLocaleString()}</strong></span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Close Menu ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key 4-Grid Financial Metric Cards (Obsidian Gold & Emerald) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Real Earned Commissions Card */}
            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Earned Commissions</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ₦{earnedCommissions.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400">
                100% Real Earned Commission
              </p>
              <div className="mt-2 text-[10px] text-emerald-300 flex items-center gap-1 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Direct Treasury Settlement</span>
              </div>
            </div>

            {/* Downline Paid Investor Volume Card */}
            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/25 rounded-2xl p-5 shadow-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Real Capital Inflow</span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#f7ecd5] font-mono mt-1">
                ₦{totalDownlineVolume.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400">
                Funded by {realPaidDownline.length} verified real investor{realPaidDownline.length === 1 ? '' : 's'}
              </p>
              <div className="mt-2 text-[10px] text-amber-300/80 flex items-center gap-1 font-semibold bg-amber-950/40 border border-amber-500/20 px-2 py-1 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>7.5% Weekly Override Paid Every Friday</span>
              </div>
            </div>

            {/* Active UAE Property Portfolio */}
            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/25 rounded-2xl p-5 shadow-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Property Portfolio</span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#f7ecd5] font-mono mt-1">
                {marketerInvestments.length} Active
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <UaeFlag size="xs" />
                <span>UAE Institutional Co-Ownership Units</span>
              </p>
              <div className="mt-2 text-[10px] text-amber-300 flex items-center gap-1 font-semibold bg-[#06080e] border border-amber-500/25 px-2 py-1 rounded-lg">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Official DLD Title Deeds on Display</span>
              </div>
            </div>

            {/* Active Wallet & Acquisition Funds */}
            <div className="bg-gradient-to-b from-[#0e1424] to-[#070a12] border border-amber-500/25 rounded-2xl p-5 shadow-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Wallet Balance</span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                  <Wallet className="w-4 h-4 text-amber-400" />
                </span>
              </div>
              <h3 className="text-2xl font-black text-amber-400 font-mono mt-1">
                ₦{(currentUser.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400">
                {(currentUser.walletBalance || 0) === 0 ? 'Top up required to acquire property plans' : 'Available for property acquisition & cashout'}
              </p>
              <div className="mt-2 text-[10px] flex items-center gap-1 font-semibold">
                {(currentUser.walletBalance || 0) > 0 ? (
                  <span className="text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Funded Wallet Active</span>
                  </span>
                ) : (
                  <span className="text-rose-300 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Wallet ₦0.00 • Add Money to Acquire</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Friday Payout Countdown Showcase */}
          <div className="bg-gradient-to-r from-[#0c101c] via-[#090d18] to-[#120a24] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                FRIDAY INVESTOR &amp; OVERRIDE PAYOUT WINDOW
              </span>
              <h4 className="text-base sm:text-lg font-black text-[#f7ecd5] uppercase tracking-wide font-mono">
                Official Treasury Cashout Schedule
              </h4>
              <p className="text-xs text-slate-300 max-w-xl">
                Show prospects this live countdown. Every Friday at 12:00 PM, weekly yields and your 7.5% sales commission settle into wallets and bank accounts automatically.
              </p>
            </div>
            <div className="shrink-0">
              <PayoutCountdown />
            </div>
          </div>

          {/* Recent Downline Activity Summary */}
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#070a12] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Your Latest Referral Conversions
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Investors who registered under invite code <strong className="font-mono text-amber-300">{currentUser.referralCode}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('downline')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer font-mono"
              >
                View All ({myDownline.length}) →
              </button>
            </div>

            {myDownline.length === 0 ? (
              <div className="text-center py-10 bg-[#06080e] rounded-xl border border-dashed border-amber-500/20 text-xs text-slate-400 space-y-2">
                <Users className="w-8 h-8 text-amber-400/50 mx-auto" />
                <p className="font-bold text-slate-200">No leads registered yet.</p>
                <p>Share your invite link with your contacts to start building your sales pipeline!</p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Copy Your Referral Link
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-300">
                  <thead>
                    <tr className="border-b border-amber-500/20 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-2.5">Investor Name</th>
                      <th className="pb-2.5">Registered</th>
                      <th className="pb-2.5 text-center">Investor Status</th>
                      <th className="pb-2.5 text-right">Paid Wallet Top-Up</th>
                      <th className="pb-2.5 text-right">Your 7.5% Yield Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10">
                    {downlineWithStats.slice(0, 5).map(lead => (
                      <tr key={lead.id} className="hover:bg-amber-500/5 transition-colors">
                        <td className="py-3 font-semibold text-slate-100">
                          {lead.name}
                          <span className="text-[10px] text-slate-400 block font-mono font-normal">{lead.email}</span>
                        </td>
                        <td className="py-3 text-[11px] font-mono text-slate-400">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-center">
                          {lead.isRealPaidInvestor ? (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                              VERIFIED REAL INVESTOR
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                              UNFUNDED LEAD
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-white">
                          ₦{lead.totalDeposited.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-400">
                          {lead.totalDeposited > 0 ? `+₦${Math.round(lead.totalDeposited * 0.075).toLocaleString()}/wk` : '₦0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BUY PLANS TAB */}
      {activeTab === 'buy_plans' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0c101c] via-[#090d18] to-[#120a24] border border-amber-500/30 text-white rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                <UaeFlag size="xs" />
                <span>UAE Prime Real Estate Portfolio</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#f7ecd5] font-mono">
                Acquire Verified UAE Property Co-Ownership Plans
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Acquire 24-week structured UAE luxury real estate co-ownership cycles. Each plan generates authentic Dubai Land Department Title Deeds, makani numbers, and guaranteed Friday cash yield schedules.
              </p>
            </div>

            <div className="bg-[#06080e] border border-amber-500/30 px-5 py-3 rounded-xl text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Your Wallet Balance</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                ₦{(currentUser.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] font-mono block ${(currentUser.walletBalance || 0) === 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                {(currentUser.walletBalance || 0) === 0 ? '₦0.00 • Top up to acquire plans' : 'Active Available Balance'}
              </span>
            </div>
          </div>

          {/* Property Plans Catalog: Identical to UserDashboard with Luxury Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 font-mono">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Available 24-Week UAE Property Plans</span>
              </h3>
              <span className="text-xs text-emerald-400 font-mono">Weekly Friday Payouts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INVESTMENT_PLANS.map((plan) => {
                const currentBal = Math.max(0, currentUser.walletBalance || 0);
                const canAfford = currentBal >= plan.cost;
                const shortfall = Math.max(0, plan.cost - currentBal);

                return (
                  <div 
                    key={plan.id} 
                    className={`bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border rounded-2xl flex flex-col justify-between shadow-2xl transition-all duration-300 relative overflow-hidden ${
                      justAcquiredPlanId === plan.id
                        ? 'border-emerald-500 ring-4 ring-emerald-500/30 shadow-2xl scale-[1.01]'
                        : canAfford ? 'border-amber-500/30 hover:border-amber-400 hover:shadow-amber-500/10' : 'border-amber-500/15 opacity-90'
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
                      <div className="absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-widest font-mono shadow-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950">
                        DLD VERIFIED
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
                            <span className="text-xs text-slate-400 font-medium">Total 24-Week Return:</span>
                            <span className="text-base font-black text-amber-400 font-mono">₦{plan.totalReturns.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Duration:</span>
                            <span className="text-slate-200 font-mono font-bold">24 Weeks (Friday Payouts)</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: View Title Deed & Acquire Property */}
                      <div className="pt-3 border-t border-amber-500/15 space-y-2">
                        <button
                          type="button"
                          onClick={() => openDeedForPlan(plan)}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/10 cursor-pointer active:scale-95"
                          title="View official DLD Co-Ownership Deed and backing contracts to showcase to investors"
                        >
                          <Award className="w-4 h-4 text-slate-950" />
                          <span>📜 View Official Deed (Client Presentation)</span>
                        </button>

                        {canAfford ? (
                          <button
                            type="button"
                            onClick={() => handleAcquirePropertyPlan(plan)}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-95"
                            id={`btn_mkt_acquire_${plan.id}`}
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-950" />
                            <span>Acquire Property (₦{plan.cost.toLocaleString()})</span>
                          </button>
                        ) : (
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={() => setShortfallPlan(plan)}
                              className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#06080e] hover:bg-[#111728] border border-amber-500/40 text-amber-300 hover:border-amber-400 shadow-sm active:scale-95"
                              id={`btn_mkt_topup_${plan.id}`}
                              title="Insufficient wallet balance. Click to top up."
                            >
                              <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>Top Up ₦{shortfall.toLocaleString()} to Acquire</span>
                            </button>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                              <span>Wallet: <strong className={currentBal === 0 ? "text-rose-400" : "text-white"}>₦{currentBal.toLocaleString()}</strong></span>
                              <span>Shortfall: <strong className="text-rose-400 font-bold">₦{shortfall.toLocaleString()}</strong></span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Marketer's Active Acquired Plans */}
          {marketerInvestments.length > 0 && (
            <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#070a12] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Your Active Property Portfolio ({marketerInvestments.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Your verified physical asset holdings registered under Dubai Land Department.
                  </span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>VERIFIED TITLE DEED · ACTIVE ASSET</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketerInvestments.map((inv) => (
                  <div key={inv.id} className="p-4 bg-[#06080e] border border-amber-500/20 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-[#f7ecd5] text-base block font-mono">{inv.planName}</span>
                        <span className="text-xs text-slate-400 font-mono">Plan Principal: ₦{inv.cost.toLocaleString()}</span>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
                        Week {inv.weeksPaid}/{inv.totalWeeks}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-[#0c101c] p-3 rounded-xl border border-amber-500/15">
                      <span className="text-slate-400">Weekly Payout Yield:</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">+₦{inv.weeklyPayout.toLocaleString()} / wk</span>
                    </div>

                    <div className="pt-1">
                      <PayoutCountdown 
                        targetDate={inv.nextPayoutDate} 
                        isLocked={inv.isTimerLocked || currentUser.isTimerLocked} 
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingDeedInvestment(inv)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      <Award className="w-4 h-4 text-slate-950" />
                      <span>📜 Inspect DLD Title Deed Certificate</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY DOWNLINE TAB */}
      {activeTab === 'downline' && (
        <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#070a12] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-500/20 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 font-mono">
                <Users className="w-5 h-5 text-emerald-400" />
                Downline Investor Directory ({myDownline.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Segregated list of investors registered under your promotional code. Follow up with leads via WhatsApp to activate their portfolios.
              </p>
            </div>

            <div className="relative w-full sm:w-64 text-xs">
              <input
                type="text"
                placeholder="Search leads by name, email, phone..."
                value={searchDownline}
                onChange={(e) => setSearchDownline(e.target.value)}
                className="w-full bg-[#06080e] border border-amber-500/30 rounded-xl py-2 pl-8 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">Verified Real Investors</span>
              <span className="text-2xl font-black text-emerald-300 font-mono mt-0.5 block">{realPaidDownline.length}</span>
              <span className="text-[10px] text-emerald-400/80">Funded their wallets with real capital</span>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Unfunded Leads</span>
              <span className="text-2xl font-black text-amber-300 font-mono mt-0.5 block">{unfundedLeads.length}</span>
              <span className="text-[10px] text-amber-400/80">Registered • Awaiting first deposit</span>
            </div>

            <div className="bg-[#06080e] border border-amber-500/25 rounded-xl p-3.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Total Downline Capital</span>
              <span className="text-2xl font-black text-[#f7ecd5] font-mono mt-0.5 block">
                ₦{totalDownlineVolume.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Cumulative paid deposit volume</span>
            </div>
          </div>

          {/* Table */}
          {filteredDownline.length === 0 ? (
            <div className="text-center py-12 bg-[#06080e] rounded-xl border border-dashed border-amber-500/20">
              <Users className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-200">No matching leads found</p>
              <p className="text-xs text-slate-500 mt-0.5">Try searching with a different name or email.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans text-slate-300">
                <thead>
                  <tr className="border-b border-amber-500/20 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-2.5">Lead / Investor</th>
                    <th className="pb-2.5">Phone Contact</th>
                    <th className="pb-2.5 text-center">Investor Classification</th>
                    <th className="pb-2.5 text-right">Lifetime Paid Top-Up</th>
                    <th className="pb-2.5 text-center">Active Plans</th>
                    <th className="pb-2.5 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10">
                  {filteredDownline.map(lead => (
                    <tr key={lead.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-100">{lead.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.email}</div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-300">
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="hover:text-amber-400 flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-amber-400" />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500">Not provided</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {lead.isRealPaidInvestor ? (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            VERIFIED REAL INVESTOR
                          </span>
                        ) : (
                          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            UNFUNDED LEAD
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        ₦{lead.totalDeposited.toLocaleString()}
                      </td>
                      <td className="py-3 text-center font-mono">
                        <span className="bg-[#06080e] border border-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded font-bold">
                          {lead.activePlansCount}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {lead.phone ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadForPitch({
                                name: lead.name,
                                phone: lead.phone,
                                email: lead.email
                              });
                              setIsPitchModalOpen(true);
                            }}
                            className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-bold px-2.5 py-1 rounded-lg text-[10px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-400" />
                            <span>WhatsApp Follow-up</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">No phone</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CLIENT PRESENTATION MODE TAB */}
      {activeTab === 'presentation' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0c101c] via-[#090d18] to-[#120a24] border border-amber-500/30 text-white rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <PmLogo className="w-12 h-12" />
                <div>
                  <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase font-bold block">
                    TREASURE HOMES ACCREDITED PRESENTATION SUITE
                  </span>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-[#f7ecd5] font-mono">
                    PM Invest UAE Property Plans &amp; Returns Catalog
                  </h2>
                </div>
              </div>

              <div className="bg-[#06080e] border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-mono text-slate-300">
                <span>Presenter ID: </span>
                <strong className="text-amber-400">{currentUser.referralCode}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Use this screen when presenting to prospective investors in person or via video call. Explain the 24-week structured investment cycle and cash returns backed by verified UAE luxury property developments.
            </p>
          </div>

          {/* Interactive Calculator for Clients */}
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#070a12] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 border-b border-amber-500/20 pb-3 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Interactive Returns Calculator (24-Week Cycles)
            </h3>

            {/* Plan Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {INVESTMENT_PLANS.map((plan) => {
                const isSelected = selectedPlanCalc.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanCalc(plan)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#141b2d] to-[#0c1220] border-amber-400 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-[#06080e] border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    <span className="text-[10px] text-amber-400 uppercase font-mono block">{plan.propertyName || plan.name}</span>
                    <span className="text-sm font-black text-white font-mono block mt-0.5">
                      ₦{plan.cost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                      +₦{plan.weeklyPayout.toLocaleString()}/wk
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Plan Calculation Breakdown Card */}
            <div className="bg-[#06080e] border border-amber-500/30 text-white rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Property Acquisition Cost</span>
                <h4 className="text-2xl font-black text-white font-mono">
                  ₦{selectedPlanCalc.cost.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-400">100% principal allocated to Treasure Homes development</p>
              </div>

              <div className="space-y-1 border-y md:border-y-0 md:border-x border-amber-500/20 py-4 md:py-0 md:px-6">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">Weekly Friday Cash Payout</span>
                <h4 className="text-2xl font-black text-emerald-400 font-mono">
                  ₦{selectedPlanCalc.weeklyPayout.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-400">Paid 24 consecutive Fridays into the investor's wallet</p>
              </div>

              <div className="space-y-1 md:pl-2">
                <span className="text-[10px] text-amber-400 font-mono uppercase block">Total 24-Week Net Return</span>
                <h4 className="text-2xl font-black text-amber-400 font-mono">
                  ₦{selectedPlanCalc.totalReturns.toLocaleString()}
                </h4>
                <p className="text-xs text-slate-400">Total cash collected across the 24-week property cycle (+420%)</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => openDeedForPlan(selectedPlanCalc)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Award className="w-4 h-4" />
                <span>Show Prospect Official Title Deed Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PITCH ASSETS & BROADCAST TAB */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#070a12] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
            <h3 className="text-base font-bold text-[#f7ecd5] uppercase tracking-wider flex items-center gap-2 border-b border-amber-500/20 pb-3 font-mono">
              <Share2 className="w-5 h-5 text-amber-400" />
              Marketing Assets &amp; Quick Sharing Tools
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Tool */}
              <div className="bg-[#06080e] border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-[#f7ecd5] font-mono">One-Click WhatsApp Broadcast</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Send a pre-formatted message explaining the Treasure Homes weekly Friday cash yield directly to your contacts and WhatsApp status.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeadForPitch(null);
                    setIsPitchModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 w-full shadow-md active:scale-95 cursor-pointer"
                  id="btn_open_multilingual_broadcast"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Choose Language &amp; Pitch on WhatsApp</span>
                </button>
              </div>

              {/* Direct Referral Link Copy */}
              <div className="bg-[#06080e] border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-[#f7ecd5] font-mono">Direct Invite Link</span>
                </div>
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full bg-[#0c101c] border border-amber-500/30 rounded-lg p-2 font-mono text-xs text-amber-300"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 w-full cursor-pointer shadow-md active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UAE Title Deed Inspection Modal */}
      {viewingDeedInvestment && (
        <UaeDeedModal
          isOpen={!!viewingDeedInvestment}
          onClose={() => setViewingDeedInvestment(null)}
          investment={viewingDeedInvestment}
        />
      )}

      {/* Insufficient Funds & Top-Up Prompt Modal */}
      {shortfallPlan && (
        <InsufficientFundsModal
          isOpen={!!shortfallPlan}
          onClose={() => setShortfallPlan(null)}
          plan={shortfallPlan}
          walletBalance={currentUser.walletBalance || 0}
          onNavigateToDeposit={(amt) => {
            setShortfallPlan(null);
            if (currentUser.role === 'admin') {
              try {
                sessionStorage.setItem('pm_prefill_deposit', amt.toString());
                window.dispatchEvent(new CustomEvent('switch-admin-view', { detail: 'investor' }));
              } catch {
                // fallback
              }
            }
          }}
        />
      )}

      {/* WhatsApp Multilingual Canvassing Modal */}
      <MultilingualPitchModal
        isOpen={isPitchModalOpen}
        onClose={() => {
          setIsPitchModalOpen(false);
          setSelectedLeadForPitch(null);
        }}
        marketerName={currentUser.name}
        referralCode={currentUser.referralCode}
        referralLink={referralLink}
        targetLead={selectedLeadForPitch}
      />
    </div>
  );
};
