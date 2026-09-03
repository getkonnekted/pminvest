import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { 
  ShieldAlert, 
  TrendingUp, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  FileText, 
  Settings, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  Lock,
  Sparkles,
  Search,
  Settings2,
  Hourglass,
  Flame,
  Building2,
  CalendarCheck,
  BarChart3,
  Share2,
  Award,
  CheckCircle2
} from 'lucide-react';
import { INVESTMENT_PLANS } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    users, 
    investments, 
    transactions, 
    settings, 
    dailyTasks,
    taskSubmissions,
    virtualDate,
    approveDeposit, 
    rejectDeposit, 
    approveWithdrawal, 
    rejectWithdrawal, 
    reviewKyc, 
    updateSettings, 
    approveTaskSubmission,
    rejectTaskSubmission,
    switchUser,
    simulateWeek,
    simulateNextDay,
    resetAll,
    successMsg,
    errorMsg,
    clearMessages
  } = useAppState();

  const [adminTab, setAdminTab] = useState<'analytics' | 'deposits' | 'withdrawals' | 'tasks' | 'users' | 'kyc' | 'settings'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutConfirmationInput, setPayoutConfirmationInput] = useState('');

  // Stats
  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalActiveCapital = activeInvestments.reduce((sum, i) => sum + i.cost, 0);
  const totalAccumulatedPayouts = transactions
    .filter(t => (t.type === 'payout' || t.type === 'referral_bonus') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const pendingKycs = users.filter(u => u.kycStatus === 'pending');
  const pendingTaskSubmissions = taskSubmissions.filter(s => s.status === 'pending');

  const totalRegisteredUsers = users.length;

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.referralCode.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="w-full text-slate-800 p-1" id="admin_panel_container">
      {/* Admin Action Bar */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] text-amber-600 font-mono tracking-widest block uppercase font-extrabold">Treasure Homes Control Centre</span>
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> PM Invest Master Dashboard
          </h2>
        </div>

        {/* Live Simulator Quick Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setPayoutConfirmationInput('');
              setShowPayoutModal(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
            id="btn_simulate_week_admin"
            title="Advance 1 week in the future, credit payouts & calculate referral bonuses!"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Trigger Weekly Payout Cycle
          </button>
          <button
            onClick={() => {
              setResetConfirmationInput('');
              setShowResetModal(true);
            }}
            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors"
            id="btn_reset_platform"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearMessages} className="text-emerald-600 hover:text-emerald-800 font-medium text-xs font-mono px-2">Dismiss</button>
        </div>
      )}

      {/* Admin sub-tabs */}
      <div className="flex flex-wrap overflow-x-auto pb-1 mb-6 border-b border-slate-200 gap-1">
        <button
          onClick={() => { setAdminTab('analytics'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'analytics'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_analytics"
        >
          Analytics
        </button>
        <button
          onClick={() => { setAdminTab('deposits'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'deposits'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_deposits"
        >
          Deposits {pendingDeposits.length > 0 && <span className="bg-amber-500 text-slate-950 font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0">{pendingDeposits.length}</span>}
        </button>
        <button
          onClick={() => { setAdminTab('withdrawals'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'withdrawals'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_withdrawals"
        >
          Withdrawals {pendingWithdrawals.length > 0 && <span className="bg-rose-600 text-white font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0">{pendingWithdrawals.length}</span>}
        </button>
        <button
          onClick={() => { setAdminTab('kyc'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'kyc'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_kyc"
        >
          KYC Audits {pendingKycs.length > 0 && <span className="bg-amber-500 text-slate-950 font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0">{pendingKycs.length}</span>}
        </button>
        <button
          onClick={() => { setAdminTab('tasks'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'tasks'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_tasks"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Daily Tasks</span>
          {pendingTaskSubmissions.length > 0 && (
            <span className="bg-purple-600 text-white font-mono font-bold px-1.5 py-0.5 text-[9px] rounded-full shrink-0 animate-pulse">
              {pendingTaskSubmissions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setAdminTab('users'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'users'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_users"
        >
          Users List ({users.length})
        </button>
        <button
          onClick={() => { setAdminTab('settings'); clearMessages(); }}
          className={`px-3.5 py-2 rounded-t-lg font-bold text-xs tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'settings'
              ? 'bg-slate-100 text-slate-900 border-t-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab_admin_settings"
        >
          Controls
        </button>
      </div>

      {/* ANALYTICS SUB-TAB */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          {/* Liquidity Reserve Status Bar */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase font-medium">Security Compliance Level</span>
              <h3 className="text-xl font-extrabold text-slate-900">TREASURE HOMES ESCROW LIQUIDITY GUARANTEE</h3>
              <p className="text-xs text-slate-600">
                Current Liquidity Reserve backing active yields is calculated synchronously against aggregate pending and completed payout volumes.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-center shrink-0 w-full md:w-auto">
              <span className="text-xs text-amber-600 font-bold block">ACTIVE ESCROW RESERVE</span>
              <span className="text-2xl font-extrabold text-slate-900 block mt-1 font-mono">₦{settings.liquidityReserve.toLocaleString()} Naira</span>
              <span className="text-[11px] text-emerald-600 font-mono font-bold block mt-1">+₦530,234 Naira Daily Accretion</span>
              <span className={`inline-block mt-2 px-3 py-0.5 rounded text-[10px] font-mono font-bold ${
                settings.riskAlertLevel === 'low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                settings.riskAlertLevel === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
              }`}>
                RISK ALERT LEVEL: {settings.riskAlertLevel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 font-medium block font-mono">Total Capital Under Mgmt</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₦{totalActiveCapital.toLocaleString()}</h3>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">{activeInvestments.length} Active Investments</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 font-medium block font-mono">Accumulated Payout Yields</span>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">₦{totalAccumulatedPayouts.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-500 mt-1">Includes payout & ref bonuses</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 font-medium block font-mono">Pending Authorizations</span>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingDeposits.length + pendingWithdrawals.length}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{pendingDeposits.length} deposits | {pendingWithdrawals.length} withdrawals</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 font-medium block font-mono">Registered Investors</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalRegisteredUsers}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">{users.filter(u => u.kycStatus === 'verified').length} verified identities</p>
            </div>
          </div>

          {/* Active Capital Distribution across Plans */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Plan Distribution & Exposure
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {INVESTMENT_PLANS.map(plan => {
                const count = investments.filter(i => i.planId === plan.id && i.status === 'active').length;
                return (
                  <div key={plan.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">{plan.name}</span>
                    <span className="text-slate-500 text-[10px] block">Cost: ₦{plan.cost.toLocaleString()}</span>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-emerald-600 font-medium">Count: {count}</span>
                      <span className="font-bold text-amber-600">₦{(count * plan.cost).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DEPOSITS LIST SUB-TAB */}
      {adminTab === 'deposits' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Pending Escrow Deposits ({pendingDeposits.length})</span>
            <span className="text-xs text-slate-500 font-mono">Require manual confirmation of escrow receipt</span>
          </h3>

          {pendingDeposits.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No pending deposits require verification.</p>
          ) : (
            <div className="space-y-4">
              {pendingDeposits.map((tx) => (
                <div key={tx.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">₦{tx.amount.toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">by {tx.userName}</span>
                    </div>
                    <p className="text-slate-600">Method: <strong className="text-slate-900 font-medium">{tx.paymentMethod}</strong> | Account details: <strong className="text-slate-900 font-medium">{tx.accountDetails}</strong></p>
                    <p className="text-slate-400 text-[10px] font-mono">ID: {tx.id} | Submitted: {new Date(tx.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Receipt display & actions */}
                  <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    {tx.proofUrl && (
                      <a href={tx.proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-amber-600 hover:underline hover:text-amber-800 font-semibold">
                        <Eye className="w-3.5 h-3.5" /> View Receipt Proof
                      </a>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveDeposit(tx.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-3 py-1.5 transition-colors"
                        id={`btn_approve_dep_${tx.id}`}
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => rejectDeposit(tx.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg px-3 py-1.5 transition-colors"
                        id={`btn_reject_dep_${tx.id}`}
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WITHDRAWALS LIST SUB-TAB */}
      {adminTab === 'withdrawals' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Pending Withdrawal Clearance ({pendingWithdrawals.length})</span>
            <span className="text-xs text-slate-500 font-mono">Verify liquidity limits & transfer payout manually</span>
          </h3>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No pending withdrawals requiring compliance review.</p>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((tx) => {
                const user = users.find(u => u.id === tx.userId);
                const isKycVerified = user?.kycStatus === 'verified';
                return (
                  <div key={tx.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">₦{tx.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">by {tx.userName}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          isKycVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isKycVerified ? 'KYC VERIFIED' : 'KYC UNVERIFIED'}
                        </span>
                      </div>
                      <p className="text-slate-600">Receiving account: <strong className="text-slate-900 font-mono font-medium">{tx.accountDetails}</strong></p>
                      <p className="text-slate-400 text-[10px] font-mono">ID: {tx.id} | Requested: {new Date(tx.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveWithdrawal(tx.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-3 py-1.5 transition-colors"
                        id={`btn_approve_with_${tx.id}`}
                      >
                        <Check className="w-3.5 h-3.5" /> Clear & Pay
                      </button>
                      <button
                        onClick={() => rejectWithdrawal(tx.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg px-3 py-1.5 transition-colors"
                        id={`btn_reject_with_${tx.id}`}
                      >
                        <X className="w-3.5 h-3.5" /> Reject & Refund
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* KYC AUDITS TAB */}
      {adminTab === 'kyc' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Identity Verification Compliance Reviews ({pendingKycs.length})
          </h3>

          {pendingKycs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No pending KYC files awaiting review.</p>
          ) : (
            <div className="space-y-4">
              {pendingKycs.map((u) => (
                <div key={u.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{u.name}</p>
                    <p className="text-slate-600 font-mono">Email: {u.email} | Code: {u.referralCode}</p>
                    <div className="bg-white border border-slate-200 p-3 rounded-lg text-[11px] text-slate-700 mt-2 font-mono">
                      <p><strong>• Legal Name:</strong> {u.kycDetails?.fullName}</p>
                      <p><strong>• Document Type:</strong> {u.kycDetails?.idType}</p>
                      <p><strong>• Document ID:</strong> {u.kycDetails?.idNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => reviewKyc(u.id, true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-3.5 py-1.5 transition-colors"
                      id={`btn_approve_kyc_${u.id}`}
                    >
                      <Check className="w-3.5 h-3.5" /> Accept KYC
                    </button>
                    <button
                      onClick={() => reviewKyc(u.id, false)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg px-3.5 py-1.5 transition-colors"
                      id={`btn_reject_kyc_${u.id}`}
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SYSTEM CONTROLS TAB */}
      {adminTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-amber-500" /> System Settings & Stability Controls
          </h3>

          <div className="space-y-5 text-xs">
            {/* Auto approve deposits toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Automated Deposit Approvals</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Skip manual escrow confirmation and credit payments instantly.</p>
              </div>
              <button
                onClick={() => updateSettings({ autoApproveDeposits: !settings.autoApproveDeposits })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                  settings.autoApproveDeposits ? 'bg-amber-500' : 'bg-slate-200'
                }`}
                type="button"
                id="btn_toggle_auto_approve"
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                  settings.autoApproveDeposits ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Pause New Investments toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Pause New Investments</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Prevent users from purchasing any new investment plans. Existing plans still earn weekly yields.</p>
              </div>
              <button
                onClick={() => updateSettings({ pauseInvestments: !settings.pauseInvestments })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                  settings.pauseInvestments ? 'bg-amber-500' : 'bg-slate-200'
                }`}
                type="button"
                id="btn_toggle_pause_investments"
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                  settings.pauseInvestments ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Pause Withdrawals toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Pause Withdrawals</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Temporarily freeze new withdrawal requests during system updates or balance audits.</p>
              </div>
              <button
                onClick={() => updateSettings({ pauseWithdrawals: !settings.pauseWithdrawals })}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                  settings.pauseWithdrawals ? 'bg-rose-500' : 'bg-slate-200'
                }`}
                type="button"
                id="btn_toggle_pause_withdrawals"
              >
                <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                  settings.pauseWithdrawals ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Minimum / Maximum Withdrawal sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-medium text-slate-700 block">Min Withdrawal (₦)</span>
                <input 
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={(e) => updateSettings({ minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-slate-900 font-semibold text-xs font-mono"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-medium text-slate-700 block">Max Withdrawal (₦)</span>
                <input 
                  type="number"
                  value={settings.maxWithdrawal}
                  onChange={(e) => updateSettings({ maxWithdrawal: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-slate-900 font-semibold text-xs font-mono"
                />
              </div>
            </div>

            {/* Daily Task Controls */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Daily Task Economy Settings
              </h4>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Enable Daily Task System</p>
                  <p className="text-slate-500 text-[10px]">Allow users to access daily property inspection audits and check-ins for yield bonuses.</p>
                </div>
                <button
                  onClick={() => updateSettings({ dailyTaskEnabled: !settings.dailyTaskEnabled })}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                    settings.dailyTaskEnabled ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                  type="button"
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                    settings.dailyTaskEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Daily Bonus Rate</span>
                  <select
                    value={settings.dailyTaskBonusRate ?? 0.05}
                    onChange={(e) => updateSettings({ dailyTaskBonusRate: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  >
                    <option value={0.03}>3% of Weekly Payout</option>
                    <option value={0.05}>5% of Weekly Payout (Recommended)</option>
                    <option value={0.08}>8% of Weekly Payout</option>
                    <option value={0.10}>10% of Weekly Payout</option>
                  </select>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">Base Pool (Non-Investors)</span>
                  <input
                    type="number"
                    value={settings.dailyTaskBaseReward ?? 200}
                    onChange={(e) => updateSettings({ dailyTaskBaseReward: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">7-Day Consistency Bonus</span>
                  <input
                    type="number"
                    value={settings.dailyTaskStreakBonus ?? 1500}
                    onChange={(e) => updateSettings({ dailyTaskStreakBonus: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Free Trial Limit & Monetization Engine Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-950 block">Free Starter Cashout Limit</span>
                    <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">₦3,000 Cap</span>
                  </div>
                  <input
                    type="number"
                    value={settings.freeStarterWithdrawalLimit ?? 3000}
                    onChange={(e) => updateSettings({ freeStarterWithdrawalLimit: Number(e.target.value) })}
                    className="w-full bg-white border border-amber-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                  <p className="text-[10px] text-amber-800">Max trial withdrawal before requiring investment upgrade.</p>
                </div>

                <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-950 block">Rewarded Ad Boost Multiplier</span>
                    <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-mono font-bold">2X Multiplier</span>
                  </div>
                  <select
                    value={settings.rewardedAdBonusMultiplier ?? 2}
                    onChange={(e) => updateSettings({ rewardedAdBonusMultiplier: Number(e.target.value) })}
                    className="w-full bg-white border border-purple-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 font-mono font-bold"
                  >
                    <option value={1.5}>1.5X Yield</option>
                    <option value={2}>2.0X Yield (Standard 100% Boost)</option>
                    <option value={2.5}>2.5X Yield</option>
                  </select>
                  <p className="text-[10px] text-purple-800">Bonus paid on 12-second sponsor video completion.</p>
                </div>

                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 block">Ad Revenue Pool</span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">Self-Funding</span>
                  </div>
                  <div className="text-base font-extrabold font-mono text-emerald-700">
                    ₦{(settings.estimatedAdRevenueTotal || 284500).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-emerald-800">100% sponsor-funded ad income covering free task yields.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAILY TASKS MANAGEMENT SUB-TAB */}
      {adminTab === 'tasks' && (
        <div className="space-y-6">
          {/* Economy Overview & Controls Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] text-amber-600 font-mono font-bold uppercase tracking-wider block">Investor Engagement & Retention</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" /> Daily Task Economy & Balancing Controls
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={simulateNextDay}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors font-mono"
                  id="btn_admin_sim_next_day"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" /> Advance Day (+₦530,234 Naira Liquidity)
                </button>
              </div>
            </div>

            {/* Plan Tier Multiplier Matrix */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Live Tier Daily Pool Multipliers ({Math.round((settings.dailyTaskBonusRate ?? 0.05) * 100)}% of Weekly Yield)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {INVESTMENT_PLANS.map((plan) => {
                  const dailyRate = Math.round(plan.weeklyPayout * (settings.dailyTaskBonusRate ?? 0.05));
                  return (
                    <div key={plan.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                      <span className="font-bold text-slate-900 block truncate">{plan.name}</span>
                      <div className="text-slate-500 text-[11px]">
                        Weekly Payout: <strong className="text-slate-800">₦{plan.weeklyPayout.toLocaleString()}</strong>
                      </div>
                      <div className="text-amber-600 font-mono font-bold text-xs pt-1 border-t border-slate-200">
                        Daily Task Pool: ₦{dailyRate.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Toggle & Balancing Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Daily Task System</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {settings.dailyTaskEnabled ? '● Active & Live' : '○ Paused'}
                  </span>
                </div>
                <button
                  onClick={() => updateSettings({ dailyTaskEnabled: !settings.dailyTaskEnabled })}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors relative ${
                    settings.dailyTaskEnabled ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                  type="button"
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                    settings.dailyTaskEnabled ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs font-bold text-slate-800 block">Proportional Bonus Rate</label>
                <select
                  value={settings.dailyTaskBonusRate ?? 0.05}
                  onChange={(e) => updateSettings({ dailyTaskBonusRate: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-mono font-bold text-slate-900"
                >
                  <option value={0.03}>3% of Weekly Payout</option>
                  <option value={0.05}>5% of Weekly Payout (Standard Option 2)</option>
                  <option value={0.08}>8% of Weekly Payout</option>
                  <option value={0.10}>10% of Weekly Payout</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs font-bold text-slate-800 block">7-Day Consistency Bonus</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settings.dailyTaskStreakBonus ?? 1500}
                    onChange={(e) => updateSettings({ dailyTaskStreakBonus: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-mono">NGN</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Task Proof Submissions Audit Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  Social & Growth Proof Submissions ({taskSubmissions.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review proof submitted by investors for growth bounties and credit rewards upon compliance verification.
                </p>
              </div>

              {pendingTaskSubmissions.length > 0 && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold font-mono px-3 py-1 rounded-full">
                  {pendingTaskSubmissions.length} Pending Review
                </span>
              )}
            </div>

            {taskSubmissions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No user proof submissions recorded yet. Submissions made via the Growth Bounty will appear here for admin audit.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-2 font-mono">Submitted</th>
                      <th className="pb-2">User / Investor</th>
                      <th className="pb-2">Quest Title</th>
                      <th className="pb-2">Proof / Link Details</th>
                      <th className="pb-2 text-right">Bounty Reward</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-center">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taskSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-mono text-[11px] text-slate-400">
                          {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{sub.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{sub.userEmail}</div>
                        </td>
                        <td className="py-3 font-medium text-slate-800">
                          {sub.taskTitle}
                        </td>
                        <td className="py-3">
                          <div className="max-w-xs font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 break-all select-all">
                            {sub.proof}
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600">
                          +₦{sub.rewardAmount.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            sub.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {sub.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => approveTaskSubmission(sub.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                                id={`btn_approve_sub_${sub.id}`}
                                title="Approve and credit bounty to user balance"
                              >
                                <Check className="w-3 h-3" /> Approve (+₦{sub.rewardAmount})
                              </button>
                              <button
                                onClick={() => rejectTaskSubmission(sub.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors"
                                id={`btn_reject_sub_${sub.id}`}
                                title="Reject submission"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {sub.status === 'approved' ? 'Audited & Credited' : 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Quests Catalog Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-amber-500" /> Active Daily Quests Blueprint ({dailyTasks.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dailyTasks.map((t) => (
                <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {t.category.toUpperCase()} • {t.rewardShare > 0 ? `${Math.round(t.rewardShare * 100)}% pool` : `₦${t.fixedReward} fixed`}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1.5">{t.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                    {t.verificationType === 'instant' ? '⚡ Instant' : '📋 Submission'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS LIST TAB */}
      {adminTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Platform Registered Users ({filteredUsers.length})
            </h3>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 text-xs">
              <input
                type="text"
                placeholder="Search name, email, or code..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-2">Name & Email</th>
                  <th className="pb-2">Ref Code</th>
                  <th className="pb-2 text-right">Wallet Balance</th>
                  <th className="pb-2 text-center">KYC Status</th>
                  <th className="pb-2 text-center">Role</th>
                  <th className="pb-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const uInvestments = investments.filter(inv => inv.userId === u.id);
                  const activeCount = uInvestments.filter(i => i.status === 'active').length;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-amber-600 font-bold">
                        {u.referralCode}
                      </td>
                      <td className="py-2.5 text-right font-bold font-mono text-slate-900">
                        ₦{u.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          u.kycStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          u.kycStatus === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                          'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {u.kycStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-bold capitalize font-mono text-[11px] text-slate-700">
                        {u.role}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => switchUser(u.id)}
                          className="bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-700 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-bold transition-colors"
                          id={`btn_switch_user_${u.id}`}
                          title={`Switch session to ${u.name}`}
                        >
                          <Eye className="w-3 h-3" /> Login As
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleIn">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">Confirm Database Reset</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This action is highly destructive and irreversible. It will erase all users, investments, transactions, and settings, rebuilding the default starting data state.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Type <span className="font-mono text-rose-600 font-extrabold select-all">RESET DATABASE</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmationInput}
                onChange={(e) => setResetConfirmationInput(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                placeholder="RESET DATABASE"
                className="w-full font-mono text-sm border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-center tracking-wider font-bold"
                autoFocus
                autoComplete="off"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Copying and pasting is disabled for safety.
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resetConfirmationInput === 'RESET DATABASE') {
                    resetAll();
                    setShowResetModal(false);
                  }
                }}
                disabled={resetConfirmationInput !== 'RESET DATABASE'}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-colors text-white ${
                  resetConfirmationInput === 'RESET DATABASE'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10'
                    : 'bg-slate-200 cursor-not-allowed text-slate-400'
                }`}
              >
                Reset Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Confirmation Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-scaleIn">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                <RefreshCw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-950">Confirm Weekly Payout Cycle</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This will advance the system timeline by 1 week, trigger all weekly yield payouts on active user investment plans, and update user balances. This operation cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Type <span className="font-mono text-amber-600 font-extrabold select-all">TRIGGER PAYOUT</span> to confirm:
              </label>
              <input
                type="text"
                value={payoutConfirmationInput}
                onChange={(e) => setPayoutConfirmationInput(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                placeholder="TRIGGER PAYOUT"
                className="w-full font-mono text-sm border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-center tracking-wider font-bold"
                autoFocus
                autoComplete="off"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Copying and pasting is disabled for safety.
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (payoutConfirmationInput === 'TRIGGER PAYOUT') {
                    simulateWeek();
                    setShowPayoutModal(false);
                  }
                }}
                disabled={payoutConfirmationInput !== 'TRIGGER PAYOUT'}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-colors ${
                  payoutConfirmationInput === 'TRIGGER PAYOUT'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'bg-slate-200 cursor-not-allowed text-slate-400'
                }`}
              >
                Trigger Payouts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
