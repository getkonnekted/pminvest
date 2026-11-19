import React, { useState } from 'react';
import {
  Users,
  Share2,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Copy,
  Clock,
  ShieldCheck,
  Check,
  MessageSquare,
  PhoneCall,
  Search,
  Building2,
  AlertCircle,
  Award,
  MapPin,
  Calculator
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { INVESTMENT_PLANS, InvestmentPlan, UserInvestment } from '../types';
import { CommunityBanner } from './CommunityBanner';
import { PayoutCountdown } from './PayoutCountdown';
import { UaeDeedModal } from './UaeDeedModal';
import { InsufficientFundsModal } from './InsufficientFundsModal';
import { MultilingualPitchModal } from './MultilingualPitchModal';
import { PWAInstallButton } from './PWAInstallButton';

export const MarketerDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    transactions,
    investments,
    purchaseInvestment,
    successMsg,
    errorMsg,
    clearMessages
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'buy_plans' | 'downline' | 'presentation' | 'tools'>('overview');
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

  const myDownline = users.filter(u => u.referredByCode === currentUser.referralCode);

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

  const earnedCommissions = transactions
    .filter(t => t.userId === currentUser.id && (t.type === 'referral_bonus' || t.type === 'task_reward') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

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

  const navItems: {
    id: 'overview' | 'buy_plans' | 'downline' | 'presentation' | 'tools';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'buy_plans', label: 'Properties', icon: Building2 },
    { id: 'downline', label: 'Downline', icon: Users, count: myDownline.length },
    { id: 'presentation', label: 'Calculator', icon: Calculator },
    { id: 'tools', label: 'Tools', icon: Share2 }
  ];

  return (
    <div className="space-y-6" id="marketer_dashboard_container">
      {/* Global Alerts */}
      {successMsg && (
        <div className="pm-card border-l-4 border-l-[#0B7A4E] px-4 py-3 rounded-xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B7A4E] shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-[#0B7A4E] hover:underline text-xs font-medium px-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="pm-card border-l-4 border-l-rose-600 px-4 py-3 rounded-xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-rose-600 hover:underline text-xs font-medium px-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Executive Partner Header */}
      <div className="pm-card rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0B7A4E]">
            Partner Desk · 7.5% Friday Override
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
            {currentUser.name}
          </h1>
          <p className="text-xs opacity-65 max-w-xl">
            Manage downline investors, present Dubai title deeds, and track weekly commissions.
          </p>
        </div>

        {/* Invite Code & Quick Share */}
        <div className="pm-card-subtle p-4 rounded-xl shrink-0 w-full sm:w-auto space-y-2.5">
          <span className="text-[10px] uppercase tracking-[0.12em] opacity-60 font-medium block">
            Partner Invite Code
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-base tracking-widest px-3 py-1.5 rounded-lg bg-[var(--pm-surface)] border border-[var(--pm-border)]">
              {currentUser.referralCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="flex items-center gap-3 pt-1 text-xs">
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[#0B7A4E] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
            </button>
            <span className="opacity-30">·</span>
            <button
              type="button"
              onClick={() => {
                setSelectedLeadForPitch(null);
                setIsPitchModalOpen(true);
              }}
              className="opacity-75 hover:opacity-100 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              id="btn_marketer_whatsapp_pitch"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#0B7A4E]" />
              <span>Share Pitch</span>
            </button>
          </div>
          <div className="pt-2 border-t border-[var(--pm-border)]">
            <PWAInstallButton className="w-full justify-center" />
          </div>
        </div>
      </div>

      {/* Quiet Telegram Bar */}
      <CommunityBanner />

      {/* Horizontal Hairline Tab Bar */}
      <div className="border-b border-[var(--pm-border)] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  clearMessages();
                }}
                className={`px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#0B7A4E] text-[#0B7A4E] font-semibold'
                    : 'border-transparent opacity-65 hover:opacity-100'
                }`}
                id={`tab_marketer_desktop_${item.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="text-[11px] font-mono opacity-60">({item.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="pm-card rounded-xl p-5">
              <div className="flex items-center justify-between text-xs opacity-65 mb-2">
                <span>Earned Commissions</span>
                <Wallet className="w-4 h-4 text-[#0B7A4E]" />
              </div>
              <p className="text-2xl font-mono font-semibold text-[#0B7A4E] tabular-nums">
                ₦{earnedCommissions.toLocaleString()}
              </p>
              <p className="text-[11px] opacity-55 mt-1.5">Settled directly to wallet</p>
            </div>

            <div className="pm-card rounded-xl p-5">
              <div className="flex items-center justify-between text-xs opacity-65 mb-2">
                <span>Downline Volume</span>
                <TrendingUp className="w-4 h-4 text-[#9A7B3E]" />
              </div>
              <p className="text-2xl font-mono font-semibold tabular-nums">
                ₦{totalDownlineVolume.toLocaleString()}
              </p>
              <p className="text-[11px] opacity-55 mt-1.5">
                {realPaidDownline.length} funded investor{realPaidDownline.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="pm-card rounded-xl p-5">
              <div className="flex items-center justify-between text-xs opacity-65 mb-2">
                <span>Active Deeds</span>
                <Building2 className="w-4 h-4 text-[#0B7A4E]" />
              </div>
              <p className="text-2xl font-mono font-semibold tabular-nums">
                {marketerInvestments.length}
              </p>
              <p className="text-[11px] opacity-55 mt-1.5">Dubai co-ownership portfolio</p>
            </div>

            <div className="pm-card rounded-xl p-5">
              <div className="flex items-center justify-between text-xs opacity-65 mb-2">
                <span>Wallet Balance</span>
                <ShieldCheck className="w-4 h-4 text-[#9A7B3E]" />
              </div>
              <p className="text-2xl font-mono font-semibold tabular-nums">
                ₦{(currentUser.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] opacity-55 mt-1.5">
                {(currentUser.walletBalance || 0) > 0 ? 'Available for withdrawal or plans' : 'Deposit to acquire deeds'}
              </p>
            </div>
          </div>

          {/* Friday Payout Countdown */}
          <div className="pm-card rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#0B7A4E] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Friday Payout Window
              </span>
              <h4 className="font-serif text-xl font-semibold">Weekly Yield &amp; Override Settlement</h4>
              <p className="text-xs opacity-65">
                Investor yields and 7.5% partner commissions credit every Friday at 12:00 PM WAT.
              </p>
            </div>
            <div className="shrink-0">
              <PayoutCountdown />
            </div>
          </div>

          {/* Recent Downline Activity */}
          <div className="pm-card rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--pm-border)] pb-3">
              <div>
                <h4 className="font-serif text-xl font-semibold">Recent Referrals</h4>
                <p className="text-xs opacity-60">
                  Registered under code <span className="font-mono font-semibold">{currentUser.referralCode}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('downline')}
                className="text-xs font-semibold text-[#0B7A4E] hover:underline cursor-pointer"
              >
                View All ({myDownline.length})
              </button>
            </div>

            {myDownline.length === 0 ? (
              <div className="text-center py-10 pm-card-subtle rounded-xl space-y-2">
                <Users className="w-7 h-7 opacity-40 mx-auto" />
                <p className="text-sm font-medium">No referrals yet</p>
                <p className="text-xs opacity-60">Share your invite link to start earning 7.5% Friday overrides.</p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-2 bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Copy Invite Link
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--pm-border)] opacity-60 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5 font-medium">Investor</th>
                      <th className="pb-2.5 font-medium">Joined</th>
                      <th className="pb-2.5 text-center font-medium">Status</th>
                      <th className="pb-2.5 text-right font-medium">Deposited</th>
                      <th className="pb-2.5 text-right font-medium">Est. Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--pm-border)]">
                    {downlineWithStats.slice(0, 5).map(lead => (
                      <tr key={lead.id}>
                        <td className="py-3 font-medium">
                          {lead.name}
                          <span className="text-[11px] opacity-55 block font-mono font-normal">{lead.email}</span>
                        </td>
                        <td className="py-3 text-[11px] font-mono opacity-65">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-center">
                          {lead.isRealPaidInvestor ? (
                            <span className="text-[11px] font-medium text-[#0B7A4E]">Funded</span>
                          ) : (
                            <span className="text-[11px] opacity-55">Unfunded</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold tabular-nums">
                          ₦{lead.totalDeposited.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold text-[#0B7A4E] tabular-nums">
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

      {/* PROPERTIES TAB */}
      {activeTab === 'buy_plans' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[var(--pm-border)] pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Dubai Property Portfolio</h2>
              <p className="text-xs opacity-65 mt-0.5">
                24-week structured co-ownership deeds starting from ₦15,000.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider opacity-60 block">Available Balance</span>
              <span className="text-xl font-mono font-semibold text-[#0B7A4E] tabular-nums">
                ₦{(currentUser.walletBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INVESTMENT_PLANS.map((plan) => {
              const currentBal = Math.max(0, currentUser.walletBalance || 0);
              const canAfford = currentBal >= plan.cost;
              const shortfall = Math.max(0, plan.cost - currentBal);

              return (
                <article
                  key={plan.id}
                  className={`pm-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                    justAcquiredPlanId === plan.id ? 'ring-2 ring-[#0B7A4E]' : ''
                  }`}
                >
                  {/* Clean Architectural Photo (zero corner pills, theme-immune overlay) */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#18222B] group">
                    <img
                      src={plan.propertyImage}
                      alt={plan.propertyName || plan.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="pm-photo-sub text-[10px] font-medium uppercase tracking-[0.14em] truncate">
                          {plan.propertyLocation.split(',')[0]}
                        </p>
                        <p className="pm-photo-overlay text-xs font-medium truncate">
                          {plan.propertyType}
                        </p>
                      </div>
                      <span className="pm-photo-overlay font-mono text-[11px] font-medium shrink-0">
                        {plan.occupancyRate} Occ.
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-serif text-xl font-semibold leading-snug">
                          {plan.propertyName || plan.name}
                        </h4>
                        <p className="text-[11px] opacity-65 mt-1 flex items-start gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9A7B3E]" />
                          <span>{plan.propertyAddress}</span>
                        </p>
                        <p className="text-[10px] font-mono opacity-55 mt-1">
                          Makani {plan.makaniNumber} · {plan.cadastralId}
                        </p>
                      </div>

                      {/* Hairline Financial Ledger */}
                      <div className="border-t border-b border-[var(--pm-border)] py-3 space-y-2 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="opacity-65">Capital</span>
                          <span className="font-mono font-semibold text-sm tabular-nums">₦{plan.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="opacity-65">Friday Payout</span>
                          <span className="font-mono font-semibold text-[#0B7A4E] tabular-nums">₦{plan.weeklyPayout.toLocaleString()} / wk</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="opacity-65">24-Week Total</span>
                          <span className="font-mono font-semibold text-[#9A7B3E] tabular-nums">₦{plan.totalReturns.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {canAfford ? (
                        <button
                          type="button"
                          onClick={() => handleAcquirePropertyPlan(plan)}
                          className="w-full py-2.5 px-4 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          id={`btn_mkt_acquire_${plan.id}`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Acquire · ₦{plan.cost.toLocaleString()}</span>
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setShortfallPlan(plan)}
                            className="w-full py-2.5 px-4 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            id={`btn_mkt_topup_${plan.id}`}
                          >
                            <Wallet className="w-3.5 h-3.5 shrink-0" />
                            <span>Top Up ₦{shortfall.toLocaleString()}</span>
                          </button>
                          <div className="flex items-center justify-between text-[11px] font-mono opacity-60 px-0.5">
                            <span>Wallet: ₦{currentBal.toLocaleString()}</span>
                            <span>Shortfall: ₦{shortfall.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openDeedForPlan(plan)}
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

          {/* Active Holdings */}
          {marketerInvestments.length > 0 && (
            <div className="pm-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--pm-border)] pb-3">
                <h3 className="font-serif text-xl font-semibold">
                  Active Holdings ({marketerInvestments.length})
                </h3>
                <span className="text-xs font-medium text-[#0B7A4E]">DLD Verified</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketerInvestments.map((inv) => (
                  <div key={inv.id} className="pm-card-subtle p-4 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-serif font-semibold text-lg block">{inv.planName}</span>
                        <span className="text-xs opacity-60 font-mono">Principal: ₦{inv.cost.toLocaleString()}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#0B7A4E]">
                        Wk {inv.weeksPaid}/{inv.totalWeeks}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-y border-[var(--pm-border)] py-2">
                      <span className="opacity-65">Friday Payout</span>
                      <span className="font-semibold text-[#0B7A4E] font-mono">+₦{inv.weeklyPayout.toLocaleString()} / wk</span>
                    </div>

                    <PayoutCountdown
                      targetDate={inv.nextPayoutDate}
                      isLocked={inv.isTimerLocked || currentUser.isTimerLocked}
                    />

                    <button
                      type="button"
                      onClick={() => setViewingDeedInvestment(inv)}
                      className="w-full py-2 px-3 rounded-lg pm-btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#9A7B3E]" />
                      <span>Inspect Title Deed</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOWNLINE TAB */}
      {activeTab === 'downline' && (
        <div className="pm-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--pm-border)] pb-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold">
                Downline Directory ({myDownline.length})
              </h3>
              <p className="text-xs opacity-60 mt-0.5">
                Investors registered with your invite code.
              </p>
            </div>

            <div className="relative w-full sm:w-64 text-xs">
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchDownline}
                onChange={(e) => setSearchDownline(e.target.value)}
                className="w-full bg-[var(--pm-surface-subtle)] border border-[var(--pm-border)] rounded-lg py-2 pl-8 pr-3 focus:outline-none focus:border-[#0B7A4E]"
              />
              <Search className="w-3.5 h-3.5 opacity-50 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="pm-card-subtle rounded-xl p-4">
              <span className="text-[11px] opacity-60 block">Funded Investors</span>
              <span className="text-2xl font-mono font-semibold text-[#0B7A4E] mt-1 block">{realPaidDownline.length}</span>
            </div>
            <div className="pm-card-subtle rounded-xl p-4">
              <span className="text-[11px] opacity-60 block">Unfunded Leads</span>
              <span className="text-2xl font-mono font-semibold text-[#9A7B3E] mt-1 block">{unfundedLeads.length}</span>
            </div>
            <div className="pm-card-subtle rounded-xl p-4">
              <span className="text-[11px] opacity-60 block">Downline Capital</span>
              <span className="text-2xl font-mono font-semibold mt-1 block">₦{totalDownlineVolume.toLocaleString()}</span>
            </div>
          </div>

          {filteredDownline.length === 0 ? (
            <div className="text-center py-10 pm-card-subtle rounded-xl">
              <Users className="w-7 h-7 opacity-40 mx-auto mb-2" />
              <p className="text-sm font-medium">No matching leads</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--pm-border)] opacity-60 uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5 font-medium">Lead</th>
                    <th className="pb-2.5 font-medium">Phone</th>
                    <th className="pb-2.5 text-center font-medium">Status</th>
                    <th className="pb-2.5 text-right font-medium">Deposited</th>
                    <th className="pb-2.5 text-center font-medium">Plans</th>
                    <th className="pb-2.5 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pm-border)]">
                  {filteredDownline.map(lead => (
                    <tr key={lead.id}>
                      <td className="py-3">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-[11px] opacity-55 font-mono">{lead.email}</div>
                      </td>
                      <td className="py-3 font-mono text-[11px]">
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="hover:text-[#0B7A4E] inline-flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-[#0B7A4E]" />
                            <span>{lead.phone}</span>
                          </a>
                        ) : (
                          <span className="opacity-45">—</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {lead.isRealPaidInvestor ? (
                          <span className="text-[11px] font-semibold text-[#0B7A4E]">Funded</span>
                        ) : (
                          <span className="text-[11px] opacity-60">Unfunded</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold tabular-nums">
                        ₦{lead.totalDeposited.toLocaleString()}
                      </td>
                      <td className="py-3 text-center font-mono">{lead.activePlansCount}</td>
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
                            className="pm-btn-secondary font-medium px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3 text-[#0B7A4E]" />
                            <span>Follow Up</span>
                          </button>
                        ) : (
                          <span className="text-[11px] opacity-45">—</span>
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

      {/* CALCULATOR TAB */}
      {activeTab === 'presentation' && (
        <div className="pm-card rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--pm-border)] pb-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Client Returns Calculator</h2>
              <p className="text-xs opacity-60 mt-0.5">Select a Dubai property tier to preview its 24-week cashflow.</p>
            </div>
            <span className="text-xs font-mono opacity-70">
              Partner ID: <strong>{currentUser.referralCode}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {INVESTMENT_PLANS.map((plan) => {
              const isSelected = selectedPlanCalc.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanCalc(plan)}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#0B7A4E] bg-[#0B7A4E]/8'
                      : 'border-[var(--pm-border)] bg-[var(--pm-surface-subtle)] hover:border-[#0B7A4E]/50'
                  }`}
                >
                  <span className="text-[11px] opacity-65 block truncate">{plan.propertyName || plan.name}</span>
                  <span className="text-sm font-mono font-semibold block mt-0.5 tabular-nums">
                    ₦{plan.cost.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono text-[#0B7A4E] font-medium block mt-0.5">
                    +₦{plan.weeklyPayout.toLocaleString()}/wk
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pm-card-subtle rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider opacity-60 block">Capital</span>
              <h4 className="text-2xl font-mono font-semibold tabular-nums">
                ₦{selectedPlanCalc.cost.toLocaleString()}
              </h4>
              <p className="text-xs opacity-60">{selectedPlanCalc.propertyName}</p>
            </div>

            <div className="space-y-1 border-y md:border-y-0 md:border-x border-[var(--pm-border)] py-4 md:py-0 md:px-6">
              <span className="text-[11px] uppercase tracking-wider text-[#0B7A4E] block">Friday Payout</span>
              <h4 className="text-2xl font-mono font-semibold text-[#0B7A4E] tabular-nums">
                ₦{selectedPlanCalc.weeklyPayout.toLocaleString()}
              </h4>
              <p className="text-xs opacity-60">24 consecutive Fridays</p>
            </div>

            <div className="space-y-1 md:pl-2">
              <span className="text-[11px] uppercase tracking-wider text-[#9A7B3E] block">24-Week Total</span>
              <h4 className="text-2xl font-mono font-semibold text-[#9A7B3E] tabular-nums">
                ₦{selectedPlanCalc.totalReturns.toLocaleString()}
              </h4>
              <p className="text-xs opacity-60">Structured property cycle</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => openDeedForPlan(selectedPlanCalc)}
              className="py-2.5 px-4 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Preview Title Deed</span>
            </button>
          </div>
        </div>
      )}

      {/* TOOLS TAB */}
      {activeTab === 'tools' && (
        <div className="pm-card rounded-2xl p-6 space-y-5">
          <div className="border-b border-[var(--pm-border)] pb-3">
            <h3 className="font-serif text-2xl font-semibold">Sharing Tools</h3>
            <p className="text-xs opacity-60 mt-0.5">Direct invite link and multilingual pitch templates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="pm-card-subtle rounded-xl p-5 space-y-3">
              <span className="text-xs font-semibold block">Multilingual Pitch Templates</span>
              <p className="text-xs opacity-65">
                Ready-to-share investment summaries in 6 languages with your code embedded.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLeadForPitch(null);
                  setIsPitchModalOpen(true);
                }}
                className="bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 w-full cursor-pointer"
                id="btn_open_multilingual_broadcast"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Pitch Templates</span>
              </button>
            </div>

            <div className="pm-card-subtle rounded-xl p-5 space-y-3">
              <span className="text-xs font-semibold block">Direct Invite Link</span>
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full bg-[var(--pm-surface)] border border-[var(--pm-border)] rounded-lg px-3 py-2 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="pm-btn-secondary font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 w-full cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#0B7A4E]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Invite Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {viewingDeedInvestment && (
        <UaeDeedModal
          isOpen={!!viewingDeedInvestment}
          onClose={() => setViewingDeedInvestment(null)}
          investment={viewingDeedInvestment}
        />
      )}

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
