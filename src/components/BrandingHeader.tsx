import React from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Wallet,
  MessageCircle,
  Send,
  ExternalLink,
  Building2
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { PmLogo } from './PmLogo';
import { WHATSAPP_COMMUNITY_URL, TELEGRAM_COMMUNITY_URL } from './CommunityBanner';
import { WhatsAppGoldIcon, TelegramGoldIcon } from './CommunityIcons';
import { LiveReserveCounter } from './LiveReserveCounter';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';
import { UaeFlag } from './UaeFlag';

import { useTheme } from '../context/ThemeContext';

export const BrandingHeader: React.FC = () => {
  const { currentUser, logout } = useAppState();
  const { isChampagne } = useTheme();

  return (
    <header className={`w-full ${isChampagne ? 'bg-white border-b border-[#c5a059]/35 text-slate-900 shadow-sm' : 'bg-[#070a12] border-b border-amber-500/20 text-white shadow-xl'} backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3">
          <PmLogo className="w-11 h-11 drop-shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black tracking-tight uppercase font-sans ${isChampagne ? 'text-slate-950' : 'text-white'}`}>
                PM <span className={isChampagne ? 'text-amber-700' : 'text-amber-400'}>Invest</span>
              </span>
              <span className={`text-[10px] uppercase tracking-widest ${isChampagne ? 'text-amber-800' : 'text-amber-500/80'} font-mono font-bold leading-none`}>
                By Treasure Homes
              </span>
            </div>
            <p className={`text-xs ${isChampagne ? 'text-slate-600' : 'text-slate-300'} font-normal mt-0.5 flex items-center gap-1.5`}>
              <UaeFlag size="xs" />
              <span>Sovereign UAE Luxury Property Wealth &amp; Steady Friday Payouts</span>
            </p>
          </div>
        </div>

        {/* Current logged in user view / actions & Luxury Theme Switcher */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <PWAInstallButton />
          <ThemeToggle />

          {currentUser && (
            <div className={`flex items-center gap-4 ${isChampagne ? 'bg-[#fcfaf7] border-[#c5a059]/40 text-slate-900 shadow-sm' : 'bg-[#0d1222] border-amber-500/25 text-white shadow-md'} p-2.5 rounded-xl border`}>
              <div className="text-right">
                <p className={`text-sm font-bold ${isChampagne ? 'text-slate-900' : 'text-white'} flex items-center justify-end gap-1`}>
                  {currentUser.name}
                  {currentUser.role === 'admin' && (
                    <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">Admin</span>
                  )}
                </p>
              </div>
              <div className={`h-8 w-px ${isChampagne ? 'bg-[#e5d8c3]' : 'bg-slate-800'}`} />
              
              {/* Wallet display */}
              <div className="flex flex-col text-left">
                <span className={`text-[10px] ${isChampagne ? 'text-amber-800 font-bold' : 'text-amber-400/80'} font-mono flex items-center gap-1`}>
                  <Wallet className={`w-3 h-3 ${isChampagne ? 'text-amber-700' : 'text-amber-400'}`} /> Wallet
                </span>
                <span className={`text-sm font-extrabold ${isChampagne ? 'text-emerald-700' : 'text-emerald-400'} font-mono tabular-nums`}>
                  ₦{currentUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button 
                onClick={logout}
                className={`p-1.5 ${isChampagne ? 'text-slate-500 hover:text-rose-600 hover:bg-[#ede5d8]' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'} rounded transition-colors cursor-pointer`}
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
  const { isChampagne } = useTheme();

  return (
    <footer className={`w-full ${isChampagne ? 'bg-[#ede5d8] border-t border-[#c5a059]/30 text-slate-700' : 'bg-[#06080e] border-t border-amber-500/20 text-slate-400'} py-12 px-4 text-xs font-sans`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className={`text-sm font-bold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wider mb-3`}>TREASURE HOMES GROUP</h4>
          <p className={`leading-relaxed mb-4 ${isChampagne ? 'text-slate-700' : 'text-slate-300'}`}>
            PM Invest is backed by real estate developed and managed by Treasure Homes Ltd. We put money into real building projects and verified rental properties worldwide to pay steady weekly returns to our investors.
          </p>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${isChampagne ? 'text-amber-700' : 'text-amber-400'}`} />
            <span className={`font-mono text-[10px] tracking-wider font-semibold ${isChampagne ? 'text-amber-900 font-bold' : 'text-amber-400'}`}>100% ASSET-BACKED CASH RESERVE</span>
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-bold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wider mb-3`}>OFFICIAL INVESTOR COMMUNITY</h4>
          <p className={`leading-relaxed mb-3 ${isChampagne ? 'text-slate-700' : 'text-slate-300'}`}>
            Join our verified groups for daily payout alerts, announcements, land allocations, and 24/7 friendly support.
          </p>
          <div className="space-y-2 mt-3">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2.5 rounded-xl ${isChampagne ? 'bg-white hover:bg-[#fbf9f4] border border-[#c5a059]/35 text-slate-800' : 'bg-[#0c101c] hover:bg-[#111728] border border-amber-500/20 text-slate-200'} transition-colors group`}
            >
              <div className="flex items-center gap-2.5">
                <WhatsAppGoldIcon className="w-5 h-5 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className={`font-semibold text-xs ${isChampagne ? 'text-slate-950' : 'text-white'}`}>Join WhatsApp Group</span>
                  <span className={`text-[11px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>Official Community &amp; Updates</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
            </a>
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2.5 rounded-xl ${isChampagne ? 'bg-white hover:bg-[#fbf9f4] border border-[#c5a059]/35 text-slate-800' : 'bg-[#0c101c] hover:bg-[#111728] border border-amber-500/20 text-slate-200'} transition-colors group`}
            >
              <div className="flex items-center gap-2.5">
                <TelegramGoldIcon className="w-5 h-5 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className={`font-semibold text-xs ${isChampagne ? 'text-slate-950' : 'text-white'}`}>Join Telegram Channel</span>
                  <span className={`text-[11px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>Official Announcements &amp; Payouts</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500" />
            </a>
          </div>
        </div>

        <div>
          <h4 className={`text-sm font-bold ${isChampagne ? 'text-slate-950' : 'text-[#f7ecd5]'} uppercase tracking-wider mb-3`}>CASH RESERVE &amp; SAFETY</h4>
          <p className={`leading-relaxed mb-3 ${isChampagne ? 'text-slate-700' : 'text-slate-300'}`}>
            To guarantee your weekly payouts, PM Invest keeps a dedicated <strong>cash reserve</strong> of over <LiveReserveCounter precision={0} showLivePulse={true} className={`${isChampagne ? 'text-amber-800' : 'text-amber-400'} font-bold`} /> in bank reserve. This ensures every investor gets paid on time, every Friday.
          </p>
        </div>

        <div>
          {/* Obvious Note on Plans Card */}
          <div className={`${isChampagne ? 'bg-white border-[#c5a059]/35 text-slate-800' : 'bg-[#0c101c] border-amber-500/25 text-slate-200'} border rounded-2xl p-4 shadow-md space-y-2`}>
            <h4 className={`text-xs font-extrabold ${isChampagne ? 'text-amber-800' : 'text-amber-400'} uppercase tracking-wider flex items-center gap-1.5`}>
              <Building2 className={`w-4 h-4 ${isChampagne ? 'text-amber-700' : 'text-amber-400'} shrink-0`} />
              <span>NOTE ON PLANS</span>
            </h4>
            <p className={`leading-relaxed ${isChampagne ? 'text-slate-700' : 'text-slate-200'} text-xs font-medium`}>
              Your profit comes from physical UAE luxury property developments, trading, and rental income. Once you pick a plan, your capital works for the full 24 weeks, paying you cash every Friday.
            </p>
          </div>
          <p className={`text-[11px] ${isChampagne ? 'text-slate-500' : 'text-slate-500'} font-mono mt-3`}>
            © {new Date().getFullYear()} PM Invest Platforms under License of Treasure Homes Ltd. All rights reserved. Corporate office: Level 48, Emirates Financial Towers, DIFC, Dubai, United Arab Emirates.
          </p>
        </div>
      </div>
    </footer>
  );
};

