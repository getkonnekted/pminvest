import React from 'react';
import { ExternalLink, BellRing, Sparkles, MessageCircle, Send } from 'lucide-react';
import { WhatsAppGoldIcon, TelegramGoldIcon } from './CommunityIcons';

export const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/JFQaPQ9gur84iQZtDqvixk';
export const TELEGRAM_COMMUNITY_URL = 'https://t.me/+Hz6k32s6VmE4NTZk';

export const CommunityBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 border border-amber-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              <WhatsAppGoldIcon className="w-8 h-8 drop-shadow-md" />
              <TelegramGoldIcon className="w-8 h-8 drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Join Community</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-300">Get instant payout notices & platform updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 text-slate-950" />
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#229ED9] hover:bg-[#1d8cbf] text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-xl mb-6">
      {/* Decorative Golden Ambient Glows */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left column: Icons + Text */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex -space-x-3 sm:-space-x-4 shrink-0 p-1">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <WhatsAppGoldIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-xl" />
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <TelegramGoldIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-xl" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
              <BellRing className="w-3 h-3 text-amber-400 animate-bounce" />
              <span>Official Investor Community</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              Join WhatsApp & Telegram For Live Updates
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Never miss a payout alert! Join our verified investor groups for real-time announcements, weekly yield distributions, land allocation schedules, and 24/7 dedicated support.
            </p>
          </div>
        </div>

        {/* Right column: Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1ebd5a] hover:to-[#0f7a6e] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            id="btn_join_whatsapp_community"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Join WhatsApp Group</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <a
            href={TELEGRAM_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#229ED9] hover:to-[#1b7ca8] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-sky-950/40 hover:shadow-sky-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            id="btn_join_telegram_community"
          >
            <Send className="w-4 h-4 text-white" />
            <span>Join Telegram</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};
