import React from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Wallet,
  MessageCircle,
  Send,
  ExternalLink 
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { PmLogo } from './PmLogo';
import { WHATSAPP_COMMUNITY_URL, TELEGRAM_COMMUNITY_URL } from './CommunityBanner';
import { WhatsAppGoldIcon, TelegramGoldIcon } from './CommunityIcons';

export const BrandingHeader: React.FC = () => {
  const { currentUser, logout } = useAppState();

  return (
    <header className="w-full bg-[#0f172a] border-b border-slate-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3">
          <PmLogo className="w-11 h-11" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight uppercase font-sans text-white">PM <span className="text-amber-400">Invest</span></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-bold leading-none">By Treasure Homes</span>
            </div>
            <p className="text-xs text-slate-400 font-light mt-0.5">Secure wealth multiplication & estate-backed liquidity</p>
          </div>
        </div>

        {/* Community Links & Current logged in user view / actions */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Quick Community Buttons */}
          <div className="flex items-center gap-2">
            <a 
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Join PM Invest Official WhatsApp Community"
            >
              <WhatsAppGoldIcon className="w-4 h-4" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
            <a 
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/40 text-[#2AABEE] px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Join PM Invest Official Telegram Channel"
            >
              <TelegramGoldIcon className="w-4 h-4" />
              <span className="hidden md:inline">Telegram</span>
            </a>
          </div>

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
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                title="Logout"
                id="btn_logout_header"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const LegalDisclosures: React.FC = () => {
  const { settings } = useAppState();
  return (
    <footer className="w-full bg-[#0f172a] border-t border-t-slate-800 text-slate-400 py-10 px-4 text-xs font-sans mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
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
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">OFFICIAL INVESTOR COMMUNITY</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            Join our verified platforms for daily payout alerts, platform notices, land allocations, and 24/7 investor support.
          </p>
          <div className="space-y-2 mt-3">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <WhatsAppGoldIcon className="w-5 h-5" />
                <span className="font-semibold text-xs text-white">Join WhatsApp Group</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
            </a>
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <TelegramGoldIcon className="w-5 h-5" />
                <span className="font-semibold text-xs text-white">Join Telegram Channel</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">RISK MANAGEMENT & SECURITY</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            To sustain our high payouts, PM Invest manages a dedicated <strong>liquidity reserve</strong> of over ₦{settings.liquidityReserve.toLocaleString()}. Under supervision of the Treasure Homes trust committee, withdrawals are processed under a tier-based risk alert system.
          </p>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-300">
            <span className="font-semibold text-amber-400">Active Liquidity Reserve:</span> Backed by physical assets and real estate escrow accounts with current reserve liquidity of <strong className="text-white font-mono">₦{settings.liquidityReserve.toLocaleString()}</strong>.
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">LEGAL DISCLAIMER</h4>
          <p className="leading-relaxed mb-3 text-slate-300">
            Investments carry risk. Our weekly payouts are generated from real estate construction completions and rental yields managed by Treasure Homes. Active investments cannot be cancelled early and are locked for the full 4-week duration.
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            © {new Date().getFullYear()} PM Invest Platforms under License of Treasure Homes Ltd. All rights reserved. Registered Corporate office: Treasure Homes Building, Lagos, Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
};

