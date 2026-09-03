/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StateProvider, useAppState, ADMIN_EMAIL } from './context/StateContext';
import { BrandingHeader, LegalDisclosures } from './components/BrandingHeader';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AujotenPage } from './components/AujotenPage';
import { 
  Building, 
  ShieldCheck, 
  Landmark, 
  ArrowRight, 
  Lock, 
  Mail, 
  UserPlus, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  Key,
  Users,
  AlertTriangle,
  ShieldAlert,
  LayoutGrid,
  Eye,
  EyeOff,
  CheckCircle2,
  User as UserIcon,
  X,
  Globe
} from 'lucide-react';
import { INVESTMENT_PLANS } from './types';
import { PayoutToastContainer } from './components/PayoutToast';

function MainAppContent() {
  const { 
    currentUser, 
    users, 
    settings,
    register, 
    login, 
    successMsg, 
    errorMsg, 
    clearMessages,
    payoutToasts,
    dismissPayoutToast
  } = useAppState();
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminView, setAdminView] = useState<'admin' | 'user'>('admin');
  const [currentPage, setCurrentPage] = useState<'pminvest' | 'aujoten'>(() => {
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      if (path.includes('aujoten') || hash.includes('aujoten') || search.includes('aujoten')) {
        return 'aujoten';
      }
    }
    return 'pminvest';
  });
  
  // URL routing detection (e.g. pminvest.org.ng/aujoten or ?page=aujoten or #aujoten or pathname === '/aujoten')
  useEffect(() => {
    const checkRoute = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      
      if (path.includes('aujoten') || hash.includes('aujoten') || search.includes('aujoten')) {
        setCurrentPage('aujoten');
      } else {
        setCurrentPage('pminvest');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const navigateTo = (page: 'pminvest' | 'aujoten') => {
    setCurrentPage(page);
    if (page === 'aujoten') {
      window.location.hash = 'aujoten';
    } else {
      window.location.hash = '';
      if (window.location.pathname.includes('aujoten')) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  // If user navigated to /aujoten, render the Aujoten dedicated website
  if (currentPage === 'aujoten') {
    return <AujotenPage onBackToPmInvest={() => navigateTo('pminvest')} />;
  }
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRef, setRegRef] = useState('TREASURE_ADMIN');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = register(regName, regEmail, regRef, regPassword);
    if (success) {
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    }
  };

  // Unauthenticated Landing Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans">
        <PayoutToastContainer
          toasts={payoutToasts}
          onDismiss={dismissPayoutToast}
        />
        {/* Affiliation Header bar */}
        <div className="bg-[#0f172a] px-4 py-2.5 text-center text-xs text-slate-300 border-b border-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>PM Invest is a certified wealth program operating under <strong className="text-white">TREASURE HOMES LTD</strong></span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow">
          {/* LEFT PANEL: Promotional, brand values, plans preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Landmark className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">TREASURE HOMES GROUP</span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">PM <span className="text-amber-500">Invest</span> Platform</h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Multiply your capital with asset-backed security. Our yield models are directly leveraged against physical real estate development completions, premium rentals, and corporate mortgage assets managed by <strong>TREASURE HOMES</strong>.
            </p>

            {/* Quick Rates Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Active Investment Tiers (4-Week Cycles)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {INVESTMENT_PLANS.slice(0, 3).map(plan => (
                  <div key={plan.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-xs uppercase">{plan.name}</span>
                      <span className="text-xs text-amber-600 font-mono font-bold">₦{plan.cost.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>Weekly Payout:</span>
                      <span className="text-emerald-600 font-bold">₦{plan.weeklyPayout.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                  <span className="text-[11px] text-slate-700 font-bold uppercase">Up to Plan 5</span>
                  <span className="text-[10px] text-slate-500">₦500k Purchase → ₦1.16M Returns</span>
                </div>
              </div>
            </div>

            {/* Brand benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
              <div className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">Automated weekly payouts</h4>
                  <p className="text-slate-500 mt-0.5">Yield is credited automatically to your investment wallet every week.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Users className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">20% Referral Commission</h4>
                  <p className="text-slate-500 mt-0.5">Earn 20% of your referral's weekly payouts automatically credited to your balance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Clean Auth Forms */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden text-slate-800" id="card_auth_panel">
            {/* Ambient accent background blur */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Segmented Top Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5 border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); clearMessages(); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isRegistering
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab_auth_signin"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); clearMessages(); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isRegistering
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="tab_auth_signup"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Subtitle Header */}
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                {isRegistering ? 'Open Investor Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegistering 
                  ? 'Join PM Invest to start earning weekly mortgage returns.'
                  : 'Enter your credentials to access your portfolio dashboard.'
                }
              </p>
            </div>

            {/* General Feedback Notifications */}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-start justify-between gap-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium leading-relaxed">{successMsg}</span>
                </div>
                <button 
                  onClick={clearMessages} 
                  className="text-emerald-600 hover:text-emerald-800 p-0.5"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start justify-between gap-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
                <button 
                  onClick={clearMessages} 
                  className="text-rose-600 hover:text-rose-800 p-0.5"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {!isRegistering ? (
              /* CLEAN SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. investor@gmail.com"
                      autoComplete="email"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <span className="text-[10px] text-slate-400 font-normal">Optional for unseeded guest accounts</span>
                  </div>
                  <div className="relative">
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      autoComplete="current-password"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                  id="btn_landing_login"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-500">
                  <span>Don't have an account? </span>
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(true); clearMessages(); }}
                    className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </div>
              </form>
            ) : (
              /* CLEAN REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jude Okafor"
                      autoComplete="name"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                      required
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. jude@gmail.com"
                      autoComplete="email"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-sans"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                  <div className="relative">
                    <input 
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                      title={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Sponsor Referral Code</label>
                    <span className="text-[10px] text-amber-600 font-mono font-bold">Auto-Assigned</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={regRef}
                      onChange={(e) => setRegRef(e.target.value.toUpperCase())}
                      placeholder="e.g. TREASURE_ADMIN"
                      className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono uppercase"
                      required
                    />
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Default: <strong className="text-slate-600">TREASURE_ADMIN</strong>. You may also enter a friend or partner's code.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/15 cursor-pointer mt-2"
                  id="btn_landing_register"
                >
                  <span>Create Account</span>
                  <UserPlus className="w-4 h-4" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-500">
                  <span>Already registered? </span>
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(false); clearMessages(); }}
                    className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Brand visual cards section */}
        <div className="bg-[#0f172a] py-8 border-t border-slate-800 text-slate-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-amber-400 font-bold text-sm block">100% REGULATED</span>
              <p className="text-slate-300">Operating transparent escrow reserves under supervision of the Treasure Homes asset board.</p>
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-x border-slate-800 py-4 md:py-0">
              <span className="text-amber-400 font-bold text-sm block font-mono">₦{settings ? Math.floor(settings.liquidityReserve / 1000000) : '78'}M+ RESERVE BACKING</span>
              <p className="text-slate-300">Ensuring complete stability with physical properties and liquid collateral holding records.</p>
            </div>
            <div className="space-y-1">
              <span className="text-amber-400 font-bold text-sm block">KYC INTEGRITY GATE</span>
              <p className="text-slate-300">Anti-fraud protection including verified identification checks for seamless, quick clearances.</p>
            </div>
          </div>
        </div>

        <LegalDisclosures />
      </div>
    );
  }

  // Authenticated workspace
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans pb-10" id="app_workspace_root">
      <PayoutToastContainer
        toasts={payoutToasts}
        onDismiss={dismissPayoutToast}
        onNavigateToWallet={() => {
          if (currentUser?.role === 'admin') {
            setAdminView('user');
          }
          const walletEl = document.getElementById('user_dashboard_container');
          if (walletEl) {
            walletEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
      <div>
        <BrandingHeader />
        
        {currentUser.role === 'admin' && (
          <div className="bg-[#1e293b] border-b border-slate-700 py-3 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Treasure Homes Authorized Admin session</span>
              </div>
              <div className="flex gap-2 bg-[#0f172a] p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setAdminView('admin')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Control Panel
                </button>
                <button
                  onClick={() => setAdminView('user')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'user'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Investor View (Full Build)
                </button>
              </div>
            </div>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentUser.role === 'admin' ? (
            adminView === 'admin' ? (
              <AdminPanel />
            ) : (
              <UserDashboard />
            )
          ) : (
            <UserDashboard />
          )}
        </main>
      </div>

      <LegalDisclosures />
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <MainAppContent />
    </StateProvider>
  );
}
