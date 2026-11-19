import React from 'react';
import { LogOut, Send } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { PmLogo } from './PmLogo';
import { TELEGRAM_COMMUNITY_URL } from './CommunityBanner';
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
    <header
      className={`w-full sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-150 ${
        isChampagne
          ? 'bg-[#FAF8F4]/95 border-[#E6E0D6] text-[#18222B]'
          : 'bg-[#0B1015]/95 border-[#222F3D] text-[#F4F1EA]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Logo Only */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center shrink-0 focus:outline-none"
          aria-label="Home"
        >
          <PmLogo className="h-9 sm:h-10 w-auto" />
        </a>

        {/* Zone 2: Minimal Navigation Links (Landing Only) */}
        {!currentUser && (
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => scrollToSection('properties_catalog')}
              className={`transition-colors cursor-pointer ${
                isChampagne ? 'text-[#43505C] hover:text-[#18222B]' : 'text-[#94A3B8] hover:text-[#F4F1EA]'
              }`}
            >
              Properties
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('difc_trust_section')}
              className={`transition-colors cursor-pointer ${
                isChampagne ? 'text-[#43505C] hover:text-[#18222B]' : 'text-[#94A3B8] hover:text-[#F4F1EA]'
              }`}
            >
              Legal Trust
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('payout_structure')}
              className={`transition-colors cursor-pointer ${
                isChampagne ? 'text-[#43505C] hover:text-[#18222B]' : 'text-[#94A3B8] hover:text-[#F4F1EA]'
              }`}
            >
              Returns
            </button>
          </nav>
        )}

        {/* Zone 3: Theme Toggle & Account Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle />

          {currentUser ? (
            <div
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border ${
                isChampagne
                  ? 'bg-white border-[#E6E0D6] text-[#18222B]'
                  : 'bg-[#121922] border-[#222F3D] text-[#F4F1EA]'
              }`}
            >
              <div className="text-right min-w-0 leading-tight">
                <p className="text-xs font-semibold flex items-center justify-end gap-1.5">
                  <span className="max-w-[90px] sm:max-w-[160px] truncate">{currentUser.name}</span>
                  {currentUser.role === 'admin' && (
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
                      }`}
                    >
                      Admin
                    </span>
                  )}
                </p>
                <span
                  className={`text-[11px] font-mono font-medium tabular-nums block mt-0.5 ${
                    isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
                  }`}
                >
                  ₦{currentUser.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className={`h-5 w-px ${isChampagne ? 'bg-[#E6E0D6]' : 'bg-[#222F3D]'}`} />

              <button
                onClick={logout}
                className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                  isChampagne ? 'text-[#6C7885] hover:text-rose-700' : 'text-[#8896A6] hover:text-rose-400'
                }`}
                title="Sign out"
                aria-label="Sign out"
                id="btn_logout_header"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => scrollToSection('card_auth_panel')}
              className="px-4 py-2 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
              id="btn_header_access_portal"
            >
              Client Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const LegalDisclosures: React.FC = () => {
  const { isChampagne } = useTheme();

  return (
    <footer
      className={`w-full border-t py-10 px-4 sm:px-6 lg:px-8 text-xs ${
        isChampagne
          ? 'bg-[#F3EFE8] border-[#E6E0D6] text-[#43505C]'
          : 'bg-[#080C10] border-[#222F3D] text-[#8896A6]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[var(--pm-border)]">
          {/* Column 1: Logo & Mandate */}
          <div className="space-y-3">
            <PmLogo className="h-9 w-auto" />
            <p className="leading-relaxed max-w-xs">
              Dubai real estate co-ownership structured under Treasure Homes Ltd. Weekly Friday distributions backed by physical UAE assets.
            </p>
          </div>

          {/* Column 2: Cash Reserve */}
          <div className="space-y-2">
            <h4
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isChampagne ? 'text-[#18222B]' : 'text-[#F4F1EA]'
              }`}
            >
              Liquidity Reserve
            </h4>
            <p className="leading-relaxed">
              Dedicated Friday payout reserve:{' '}
              <LiveReserveCounter
                precision={0}
                showLivePulse={false}
                className={`font-mono font-semibold tabular-nums ${
                  isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'
                }`}
              />
            </p>
            <p className={isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}>
              24-week term · Direct Friday settlement
            </p>
          </div>

          {/* Column 3: Official Telegram Only */}
          <div className="space-y-2.5">
            <h4
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isChampagne ? 'text-[#18222B]' : 'text-[#F4F1EA]'
              }`}
            >
              Investor Channel
            </h4>
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                isChampagne
                  ? 'bg-white border-[#D3CBC0] text-[#18222B] hover:bg-[#FAF8F4]'
                  : 'bg-[#121922] border-[#222F3D] text-[#F4F1EA] hover:bg-[#18222E]'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#0B7A4E]" />
              <span>Official Telegram Channel</span>
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
          <span>© {new Date().getFullYear()} Treasure Homes Ltd. All rights reserved.</span>
          <span className={isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}>
            Level 48, Emirates Financial Towers, DIFC, Dubai, UAE
          </span>
        </div>
      </div>
    </footer>
  );
};
