import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink, Globe, Sparkles, UserCheck, Send } from 'lucide-react';
import {
  CANVASSING_LANGUAGES,
  CanvassingLanguage,
  getBroadcastPitch,
  getPersonalFollowupPitch
} from '../data/canvassingPitches';

interface MultilingualPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketerName: string;
  referralCode: string;
  referralLink: string;
  targetLead?: {
    name: string;
    phone?: string;
    email?: string;
  } | null;
}

export const MultilingualPitchModal: React.FC<MultilingualPitchModalProps> = ({
  isOpen,
  onClose,
  marketerName,
  referralCode,
  referralLink,
  targetLead
}) => {
  const [selectedLang, setSelectedLang] = useState<CanvassingLanguage>('pcm'); // Default to Nigerian Pidgin for high engagement
  const [pitchText, setPitchText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const isPersonal = Boolean(targetLead);

  // Generate initial pitch when modal opens, language changes, or lead changes
  useEffect(() => {
    if (isPersonal && targetLead) {
      const generated = getPersonalFollowupPitch(
        selectedLang,
        targetLead.name,
        marketerName,
        referralCode,
        referralLink
      );
      setPitchText(generated);
    } else {
      const generated = getBroadcastPitch(
        selectedLang,
        marketerName,
        referralCode,
        referralLink
      );
      setPitchText(generated);
    }
  }, [selectedLang, isPersonal, targetLead, marketerName, referralCode, referralLink]);

  // Clean phone number for direct WhatsApp link
  const cleanPhoneForWhatsApp = (phone?: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `234${cleaned.slice(1)}`;
    }
    return cleaned;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(pitchText);
    let url = `https://wa.me/?text=${encodedText}`;

    if (isPersonal && targetLead?.phone) {
      const cleaned = cleanPhoneForWhatsApp(targetLead.phone);
      if (cleaned) {
        url = `https://wa.me/${cleaned}?text=${encodedText}`;
      }
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTelegram = () => {
    const encodedText = encodeURIComponent(pitchText);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://treasurehomes.ng';
    const targetUrl = referralLink || origin;
    const url = `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Keyboard navigation escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="multilingual_pitch_title"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1424] via-[#090d18] to-[#06080e] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-5 border-b border-amber-500/20 bg-[#070b14]/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 id="multilingual_pitch_title" className="text-sm sm:text-base font-extrabold text-[#f7ecd5] uppercase tracking-wide flex items-center gap-2 font-mono">
                <span>{isPersonal ? 'Personal WhatsApp Follow-up' : 'WhatsApp Canvassing Broadcast'}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                {isPersonal && targetLead ? (
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    Target Lead: <strong className="text-white">{targetLead.name}</strong> {targetLead.phone ? `(${targetLead.phone})` : ''}
                  </span>
                ) : (
                  'Select a regional language to generate a tailored pitch for status and groups.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Language Switcher & Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Step 1: Language Switcher Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Select Canvassing Language
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {CANVASSING_LANGUAGES.length} Regional Languages
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CANVASSING_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLang(lang.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/10 border-amber-400/70 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-[#06080e] hover:bg-[#101524] border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-sm">{lang.flag}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isSelected ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {lang.badge}
                      </span>
                    </div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {lang.nativeName}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {lang.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Live Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="pitch_preview_textarea" className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Message Preview</span>
                <span className="text-[10px] text-emerald-400 font-normal font-sans">(Editable before sending)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {pitchText.length} characters
              </span>
            </div>

            <div className="relative rounded-xl border border-amber-500/25 bg-[#05070c] p-3 shadow-inner">
              <textarea
                id="pitch_preview_textarea"
                rows={7}
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                className="w-full bg-transparent text-slate-200 text-xs sm:text-sm font-sans leading-relaxed resize-none focus:outline-none"
                placeholder="Message preview..."
              />

              {/* Referral watermark badge */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span>Referral: <strong className="text-amber-400">{referralCode}</strong></span>
                <span className="text-emerald-400">⚡ Friday Payout Pitch Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-amber-500/20 bg-[#070b14]/90 flex flex-col sm:flex-row items-center gap-2.5 justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            id="btn_modal_copy_pitch"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Pitch Copied!' : 'Copy Text'}</span>
          </button>

          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenTelegram}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/50 text-[#229ED9] hover:text-sky-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              id="btn_modal_launch_telegram"
              title="Share pitch to Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
              id="btn_modal_launch_whatsapp"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>Open in WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950 opacity-70" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MultilingualPitchModal;
