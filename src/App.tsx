/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { StateProvider, useAppState } from './context/StateContext';
import { BrandingHeader, LegalDisclosures } from './components/BrandingHeader';
import { PmLogo } from './components/PmLogo';
import { 
  Building, 
  ShieldCheck, 
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
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  User as UserIcon,
  Phone,
  X,
  Globe,
  KeyRound,
  RotateCcw,
  MapPin,
  Award,
  Clock,
  MessageSquare
} from 'lucide-react';
import { INVESTMENT_PLANS } from './types';
import { PayoutToastContainer } from './components/PayoutToast';
import { LiveReserveCounter } from './components/LiveReserveCounter';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { UaeFlag } from './components/UaeFlag';
import { PayoutCountdown } from './components/PayoutCountdown';
import { WHATSAPP_COMMUNITY_URL } from './components/CommunityBanner';
import { sanitizeAndValidatePhone } from './lib/phoneSanitizer';

const UserDashboard = React.lazy(() => import('./components/UserDashboard').then(module => ({ default: module.UserDashboard })));
const MarketerDashboard = React.lazy(() => import('./components/MarketerDashboard').then(module => ({ default: module.MarketerDashboard })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));
const AujotenPage = React.lazy(() => import('./components/AujotenPage').then(module => ({ default: module.AujotenPage })));

function MainAppContent() {
  const { isChampagne } = useTheme();
  // Pure lightweight native hardware-accelerated scrolling with zero JS main-thread overhead
  const { 
    currentUser, 
    users, 
    settings,
    liveLiquidityReserve,
    register, 
    login, 
    requestPasswordReset,
    confirmPasswordReset,
    successMsg, 
    errorMsg, 
    clearMessages,
    payoutToasts,
    dismissPayoutToast
  } = useAppState();
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminView, setAdminView] = useState<'admin' | 'investor' | 'marketer'>('admin');
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
    const handleAdminViewSwitch = (e: any) => {
      if (e.detail && (e.detail === 'admin' || e.detail === 'investor' || e.detail === 'marketer')) {
        setAdminView(e.detail);
      }
    };
    window.addEventListener('switch-admin-view', handleAdminViewSwitch);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('switch-admin-view', handleAdminViewSwitch);
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
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-slate-950 p-8 text-center text-sm text-slate-300">Loading page…</div>}>
        <AujotenPage onBackToPmInvest={() => navigateTo('pminvest')} />
      </React.Suspense>
    );
  }
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const regPhoneValidation = sanitizeAndValidatePhone(regPhone);
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRef, setRegRef] = useState('');

  // Check URL params for referral code if provided and take visitor straight to Create Account
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      if (refParam) {
        const cleanRef = refParam.toUpperCase().trim();
        setRegRef(cleanRef);
        setIsRegistering(true); // Takes visitor directly to CREATE ACCOUNT
        setTimeout(() => {
          const authElement = document.getElementById('card_auth_panel');
          if (authElement) {
            authElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } catch {
      // Ignore if URLSearchParams is unavailable
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginEmail, loginPassword);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneToSubmit = regPhoneValidation.isValid ? regPhoneValidation.e164 : regPhone.trim();
    const success = register(regName, regEmail, regRef, regPassword, phoneToSubmit);
    if (success) {
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegRef('');
    }
  };

  // Password reset state & flow
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1 = Request, 2 = Verify Code & Confirm New Password, 3 = Reset Confirmed
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCodeBanner, setGeneratedCodeBanner] = useState<string | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetLocalError, setResetLocalError] = useState<string | null>(null);

  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLocalError(null);
    clearMessages();
    const emailToUse = resetEmail.trim().toLowerCase();
    if (!emailToUse) {
      setResetLocalError('Please enter your registered email address.');
      return;
    }
    const res = requestPasswordReset(emailToUse);
    if (res.success && res.code) {
      setGeneratedCodeBanner(res.code);
      setResetStep(2);
    }
  };

  const handleConfirmResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLocalError(null);
    clearMessages();

    const codeToUse = resetCode.trim();
    if (!codeToUse) {
      setResetLocalError('Please enter the 6-digit confirmation code.');
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 4) {
      setResetLocalError('New password must be at least 4 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetLocalError('Password confirmation does not match. Please ensure both passwords match.');
      return;
    }

    const success = confirmPasswordReset(resetEmail.trim().toLowerCase(), codeToUse, resetNewPassword);
    if (success) {
      setResetStep(3);
    }
  };

  const handleFinishResetToSignIn = () => {
    setLoginEmail(resetEmail.trim().toLowerCase());
    setLoginPassword(resetNewPassword);
    setIsResettingPassword(false);
    setResetStep(1);
    setResetCode('');
    setGeneratedCodeBanner(null);
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetLocalError(null);
    clearMessages();
  };

  // Unauthenticated Landing Page
  if (!currentUser) {
    return (
      <div className={`min-h-screen ${isChampagne ? 'bg-[#f7f4ed] text-slate-900' : 'bg-[#06080e] text-slate-100'} flex flex-col justify-between font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden`}>
        {/* Ambient warm gold lighting blur */}
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] ${isChampagne ? 'bg-amber-500/5' : 'bg-amber-500/5'} rounded-full blur-[140px] pointer-events-none`} />
        <div className={`absolute top-1/3 right-10 w-[450px] h-[450px] ${isChampagne ? 'bg-amber-600/5' : 'bg-amber-600/5'} rounded-full blur-[130px] pointer-events-none`} />

        <PayoutToastContainer
          toasts={payoutToasts}
          onDismiss={dismissPayoutToast}
        />

        {/* Affiliation & Live Accreting Reserve Header bar */}
        <div className={`${isChampagne ? 'bg-[#ede5d8] border-b border-[#c5a059]/35 text-slate-700 shadow-sm' : 'bg-[#070a12] border-b border-amber-500/20 text-slate-300 shadow-md'} px-4 py-2.5 text-center text-xs flex flex-wrap items-center justify-between gap-x-4 gap-y-2`}>
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3.5 h-3.5 ${isChampagne ? 'text-amber-700' : 'text-amber-400'} animate-pulse`} />
            <span>PM Invest is certified under <strong className={isChampagne ? 'text-slate-950 font-black' : 'text-white'}>TREASURE HOMES LTD</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
              <span className={`${isChampagne ? 'text-amber-800 font-bold' : 'text-amber-400'} font-medium`}>Reserve Collateral:</span>
              <LiveReserveCounter precision={0} showLivePulse={true} showRateBadge={false} className={`${isChampagne ? 'text-slate-950' : 'text-white'} font-bold font-mono`} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start flex-grow relative z-10">
          {/* LEFT PANEL: Brand identity, executive headline & 4 live trust metrics */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <PmLogo className="w-14 h-14 sm:w-18 sm:h-18 drop-shadow-[0_8px_20px_rgba(245,158,11,0.25)] shrink-0" />
              <div>
                <div className={`inline-flex items-center gap-1.5 ${isChampagne ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-bold' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'} border text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono mb-1`}>
                  <UaeFlag size="xs" />
                  <span>Treasure Homes Sovereign Real Estate SPV</span>
                </div>
                <h1 className={`text-2xl sm:text-4xl font-black ${isChampagne ? 'text-slate-950' : 'text-white'} tracking-tight uppercase font-sans`}>
                  PM <span className="gold-gradient-text">Invest</span> Platform
                </h1>
                <p className={`text-xs ${isChampagne ? 'text-amber-800 font-semibold' : 'text-amber-400/90 font-mono'} mt-0.5`}>
                  Physical UAE Luxury Real Estate · Verified DLD Deeds · Friday Cash Yields
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-extrabold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} leading-snug`}>
                Co-Own Prime Dubai Real Estate · Earn Direct Friday Cash Rental Payouts
              </h2>
              <p className={`text-xs sm:text-sm ${isChampagne ? 'text-slate-700' : 'text-slate-300'} leading-relaxed max-w-2xl`}>
                Acquire fractional institutional stakes in Dubai Marina, DIFC, and Palm Jumeirah starting from ₦30,000. Rental profits collected from verified tenants are credited directly into your Nigerian bank account or digital wallet every Friday at 12:00 PM.
              </p>
            </div>

            {/* 4 Hero Institutional Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-900 shadow-sm' : 'bg-[#0c101c] border-amber-500/25 text-white shadow-md'} border p-3 rounded-xl`}>
                <span className={`text-[10px] font-mono ${isChampagne ? 'text-slate-500 font-semibold' : 'text-slate-400'} uppercase block`}>Liquid Backing</span>
                <span className={`text-sm sm:text-base font-extrabold ${isChampagne ? 'text-amber-800' : 'text-amber-400'} font-mono block mt-0.5`}>
                  ₦{(liveLiquidityReserve / 1000000000).toFixed(2)}B+
                </span>
                <span className={`text-[9px] ${isChampagne ? 'text-emerald-700 font-semibold' : 'text-emerald-400'} font-mono`}>Treasure Homes SPV</span>
              </div>

              <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-900 shadow-sm' : 'bg-[#0c101c] border-amber-500/25 text-white shadow-md'} border p-3 rounded-xl`}>
                <span className={`text-[10px] font-mono ${isChampagne ? 'text-slate-500 font-semibold' : 'text-slate-400'} uppercase block`}>Dubai Assets</span>
                <span className={`text-sm sm:text-base font-extrabold ${isChampagne ? 'text-slate-950' : 'text-white'} font-mono block mt-0.5`}>
                  6 Verified
                </span>
                <span className={`text-[9px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'} font-mono`}>DLD Recorded</span>
              </div>

              <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-900 shadow-sm' : 'bg-[#0c101c] border-amber-500/25 text-white shadow-md'} border p-3 rounded-xl`}>
                <span className={`text-[10px] font-mono ${isChampagne ? 'text-slate-500 font-semibold' : 'text-slate-400'} uppercase block`}>Payout Day</span>
                <span className={`text-sm sm:text-base font-extrabold ${isChampagne ? 'text-emerald-700' : 'text-emerald-400'} font-mono block mt-0.5`}>
                  Every Friday
                </span>
                <span className={`text-[9px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'} font-mono`}>12:00 PM Auto-Bank</span>
              </div>

              <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-900 shadow-sm' : 'bg-[#0c101c] border-amber-500/25 text-white shadow-md'} border p-3 rounded-xl`}>
                <span className={`text-[10px] font-mono ${isChampagne ? 'text-slate-500 font-semibold' : 'text-slate-400'} uppercase block`}>Partner Share</span>
                <span className={`text-sm sm:text-base font-extrabold ${isChampagne ? 'text-amber-800' : 'text-amber-300'} font-mono block mt-0.5`}>
                  7.5% Weekly
                </span>
                <span className={`text-[9px] ${isChampagne ? 'text-emerald-700 font-semibold' : 'text-emerald-400'} font-mono`}>Liquid Override</span>
              </div>
            </div>

            {/* Quick links & WhatsApp Community CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 ${isChampagne ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'} border text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Official WhatsApp Investor Group →</span>
              </a>

              <a
                href="#properties_catalog"
                className={`inline-flex items-center gap-1.5 text-xs ${isChampagne ? 'text-amber-800 hover:text-amber-900' : 'text-amber-400 hover:text-amber-300'} font-mono font-bold hover:underline py-2 px-1 cursor-pointer`}
              >
                <span>Explore All 6 Properties ↓</span>
              </a>
            </div>
          </div>

          {/* RIGHT PANEL: Clean Auth Forms in Luxury Obsidian & Brushed Gold */}
          <div className={`lg:col-span-5 ${isChampagne ? 'bg-white border-[#c5a059]/40 text-slate-900 shadow-xl' : 'bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border-amber-500/30 text-slate-100 shadow-2xl'} border rounded-2xl p-6 sm:p-7 relative overflow-hidden`} id="card_auth_panel">
            {/* Ambient accent background blur */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Segmented Top Tabs */}
            <div className={`flex ${isChampagne ? 'bg-[#ede5d8] border-[#c5a059]/30' : 'bg-[#06080e] border-amber-500/20'} p-1 rounded-xl mb-5 border`}>
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setIsResettingPassword(false); clearMessages(); }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isRegistering && !isResettingPassword
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="tab_auth_signin"
              >
                <Lock className={`w-3.5 h-3.5 ${!isRegistering && !isResettingPassword ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setIsResettingPassword(false); clearMessages(); }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isRegistering && !isResettingPassword
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="tab_auth_signup"
              >
                <UserPlus className={`w-3.5 h-3.5 ${isRegistering && !isResettingPassword ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Subtitle Header */}
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-[#f7ecd5] uppercase tracking-tight">
                {isResettingPassword
                  ? 'Reset Your Password'
                  : isRegistering
                    ? 'Create Your Investor Account'
                    : 'Welcome to PM Invest'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isResettingPassword
                  ? 'Enter your registered email to reset your password.'
                  : isRegistering 
                    ? 'Enter your credentials and your friend’s invite code to begin.'
                    : 'Sign in to access your properties, wallet balance, and Friday yields.'
                }
              </p>
            </div>

            {/* Invite-Only Gating Banner for Registration */}
            {isRegistering && !isResettingPassword && (
              <div className={`mb-4 rounded-xl p-3 flex items-start gap-2.5 text-xs shadow-xs ${
                regRef 
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200' 
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
              }`}>
                {regRef ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-white block">
                    {regRef ? `Invited by Verified Partner (${regRef})` : 'Sponsor Invite Code Required'}
                  </span>
                  <span className="text-[11px] text-slate-300 mt-0.5 block leading-relaxed">
                    {regRef 
                      ? 'Your referral link was verified. Complete registration below to claim your asset-backed account.'
                      : 'To maintain institutional integrity, PM Invest registration requires an authorized referral code from an existing member.'}
                  </span>
                </div>
              </div>
            )}

            {/* General Feedback Notifications */}
            {successMsg && (
              <div className="mb-4 bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 p-3 rounded-xl text-xs flex items-start justify-between gap-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium leading-relaxed">{successMsg}</span>
                </div>
                <button 
                  onClick={clearMessages} 
                  className="text-emerald-400 hover:text-emerald-200 p-0.5"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-rose-950/70 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs flex items-start justify-between gap-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
                <button 
                  onClick={clearMessages} 
                  className="text-rose-400 hover:text-rose-200 p-0.5"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isResettingPassword ? (
              /* PASSWORD RESET & CONFIRMATION WORKFLOW */
              <div className="space-y-4">
                {resetLocalError && (
                  <div className="bg-rose-950/70 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs flex items-start gap-2 shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{resetLocalError}</span>
                  </div>
                )}

                {resetStep === 1 && (
                  /* Step 1: Request Reset Confirmation Code */
                  <form onSubmit={handleRequestResetCode} className="space-y-3.5">
                    <div className="bg-[#06080e] border border-amber-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#f7ecd5]">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>Step 1 of 2: Request Confirmation Code</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Enter your registered account email. A secure 6-digit confirmation code will be issued to authorize resetting your password.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Email Address</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="e.g. investor@gmail.com"
                          autoComplete="email"
                          className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer mt-2"
                      id="btn_request_reset_code"
                    >
                      <span>Send Reset Confirmation Code</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>

                    <div className="text-center pt-2 text-xs text-slate-400">
                      <span>Remembered your password? </span>
                      <button 
                        type="button"
                        onClick={() => { setIsResettingPassword(false); setResetStep(1); clearMessages(); }}
                        className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  </form>
                )}

                {resetStep === 2 && (
                  /* Step 2: Enter Code, New Password & Confirm Match */
                  <form onSubmit={handleConfirmResetSubmit} className="space-y-3.5">
                    {/* Security Code Banner with Quick Autofill */}
                    {generatedCodeBanner && (
                      <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Security Confirmation Code</span>
                          </div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded font-bold">15m Expiry</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Reset authorization for <strong className="text-white">{resetEmail}</strong>:
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="font-mono font-extrabold text-sm tracking-widest text-white bg-[#06080e] px-3 py-1 rounded border border-amber-500/40 shadow-xs">
                            {generatedCodeBanner}
                          </span>
                          <button
                            type="button"
                            onClick={() => setResetCode(generatedCodeBanner)}
                            className="text-[11px] bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded hover:bg-amber-400 transition-colors cursor-pointer"
                          >
                            Autofill Code
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Confirmation Code</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="e.g. 123456"
                          maxLength={6}
                          className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono tracking-widest"
                          required
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                      <div className="relative">
                        <input 
                          type={showResetNewPassword ? 'text' : 'password'}
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          placeholder="At least 4 characters"
                          className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white focus:outline-none"
                          tabIndex={-1}
                        >
                          {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-300">Confirm New Password</label>
                        {resetNewPassword && resetConfirmPassword && (
                          resetNewPassword === resetConfirmPassword ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Match
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Does not match
                            </span>
                          )
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type={showResetConfirmPassword ? 'text' : 'password'}
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                          required
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white focus:outline-none"
                          tabIndex={-1}
                        >
                          {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!resetCode.trim() || !resetNewPassword || resetNewPassword !== resetConfirmPassword}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer mt-2"
                      id="btn_confirm_reset_password"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Confirm & Reset Password</span>
                    </button>
                  </form>
                )}

                {resetStep === 3 && (
                  /* Step 3: Success Acknowledgement */
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Password Reset Confirmed!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your new password has been set. You can now sign in with your updated credentials.
                    </p>
                    <button
                      type="button"
                      onClick={handleFinishResetToSignIn}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                    >
                      <span>Continue to Sign In</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                )}
              </div>
            ) : !isRegistering ? (
              /* CLEAN SIGN IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. investor@gmail.com"
                      autoComplete="email"
                      className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResettingPassword(true);
                        setResetEmail(loginEmail || '');
                        setResetStep(1);
                        setResetLocalError(null);
                        clearMessages();
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      autoComplete="current-password"
                      className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white focus:outline-none"
                      tabIndex={-1}
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer mt-2"
                  id="btn_landing_login"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-400">
                  <span>Don't have an account? </span>
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(true); clearMessages(); }}
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                  >
                    Create one now
                  </button>
                </div>
              </form>
            ) : (
              /* CLEAN REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jude Okafor"
                      autoComplete="name"
                      className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans"
                      required
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. jude@gmail.com"
                      autoComplete="email"
                      className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-sans"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active WhatsApp Number</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                      Compulsory
                    </span>
                  </div>

                  <div className="relative">
                    <input 
                      type="tel" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 08012345678 or +234..."
                      autoComplete="tel"
                      className={`w-full bg-[#06080e] border ${
                        regPhone.trim() 
                          ? regPhoneValidation.isValid 
                            ? 'border-emerald-500/60 focus:border-emerald-400 focus:ring-emerald-500/20' 
                            : 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/20'
                          : 'border-slate-700/80 focus:border-amber-400 focus:ring-amber-500/20'
                      } rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-mono`}
                      required
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  {/* Value Proposition Notice */}
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-start gap-1.5 text-[11px] text-emerald-200/90 bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2 leading-relaxed">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Value Guarantee:</strong> Receive instant Friday yield receipts and deed documents directly on WhatsApp.
                      </span>
                    </div>

                    {/* Live Strict Sanitization & Country Detection Feedback */}
                    {regPhone.trim() && (
                      regPhoneValidation.isValid ? (
                        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span>{regPhoneValidation.flag}</span>
                            <span>{regPhoneValidation.formatted}</span>
                          </span>
                          <span className="text-emerald-300 font-sans">✓ Verified Active Format</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-rose-300 font-mono bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>{regPhoneValidation.error}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Create Password</label>
                  <div className="relative">
                    <input 
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white focus:outline-none"
                      tabIndex={-1}
                      title={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Sponsor Referral Code <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                      Compulsory
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={regRef}
                      onChange={(e) => setRegRef(e.target.value.toUpperCase())}
                      placeholder="e.g. INV1000 or friend's code"
                      className="w-full bg-[#06080e] border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono uppercase"
                      required
                    />
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    🔒 Registration requires an invite code from a verified investor or sponsor.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer mt-2"
                  id="btn_landing_register"
                >
                  <span>Create Account</span>
                  <UserPlus className="w-4 h-4 text-slate-950" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-400">
                  <span>Already registered? </span>
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(false); clearMessages(); }}
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* SECTION 2: LIVE TREASURY STRIP & FRIDAY PAYOUT COUNTDOWN */}
        <section className={`w-full ${isChampagne ? 'bg-gradient-to-r from-[#fbf8f2] via-[#f5ede0] to-[#ece1cf] border-y border-[#c5a059]/35 text-slate-900' : 'bg-gradient-to-r from-[#0c101c] via-[#090d18] to-[#120a24] border-y border-amber-500/25 text-slate-100'} py-6 px-4 sm:px-6 lg:px-8 shadow-md relative z-10`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className={`text-[10px] ${isChampagne ? 'text-amber-800 font-extrabold' : 'text-amber-400 font-bold'} font-mono uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5`}>
                <Clock className={`w-3.5 h-3.5 ${isChampagne ? 'text-amber-700' : 'text-amber-400'} shrink-0`} />
                OFFICIAL FRIDAY TREASURY CASH DISTRIBUTION SCHEDULE
              </span>
              <h3 className={`text-base sm:text-xl font-black ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wide font-mono`}>
                Live Countdown to Friday 12:00 PM Payout Window
              </h3>
              <p className={`text-xs ${isChampagne ? 'text-slate-700' : 'text-slate-300'} max-w-xl leading-relaxed`}>
                Every Friday at 12:00 PM, tenant rental yields collected from our UAE luxury towers are automatically disbursed to investor wallets and local Nigerian bank accounts.
              </p>
            </div>
            <div className="shrink-0">
              <PayoutCountdown />
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS (3 PLAIN-LANGUAGE LAYMAN STEPS) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className={`inline-flex items-center gap-1.5 ${isChampagne ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-bold' : 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'} border text-[11px] px-3 py-1 rounded-full uppercase tracking-wider font-mono`}>
              <span>HOW PM INVEST WORKS</span>
            </div>
            <h3 className={`text-xl sm:text-3xl font-black ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-tight font-mono`}>
              Dubai Real Estate Co-Ownership in 3 Steps
            </h3>
            <p className={`text-xs sm:text-sm ${isChampagne ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
              No complicated paperwork or international banking hurdles. Co-own verified Dubai luxury assets and start receiving weekly direct bank alerts in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md hover:border-amber-600' : 'bg-[#0c101c] border-amber-500/20 text-slate-300 shadow-xl hover:border-amber-400/50'} border rounded-2xl p-6 space-y-3 relative overflow-hidden group transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${isChampagne ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'} border flex items-center justify-center font-black font-mono text-base`}>
                1
              </div>
              <h4 className={`text-base font-bold ${isChampagne ? 'text-slate-950' : 'text-white'} uppercase tracking-wide`}>
                Pick Your Property Stake
              </h4>
              <p className={`text-xs ${isChampagne ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                Choose a structured 24-week unit in prime Dubai towers (starting from ₦30,000). Every unit is backed by authentic Dubai Land Department Title Deeds and Makani parcel IDs.
              </p>
            </div>

            <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md hover:border-amber-600' : 'bg-[#0c101c] border-amber-500/20 text-slate-300 shadow-xl hover:border-amber-400/50'} border rounded-2xl p-6 space-y-3 relative overflow-hidden group transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${isChampagne ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'} border flex items-center justify-center font-black font-mono text-base`}>
                2
              </div>
              <h4 className={`text-base font-bold ${isChampagne ? 'text-slate-950' : 'text-white'} uppercase tracking-wide`}>
                Receive Friday Bank Alerts
              </h4>
              <p className={`text-xs ${isChampagne ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                Tenants pay rent, and our treasury distributes your guaranteed weekly cash yield directly to your wallet and Nigerian bank account every Friday at 12:00 PM sharp.
              </p>
            </div>

            <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md hover:border-amber-600' : 'bg-[#0c101c] border-amber-500/20 text-slate-300 shadow-xl hover:border-amber-400/50'} border rounded-2xl p-6 space-y-3 relative overflow-hidden group transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${isChampagne ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'} border flex items-center justify-center font-black font-mono text-base`}>
                3
              </div>
              <h4 className={`text-base font-bold ${isChampagne ? 'text-slate-950' : 'text-white'} uppercase tracking-wide`}>
                Principal Capital Return
              </h4>
              <p className={`text-xs ${isChampagne ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                At the completion of the 24-week tenure, your initial investment capital is returned in full, or you can roll it over into new luxury Dubai developments.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: FULL-WIDTH 3-COLUMN DUBAI PROPERTY CATALOG */}
        <section id="properties_catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 relative z-10">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b ${isChampagne ? 'border-[#c5a059]/30' : 'border-amber-500/20'} pb-4`}>
            <div>
              <div className={`inline-flex items-center gap-1.5 ${isChampagne ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-bold' : 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'} border text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-2 font-mono`}>
                <UaeFlag size="xs" />
                <span>Prime Real Estate Portfolio</span>
              </div>
              <h3 className={`text-xl sm:text-3xl font-black ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-tight font-mono`}>
                Verified Dubai Property Offerings (24-Week Cycles)
              </h3>
              <p className={`text-xs sm:text-sm ${isChampagne ? 'text-slate-600' : 'text-slate-400'} mt-1 max-w-xl leading-relaxed`}>
                All offerings are recorded under the Dubai Land Department and managed through Treasure Homes Special Purpose Vehicles (SPVs).
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <span className={`text-xs font-mono ${isChampagne ? 'text-emerald-800 bg-emerald-100/90 border-emerald-300' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'} flex items-center gap-1.5 border px-3 py-1.5 rounded-full font-bold`}>
                <Clock className={`w-3.5 h-3.5 ${isChampagne ? 'text-emerald-700' : 'text-emerald-400'}`} />
                Weekly Friday Payouts
              </span>
            </div>
          </div>

          {/* 3-Column Grid on Desktop, 2 on Tablet, 1 on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INVESTMENT_PLANS.map(plan => (
              <div 
                key={plan.id}
                className={`${isChampagne ? 'bg-white border-[#c5a059]/35 shadow-lg hover:border-amber-600' : 'bg-gradient-to-b from-[#0e1424] via-[#090d18] to-[#06080e] border-amber-500/20 hover:border-amber-400/60 shadow-2xl'} border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between group`}
              >
                {/* Property Photography Banner with Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img 
                    src={plan.propertyImage} 
                    alt={plan.propertyName || plan.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Location Badge */}
                  <div className="absolute top-3 left-3 bg-[#06080e]/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                    <UaeFlag size="xs" />
                    <span>{plan.propertyLocation.split(',')[0]}</span>
                  </div>

                  {/* DLD Verified Tag */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest font-mono shadow-md">
                    DLD VERIFIED
                  </div>

                  {/* Property Type & Occupancy */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200 truncate pr-2">{plan.propertyType}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0">
                      {plan.occupancyRate}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title & Street Address */}
                    <div className="space-y-1">
                      <h4 className={`text-base sm:text-lg font-black ${isChampagne ? 'text-slate-950 group-hover:text-amber-800' : 'text-[#f7ecd5] group-hover:text-amber-400'} uppercase tracking-tight transition-colors`}>
                        {plan.propertyName || plan.name}
                      </h4>
                      <div className={`flex items-start gap-1 text-[11px] ${isChampagne ? 'text-slate-600' : 'text-slate-400'}`}>
                        <MapPin className={`w-3.5 h-3.5 ${isChampagne ? 'text-amber-700' : 'text-amber-400'} shrink-0 mt-0.5`} />
                        <span className="line-clamp-1 leading-snug">{plan.propertyAddress}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 pt-1 text-[9px] font-mono ${isChampagne ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span className={`${isChampagne ? 'bg-[#f4eee2] border-[#c5a059]/30 text-amber-900' : 'bg-[#06080e] border-amber-500/15 text-amber-300/80'} border px-2 py-0.5 rounded`}>
                          Makani: {plan.makaniNumber}
                        </span>
                        <span className={`${isChampagne ? 'bg-[#f4eee2] border-[#c5a059]/30 text-slate-700' : 'bg-[#06080e] border-amber-500/15 text-slate-400'} border px-2 py-0.5 rounded`}>
                          Ref: {plan.cadastralId}
                        </span>
                      </div>
                    </div>

                    {/* Yield Box */}
                    <div className={`mt-3.5 ${isChampagne ? 'bg-[#faf7f2] border-[#c5a059]/35' : 'bg-[#06080e]/90 border-amber-500/20 shadow-inner'} border rounded-xl p-3.5 space-y-2 text-xs`}>
                      <div className="flex justify-between items-baseline">
                        <span className={`${isChampagne ? 'text-slate-600' : 'text-slate-400'} text-xs`}>Stake Capital:</span>
                        <span className={`text-base font-extrabold ${isChampagne ? 'text-slate-950' : 'text-white'} font-mono`}>₦{plan.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className={`${isChampagne ? 'text-slate-600' : 'text-slate-400'} text-xs`}>Weekly Friday Yield:</span>
                        <span className={`text-sm font-black ${isChampagne ? 'text-emerald-700' : 'text-emerald-400'} font-mono`}>₦{plan.weeklyPayout.toLocaleString()} / wk</span>
                      </div>
                      <div className={`h-px ${isChampagne ? 'bg-[#e5d8c3]' : 'bg-amber-500/15'} w-full`} />
                      <div className="flex justify-between items-baseline">
                        <span className={`${isChampagne ? 'text-amber-900 font-bold' : 'text-amber-300 font-bold'} text-xs`}>24-Week Total Returns:</span>
                        <span className={`text-base font-black ${isChampagne ? 'text-amber-800' : 'text-amber-400'} font-mono`}>₦{plan.totalReturns.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      const authCard = document.getElementById('card_auth_panel');
                      if (authCard) {
                        authCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => {
                          const nameInput = document.querySelector('#card_auth_panel input[type="text"]') as HTMLInputElement;
                          if (nameInput) nameInput.focus();
                        }, 250);
                      }
                    }}
                    className={`w-full mt-3 py-2.5 px-3 rounded-xl ${
                      isChampagne
                        ? 'bg-amber-50 hover:bg-amber-500 border border-amber-300 hover:border-amber-500 text-amber-900 hover:text-slate-950 font-bold'
                        : 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500 hover:to-amber-600 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-slate-950 font-bold'
                    } text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Acquire Stake in {plan.name} →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Note on Plans */}
          <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md' : 'bg-[#0c101c] border-amber-500/25 text-slate-200 shadow-xl'} border rounded-2xl p-5 text-xs space-y-1.5`}>
            <span className={`font-bold ${isChampagne ? 'text-amber-800' : 'text-amber-400'} block uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5`}>
              <Sparkles className={`w-3.5 h-3.5 ${isChampagne ? 'text-amber-700' : 'text-amber-400'}`} />
              Note on UAE Property Tenures &amp; Friday Cash Payouts
            </span>
            <p className={`leading-relaxed ${isChampagne ? 'text-slate-700' : 'text-slate-300'} text-xs`}>
              Your returns stem from direct tenancy rent and institutional capital growth of physical luxury towers in the United Arab Emirates. Each plan runs for a strict 24-week tenure with cash profits paid into your bank or wallet every Friday. Investors receive registered fractional deeds upon acquisition.
            </p>
          </div>
        </section>

        {/* SECTION 5: INSTITUTIONAL BENEFIT HIGHLIGHTS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className={`flex items-start gap-3 ${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md' : 'bg-[#0c101c] border-amber-500/20 text-slate-300 shadow-lg'} border p-4 rounded-xl`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className={`font-bold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wider`}>Weekly Cash Returns</h4>
                <p className={`${isChampagne ? 'text-slate-600' : 'text-slate-400'} text-[11px] mt-0.5 leading-relaxed`}>
                  Physical property yield paid directly to your wallet every Friday without withdrawal delays.
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 ${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md' : 'bg-[#0c101c] border-amber-500/20 text-slate-300 shadow-lg'} border p-4 rounded-xl`}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className={`font-bold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wider`}>7.5% Referral Bonus</h4>
                <p className={`${isChampagne ? 'text-slate-600' : 'text-slate-400'} text-[11px] mt-0.5 leading-relaxed`}>
                  Share your exclusive invite link. Earn 7.5% liquid cash every Friday your invitee gets paid.
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 ${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md' : 'bg-[#0c101c] border-amber-500/20 text-slate-300 shadow-lg'} border p-4 rounded-xl`}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Award className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className={`font-bold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wider`}>DLD Recorded Deeds</h4>
                <p className={`${isChampagne ? 'text-slate-600' : 'text-slate-400'} text-[11px] mt-0.5 leading-relaxed`}>
                  All properties registered under official Dubai Land Department cadastral parcel identifiers.
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 ${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800 shadow-md' : 'bg-[#0c101c] border-amber-500/20 text-slate-300 shadow-lg'} border p-4 rounded-xl`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className={`font-bold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wider`}>24/7 Investor Group</h4>
                <p className={`${isChampagne ? 'text-slate-600' : 'text-slate-400'} text-[11px] mt-0.5 leading-relaxed`}>
                  Join our official verified WhatsApp community for live Friday payment proofs and updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Brand Footer */}
        <div className={`${isChampagne ? 'bg-[#ede5d8] border-t border-[#c5a059]/30 text-slate-700' : 'bg-[#06080e] border-t border-amber-500/20 text-slate-400'} text-xs`}>
          <div className="max-w-7xl mx-auto px-4 pt-8 pb-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <span className={`${isChampagne ? 'text-slate-900' : 'text-[#f7ecd5]'} font-bold text-sm block`}>100% REGULATED</span>
              <p className={isChampagne ? 'text-slate-600' : 'text-slate-400'}>Operating transparent cash reserves under supervision of the Treasure Homes asset board.</p>
            </div>
            <div className={`space-y-1 py-4 md:py-0 md:border-x ${isChampagne ? 'border-[#c5a059]/30' : 'border-amber-500/20'}`}>
              <span className={`${isChampagne ? 'text-amber-800' : 'text-amber-400'} font-bold text-sm block font-mono`}>₦{(liveLiquidityReserve / 1000000000).toFixed(2)}B+ RESERVE BACKING</span>
              <p className={isChampagne ? 'text-slate-600' : 'text-slate-400'}>Ensuring complete stability with physical properties and liquid collateral holding records.</p>
            </div>
            <div className="space-y-1">
              <span className={`${isChampagne ? 'text-slate-900' : 'text-[#f7ecd5]'} font-bold text-sm block`}>KYC INTEGRITY GATE</span>
              <p className={isChampagne ? 'text-slate-600' : 'text-slate-400'}>Anti-fraud protection including verified identification checks for seamless, quick clearances.</p>
            </div>
          </div>

          <OfflineIndicator />
          <LegalDisclosures />
        </div>
      </div>
    );
  }

  // Authenticated workspace
  return (
    <div className={`min-h-screen ${isChampagne ? 'bg-[#f4efe6] text-slate-900' : 'bg-[#06080e] text-slate-100'} flex flex-col justify-between font-sans pb-0 selection:bg-amber-500/30 selection:text-amber-200`} id="app_workspace_root">
      <PayoutToastContainer
        toasts={payoutToasts}
        onDismiss={dismissPayoutToast}
        onNavigateToWallet={() => {
          if (currentUser?.role === 'admin') {
            setAdminView('investor');
          }
          const walletEl = document.getElementById('user_dashboard_container') || document.getElementById('marketer_dashboard_container');
          if (walletEl) {
            walletEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
      <div>
        <BrandingHeader />
        
        {currentUser.role === 'admin' && (
          <div className={`${isChampagne ? 'bg-[#ede5d8] border-b border-[#c5a059]/35 text-slate-800' : 'bg-[#1e293b] border-b border-slate-700'} py-3 px-4 transition-colors`}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className={`flex items-center gap-2 ${isChampagne ? 'text-slate-800 font-semibold' : 'text-slate-300'} text-xs font-medium`}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm" />
                <span>Treasure Homes Authorized Admin session</span>
              </div>
              <div className={`flex gap-2 ${isChampagne ? 'bg-[#dfd5c2] border-[#c5a059]/40' : 'bg-[#0f172a] border-slate-700'} p-1 rounded-xl border flex-wrap justify-center`}>
                <button
                  onClick={() => setAdminView('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'admin'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                      : isChampagne ? 'text-slate-700 hover:text-slate-950 hover:bg-black/5' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Control Panel
                </button>
                <button
                  onClick={() => setAdminView('investor')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'investor'
                      ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                      : isChampagne ? 'text-slate-700 hover:text-slate-950 hover:bg-black/5' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Real Investor View
                </button>
                <button
                  onClick={() => setAdminView('marketer')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminView === 'marketer'
                      ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                      : isChampagne ? 'text-purple-800 hover:text-purple-950 hover:bg-black/5' : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Marketer Portal View
                </button>
              </div>
            </div>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <React.Suspense fallback={<div className="rounded-2xl border border-amber-500/30 bg-[#090d18] p-8 text-center text-sm text-[#f7ecd5] font-mono shadow-xl">Loading your luxury portfolio…</div>}>
            {currentUser.role === 'admin' ? (
              adminView === 'admin' ? (
                <AdminPanel />
              ) : adminView === 'marketer' ? (
                <MarketerDashboard />
              ) : (
                <UserDashboard />
              )
            ) : currentUser.isMarketingAccount ? (
              <MarketerDashboard />
            ) : (
              <UserDashboard />
            )}
          </React.Suspense>
        </main>
      </div>

      <OfflineIndicator />
      <LegalDisclosures />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StateProvider>
        <MainAppContent />
      </StateProvider>
    </ThemeProvider>
  );
}
