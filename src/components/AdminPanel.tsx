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
  Hourglass
} from 'lucide-react';
import { INVESTMENT_PLANS } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    users, 
    investments, 
    transactions, 
    settings, 
    approveDeposit, 
    rejectDeposit, 
    approveWithdrawal, 
    rejectWithdrawal, 
    reviewKyc, 
    updateSettings, 
    switchUser,
    simulateWeek,
    resetAll,
    successMsg,
    errorMsg,
    clearMessages
  } = useAppState();

  const [adminTab, setAdminTab] = useState<'analytics' | 'deposits' | 'withdrawals' | 'users' | 'kyc' | 'settings'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');

  // Stats
  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalActiveCapital = activeInvestments.reduce((sum, i) => sum + i.cost, 0);
  const totalAccumulatedPayouts = transactions
    .filter(t => (t.type === 'payout' || t.type === 'referral_bonus') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
  const pendingKycs = users.filter(u => u.kycStatus === 'pending');

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
            onClick={simulateWeek}
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
              <span className="text-2xl font-extrabold text-slate-900 block mt-1">₦{settings.liquidityReserve.toLocaleString()}</span>
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
    </div>
  );
};
