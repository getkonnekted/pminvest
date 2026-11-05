import React from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  Building2
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { PmLogo } from './PmLogo';
import { WHATSAPP_COMMUNITY_URL, WHATSAPP_SUPPORT_URL, TELEGRAM_COMMUNITY_URL } from './CommunityBanner';
import { WhatsAppGoldIcon, TelegramGoldIcon } from './CommunityIcons';
import { LiveReserveCounter } from './LiveReserveCounter';
import { ThemeToggle } from './ThemeToggle';

import { useTheme } from '../context/ThemeContext';

export const BrandingHeader: React.FC = () => {
  const { currentUser, logout } = useAppState();
  const { isChampagne } = useTheme();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`w-full ${isChampagne ? 'bg-[#FAF8F5]/95 border-b border-[#B8964E]/25 text-slate-900 shadow-xs' : 'bg-[#0B0C10]/95 border-b border-[#B8964E]/20 text-white shadow-xl'} backdrop-blur-md sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <PmLogo className="h-10 sm:h-12 w-auto shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className={`text-xs sm:text-base font-black tracking-wider sm:tracking-widest uppercase font-mono truncate ${isChampagne ? 'text-slate-950' : 'text-[#FAF8F5]'}`}>
              PM INVEST <span className="text-[#B8964E]">·</span> TREASURE HOMES
            </span>
            <span className={`hidden md:block text-[9px] uppercase tracking-widest ${isChampagne ? 'text-slate-500' : 'text-slate-400'} font-mono leading-none mt-0.5 truncate`}>
              DIFC SPV Legal Trust &amp; Dubai Land Department Co-Ownership
            </span>
          </div>
        </div>

        {/* Zone 3: Executive CTA & Account Access */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          {currentUser ? (
            <div className={`flex items-center gap-2 sm:gap-3 ${isChampagne ? 'bg-white border-[#B8964E]/30 text-slate-900 shadow-xs' : 'bg-[#13151F] border-[#B8964E]/25 text-white shadow-md'} px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border`}>
              <div className="text-right min-w-0">
                <p className={`text-[11px] sm:text-xs font-bold ${isChampagne ? 'text-slate-950' : 'text-white'} flex items-center justify-end gap-1 font-mono`}>
                  <span className="max-w-[70px] xs:max-w-[110px] sm:max-w-none truncate">{currentUser.name}</span>
                  {currentUser.role === 'admin' && (
                    <span className="text-[8px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded-sm font-black uppercase tracking-wider shrink-0">Admin</span>
                  )}
                </p>
                <span className={`text-[10px] sm:text-[11px] font-bold ${isChampagne ? 'text-emerald-700' : 'text-emerald-400'} font-mono tabular-nums block`}>
                  ₦{currentUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className={`h-5 sm:h-6 w-px ${isChampagne ? 'bg-slate-200' : 'bg-slate-800'}`} />

              <button 
                onClick={logout}
                className={`p-1 sm:p-1.5 ${isChampagne ? 'text-slate-500 hover:text-rose-600' : 'text-slate-400 hover:text-rose-400'} rounded transition-colors cursor-pointer shrink-0`}
                title="Logout"
                id="btn_logout_header"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => scrollToSection('card_auth_panel')}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#B8964E] via-[#D4AF37] to-[#9C7B38] hover:from-[#D4AF37] hover:to-[#B8964E] text-slate-950 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95 whitespace-nowrap"
              id="btn_header_access_portal"
            >
              <span className="hidden xs:inline">Access </span>Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const LegalDisclosures: React.FC = () => {
  const { isChampagne } = useTheme();
  const { currentUser } = useAppState();

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
            Join our verified community for daily payout alerts, announcements, land allocations, and proof of deeds.
          </p>
          <div className="space-y-2 mt-3">
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2.5 rounded-xl ${isChampagne ? 'bg-white hover:bg-[#fbf9f4] border border-sky-400/40 text-slate-800' : 'bg-gradient-to-r from-[#0c1626] to-[#0c101c] hover:bg-[#111e33] border border-sky-500/35 text-slate-200'} transition-colors group shadow-sm`}
            >
              <div className="flex items-center gap-2.5">
                <TelegramGoldIcon className="w-5 h-5 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className={`font-bold text-xs ${isChampagne ? 'text-slate-950' : 'text-white'}`}>
                    Join Official Telegram
                  </span>
                </div>
              </div>
            </a>

            {currentUser && (
              <a
                href={WHATSAPP_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-xl ${isChampagne ? 'bg-white hover:bg-[#fbf9f4] border border-[#c5a059]/35 text-slate-800' : 'bg-[#0c101c] hover:bg-[#111728] border border-emerald-500/30 text-slate-200'} transition-colors group`}
              >
                <div className="flex items-center gap-2.5">
                  <WhatsAppGoldIcon className="w-5 h-5 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className={`font-semibold text-xs ${isChampagne ? 'text-slate-950' : 'text-white'}`}>Chat on WhatsApp</span>
                    <span className={`text-[11px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>1-on-1 Account Concierge</span>
                  </div>
                </div>
              </a>
            )}
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

