import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Clock, 
  CreditCard,
  Building,
  UploadCloud,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { INVESTMENT_PLANS, InvestmentPlan } from '../types';

export const UserDashboard: React.FC = () => {
  const { 
    currentUser, 
    investments, 
    transactions, 
    users, 
    settings,
    submitDeposit, 
    submitWithdrawal, 
    purchaseInvestment, 
    submitKyc,
    successMsg,
    errorMsg,
    clearMessages
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'overview' | 'invest' | 'finance' | 'referrals' | 'kyc'>('overview');
  
  // Deposit state
  const [depAmount, setDepAmount] = useState<string>('');
  const [depMethod, setDepMethod] = useState<string>('Bank Transfer (Treasure Homes Escrow)');
  const [depDetails, setDepDetails] = useState<string>('');
  
  // Real Receipt Upload states
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Withdrawal state
  const [withAmount, setWithAmount] = useState<string>('');
  const [withDetails, setWithDetails] = useState<string>('');

  // KYC state
  const [kycName, setKycName] = useState<string>(currentUser?.name || '');
  const [kycType, setKycType] = useState<string>('National ID Card');
  const [kycNumber, setKycNumber] = useState<string>('');

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!currentUser) return null;

  // Calculate stats
  const userInvestments = investments.filter(i => i.userId === currentUser.id);
  const activeInvestments = userInvestments.filter(i => i.status === 'active');
  const completedInvestments = userInvestments.filter(i => i.status === 'completed');
  
  const totalInvested = userInvestments.reduce((sum, i) => sum + i.cost, 0);
  const totalEarnedPayouts = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'payout' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReferralBonus = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'referral_bonus' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions
    .filter(t => t.userId === currentUser.id && t.type === 'withdrawal' && t.status === 'pending');

  const referredUsers = users.filter(u => u.referredByCode === currentUser.referralCode);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
    setDepAmount('');
    setDepDetails('');
    setReceiptFile(null);
    setReceiptUrl('');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withAmount);
    if (isNaN(amt) || amt <= 0) return;
    const success = submitWithdrawal(amt, withDetails);
    if (success) {
      setWithAmount('');
      setWithDetails('');
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc(kycName, kycType, kycNumber);
  };

  const handlePurchase = (plan: InvestmentPlan) => {
    purchaseInvestment(plan.id);
  };

  return (
    <div className="w-full text-slate-800 p-1" id="user_dashboard_container">
      {/* Alert Banner for Global messages */}
      {successMsg && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-emerald-600 hover:text-emerald-800 text-xs font-mono px-2">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-rose-600 hover:text-rose-800 text-xs font-mono px-2">Dismiss</button>
        </div>
      )}

      {/* KYC Alert banner if unverified */}
      {currentUser.kycStatus === 'unverified' && (
        <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Optional KYC Verification Pending</p>
              <p className="text-slate-600 mt-0.5">Submit your identification details to prevent future manual withdrawal clearance holding times.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('kyc')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-1.5 rounded-lg transition-colors self-start sm:self-auto shrink-0 text-xs shadow-sm"
            id="btn_kyc_alert_action"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto pb-1 mb-6 border-b border-slate-200 gap-1 sm:gap-2">
        <button
          onClick={() => { setActiveTab('overview'); clearMessages(); }}
          className={`px-4 py-2.5 rounded-t-lg font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-slate-100 text-slate-950 border-t-2 border-amber-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_user_overview"
        >
          <TrendingUp className="w-4 h-4 text-amber-500" /> Overview
        </button>
        <button
          onClick={() => { setActiveTab('invest'); clearMessages(); }}
          className={`px-4 py-2.5 rounded-t-lg font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'invest'
              ? 'bg-slate-100 text-slate-950 border-t-2 border-amber-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_user_invest"
        >
          <Sparkles className="w-4 h-4 text-amber-500" /> Buy Plans
        </button>
        <button
          onClick={() => { setActiveTab('finance'); clearMessages(); }}
          className={`px-4 py-2.5 rounded-t-lg font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'finance'
              ? 'bg-slate-100 text-slate-950 border-t-2 border-amber-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_user_finance"
        >
          <Wallet className="w-4 h-4 text-amber-500" /> Deposit & Withdraw
        </button>
        <button
          onClick={() => { setActiveTab('referrals'); clearMessages(); }}
          className={`px-4 py-2.5 rounded-t-lg font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'referrals'
              ? 'bg-slate-100 text-slate-950 border-t-2 border-amber-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_user_referrals"
        >
          <Users className="w-4 h-4 text-amber-500" /> Referral 50%
        </button>
        <button
          onClick={() => { setActiveTab('kyc'); clearMessages(); }}
          className={`px-4 py-2.5 rounded-t-lg font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'kyc'
              ? 'bg-slate-100 text-slate-950 border-t-2 border-amber-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_user_kyc"
        >
          <FileText className="w-4 h-4 text-amber-500" /> KYC Verification
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Wallet Balance</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">₦{currentUser.walletBalance.toLocaleString()}</h3>
                <span className="text-[10px] text-amber-600 font-medium font-sans">Available for immediate withdrawal</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Active Capital</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  ₦{activeInvestments.reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-sans">{activeInvestments.length} Active Plans</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Simulated Earnings</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">₦{totalEarnedPayouts.toLocaleString()}</h3>
                <span className="text-[10px] text-slate-400 font-sans">Received from payouts</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-amber-500">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium font-sans uppercase tracking-wider">Referral Income</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">₦{totalReferralBonus.toLocaleString()}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold font-sans">50% weekly commission active</span>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Active Investments section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
              My Active Investments ({activeInvestments.length})
            </h3>

            {activeInvestments.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No active investments found.</p>
                <p className="text-xs text-slate-500 mt-1">Go to the "Buy Plans" tab to purchase an investment plan starting at ₦15,000.</p>
                <button
                  onClick={() => setActiveTab('invest')}
                  className="mt-4 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Explore Plans
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInvestments.map((inv) => {
                  const percentComplete = (inv.weeksPaid / inv.totalWeeks) * 100;
                  return (
                    <div key={inv.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xs">
                      {/* Brand background watermark */}
                      <div className="absolute right-2 top-2 opacity-10 pointer-events-none">
                        <Building className="w-20 h-20 text-slate-300" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">{inv.planName}</span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            ACTIVE
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-3 text-xs border-y border-slate-200 py-3">
                          <div>
                            <span className="text-slate-500 block font-light">Capital Invested</span>
                            <span className="text-sm font-bold text-slate-900">₦{inv.cost.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block font-light">Target Returns</span>
                            <span className="text-sm font-bold text-amber-600">₦{inv.totalReturns.toLocaleString()}</span>
                          </div>
                          <div className="col-span-2 pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 block font-light">Weekly Payout Credited</span>
                            <span className="text-sm font-bold text-slate-900">₦{inv.weeklyPayout.toLocaleString()} / week</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="my-3">
                          <div className="flex justify-between text-[11px] mb-1 font-mono text-slate-500">
                            <span>Payout Cycles</span>
                            <span>{inv.weeksPaid} / {inv.totalWeeks} Weeks</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentComplete}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between">
                        <span>Invested on: {new Date(inv.createdAt).toLocaleDateString()}</span>
                        <span>Next Cycle: Auto Weekly Payout</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User History List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Recent Transactions
            </h3>

            {transactions.filter(t => t.userId === currentUser.id).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No transaction history found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="pb-2 font-mono">Date</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions
                      .filter(t => t.userId === currentUser.id)
                      .slice(0, 8)
                      .map((tx) => {
                        let typeColor = 'text-amber-600';
                        if (tx.type === 'deposit') typeColor = 'text-emerald-600';
                        if (tx.type === 'referral_bonus') typeColor = 'text-amber-600';
                        if (tx.type === 'withdrawal' && tx.status === 'completed') typeColor = 'text-rose-600';

                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-mono text-[11px] text-slate-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className={`py-2.5 font-semibold capitalize ${typeColor}`}>
                              {tx.type.replace('_', ' ')}
                            </td>
                            <td className="py-2.5 text-slate-600 text-[11px]">
                              {tx.description}
                            </td>
                            <td className="py-2.5 text-right font-bold font-mono text-slate-900">
                              ₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                            </td>
                            <td className="py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                                tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 tracking-wide uppercase">Select Wealth Growth Plan</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
              Our plans run for a fixed duration of <strong>4 weeks</strong>. Weekly payouts are credited automatically to your wallet and are fully withdrawable anytime.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mortgage & Real Estate backed by <strong>Treasure Homes</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INVESTMENT_PLANS.map((plan) => {
              const isAffordable = currentUser.walletBalance >= plan.cost;
              return (
                <div 
                  key={plan.id} 
                  className={`bg-white border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
                    isAffordable ? 'border-amber-300 hover:border-amber-500 hover:shadow-lg' : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-lg tracking-widest font-mono">
                    REAL ESTATE TRUST
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900 uppercase tracking-wider">{plan.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Asset Backed Fixed Yield</p>
                    
                    <div className="my-5 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500">Purchase Price:</span>
                        <span className="text-lg font-extrabold text-slate-900">₦{plan.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500">Total Returns (4w):</span>
                        <span className="text-base font-bold text-amber-600">₦{plan.totalReturns.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-slate-200 w-full" />
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-emerald-600 font-semibold">Weekly Payout:</span>
                        <span className="text-base font-bold text-emerald-600">₦{plan.weeklyPayout.toLocaleString()}</span>
                      </div>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-2 mb-6">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>4 automated weekly cycles</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>50% Weekly Sponsor Referral Commission</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Instant Wallet credit on cycle end</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={!isAffordable}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                      isAffordable 
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    id={`btn_purchase_${plan.id}`}
                  >
                    {isAffordable ? `Invest ₦${plan.cost.toLocaleString()}` : 'Insufficient Balance'}
                  </button>
                  
                  {!isAffordable && (
                    <p className="text-[10px] text-center text-rose-600 mt-2 font-sans">
                      Add at least ₦{(plan.cost - currentUser.walletBalance).toLocaleString()} to buy this plan.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FINANCE (DEPOSIT & WITHDRAWAL) TAB */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DEPOSIT MODULE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                Capital Deposit (Escrow Transfer)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Fund your wallet by transferring to the registered Treasure Homes bank details below. Submit your details and proof to initiate verification.
              </p>
            </div>

            {/* Treasure Homes Escrow Accounts */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Building className="w-4 h-4 text-amber-500" />
                <span>TREASURE HOMES TRUSTEE BANK DETAILS</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-semibold text-slate-900">United Bank for Africa (UBA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Name:</span>
                  <span className="font-semibold text-slate-900">Treasure Homes Ltd - Escrow Holdings</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Account Number:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-600 font-mono text-sm">1023485720</span>
                    {copiedAccount ? (
                      <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider font-mono">Copied!</span>
                    ) : (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('1023485720');
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2000);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy Account Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Transfer Amount (₦)</label>
                <input 
                  type="number" 
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Payment Method</label>
                <select 
                  value={depMethod}
                  onChange={(e) => setDepMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option>Bank Transfer (Treasure Homes Escrow)</option>
                  <option>USDT-TRC20 Stablecoin Account</option>
                  <option>Naira Cards (Instant Gateway)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Sender Bank & Name / Transaction Reference</label>
                <input 
                  type="text" 
                  value={depDetails}
                  onChange={(e) => setDepDetails(e.target.value)}
                  placeholder="e.g. Access Bank - John Doe Transfer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Receipt Upload with Drag & Drop & Click */}
              <div className="space-y-2">
                <label className="block text-xs text-slate-500 font-medium">Attach Receipt / Payment Proof</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-amber-500 bg-amber-50/50' 
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'
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
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto animate-bounce-slow" />
                    <div className="text-xs text-slate-600">
                      {receiptFile ? (
                        <span className="font-bold text-amber-600 font-mono text-[11px] break-all">
                          Selected: {receiptFile.name}
                        </span>
                      ) : (
                        <span>Drag and drop your receipt here, or <strong className="text-amber-600 hover:underline">browse files</strong></span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">Supports PNG, JPG, or PDF (Max 5MB)</p>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm shadow-emerald-600/10"
                id="btn_submit_deposit"
              >
                Submit Deposit proof
              </button>
            </form>

            {/* List of User Pending Deposits */}
            {pendingDeposits.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Deposit Approvals ({pendingDeposits.length})
                </h4>
                {pendingDeposits.map(t => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex justify-between items-center shadow-xs">
                    <div>
                      <p className="font-bold text-slate-900">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{t.paymentMethod} - {new Date(t.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-200 rounded font-mono uppercase tracking-widest animate-pulse font-bold">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WITHDRAWAL MODULE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-600" />
                Wallet Withdrawal
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Initiate payouts directly to your personal bank account. Manual audit systems enforce security limits to preserve asset liquidity.
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>STABILITY CONTROLS ACTIVE</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>Minimum single withdrawal: <strong className="text-slate-900">₦{settings.minWithdrawal.toLocaleString()}</strong></li>
                <li>Maximum single withdrawal: <strong className="text-slate-900">₦{settings.maxWithdrawal.toLocaleString()}</strong></li>
                <li>Pending limits check: KYC verified users receive faster clearance.</li>
                <li>Refund Guarantee: Rejected withdrawals are automatically credited back to your wallet.</li>
              </ul>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Withdrawal Amount (₦)</label>
                <input 
                  type="number" 
                  value={withAmount}
                  onChange={(e) => setWithAmount(e.target.value)}
                  placeholder={`Min ₦${settings.minWithdrawal}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Your Receiving Bank Details / Account Number</label>
                <textarea 
                  rows={3}
                  value={withDetails}
                  onChange={(e) => setWithDetails(e.target.value)}
                  placeholder="e.g. GTBank - 0123456789 - Olayinka Williams"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm"
                id="btn_submit_withdrawal"
              >
                Request Withdrawal
              </button>
            </form>

            {/* List of User Pending Withdrawals */}
            {pendingWithdrawals.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Security Clearance ({pendingWithdrawals.length})
                </h4>
                {pendingWithdrawals.map(t => (
                  <div key={t.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">To: {t.accountDetails} - {new Date(t.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 border border-amber-200 rounded font-mono uppercase tracking-widest animate-pulse font-bold">
                      Reviewing
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center max-w-3xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-wide uppercase flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Supercharged 50% Referral Commission Engine
            </h3>
            <p className="text-xs text-slate-600 max-w-xl mx-auto">
              Our unique system pays sponsors **50% of their referral's weekly payouts**. When your friends earn their weekly returns, you receive a massive 50% commission automatically!
            </p>
            <div className="bg-slate-50 inline-flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm">
              <span className="text-slate-500 text-xs">My Sponsor Code:</span>
              <strong className="text-slate-900 font-mono text-base tracking-wider font-extrabold">{currentUser.referralCode}</strong>
              <button 
                onClick={handleCopyCode}
                className="bg-amber-500 text-slate-950 hover:bg-amber-600 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                {copiedCode ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Total Affiliates</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{referredUsers.length}</h3>
              <p className="text-[10px] text-amber-600 font-medium mt-1">Directly signed up with your code</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Affiliate Active Capital</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                ₦{investments
                  .filter(inv => referredUsers.some(ru => ru.id === inv.userId) && inv.status === 'active')
                  .reduce((sum, inv) => sum + inv.cost, 0)
                  .toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Generating weekly yields</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Commission Credited</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">₦{totalReferralBonus.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">From automated weekly 50% shares</p>
            </div>
          </div>

          {/* List of Referred Users */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              My Referral Downline ({referredUsers.length})
            </h3>
            {referredUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">You have not referred any users yet. Share your referral code to start earning!</p>
            ) : (
              <div className="space-y-3">
                {referredUsers.map(ru => {
                  const ruInvestments = investments.filter(inv => inv.userId === ru.id && inv.status === 'active');
                  return (
                    <div key={ru.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{ru.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Signed up on: {new Date(ru.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Active Investments</span>
                          <span className="font-bold text-amber-600">
                            {ruInvestments.length > 0 
                              ? `${ruInvestments.length} plan(s) (₦${ruInvestments.reduce((s, i) => s + i.cost, 0).toLocaleString()})`
                              : 'None'
                            }
                          </span>
                        </div>
                        {ruInvestments.length > 0 && (
                          <div className="bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-700 font-mono text-[9px] border border-emerald-200 font-bold">
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
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Treasure Homes KYC Compliance Centre
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify your identity to lock in maximum withdrawal limits. Verified profiles receive fast-track manual clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-mono block">Status</span>
              <span className={`text-xs font-bold uppercase tracking-wider mt-1 block font-mono ${
                currentUser.kycStatus === 'verified' ? 'text-emerald-600 font-bold' :
                currentUser.kycStatus === 'pending' ? 'text-amber-600 font-bold animate-pulse' :
                currentUser.kycStatus === 'rejected' ? 'text-rose-600 font-bold' :
                'text-slate-500 font-bold'
              }`}>
                {currentUser.kycStatus}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-mono block">Daily Clearance Limit</span>
              <span className="text-xs font-bold text-slate-900 mt-1 block font-mono">
                {currentUser.kycStatus === 'verified' ? '₦1,000,000' : '₦100,000'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-[10px] text-slate-500 font-mono block">Verification Speed</span>
              <span className="text-xs font-bold text-amber-600 mt-1 block font-sans">
                {currentUser.kycStatus === 'verified' ? 'Priority 2 Hours' : 'Standard 24-48 Hours'}
              </span>
            </div>
          </div>

          {currentUser.kycStatus === 'unverified' || currentUser.kycStatus === 'rejected' ? (
            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={kycName}
                    onChange={(e) => setKycName(e.target.value)}
                    placeholder="Same as document"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Identification Document Type</label>
                  <select 
                    value={kycType}
                    onChange={(e) => setKycType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option>National ID Card (NIN)</option>
                    <option>International Passport</option>
                    <option>Driver's License</option>
                    <option>Voters Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Document Number / Unique ID</label>
                <input 
                  type="text" 
                  value={kycNumber}
                  onChange={(e) => setKycNumber(e.target.value)}
                  placeholder="e.g. NIN-84739284729"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <UploadCloud className="w-7 h-7 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-800 font-semibold">Simulated Front Photo Upload</p>
                <p className="text-[10px] text-slate-400">Demo sandbox mode: File attachment is auto-generated for security compliance reviews.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm"
                id="btn_submit_kyc"
              >
                Submit Documents for Review
              </button>
            </form>
          ) : currentUser.kycStatus === 'pending' ? (
            <div className="bg-amber-50/50 border border-amber-200 p-6 rounded-xl text-center space-y-3">
              <Clock className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900">Under Verification Review</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Thank you. Your details ({currentUser.kycDetails?.idType}: {currentUser.kycDetails?.idNumber}) are being audited by the Treasure Homes Compliance team.
              </p>
              <p className="text-[10px] text-amber-600 font-medium">Switch to the Admin view below to approve your KYC instantly for testing!</p>
            </div>
          ) : (
            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Identity Verified</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Excellent. Your account is fully compliant under Treasure Homes regulatory mandates. Standard limit of ₦1,000,000/day is unlocked.
              </p>
              <div className="text-[11px] font-mono text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block text-left text-xs">
                <p>• Verified Legal Name: {currentUser.kycDetails?.fullName}</p>
                <p>• Verified ID: {currentUser.kycDetails?.idType} ({currentUser.kycDetails?.idNumber})</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
