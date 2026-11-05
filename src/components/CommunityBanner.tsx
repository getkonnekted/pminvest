import React from 'react';
import { ExternalLink, MessageCircle, Send } from 'lucide-react';

export const WHATSAPP_PHONE_NUMBER = '+15707501467';
export const WHATSAPP_RAW_NUMBER = '15707501467';
export const WHATSAPP_DEFAULT_PREFILL = 'Hello PM Invest, I just registered on the portal and would like assistance with activating my Friday real estate yield plan.';
export const WHATSAPP_SUPPORT_URL = `https://wa.me/${WHATSAPP_RAW_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_PREFILL)}`;
export const WHATSAPP_COMMUNITY_URL = WHATSAPP_SUPPORT_URL; // Direct Click-to-Chat (CTWA) preventing bans
export const TELEGRAM_COMMUNITY_URL = 'https://t.me/+6OhZgN0BwI5lNTc5';

export interface CommunityBannerProps {
  showWhatsAppAdvisor?: boolean;
}

export const CommunityBanner: React.FC<CommunityBannerProps> = ({ showWhatsAppAdvisor = true }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#070b14] via-[#0b1222] to-[#06080e] border border-amber-400/35 rounded-2xl p-3 sm:p-4 shadow-xl mb-5">
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Trust Value */}
        <div className="space-y-0.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Investor Hub &amp; Live Support</span>
          </div>
          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
            {showWhatsAppAdvisor ? 'Official Community & Direct Account Advisor' : 'Official Investor Telegram Community'}
          </h3>
          <p className="text-[11px] text-slate-300">
            {showWhatsAppAdvisor 
              ? 'Join Telegram for live Friday alerts & deed records, or chat directly 1-on-1 on WhatsApp.'
              : 'Join our official Telegram channel for live Friday payout alerts, deed records, and community discussions.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          {/* Primary Telegram Community Button (Social Proof & Live Payouts) */}
          <a
            href={TELEGRAM_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0088cc] to-[#229ED9] hover:from-[#0077b5] hover:to-[#1d8cbf] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-sky-950/30 active:scale-95 cursor-pointer whitespace-nowrap border border-sky-400/30"
            id="btn_join_telegram_primary"
            title="Join Official Telegram for Friday Payout Records & Proofs"
          >
            <Send className="w-4 h-4 text-white shrink-0" />
            <div className="flex flex-col text-left leading-tight">
              <span>Join Telegram Community</span>
              <span className="text-[9px] text-sky-100 font-mono font-semibold">⚡ Official Friday Proofs &amp; Alerts</span>
            </div>
          </a>

          {/* Direct 1-on-1 WhatsApp Concierge Chat (Only shown for registered users) */}
          {showWhatsAppAdvisor && (
            <a
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap border border-emerald-400/40"
              id="btn_chat_whatsapp_advisor"
              title="Chat 1-on-1 with Dedicated Account Advisor"
            >
              <MessageCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span>Chat on WhatsApp</span>
                <span className="text-[9px] text-slate-900 font-mono font-semibold">💬 1-on-1 Account Concierge</span>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
