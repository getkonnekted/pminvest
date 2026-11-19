import React from 'react';
import { Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const TELEGRAM_COMMUNITY_URL = 'https://t.me/+6OhZgN0BwI5lNTc5';

export interface CommunityBannerProps {
  showWhatsAppAdvisor?: boolean;
}

export const CommunityBanner: React.FC<CommunityBannerProps> = () => {
  const { isChampagne } = useTheme();

  return (
    <div
      className={`rounded-xl border px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isChampagne
          ? 'bg-white border-[#E6E0D6] text-[#18222B]'
          : 'bg-[#121922] border-[#222F3D] text-[#F4F1EA]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
            isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
          }`}
        >
          Investor Channel
        </span>
        <span className={`text-xs ${isChampagne ? 'text-[#43505C]' : 'text-[#C7D1DC]'}`}>
          Weekly Friday payout notices and verified deed updates on Telegram.
        </span>
      </div>

      <a
        href={TELEGRAM_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        id="btn_join_telegram_primary"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Join Telegram</span>
      </a>
    </div>
  );
};
