/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import { BrandingHeader, LegalDisclosures } from './components/BrandingHeader';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { DeveloperBar } from './components/DeveloperBar';
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
  AlertTriangle
} from 'lucide-react';
import { INVESTMENT_PLANS } from './types';

function MainAppContent() {
  const { currentUser, register, login, successMsg, errorMsg, clearMessages } = useAppState();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('ola@gmail.com'); // Pre-fill with Ola's seed email for quick loading

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRef, setRegRef] = useState('OLA500'); // Pre-fill with Chief Ola's code so they can register instantly

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = register(regName, regEmail, regRef);
    if (success) {
      setRegName('');
      setRegEmail('');
    }
  };

  // Unauthenticated Landing Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans">
        {/* Affiliation Header bar */}
        <div className="bg-[#0f172a] px-4 py-2.5 text-center text-xs text-slate-300 border-b border-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>PM Invest is a certified wealth program operates under <strong className="text-white">TREASURE HOMES LTD</strong></span>
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
                  <p className="text-slate-500 mt-0.5">Yield is credited automatically to your secure vault wallet every week.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Users className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">50% Referral Commission</h4>
                  <p className="text-slate-500 mt-0.5">Earn 50% of your referral's weekly payouts automatically credited to your balance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Auth Vault Forms */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-slate-800">
            {/* Overlay glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                <Lock className="w-4 h-4 text-amber-500" />
                {isRegistering ? 'Register Wealth Account' : 'Investor Vault Log In'}
              </h3>
              <p className="text-center sm:text-left text-xs text-slate-500 mt-1">
                {isRegistering 
                  ? 'Access secure mortgage yield cycles under Treasure Homes compliance.'
                  : 'Unlock your private investment panel and check accumulated yields.'
                }
              </p>
            </div>

            {/* General feedback message in landing page */}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center gap-1.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!isRegistering ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Registered Vault Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. ola@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  id="btn_landing_login"
                >
                  Access My Vault <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-3 border-t border-slate-100 mt-6 text-xs text-slate-500 space-y-3">
                  <p>
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsRegistering(true); clearMessages(); }}
                      className="text-amber-600 hover:underline font-semibold"
                    >
                      Open secure account
                    </button>
                  </p>
                  
                  {/* Quick-select seed users for rapid sandbox testing */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Sandbox Quick Access:</span>
                    <p className="text-slate-500 text-[11px]">Select a pre-seeded email to log in instantly:</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <button 
                        type="button"
                        onClick={() => { setLoginEmail('admin@treasurehomes.com'); login('admin@treasurehomes.com'); }}
                        className="bg-white text-slate-700 border border-slate-200 hover:border-amber-500 hover:text-amber-600 px-2 py-1 rounded text-[10px] font-semibold transition-colors shadow-sm"
                      >
                        Treasure Admin
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setLoginEmail('ola@gmail.com'); login('ola@gmail.com'); }}
                        className="bg-white text-slate-700 border border-slate-200 hover:border-amber-500 hover:text-amber-600 px-2 py-1 rounded text-[10px] font-semibold transition-colors shadow-sm"
                      >
                        Chief Ola (Investor/Sponsor)
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setLoginEmail('emeka@gmail.com'); login('emeka@gmail.com'); }}
                        className="bg-white text-slate-700 border border-slate-200 hover:border-amber-500 hover:text-amber-600 px-2 py-1 rounded text-[10px] font-semibold transition-colors shadow-sm"
                      >
                        Emeka Obi (Investor)
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setLoginEmail('fatima@gmail.com'); login('fatima@gmail.com'); }}
                        className="bg-white text-slate-700 border border-slate-200 hover:border-amber-500 hover:text-amber-600 px-2 py-1 rounded text-[10px] font-semibold transition-colors shadow-sm"
                      >
                        Fatima (Pending KYC/Deposit)
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Same as your ID card"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Vault Email Address</label>
                  <input 
                    type="email" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. investor@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs text-slate-500 font-medium">Sponsor Referral Code</label>
                    <span className="text-[10px] text-rose-500 font-semibold">* Required</span>
                  </div>
                  <input 
                    type="text" 
                    value={regRef}
                    onChange={(e) => setRegRef(e.target.value)}
                    placeholder="e.g. OLA500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Under Treasure Homes guidelines, registrations require a valid sponsor. Try <strong>OLA500</strong>, <strong>EMEKA12</strong>, or <strong>TREASURE_ADMIN</strong>.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
                  id="btn_landing_register"
                >
                  Create Secure Vault Account <UserPlus className="w-4 h-4" />
                </button>

                <p className="text-center pt-3 border-t border-slate-100 mt-6 text-xs text-slate-500">
                  Already registered?{' '}
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(false); clearMessages(); }}
                    className="text-amber-600 hover:underline font-semibold"
                  >
                    Log in here
                  </button>
                </p>
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
              <span className="text-amber-400 font-bold text-sm block">₦15M+ RESERVE BACKING</span>
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans pb-20 md:pb-16" id="app_workspace_root">
      <div>
        <BrandingHeader />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentUser.role === 'admin' ? (
            <AdminPanel />
          ) : (
            <UserDashboard />
          )}
        </main>
      </div>

      <LegalDisclosures />
      
      {/* Simulation Helper Developer bar on bottom */}
      <DeveloperBar />
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
