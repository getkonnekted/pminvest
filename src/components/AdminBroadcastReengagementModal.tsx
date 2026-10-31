import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  PhoneCall, 
  Send, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Share2, 
  Calendar,
  Layers,
  Flame,
  Smartphone,
  RefreshCw,
  Clock
} from 'lucide-react';
import { User, InvestmentPlan, INVESTMENT_PLANS } from '../types';
import { 
  CANVASSING_LANGUAGES, 
  CanvassingLanguage, 
  getPropertyOpeningPitch, 
  cleanPhoneForWhatsApp,
  PropertyPitchDetails
} from '../data/canvassingPitches';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/StateContext';
import { 
  WhatsAppStatus, 
  getWhatsAppStatusInfo, 
  formatPhoneDisplay 
} from '../lib/phoneSanitizer';

interface AdminBroadcastReengagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  unfundedLeads: User[];
  properties?: InvestmentPlan[];
  initialLeadId?: string | null;
  adminName?: string;
}

export const AdminBroadcastReengagementModal: React.FC<AdminBroadcastReengagementModalProps> = ({
  isOpen,
  onClose,
  unfundedLeads,
  properties = INVESTMENT_PLANS,
  initialLeadId = null,
  adminName = 'Treasure Homes Admin'
}) => {
  const { isChampagne } = useTheme();

  // Selected property for campaign
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || 'plan_1'
  );

  // Selected language
  const [selectedLang, setSelectedLang] = useState<CanvassingLanguage>('pcm');

  // Custom urgency / promo note
  const [customNote, setCustomNote] = useState<string>(
    'Only 12 co-ownership deed slots remaining before Friday 12:00 PM distribution lock.'
  );

  // Live editable template text
  const [templateText, setTemplateText] = useState<string>('');
  const [isCustomized, setIsCustomized] = useState<boolean>(false);

  const { updateUserWhatsAppStatus } = useAppState();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [contactFilter, setContactFilter] = useState<'all' | 'has_phone' | 'wa_verified' | 'wa_pending' | 'not_on_whatsapp' | 'missing_phone' | 'not_dispatched' | 'dispatched'>('all');

  // Session tracking of contacted leads
  const [dispatchedLeadIds, setDispatchedLeadIds] = useState<Set<string>>(new Set());

  // Copy feedback states
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [copiedPhones, setCopiedPhones] = useState<boolean>(false);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  // Target lead preview
  const [previewLeadId, setPreviewLeadId] = useState<string | null>(initialLeadId);

  // Get active property object
  const activeProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || properties[0];
  }, [properties, selectedPropertyId]);

  // Derived lead stats
  const leadsWithPhone = useMemo(() => {
    return unfundedLeads.filter(l => Boolean(cleanPhoneForWhatsApp(l.phone)));
  }, [unfundedLeads]);

  const leadsMissingPhone = useMemo(() => {
    return unfundedLeads.filter(l => !cleanPhoneForWhatsApp(l.phone));
  }, [unfundedLeads]);

  const waVerifiedLeads = useMemo(() => {
    return unfundedLeads.filter(l => l.whatsappStatus === 'verified');
  }, [unfundedLeads]);

  const waPendingLeads = useMemo(() => {
    return unfundedLeads.filter(l => Boolean(cleanPhoneForWhatsApp(l.phone)) && (!l.whatsappStatus || l.whatsappStatus === 'pending'));
  }, [unfundedLeads]);

  const waNotOnWaLeads = useMemo(() => {
    return unfundedLeads.filter(l => l.whatsappStatus === 'not_on_whatsapp');
  }, [unfundedLeads]);

  // Filtered leads based on search and contactFilter
  const filteredLeads = useMemo(() => {
    return unfundedLeads.filter(lead => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.phone && lead.phone.includes(q)) ||
        lead.referralCode.toLowerCase().includes(q)
      );

      if (!matchesSearch) return false;

      const hasPhone = Boolean(cleanPhoneForWhatsApp(lead.phone));
      const isDispatched = dispatchedLeadIds.has(lead.id);

      if (contactFilter === 'has_phone') return hasPhone;
      if (contactFilter === 'wa_verified') return lead.whatsappStatus === 'verified';
      if (contactFilter === 'wa_pending') return Boolean(hasPhone) && (!lead.whatsappStatus || lead.whatsappStatus === 'pending');
      if (contactFilter === 'not_on_whatsapp') return lead.whatsappStatus === 'not_on_whatsapp';
      if (contactFilter === 'missing_phone') return !hasPhone;
      if (contactFilter === 'dispatched') return isDispatched;
      if (contactFilter === 'not_dispatched') return !isDispatched;

      return true;
    });
  }, [unfundedLeads, searchQuery, contactFilter, dispatchedLeadIds]);

  // Regenerate base pitch when property, language, or custom note changes (if not manually overridden)
  useEffect(() => {
    if (!activeProperty) return;

    const previewLeadName = previewLeadId 
      ? unfundedLeads.find(l => l.id === previewLeadId)?.name || '{leadName}'
      : '{leadName}';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pminvest.org.ng';

    const generated = getPropertyOpeningPitch(
      selectedLang,
      previewLeadName,
      activeProperty,
      customNote,
      origin
    );

    setTemplateText(generated);
    setIsCustomized(false);
  }, [activeProperty, selectedLang, customNote, previewLeadId, unfundedLeads]);

  // Keyboard navigation escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Generate personalized pitch for a specific lead
  const getPersonalizedPitchForLead = (lead: User): string => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pminvest.org.ng';
    
    // If the admin has typed a custom template, substitute {leadName} with the actual lead's name
    if (isCustomized) {
      return templateText.replace(/{leadName}/gi, lead.name);
    }

    return getPropertyOpeningPitch(
      selectedLang,
      lead.name,
      activeProperty,
      customNote,
      origin
    );
  };

  // Launch WhatsApp with personalized message
  const handleOpenWhatsApp = (lead: User) => {
    const cleanPhone = cleanPhoneForWhatsApp(lead.phone);
    if (!cleanPhone) return;

    const personalized = getPersonalizedPitchForLead(lead);
    const encoded = encodeURIComponent(personalized);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

    // Mark as dispatched in session
    setDispatchedLeadIds(prev => new Set(prev).add(lead.id));

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Copy personalized message for one lead
  const handleCopyLeadPitch = (lead: User) => {
    const personalized = getPersonalizedPitchForLead(lead);
    navigator.clipboard.writeText(personalized);
    setCopiedLeadId(lead.id);
    setTimeout(() => setCopiedLeadId(null), 2500);
  };

  // Copy broadcast template for general status / groups
  const handleCopyBroadcastTemplate = () => {
    const broadcastText = templateText.replace(/{leadName}/gi, 'Valued Investor');
    navigator.clipboard.writeText(broadcastText);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  // Export all clean WhatsApp numbers
  const handleExportPhoneNumbers = () => {
    const numbers = leadsWithPhone
      .map(l => cleanPhoneForWhatsApp(l.phone))
      .filter(Boolean)
      .join(', ');

    navigator.clipboard.writeText(numbers);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden transition-all my-auto max-h-[92vh] flex flex-col ${
          isChampagne
            ? 'bg-[#fcfaf5] border-[#d8c29d] text-slate-900'
            : 'bg-[#0d121f] border-amber-500/30 text-slate-100'
        }`}
      >
        {/* MODAL HEADER */}
        <div 
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isChampagne
              ? 'bg-[#f5ede0] border-[#e2d2b8]'
              : 'bg-[#131929] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Broadcast Re-engagement Desk
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
                  Unfunded Leads Campaign
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isChampagne ? 'text-slate-600' : 'text-slate-400'}`}>
                Re-engage registered users with ₦0 deposits by announcing high-yield Dubai property openings in their native dialect.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isChampagne 
                ? 'hover:bg-[#e8dac5] text-slate-600' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS & CONVERSION SUMMARY STRIP */}
        <div 
          className={`p-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0 ${
            isChampagne
              ? 'bg-[#fbf7f0] border-[#ede2d1]'
              : 'bg-[#0a0e18] border-slate-800/80'
          }`}
        >
          <div className={`p-3 rounded-xl border ${isChampagne ? 'bg-white border-[#e8dac5]' : 'bg-[#111726] border-slate-800'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
              Total Unfunded Leads
            </span>
            <span className="text-xl font-extrabold font-mono text-amber-500 mt-0.5 block tabular-nums">
              {unfundedLeads.length}
            </span>
            <span className={`text-[10px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>Registered & ₦0 paid</span>
          </div>

          <div className={`p-3 rounded-xl border ${isChampagne ? 'bg-white border-[#e8dac5]' : 'bg-[#111726] border-slate-800'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
              WhatsApp Reachable
            </span>
            <span className="text-xl font-extrabold font-mono text-emerald-600 mt-0.5 block tabular-nums">
              {leadsWithPhone.length}
            </span>
            <span className={`text-[10px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
              Valid mobile numbers
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${isChampagne ? 'bg-white border-[#e8dac5]' : 'bg-[#111726] border-slate-800'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
              Dispatched in Session
            </span>
            <span className="text-xl font-extrabold font-mono text-blue-500 mt-0.5 block tabular-nums">
              {dispatchedLeadIds.size} / {leadsWithPhone.length}
            </span>
            <span className={`text-[10px] ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
              Re-engagement progress
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${isChampagne ? 'bg-white border-[#e8dac5]' : 'bg-[#111726] border-slate-800'}`}>
            <span className={`text-[10px] uppercase font-mono block ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
              Target Property Entry
            </span>
            <span className="text-xl font-extrabold font-mono text-amber-600 mt-0.5 block tabular-nums">
              ₦{activeProperty.cost.toLocaleString()}
            </span>
            <span className={`text-[10px] truncate block ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
              {activeProperty.name}
            </span>
          </div>
        </div>

        {/* MODAL MAIN CONTENT: SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: SELECT PROPERTY & LANGUAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PROPERTY SELECTOR */}
            <div className="lg:col-span-7 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider block flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>1. Select Property Opening to Promote</span>
                </span>
                <span className={`text-[10px] font-mono normal-case ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
                  {properties.length} Active UAE Assets
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {properties.map((plan) => {
                  const isSelected = plan.id === selectedPropertyId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPropertyId(plan.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? isChampagne
                            ? 'bg-[#f4ebe0] border-amber-600 ring-2 ring-amber-500/20 shadow-sm'
                            : 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                          : isChampagne
                            ? 'bg-white border-[#e6d8c4] hover:bg-[#faf5ec]'
                            : 'bg-[#111726] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-xs tracking-tight line-clamp-1">
                            {plan.name}
                          </div>
                          <div className={`text-[10px] mt-0.5 line-clamp-1 ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
                            📍 {plan.propertyLocation}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/40 flex items-center justify-between font-mono text-[11px]">
                        <div>
                          <span className={`text-[9px] block ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>Entry</span>
                          <span className="font-bold text-amber-600">₦{plan.cost.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] block ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>Friday Payout</span>
                          <span className="font-bold text-emerald-600">+₦{plan.weeklyPayout.toLocaleString()}/wk</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LANGUAGE SELECTOR */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider block flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>2. Language / Native Dialect</span>
                </span>
                <span className="text-[10px] font-mono text-amber-600 font-bold">
                  6 Dialects
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CANVASSING_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setSelectedLang(lang.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? isChampagne
                            ? 'bg-[#f4ebe0] border-amber-600 font-bold text-amber-900 shadow-xs'
                            : 'bg-amber-500/15 border-amber-500 font-bold text-amber-300 shadow-xs'
                          : isChampagne
                            ? 'bg-white border-[#e6d8c4] text-slate-700 hover:bg-[#faf5ec]'
                            : 'bg-[#111726] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-lg leading-none">{lang.flag}</div>
                      <div className="text-xs font-bold mt-1 line-clamp-1">{lang.nativeName}</div>
                      <div className={`text-[9px] font-mono uppercase mt-0.5 ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
                        {lang.badge}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Note input */}
              <div className="pt-2">
                <label className={`text-[11px] font-semibold block mb-1 ${isChampagne ? 'text-slate-700' : 'text-slate-300'}`}>
                  Custom Urgency / Incentive Note (Optional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Only 10 fractions remain before Friday 12:00 PM lock."
                  className={`w-full text-xs px-3 py-2 rounded-xl border font-sans focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
                    isChampagne
                      ? 'bg-white border-[#ded2be] text-slate-900 placeholder-slate-400'
                      : 'bg-[#111726] border-slate-800 text-slate-100 placeholder-slate-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* STEP 2: LIVE TEMPLATE PREVIEW & CUSTOMIZER */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>3. Pre-Built WhatsApp Pitch Template</span>
                {isCustomized && (
                  <span className="text-[10px] text-amber-500 font-mono font-bold lowercase">
                    (customized)
                  </span>
                )}
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBroadcastTemplate}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    copiedTemplate
                      ? 'bg-emerald-600 text-white'
                      : isChampagne
                        ? 'bg-[#ede3d3] hover:bg-[#e4d7c3] text-slate-800 border border-[#d8c7b0]'
                        : 'bg-[#1a233a] hover:bg-[#232e4d] text-slate-200 border border-slate-700'
                  }`}
                  title="Copy broadcast text for WhatsApp Status or Groups"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Copied Template!' : 'Copy Broadcast Pitch'}</span>
                </button>
              </div>
            </div>

            <div 
              className={`p-4 rounded-xl border relative font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                isChampagne
                  ? 'bg-emerald-50/40 border-emerald-300 text-slate-800'
                  : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
              }`}
            >
              <textarea
                value={templateText}
                onChange={(e) => {
                  setTemplateText(e.target.value);
                  setIsCustomized(true);
                }}
                rows={7}
                className="w-full bg-transparent resize-y outline-hidden border-none text-xs sm:text-sm font-sans leading-relaxed"
                placeholder="Compose or modify your WhatsApp message template..."
              />
              <div className={`mt-2 pt-2 border-t flex flex-wrap items-center justify-between text-[11px] font-mono ${
                isChampagne ? 'border-emerald-200 text-emerald-800' : 'border-emerald-900/40 text-emerald-400'
              }`}>
                <span>💡 Tip: <code className="font-bold">{'{leadName}'}</code> will be dynamically replaced with each lead's actual name when dispatched.</span>
                <span className="italic">WhatsApp markdown (*bold*, _italic_) supported</span>
              </div>
            </div>
          </div>

          {/* STEP 3: UNFUNDED LEADS CAMPAIGN QUEUE */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>4. Unfunded Leads Campaign Queue ({filteredLeads.length})</span>
                </h4>
                <p className={`text-xs mt-0.5 ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
                  Launch 1-click WhatsApp conversations or copy custom pitches for each registered investor lead.
                </p>
              </div>

              {/* ACTION UTILITIES */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportPhoneNumbers}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    copiedPhones
                      ? 'bg-emerald-600 text-white'
                      : isChampagne
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                        : 'bg-[#151c2e] hover:bg-[#1d2740] text-slate-200 border border-slate-700'
                  }`}
                  title="Copy all phone numbers for WhatsApp Broadcast list or SMS gateway"
                >
                  {copiedPhones ? <Check className="w-3.5 h-3.5 text-white" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>{copiedPhones ? 'Copied All Numbers!' : `Copy All Phones (${leadsWithPhone.length})`}</span>
                </button>

                {dispatchedLeadIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setDispatchedLeadIds(new Set())}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                      isChampagne 
                        ? 'text-slate-600 hover:bg-slate-200' 
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                    title="Reset dispatched session markers"
                  >
                    Reset Markers
                  </button>
                )}
              </div>
            </div>

            {/* SEARCH AND FILTER BAR */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isChampagne ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads by name, email, phone, or referral code..."
                  className={`w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border outline-hidden transition-colors ${
                    isChampagne
                      ? 'bg-white border-[#ded2be] text-slate-900 placeholder-slate-400 focus:border-amber-500'
                      : 'bg-[#111726] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500'
                  }`}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* SEGMENTED FILTER */}
              <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto ${
                isChampagne ? 'bg-[#ede5d8] border-[#ded2be]' : 'bg-[#111726] border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setContactFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    contactFilter === 'all'
                      ? isChampagne ? 'bg-white text-slate-900 shadow-xs' : 'bg-amber-500 text-slate-950 font-bold'
                      : isChampagne ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({unfundedLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContactFilter('wa_verified')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    contactFilter === 'wa_verified'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : isChampagne ? 'text-slate-600 hover:text-emerald-700' : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  ✓ Verified WA ({waVerifiedLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContactFilter('wa_pending')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    contactFilter === 'wa_pending'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : isChampagne ? 'text-slate-600 hover:text-amber-700' : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  ⏳ Pending WA ({waPendingLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContactFilter('not_on_whatsapp')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    contactFilter === 'not_on_whatsapp'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : isChampagne ? 'text-slate-600 hover:text-rose-700' : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  🚫 Not on WA ({waNotOnWaLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContactFilter('not_dispatched')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    contactFilter === 'not_dispatched'
                      ? isChampagne ? 'bg-white text-slate-900 shadow-xs' : 'bg-amber-500 text-slate-950 font-bold'
                      : isChampagne ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending Send ({unfundedLeads.length - dispatchedLeadIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setContactFilter('dispatched')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    contactFilter === 'dispatched'
                      ? isChampagne ? 'bg-white text-slate-900 shadow-xs' : 'bg-amber-500 text-slate-950 font-bold'
                      : isChampagne ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dispatched ({dispatchedLeadIds.size})
                </button>
              </div>
            </div>

            {/* LEADS LIST / TABLE */}
            <div className={`rounded-xl border overflow-hidden ${
              isChampagne ? 'border-[#e0d3bf] bg-white' : 'border-slate-800 bg-[#111726]'
            }`}>
              {filteredLeads.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                  <p className="text-sm font-bold text-slate-500">No unfunded leads match your filter</p>
                  <p className="text-xs text-slate-400">Try adjusting your search query or reset contact status.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                        isChampagne ? 'bg-[#f7f0e3] border-[#e2d5c2] text-slate-600' : 'bg-[#0a0e18] border-slate-800 text-slate-400'
                      }`}>
                        <th className="py-3 px-4">Lead Name &amp; Email</th>
                        <th className="py-3 px-3">Phone &amp; WhatsApp Status</th>
                        <th className="py-3 px-3">Registered</th>
                        <th className="py-3 px-3 text-center">Campaign</th>
                        <th className="py-3 px-4 text-right">Re-engagement &amp; Status Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/60 font-sans">
                      {filteredLeads.map((lead) => {
                        const cleanPhone = cleanPhoneForWhatsApp(lead.phone);
                        const hasPhone = Boolean(cleanPhone);
                        const isDispatched = dispatchedLeadIds.has(lead.id);
                        const isCopied = copiedLeadId === lead.id;
                        const statusInfo = getWhatsAppStatusInfo(lead.whatsappStatus);

                        return (
                          <tr 
                            key={lead.id}
                            className={`transition-colors ${
                              isDispatched
                                ? isChampagne ? 'bg-emerald-50/40' : 'bg-emerald-950/20'
                                : isChampagne ? 'hover:bg-[#fbf7ee]' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <span>{lead.name}</span>
                                {lead.referredByCode && (
                                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                    isChampagne ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400'
                                  }`}>
                                    Ref: {lead.referredByCode}
                                  </span>
                                )}
                              </div>
                              <div className={`text-[10px] font-mono ${isChampagne ? 'text-slate-500' : 'text-slate-400'}`}>
                                {lead.email}
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              {hasPhone ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                    <span className={isChampagne ? 'text-slate-800 font-bold' : 'text-slate-200 font-bold'}>
                                      {formatPhoneDisplay(lead.phone)}
                                    </span>
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className={`p-1 rounded transition-colors ${
                                        isChampagne ? 'hover:bg-slate-200 text-blue-600' : 'hover:bg-slate-800 text-blue-400'
                                      }`}
                                      title="Voice call"
                                    >
                                      <PhoneCall className="w-3 h-3" />
                                    </a>
                                  </div>
                                  <div>
                                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${statusInfo.badgeClass}`}>
                                      <span>{statusInfo.icon}</span>
                                      <span>{statusInfo.label}</span>
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-amber-600 dark:text-amber-400 italic font-mono flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 shrink-0" />
                                  <span>No phone on file</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                              {lead.createdAt 
                                ? new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                : 'Initial'}
                            </td>

                            <td className="py-3 px-3 text-center">
                              {isDispatched ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Dispatched</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>Pending</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                                {/* 1-CLICK WHATSAPP STATUS TAGGING BUTTONS */}
                                {hasPhone && (
                                  <div className="flex items-center gap-1 mr-1">
                                    {lead.whatsappStatus !== 'verified' && (
                                      <button
                                        type="button"
                                        onClick={() => updateUserWhatsAppStatus(lead.id, 'verified')}
                                        className="text-[10px] font-mono font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 px-2 py-1 rounded transition-all cursor-pointer shadow-2xs"
                                        title="Mark as confirmed active WhatsApp number"
                                      >
                                        ✓ Verify
                                      </button>
                                    )}
                                    {lead.whatsappStatus !== 'not_on_whatsapp' && (
                                      <button
                                        type="button"
                                        onClick={() => updateUserWhatsAppStatus(lead.id, 'not_on_whatsapp')}
                                        className="text-[10px] font-mono font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-700 px-2 py-1 rounded transition-all cursor-pointer shadow-2xs"
                                        title="Flag number as NOT on WhatsApp (e.g. invalid on WhatsApp Web)"
                                      >
                                        ✕ Not on WA
                                      </button>
                                    )}
                                    {(lead.whatsappStatus === 'verified' || lead.whatsappStatus === 'not_on_whatsapp') && (
                                      <button
                                        type="button"
                                        onClick={() => updateUserWhatsAppStatus(lead.id, 'pending')}
                                        className="text-[9px] font-mono text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline px-1 py-1 cursor-pointer"
                                        title="Reset status back to Pending"
                                      >
                                        Reset
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* COPY PERSONALIZED PITCH BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyLeadPitch(lead)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                                    isCopied
                                      ? 'bg-emerald-600 text-white'
                                      : isChampagne
                                        ? 'bg-[#ece3d4] hover:bg-[#e2d5c2] text-slate-700'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                  }`}
                                  title="Copy personalized message for this lead"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                                </button>

                                {/* WHATSAPP 1-CLICK LAUNCH BUTTON */}
                                {hasPhone ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenWhatsApp(lead)}
                                    className={`font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                      lead.whatsappStatus === 'not_on_whatsapp'
                                        ? 'bg-slate-600/70 hover:bg-slate-600 text-slate-200 line-through opacity-80'
                                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
                                    }`}
                                    title={
                                      lead.whatsappStatus === 'not_on_whatsapp'
                                        ? 'Number flagged as Not on WhatsApp. Click if you want to retry anyway.'
                                        : `Send ${activeProperty.name} announcement to ${lead.name} via WhatsApp`
                                    }
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic px-2">
                                    N/A
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div 
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isChampagne
              ? 'bg-[#f5ede0] border-[#e2d2b8]'
              : 'bg-[#131929] border-slate-800'
          }`}
        >
          <div className="text-xs text-slate-500 font-mono">
            <span>Campaign Target: </span>
            <strong className="text-amber-600">{activeProperty.name}</strong>
            <span> (₦{activeProperty.cost.toLocaleString()}) · </span>
            <span>Language: </span>
            <strong className="text-slate-800 dark:text-slate-200 uppercase">{selectedLang}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBroadcastTemplate}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isChampagne
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                  : 'bg-[#1c2438] hover:bg-[#25304a] text-slate-200 border border-slate-700'
              }`}
            >
              Copy Full Broadcast Text
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Done Re-engaging
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
