import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Landmark, 
  Info, 
  Sparkles, 
  LogOut, 
  ArrowRight, 
  Wallet, 
  Database, 
  Copy, 
  X, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useAppState } from '../context/StateContext';

export const BrandingHeader: React.FC = () => {
  const { currentUser, logout, settings, supabaseStatus, isDbLoaded } = useAppState();
  const [showDbModal, setShowDbModal] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const SQL_SCHEMA = `-- PM Invest Supabase Setup Script
-- Paste this script directly inside your Supabase SQL Editor and run it!

-- 1. Create Users Table
create table if not exists users (
  id text primary key,
  name text not null,
  email text unique not null,
  "referralCode" text not null,
  "referredByCode" text,
  "walletBalance" double precision not null default 0,
  "kycStatus" text not null default 'unverified',
  "kycDetails" jsonb,
  role text not null default 'user',
  "createdAt" text not null
);

-- 2. Create Investments Table
create table if not exists investments (
  id text primary key,
  "userId" text not null,
  "userName" text not null,
  "planId" text not null,
  "planName" text not null,
  cost double precision not null,
  "weeklyPayout" double precision not null,
  "totalReturns" double precision not null,
  "weeksPaid" integer not null default 0,
  "totalWeeks" integer not null default 4,
  status text not null default 'active',
  "createdAt" text not null,
  "lastPayoutDate" text
);

-- 3. Create Transactions Table
create table if not exists transactions (
  id text primary key,
  "userId" text not null,
  "userName" text not null,
  type text not null,
  amount double precision not null,
  status text not null,
  "paymentMethod" text,
  "accountDetails" text,
  "proofUrl" text,
  "createdAt" text not null,
  description text not null
);

-- 4. Create Settings Table
create table if not exists settings (
  id text primary key default 'system_settings',
  "liquidityReserve" double precision not null,
  "riskAlertLevel" text not null,
  "minWithdrawal" double precision not null,
  "maxWithdrawal" double precision not null,
  "autoApproveDeposits" boolean not null,
  "isMaintenanceMode" boolean not null
);

-- 5. Create System State Table
create table if not exists system_state (
  key text primary key,
  value text not null
);

-- Enable RLS Policies (or disable in Supabase UI for rapid sandbox deployment)
alter table users enable row level security;
alter table investments enable row level security;
alter table transactions enable row level security;
alter table settings enable row level security;
alter table system_state enable row level security;

-- Setup Permissive Development Policies
create policy "Allow all public reads" on users for select using (true);
create policy "Allow all public inserts" on users for insert with check (true);
create policy "Allow all public updates" on users for update using (true);

create policy "Allow all public reads" on investments for select using (true);
create policy "Allow all public inserts" on investments for insert with check (true);
create policy "Allow all public updates" on investments for update using (true);

create policy "Allow all public reads" on transactions for select using (true);
create policy "Allow all public inserts" on transactions for insert with check (true);
create policy "Allow all public updates" on transactions for update using (true);

create policy "Allow all public reads" on settings for select using (true);
create policy "Allow all public upserts" on settings for all using (true);

create policy "Allow all public reads" on system_state for select using (true);
create policy "Allow all public upserts" on system_state for all using (true);`;

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const renderSupabaseBadge = () => {
    if (!isDbLoaded) {
      return (
        <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
          Loading Database...
        </span>
      );
    }

    switch (supabaseStatus) {
      case 'connected':
        return (
          <button 
            onClick={() => setShowDbModal(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-emerald-500/30 hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Supabase Live
          </button>
        );
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-950/80 text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Syncing Supabase...
          </span>
        );
      case 'error':
        return (
          <button 
            onClick={() => setShowDbModal(true)}
            className="inline-flex items-center gap-1.5 bg-rose-950/80 text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-rose-500/30 hover:bg-rose-900 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Database Error
          </button>
        );
      case 'not_configured':
      default:
        return (
          <button 
            onClick={() => setShowDbModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer"
            title="Click to connect Supabase Production Backend"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Sandbox Mode</span>
            <span className="text-[9px] bg-slate-700 text-slate-300 px-1 rounded uppercase tracking-tight">Set DB</span>
          </button>
        );
    }
  };

  return (
    <header className="w-full bg-[#0f172a] border-b border-slate-700 text-white shadow-md">
      {/* Top Banner indicating Treasure Homes affiliation */}
      <div className="bg-[#1e293b] px-4 py-2 text-xs text-center border-b border-slate-800 text-slate-300 flex items-center justify-center gap-1.5 font-sans">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>PM Invest operates as a premium subsidiary under <strong>TREASURE HOMES</strong></span>
        <span className="hidden md:inline text-slate-500">|</span>
        <span className="hidden md:inline">Registered Asset & Wealth Management Group</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-amber-500/20">
            <Landmark className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight uppercase font-sans text-white">PM <span className="text-amber-400">Invest</span></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-bold leading-none">By Treasure Homes</span>
              {currentUser?.role === 'admin' && renderSupabaseBadge()}
            </div>
            <p className="text-xs text-slate-400 font-light mt-0.5">Secure wealth multiplication & estate-backed liquidity</p>
          </div>
        </div>

        {/* Current logged in user view / actions */}
        {currentUser && (
          <div className="flex items-center gap-4 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-400">Current Account</p>
              <p className="text-sm font-semibold text-white flex items-center justify-end gap-1">
                {currentUser.name}
                {currentUser.role === 'admin' && (
                  <span className="text-[9px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Admin</span>
                )}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            
            {/* Wallet display */}
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 flex items-center gap-1"><Wallet className="w-3 h-3 text-amber-400" /> Wallet</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">₦{currentUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <button 
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
              title="Logout"
              id="btn_logout_header"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Database Connection / SQL Setup Modal */}
      {showDbModal && currentUser?.role === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1f2937] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Supabase Storage Configuration</h3>
              </div>
              <button 
                onClick={() => setShowDbModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
              
              {/* Connection Status Panel */}
              <div className="p-4 rounded-xl border bg-slate-900 border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Status Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Current Mode:</span>{' '}
                    <strong className={supabaseStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>
                      {supabaseStatus === 'connected' ? 'Supabase Connected' : 'Local Sandbox (Persisted)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Status Code:</span>{' '}
                    <code className="bg-slate-800 px-1 py-0.5 rounded font-mono text-slate-300">{supabaseStatus}</code>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px] pt-1">
                  {supabaseStatus === 'connected' 
                    ? 'Your PM Invest dashboard is synchronized with your real-time production Supabase cloud database.' 
                    : 'The app is currently running in fallback Local Sandbox mode. To hook it up to your production cloud storage, define the variables below.'}
                </p>
              </div>

              {/* Instructions Panel */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">How to connect Supabase:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
                  <li>
                    Define these variables in your active environment or `.env` file:
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-1.5 font-mono text-[10px] space-y-1 text-amber-400">
                      <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
                      <div>VITE_SUPABASE_ANON_KEY="your-anon-public-key"</div>
                    </div>
                  </li>
                  <li>Go to your **Supabase Dashboard**, open the **SQL Editor**, and run the database setup script below.</li>
                </ol>
              </div>

              {/* SQL Script Panel */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Database Setup SQL Script</h4>
                  <button 
                    onClick={copySqlSchema}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px]"
                  >
                    {copiedSchema ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied Schema!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy SQL Script
                      </>
                    )}
                  </button>
                </div>
                
                <div className="relative">
                  <pre className="bg-[#030712] text-emerald-400 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-56 font-mono text-[10px] leading-relaxed">
                    {SQL_SCHEMA}
                  </pre>
                  <div className="absolute bottom-2 right-2 text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800">
                    Scroll to see entire script
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-400 flex gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Tip:</strong> If you are testing rapidly and do not want to set up RLS policies right away, you can temporarily click <strong>Disable RLS</strong> for the tables (`users`, `investments`, `transactions`, `settings`, `system_state`) in your Supabase table dashboard, then reactivate them with proper auth policies later.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-[#1f2937] flex justify-end">
              <button 
                onClick={() => setShowDbModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Close Setup Guide
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export const LegalDisclosures: React.FC = () => {
  const { settings } = useAppState();
  return (
    <footer className="w-full bg-[#0f172a] border-t border-t-slate-800 text-slate-400 py-10 px-4 text-xs font-sans mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">TREASURE HOMES GROUP</h4>
          <p className="leading-relaxed mb-4 text-slate-300">
            PM Invest is a premium high-yield investment platform owned and managed by TREASURE HOMES LTD. We leverage physical estate developments, verified property acquisition, and structured mortgage-backed securities to generate consistent yield for our active investors.
          </p>
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-[10px] tracking-wider font-semibold">100% REGULATED LIQUIDITY RESERVE</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">RISK MANAGEMENT & SECURITY</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            To sustain our high payouts, PM Invest manages a dedicated <strong>liquidity reserve</strong> of over ₦78,387,045. Under supervision of the Treasure Homes trust committee, withdrawals are processed under a tier-based risk alert system. Large, sensitive withdrawals may require manual clearing up to 24-48 business hours.
          </p>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-300">
            <span className="font-semibold text-amber-400">Active Liquidity Reserve Status:</span> Backed by physical assets and real estate escrow accounts with current reserve liquidity of <strong className="text-white">₦{settings.liquidityReserve.toLocaleString()}</strong>.
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">LEGAL DISCLAIMER</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            Investments carry risk. Our weekly payouts are generated from real estate construction completions and rental yields managed by Treasure Homes. Active investments cannot be cancelled early and are locked for the full 4-week duration.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-300 mb-3 font-mono leading-relaxed">
            <strong>No Banking Connectivity:</strong> First and foremost, the platform is a fully-simulated dashboard designed for tracking real estate investments. It has no live or automated connection to real-world banks or payout APIs.
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            © {new Date().getFullYear()} PM Invest Platforms under License of Treasure Homes Ltd. All rights reserved. Registered Corporate office: Treasure Homes Building, Lagos, Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
};

