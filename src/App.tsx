/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { StateProvider, useAppState } from './context/StateContext';
import { BrandingHeader, LegalDisclosures } from './components/BrandingHeader';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  UserPlus,
  Key,
  Users,
  AlertTriangle,
  ShieldAlert,
  LayoutGrid,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  User as UserIcon,
  Phone,
  X,
  KeyRound,
  FileText,
  Send
} from 'lucide-react';
import { INVESTMENT_PLANS } from './types';
import { PayoutToastContainer } from './components/PayoutToast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PayoutCountdown } from './components/PayoutCountdown';
import { TELEGRAM_COMMUNITY_URL } from './components/CommunityBanner';
import { sanitizeAndValidatePhone } from './lib/phoneSanitizer';
import { UaeDeedModal } from './components/UaeDeedModal';

const UserDashboard = React.lazy(() => import('./components/UserDashboard').then(module => ({ default: module.UserDashboard })));
const MarketerDashboard = React.lazy(() => import('./components/MarketerDashboard').then(module => ({ default: module.MarketerDashboard })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));

function MainAppContent() {
  const { isChampagne } = useTheme();
  const {
    currentUser,
    register,
    login,
    exitImpersonation,
    isImpersonating,
    requestPasswordReset,
    confirmPasswordReset,
    successMsg,
    errorMsg,
    clearMessages,
    payoutToasts,
    dismissPayoutToast
  } = useAppState();

  const [isRegistering, setIsRegistering] = useState(false);
  const [inspectingDeedPlan, setInspectingDeedPlan] = useState<any | null>(null);
  const [adminView, setAdminView] = useState<'admin' | 'investor' | 'marketer'>('admin');

  useEffect(() => {
    const handleAdminViewSwitch = (e: any) => {
      if (e.detail && (e.detail === 'admin' || e.detail === 'investor' || e.detail === 'marketer')) {
        setAdminView(e.detail);
      }
    };
    window.addEventListener('switch-admin-view', handleAdminViewSwitch);
    return () => {
      window.removeEventListener('switch-admin-view', handleAdminViewSwitch);
    };
  }, []);

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

  // Capture referral code from URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      if (refParam) {
        const cleanRef = refParam.toUpperCase().trim();
        setRegRef(cleanRef);
        localStorage.setItem('pm_invite_code', cleanRef);
        setIsRegistering(true);
        setTimeout(() => {
          const authElement = document.getElementById('card_auth_panel');
          if (authElement) {
            authElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        const cachedRef = localStorage.getItem('pm_invite_code');
        if (cachedRef) {
          setRegRef(cachedRef.toUpperCase().trim());
        }
      }
    } catch {
      // Ignore storage errors
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

  // Password reset state
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
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
      setResetLocalError('Enter your registered email address.');
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
      setResetLocalError('Enter the 6-digit confirmation code.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 4) {
      setResetLocalError('Password must be at least 4 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetLocalError('Passwords do not match.');
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

  const inputBase = isChampagne
    ? 'w-full bg-white border border-[#D3CBC0] rounded-lg py-2.5 pl-9 pr-3 text-sm text-[#18222B] placeholder-[#8B96A3] focus:outline-none focus:border-[#0B7A4E] focus:ring-2 focus:ring-[#0B7A4E]/15 transition-colors'
    : 'w-full bg-[#0B1015] border border-[#2A394A] rounded-lg py-2.5 pl-9 pr-3 text-sm text-[#F4F1EA] placeholder-[#64748B] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-colors';

  const labelBase = `block text-xs font-medium mb-1.5 ${isChampagne ? 'text-[#43505C]' : 'text-[#C7D1DC]'}`;

  // ── UNAUTHENTICATED LANDING PAGE ──
  if (!currentUser) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-between font-sans relative overflow-x-hidden ${
          isChampagne ? 'bg-[#FAF8F4] text-[#18222B]' : 'bg-[#0B1015] text-[#F4F1EA]'
        }`}
      >
        <PayoutToastContainer toasts={payoutToasts} onDismiss={dismissPayoutToast} />

        <BrandingHeader />

        {/* HERO & CLIENT AUTHENTICATION */}
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Editorial Proposition */}
            <div className="lg:col-span-7 space-y-7 pt-1">
              <div className="space-y-4">
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
                  }`}
                >
                  DIFC SPV Custody · Dubai Land Department
                </p>

                <h1
                  className={`font-serif font-semibold tracking-tight leading-[1.06] ${
                    isChampagne ? 'text-[#18222B]' : 'text-[#F4F1EA]'
                  }`}
                  style={{ fontSize: 'clamp(2.35rem, 4.4vw, 3.85rem)', textWrap: 'balance' as any }}
                >
                  Prime Dubai Real Estate,{' '}
                  <span className={isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'}>
                    Weekly Friday Yields.
                  </span>
                </h1>

                <p
                  className={`text-sm sm:text-base max-w-xl leading-relaxed ${
                    isChampagne ? 'text-[#43505C]' : 'text-[#A8B4C2]'
                  }`}
                >
                  Fractional ownership in verified Dubai towers starting from ₦15,000, with rental distributions settled directly every Friday.
                </p>
              </div>

              {/* Focused Action Row */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="#properties_catalog"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span>View Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#difc_trust_section"
                  className={`inline-flex items-center justify-center px-5 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    isChampagne
                      ? 'bg-white border-[#D3CBC0] text-[#18222B] hover:bg-[#F3EFE8]'
                      : 'bg-[#121922] border-[#222F3D] text-[#F4F1EA] hover:bg-[#18222E]'
                  }`}
                >
                  Legal Trust
                </a>

                <a
                  href={TELEGRAM_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors px-1 py-2 ${
                    isChampagne
                      ? 'text-[#0B7A4E] hover:text-[#08633E]'
                      : 'text-[#10B981] hover:text-emerald-300'
                  }`}
                  id="btn_hero_join_telegram"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Channel</span>
                </a>
              </div>

              {/* Clean Hairline-Divided Institutional Ledger */}
              <div
                className={`pt-7 mt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-6 ${
                  isChampagne ? 'border-[#E6E0D6]' : 'border-[#222F3D]'
                }`}
              >
                <div>
                  <span className={`text-[11px] uppercase tracking-[0.1em] block ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    SPV Entity
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums block mt-1">
                    Reg #4982
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    DIFC Common Law
                  </span>
                </div>

                <div>
                  <span className={`text-[11px] uppercase tracking-[0.1em] block ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    Portfolio
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums block mt-1">
                    {INVESTMENT_PLANS.length} Deeds
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'}`}>
                    DLD Recorded
                  </span>
                </div>

                <div>
                  <span className={`text-[11px] uppercase tracking-[0.1em] block ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    Settlement
                  </span>
                  <span className={`font-mono text-sm font-semibold tabular-nums block mt-1 ${isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'}`}>
                    Fridays
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    12:00 PM Direct
                  </span>
                </div>

                <div>
                  <span className={`text-[11px] uppercase tracking-[0.1em] block ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    Partner Share
                  </span>
                  <span className={`font-mono text-sm font-semibold tabular-nums block mt-1 ${isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'}`}>
                    7.5% Weekly
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    Referral Override
                  </span>
                </div>
              </div>
            </div>

            {/* Right Clean Single-Elevation Auth Card */}
            <div
              id="card_auth_panel"
              className={`lg:col-span-5 rounded-2xl border p-6 sm:p-7 ${
                isChampagne
                  ? 'bg-white border-[#E6E0D6]'
                  : 'bg-[#121922] border-[#222F3D]'
              }`}
            >
              {/* Clean Segmented Tabs */}
              <div
                className={`grid grid-cols-2 p-1 rounded-lg mb-6 border ${
                  isChampagne
                    ? 'bg-[#F3EFE8] border-[#E6E0D6]'
                    : 'bg-[#0B1015] border-[#222F3D]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setIsResettingPassword(false);
                    clearMessages();
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    !isRegistering && !isResettingPassword
                      ? isChampagne
                        ? 'bg-white text-[#18222B] shadow-xs'
                        : 'bg-[#18222E] text-[#F4F1EA]'
                      : isChampagne
                      ? 'text-[#6C7885] hover:text-[#18222B]'
                      : 'text-[#8896A6] hover:text-[#F4F1EA]'
                  }`}
                  id="tab_auth_signin"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setIsResettingPassword(false);
                    clearMessages();
                  }}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    isRegistering && !isResettingPassword
                      ? isChampagne
                        ? 'bg-white text-[#18222B] shadow-xs'
                        : 'bg-[#18222E] text-[#F4F1EA]'
                      : isChampagne
                      ? 'text-[#6C7885] hover:text-[#18222B]'
                      : 'text-[#8896A6] hover:text-[#F4F1EA]'
                  }`}
                  id="tab_auth_signup"
                >
                  Create Account
                </button>
              </div>

              {isResettingPassword && (
                <div className="mb-4">
                  <h3 className="font-serif text-xl font-semibold">Reset Password</h3>
                  <p className={`text-xs mt-0.5 ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    Verify your email to set a new password.
                  </p>
                </div>
              )}

              {isRegistering && !isResettingPassword && regRef && (
                <div
                  className={`mb-4 rounded-lg px-3 py-2 text-xs flex items-center gap-2 border ${
                    isChampagne
                      ? 'bg-[#0B7A4E]/5 border-[#0B7A4E]/20 text-[#0B7A4E]'
                      : 'bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sponsor code verified: <strong className="font-mono">{regRef}</strong></span>
                </div>
              )}

              {successMsg && (
                <div
                  className={`mb-4 rounded-lg p-3 text-xs flex items-start justify-between gap-2 border ${
                    isChampagne
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0B7A4E] shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                  <button onClick={clearMessages} type="button" className="opacity-70 hover:opacity-100 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {errorMsg && (
                <div
                  className={`mb-4 rounded-lg p-3 text-xs flex items-start justify-between gap-2 border ${
                    isChampagne
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-rose-950/50 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  <button onClick={clearMessages} type="button" className="opacity-70 hover:opacity-100 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isResettingPassword ? (
                <div className="space-y-4">
                  {resetLocalError && (
                    <div className="rounded-lg p-3 text-xs flex items-start gap-2 border bg-rose-50 border-rose-200 text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{resetLocalError}</span>
                    </div>
                  )}

                  {resetStep === 1 && (
                    <form onSubmit={handleRequestResetCode} className="space-y-4">
                      <div>
                        <label className={labelBase}>Registered Email</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="name@example.com"
                            autoComplete="email"
                            className={inputBase}
                            required
                          />
                          <Mail className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        id="btn_request_reset_code"
                      >
                        <Key className="w-4 h-4" />
                        <span>Send Code</span>
                      </button>

                      <div className="text-center pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIsResettingPassword(false);
                            setResetStep(1);
                            clearMessages();
                          }}
                          className={`font-medium hover:underline cursor-pointer ${
                            isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
                          }`}
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  )}

                  {resetStep === 2 && (
                    <form onSubmit={handleConfirmResetSubmit} className="space-y-4">
                      {generatedCodeBanner && (
                        <div
                          className={`rounded-lg p-3 text-xs border space-y-2 ${
                            isChampagne
                              ? 'bg-[#F3EFE8] border-[#E6E0D6] text-[#18222B]'
                              : 'bg-[#18222E] border-[#222F3D] text-[#F4F1EA]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Confirmation Code</span>
                            <span className="font-mono text-[11px] opacity-70">15m</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-semibold text-sm tracking-widest">
                              {generatedCodeBanner}
                            </span>
                            <button
                              type="button"
                              onClick={() => setResetCode(generatedCodeBanner)}
                              className="text-xs font-semibold text-[#0B7A4E] hover:underline cursor-pointer"
                            >
                              Autofill
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className={labelBase}>6-Digit Code</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            maxLength={6}
                            className={`${inputBase} font-mono tracking-widest`}
                            required
                          />
                          <KeyRound className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                        </div>
                      </div>

                      <div>
                        <label className={labelBase}>New Password</label>
                        <div className="relative">
                          <input
                            type={showResetNewPassword ? 'text' : 'password'}
                            value={resetNewPassword}
                            onChange={(e) => setResetNewPassword(e.target.value)}
                            placeholder="Minimum 4 characters"
                            className={`${inputBase} pr-10`}
                            required
                          />
                          <Lock className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                          <button
                            type="button"
                            onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                            className="absolute right-3 top-3 text-[#8B96A3] hover:text-[#18222B]"
                            tabIndex={-1}
                          >
                            {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-medium">Confirm Password</label>
                          {resetNewPassword && resetConfirmPassword && (
                            <span
                              className={`text-[11px] font-medium ${
                                resetNewPassword === resetConfirmPassword ? 'text-[#0B7A4E]' : 'text-rose-600'
                              }`}
                            >
                              {resetNewPassword === resetConfirmPassword ? 'Matches' : 'Mismatch'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showResetConfirmPassword ? 'text' : 'password'}
                            value={resetConfirmPassword}
                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className={`${inputBase} pr-10`}
                            required
                          />
                          <Lock className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                          <button
                            type="button"
                            onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                            className="absolute right-3 top-3 text-[#8B96A3] hover:text-[#18222B]"
                            tabIndex={-1}
                          >
                            {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!resetCode.trim() || !resetNewPassword || resetNewPassword !== resetConfirmPassword}
                        className="w-full bg-[#0B7A4E] hover:bg-[#08633E] disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
                        id="btn_confirm_reset_password"
                      >
                        Update Password
                      </button>
                    </form>
                  )}

                  {resetStep === 3 && (
                    <div className="text-center py-4 space-y-3">
                      <CheckCircle2 className="w-8 h-8 text-[#0B7A4E] mx-auto" />
                      <h4 className="font-serif text-lg font-semibold">Password Updated</h4>
                      <button
                        type="button"
                        onClick={handleFinishResetToSignIn}
                        className="w-full bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              ) : !isRegistering ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className={labelBase}>Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@example.com"
                        autoComplete="email"
                        className={inputBase}
                        required
                      />
                      <Mail className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={`text-xs font-medium ${isChampagne ? 'text-[#43505C]' : 'text-[#C7D1DC]'}`}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingPassword(true);
                          setResetEmail(loginEmail || '');
                          setResetStep(1);
                          setResetLocalError(null);
                          clearMessages();
                        }}
                        className={`text-xs font-medium hover:underline cursor-pointer ${
                          isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
                        }`}
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        className={`${inputBase} pr-10`}
                      />
                      <Lock className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-[#8B96A3] hover:text-[#18222B] cursor-pointer"
                        tabIndex={-1}
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
                    id="btn_landing_login"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className={`text-center pt-1 text-xs ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    New investor?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(true);
                        clearMessages();
                      }}
                      className={`font-semibold hover:underline cursor-pointer ${
                        isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
                      }`}
                    >
                      Create account
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className={labelBase}>Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Jude Okafor"
                        autoComplete="name"
                        className={inputBase}
                        required
                      />
                      <UserIcon className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="jude@example.com"
                        autoComplete="email"
                        className={inputBase}
                        required
                      />
                      <Mail className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="08012345678 or +234..."
                        autoComplete="tel"
                        className={`${inputBase} font-mono`}
                        required
                      />
                      <Phone className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                    </div>

                    {regPhone.trim() && (
                      <div
                        className={`mt-1.5 text-[11px] font-mono ${
                          regPhoneValidation.isValid
                            ? isChampagne
                              ? 'text-[#0B7A4E]'
                              : 'text-[#10B981]'
                            : 'text-rose-600'
                        }`}
                      >
                        {regPhoneValidation.isValid
                          ? `${regPhoneValidation.formatted} · Valid`
                          : regPhoneValidation.error}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelBase}>Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                        className={`${inputBase} pr-10`}
                      />
                      <Lock className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-3 text-[#8B96A3] hover:text-[#18222B] cursor-pointer"
                        tabIndex={-1}
                        aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelBase}>Invite Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={regRef}
                        onChange={(e) => setRegRef(e.target.value.toUpperCase())}
                        placeholder="Sponsor referral code"
                        className={`${inputBase} font-mono uppercase`}
                        required
                      />
                      <Users className="w-4 h-4 text-[#8B96A3] absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
                    id="btn_landing_register"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>

                  <p className={`text-center pt-1 text-xs ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        clearMessages();
                      }}
                      className={`font-semibold hover:underline cursor-pointer ${
                        isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
                      }`}
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FRIDAY PAYOUT COUNTDOWN STRIP */}
        <section
          id="payout_structure"
          className={`w-full border-y py-6 px-4 sm:px-6 lg:px-8 ${
            isChampagne
              ? 'bg-[#F3EFE8] border-[#E6E0D6]'
              : 'bg-[#121922] border-[#222F3D]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-left">
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] block ${
                  isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
                }`}
              >
                Weekly Settlement
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold mt-0.5">
                Next Friday 12:00 PM Distribution
              </h2>
            </div>
            <div className="shrink-0">
              <PayoutCountdown />
            </div>
          </div>
        </section>

        {/* DUBAI PROPERTY OFFERINGS CATALOG */}
        <section
          id="properties_catalog"
          className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10 cv-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[var(--pm-border)]">
            <div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] block ${
                  isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
                }`}
              >
                Dubai Portfolio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mt-1">
                Verified Property Offerings
              </h2>
            </div>
            <p className={`text-xs sm:text-sm ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
              24-week tenure · Direct Friday payouts · DLD recorded
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INVESTMENT_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors duration-200 group ${
                  isChampagne
                    ? 'bg-white border-[#E6E0D6] hover:border-[#BFC7CE]'
                    : 'bg-[#121922] border-[#222F3D] hover:border-[#324255]'
                }`}
              >
                {/* Clean Full-Bleed Architectural Photo with Guaranteed Scrim Contrast */}
                <div className="relative h-48 w-full overflow-hidden bg-[#18222B]">
                  <img
                    src={plan.propertyImage}
                    alt={plan.propertyName || plan.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="pm-photo-overlay absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                    <span className="text-xs font-medium truncate">
                      {plan.propertyType}
                    </span>
                    <span className="pm-photo-sub text-[11px] font-mono tabular-nums shrink-0">
                      {plan.occupancyRate}
                    </span>
                  </div>
                </div>

                {/* Dossier Details */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-4">
                    <div>
                      <p
                        className={`text-[11px] font-medium tracking-wide uppercase ${
                          isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'
                        }`}
                      >
                        {plan.propertyLocation.split(',')[0]} · DLD Verified
                      </p>
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight mt-0.5 leading-snug">
                        {plan.propertyName || plan.name}
                      </h3>
                      <p
                        className={`text-[11px] font-mono mt-1 truncate ${
                          isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'
                        }`}
                      >
                        Makani {plan.makaniNumber} · {plan.cadastralId}
                      </p>
                    </div>

                    {/* Flat Hairline Ledger (Zero Nested Boxes) */}
                    <div
                      className={`border-t border-b py-3 space-y-2 text-xs ${
                        isChampagne ? 'border-[#E6E0D6]' : 'border-[#222F3D]'
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className={isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}>
                          Stake Capital
                        </span>
                        <span className="font-mono text-sm font-semibold tabular-nums">
                          ₦{plan.cost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className={isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}>
                          Friday Payout
                        </span>
                        <span
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
                          }`}
                        >
                          ₦{plan.weeklyPayout.toLocaleString()}/wk
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className={isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}>
                          24-Week Return
                        </span>
                        <span
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
                          }`}
                        >
                          ₦{plan.totalReturns.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Actions */}
                  <div className="space-y-2">
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
                      className="w-full py-2.5 px-4 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Acquire · ₦{plan.cost.toLocaleString()}
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectingDeedPlan(plan)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isChampagne
                          ? 'text-[#43505C] hover:text-[#18222B] hover:bg-[#F3EFE8]'
                          : 'text-[#94A3B8] hover:text-[#F4F1EA] hover:bg-[#18222E]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Preview Title Deed</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* DIFC LEGAL CUSTODY — CONCISE 3-PILLAR FRAMEWORK */}
        <section
          id="difc_trust_section"
          className={`w-full border-t py-14 sm:py-20 px-4 sm:px-6 lg:px-8 cv-auto ${
            isChampagne
              ? 'bg-white border-[#E6E0D6]'
              : 'bg-[#121922] border-[#222F3D]'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-xl">
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] block ${
                  isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
                }`}
              >
                Fiduciary Structure
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mt-1">
                Asset-Backed Governance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
              <div className={`space-y-2 pt-5 border-t ${isChampagne ? 'border-[#E6E0D6]' : 'border-[#222F3D]'}`}>
                <span className={`font-mono text-xs ${isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'}`}>01</span>
                <h3 className="font-serif text-xl font-semibold">DIFC SPV Custody</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isChampagne ? 'text-[#43505C]' : 'text-[#94A3B8]'}`}>
                  Titles are ring-fenced inside a DIFC Special Purpose Vehicle under Common Law.
                </p>
              </div>

              <div className={`space-y-2 pt-5 border-t ${isChampagne ? 'border-[#E6E0D6]' : 'border-[#222F3D]'}`}>
                <span className={`font-mono text-xs ${isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'}`}>02</span>
                <h3 className="font-serif text-xl font-semibold">DLD Freehold Deeds</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isChampagne ? 'text-[#43505C]' : 'text-[#94A3B8]'}`}>
                  Every offering carries verifiable Dubai Land Department cadastral and Makani records.
                </p>
              </div>

              <div className={`space-y-2 pt-5 border-t ${isChampagne ? 'border-[#E6E0D6]' : 'border-[#222F3D]'}`}>
                <span className={`font-mono text-xs ${isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'}`}>03</span>
                <h3 className="font-serif text-xl font-semibold">Friday Settlement</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isChampagne ? 'text-[#43505C]' : 'text-[#94A3B8]'}`}>
                  Rental yields clear every Friday at 12:00 PM directly to your wallet and bank account.
                </p>
              </div>
            </div>
          </div>
        </section>

        <OfflineIndicator />
        <LegalDisclosures />

        {inspectingDeedPlan && (
          <UaeDeedModal
            isOpen={!!inspectingDeedPlan}
            onClose={() => setInspectingDeedPlan(null)}
            investment={{
              id: 'deed_inspect_' + inspectingDeedPlan.id,
              userId: 'guest',
              userName: 'Public Dossier',
              planId: inspectingDeedPlan.id,
              planName: inspectingDeedPlan.name,
              propertyName: inspectingDeedPlan.propertyName,
              propertyLocation: inspectingDeedPlan.propertyLocation,
              propertyAddress: inspectingDeedPlan.propertyAddress,
              propertyImage: inspectingDeedPlan.propertyImage,
              propertyType: inspectingDeedPlan.propertyType,
              occupancyRate: inspectingDeedPlan.occupancyRate,
              deedTier: inspectingDeedPlan.deedTier,
              cadastralId: inspectingDeedPlan.cadastralId,
              makaniNumber: inspectingDeedPlan.makaniNumber,
              deedReferenceCode: `UAE-DLD-2026-${inspectingDeedPlan.id.toUpperCase()}`,
              cost: inspectingDeedPlan.cost,
              weeklyPayout: inspectingDeedPlan.weeklyPayout,
              totalReturns: inspectingDeedPlan.totalReturns,
              weeksPaid: 0,
              totalWeeks: inspectingDeedPlan.weeksDuration || 24,
              status: 'active',
              createdAt: new Date().toISOString()
            }}
          />
        )}
      </div>
    );
  }

  // ── AUTHENTICATED WORKSPACE ──
  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans ${
        isChampagne ? 'bg-[#FAF8F4] text-[#18222B]' : 'bg-[#0B1015] text-[#F4F1EA]'
      }`}
      id="app_workspace_root"
    >
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

        {(isImpersonating || (typeof window !== 'undefined' && sessionStorage.getItem('pm_original_admin_id'))) &&
          currentUser &&
          currentUser.role !== 'admin' && (
            <div className="bg-[#18222B] text-[#FAF8F4] px-4 py-2.5 text-xs sticky top-16 z-40 border-b border-[#2C3A47]">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>
                  Previewing account: <strong>{currentUser.name}</strong> ({currentUser.email})
                </span>
                <button
                  onClick={() => exitImpersonation()}
                  className="bg-[#0B7A4E] hover:bg-[#08633E] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                >
                  Return to Admin
                </button>
              </div>
            </div>
          )}

        {currentUser.role === 'admin' && (
          <div
            className={`border-b py-2.5 px-4 ${
              isChampagne
                ? 'bg-[#F3EFE8] border-[#E6E0D6] text-[#43505C]'
                : 'bg-[#121922] border-[#222F3D] text-[#94A3B8]'
            }`}
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2.5">
              <span className="text-xs font-medium">Admin Session</span>
              <div
                className={`inline-flex p-1 rounded-lg border ${
                  isChampagne
                    ? 'bg-white border-[#E6E0D6]'
                    : 'bg-[#0B1015] border-[#222F3D]'
                }`}
              >
                <button
                  onClick={() => setAdminView('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    adminView === 'admin'
                      ? 'bg-[#0B7A4E] text-white'
                      : isChampagne
                      ? 'text-[#43505C] hover:text-[#18222B]'
                      : 'text-[#94A3B8] hover:text-[#F4F1EA]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  onClick={() => setAdminView('investor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    adminView === 'investor'
                      ? 'bg-[#0B7A4E] text-white'
                      : isChampagne
                      ? 'text-[#43505C] hover:text-[#18222B]'
                      : 'text-[#94A3B8] hover:text-[#F4F1EA]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Investor</span>
                </button>
                <button
                  onClick={() => setAdminView('marketer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    adminView === 'marketer'
                      ? 'bg-[#0B7A4E] text-white'
                      : isChampagne
                      ? 'text-[#43505C] hover:text-[#18222B]'
                      : 'text-[#94A3B8] hover:text-[#F4F1EA]'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Marketer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <React.Suspense
            fallback={
              <div
                className={`rounded-xl border p-8 text-center text-sm ${
                  isChampagne
                    ? 'bg-white border-[#E6E0D6] text-[#6C7885]'
                    : 'bg-[#121922] border-[#222F3D] text-[#8896A6]'
                }`}
              >
                Loading workspace…
              </div>
            }
          >
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
