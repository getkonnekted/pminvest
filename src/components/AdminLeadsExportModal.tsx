import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  MessageSquare, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Smartphone, 
  ExternalLink,
  ShieldAlert,
  Share2
} from 'lucide-react';
import { User, UserInvestment, Transaction } from '../types';
import { sanitizeAndValidatePhone, formatPhoneDisplay } from '../lib/phoneSanitizer';

export type LeadSegment = 'all' | 'unfunded' | 'real_paid' | 'marketing' | 'active_search';

interface AdminLeadsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  investments: UserInvestment[];
  transactions: Transaction[];
  currentFilterLabel?: string;
  filteredUsers?: User[];
}

export const AdminLeadsExportModal: React.FC<AdminLeadsExportModalProps> = ({
  isOpen,
  onClose,
  users,
  investments,
  transactions,
  currentFilterLabel,
  filteredUsers
}) => {
  const [selectedSegment, setSelectedSegment] = useState<LeadSegment>('all');
  const [phoneDelimiter, setPhoneDelimiter] = useState<'comma' | 'newline'>('comma');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Compute stats per user
  const userEnrichedMap = useMemo(() => {
    const map = new Map<string, {
      totalPaidTopup: number;
      activePlansCount: number;
      classification: 'admin' | 'marketing_canvasser' | 'real_paid_investor' | 'unfunded_lead';
      phoneValidation: ReturnType<typeof sanitizeAndValidatePhone>;
      whatsAppLink: string;
    }>();

    users.forEach(u => {
      // Real paid deposits
      const paidDeposits = transactions
        .filter(t => t.userId === u.id && t.type === 'deposit' && t.status === 'completed' && !t.isMarketing)
        .reduce((sum, t) => sum + t.amount, 0);

      // Active plans
      const activePlans = investments.filter(i => i.userId === u.id && i.status === 'active').length;

      // Classification
      let classification: 'admin' | 'marketing_canvasser' | 'real_paid_investor' | 'unfunded_lead' = 'unfunded_lead';
      if (u.role === 'admin') {
        classification = 'admin';
      } else if (u.isMarketingAccount) {
        classification = 'marketing_canvasser';
      } else if (paidDeposits > 0) {
        classification = 'real_paid_investor';
      } else {
        classification = 'unfunded_lead';
      }

      const pVal = sanitizeAndValidatePhone(u.phone || '');
      const whatsAppLink = pVal.isValid ? `https://wa.me/${pVal.whatsappDigits}` : '';

      map.set(u.id, {
        totalPaidTopup: paidDeposits,
        activePlansCount: activePlans,
        classification,
        phoneValidation: pVal,
        whatsAppLink
      });
    });

    return map;
  }, [users, investments, transactions]);

  // Segmented user lists
  const unfundedLeads = useMemo(() => {
    return users.filter(u => userEnrichedMap.get(u.id)?.classification === 'unfunded_lead');
  }, [users, userEnrichedMap]);

  const realPaidInvestors = useMemo(() => {
    return users.filter(u => userEnrichedMap.get(u.id)?.classification === 'real_paid_investor');
  }, [users, userEnrichedMap]);

  const marketingCanvassers = useMemo(() => {
    return users.filter(u => userEnrichedMap.get(u.id)?.classification === 'marketing_canvasser');
  }, [users, userEnrichedMap]);

  // Selected list
  const activeExportUsers = useMemo(() => {
    switch (selectedSegment) {
      case 'unfunded':
        return unfundedLeads;
      case 'real_paid':
        return realPaidInvestors;
      case 'marketing':
        return marketingCanvassers;
      case 'active_search':
        return filteredUsers && filteredUsers.length > 0 ? filteredUsers : users;
      case 'all':
      default:
        return users;
    }
  }, [selectedSegment, users, unfundedLeads, realPaidInvestors, marketingCanvassers, filteredUsers]);

  // Derived metrics for selected segment
  const validPhonesCount = useMemo(() => {
    return activeExportUsers.filter(u => userEnrichedMap.get(u.id)?.phoneValidation.isValid).length;
  }, [activeExportUsers, userEnrichedMap]);

  const totalSegmentPaidInflow = useMemo(() => {
    return activeExportUsers.reduce((sum, u) => sum + (userEnrichedMap.get(u.id)?.totalPaidTopup || 0), 0);
  }, [activeExportUsers, userEnrichedMap]);

  // Formatted Phone Numbers for Broadcast
  const broadcastNumbersList = useMemo(() => {
    const numbers: string[] = [];
    activeExportUsers.forEach(u => {
      const p = userEnrichedMap.get(u.id)?.phoneValidation;
      if (p && p.isValid && p.e164) {
        numbers.push(p.e164);
      }
    });
    // Remove duplicates
    const unique = Array.from(new Set(numbers));
    return phoneDelimiter === 'comma' ? unique.join(', ') : unique.join('\n');
  }, [activeExportUsers, userEnrichedMap, phoneDelimiter]);

  // Handlers
  const handleCopyNumbers = () => {
    if (!broadcastNumbersList) return;
    navigator.clipboard.writeText(broadcastNumbersList);
    setCopiedType('numbers');
    setTimeout(() => setCopiedType(null), 2200);
  };

  const handleDownloadCsv = () => {
    const headers = [
      'Account ID',
      'Legal Name',
      'Phone Number',
      'WhatsApp E164',
      'WhatsApp Direct Link',
      'Email Address',
      'Classification',
      'Total Paid TopUp (NGN)',
      'Wallet Balance (NGN)',
      'Active Plans Count',
      'User Referral Code',
      'Sponsor Code',
      'KYC Status',
      'Account Status',
      'Registered Date'
    ];

    const rows = activeExportUsers.map(u => {
      const enriched = userEnrichedMap.get(u.id);
      const classificationLabel = 
        enriched?.classification === 'real_paid_investor' ? 'Verified Real Investor' :
        enriched?.classification === 'unfunded_lead' ? 'Unfunded Lead' :
        enriched?.classification === 'marketing_canvasser' ? 'Marketing Canvasser' : 'Administrator';

      const rowValues = [
        u.id,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${(u.phone || '').replace(/"/g, '""')}"`,
        enriched?.phoneValidation.e164 || '',
        enriched?.whatsAppLink || '',
        `"${(u.email || '').replace(/"/g, '""')}"`,
        classificationLabel,
        enriched?.totalPaidTopup || 0,
        u.walletBalance || 0,
        enriched?.activePlansCount || 0,
        u.referralCode || '',
        u.referredByCode || 'PM-INVEST',
        u.kycStatus || 'unverified',
        u.isDeactivated ? 'Deactivated' : 'Active',
        u.createdAt || ''
      ];

      return rowValues.join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `pm_invest_leads_${selectedSegment}_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (!broadcastNumbersList) return;
    const blob = new Blob([broadcastNumbersList], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `pm_invest_whatsapp_broadcast_${selectedSegment}_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadVCard = () => {
    let vcf = '';
    activeExportUsers.forEach(u => {
      const enriched = userEnrichedMap.get(u.id);
      const p = enriched?.phoneValidation;
      if (!p || !p.isValid) return;

      const classificationLabel = 
        enriched?.classification === 'real_paid_investor' ? 'Investor' :
        enriched?.classification === 'unfunded_lead' ? 'Lead' : 'Canvasser';

      vcf += 'BEGIN:VCARD\r\n';
      vcf += 'VERSION:3.0\r\n';
      vcf += `FN;CHARSET=UTF-8:${u.name.trim()} (PM Invest ${classificationLabel})\r\n`;
      vcf += `TEL;TYPE=CELL,VOICE:${p.e164}\r\n`;
      if (u.email) {
        vcf += `EMAIL:${u.email.trim()}\r\n`;
      }
      vcf += `NOTE;CHARSET=UTF-8:PM Invest Lead | Classification: ${classificationLabel} | Ref: ${u.referredByCode || 'PM-INVEST'} | Balance: NGN ${u.walletBalance}\r\n`;
      vcf += 'END:VCARD\r\n';
    });

    if (!vcf) {
      alert('No valid phone numbers found in this segment to export as contacts.');
      return;
    }

    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `pm_invest_contacts_${selectedSegment}_${timestamp}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 shadow-inner">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
                  Export Leads &amp; CRM Pipeline
                </h3>
                <span className="bg-amber-500/10 text-amber-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                  CONTROL PANEL
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Download spreadsheet files, WhatsApp broadcast lists, or phone contacts for canvassing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close export modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Step 1: Select Target Segment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Select Lead Segment to Export
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Unfunded Leads (High Priority) */}
              <button
                type="button"
                onClick={() => setSelectedSegment('unfunded')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedSegment === 'unfunded'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800">
                    TARGET
                  </span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <span className="font-bold text-xs block">Unfunded Leads</span>
                  <span className="text-lg font-black font-mono text-amber-700 block mt-0.5">
                    {unfundedLeads.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Awaiting deposit</span>
                </div>
              </button>

              {/* Verified Real Investors */}
              <button
                type="button"
                onClick={() => setSelectedSegment('real_paid')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedSegment === 'real_paid'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800">
                    FUNDED
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-xs block">Paid Investors</span>
                  <span className="text-lg font-black font-mono text-emerald-700 block mt-0.5">
                    {realPaidInvestors.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Real capital funded</span>
                </div>
              </button>

              {/* All Accounts */}
              <button
                type="button"
                onClick={() => setSelectedSegment('all')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedSegment === 'all'
                    ? 'bg-slate-900 border-slate-900 text-white ring-2 ring-slate-900/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    selectedSegment === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    DATABASE
                  </span>
                  <Users className={`w-4 h-4 ${selectedSegment === 'all' ? 'text-amber-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <span className="font-bold text-xs block">All Accounts</span>
                  <span className={`text-lg font-black font-mono block mt-0.5 ${
                    selectedSegment === 'all' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {users.length}
                  </span>
                  <span className={`text-[10px] ${selectedSegment === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Entire platform roster
                  </span>
                </div>
              </button>

              {/* Marketing Canvassers */}
              <button
                type="button"
                onClick={() => setSelectedSegment('marketing')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedSegment === 'marketing'
                    ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-800">
                    CANVASSERS
                  </span>
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <span className="font-bold text-xs block">Marketers</span>
                  <span className="text-lg font-black font-mono text-purple-700 block mt-0.5">
                    {marketingCanvassers.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Sales downlines</span>
                </div>
              </button>
            </div>

            {/* Current Search/Filter Pill */}
            {filteredUsers && filteredUsers.length !== users.length && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedSegment('active_search')}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    selectedSegment === 'active_search'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  ⚡ Use Current Search Filter ({filteredUsers.length} records matching {currentFilterLabel || 'query'})
                </button>
              </div>
            )}
          </div>

          {/* Quick Segment Summary Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Selected Leads</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {activeExportUsers.length} Users
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">WhatsApp Ready</span>
                <span className="text-base font-black text-emerald-700 font-mono">
                  {validPhonesCount} Phones ({activeExportUsers.length > 0 ? Math.round((validPhonesCount / activeExportUsers.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Segment Inflow</span>
                <span className="text-base font-black text-amber-700 font-mono">
                  ₦{totalSegmentPaidInflow.toLocaleString()}
                </span>
              </div>
            </div>
            
            <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-mono px-2.5 py-1 rounded-lg">
              Segment: <strong className="uppercase text-slate-900">{selectedSegment.replace('_', ' ')}</strong>
            </span>
          </div>

          {/* Step 2: Choose Export Formats */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              2. Choose Export Format
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Option 1: Full CSV Spreadsheet */}
              <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-2xs hover:shadow-md">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Excel &amp; CSV Spreadsheet
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Full dataset with Names, Verified Phone, Direct WhatsApp links, Emails, Balances, and Referral codes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  id="btn_download_leads_csv"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV</span>
                </button>
              </div>

              {/* Option 2: WhatsApp Broadcast List */}
              <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-2xs hover:shadow-md">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    WhatsApp Broadcast Numbers
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Clean E.164 phone numbers (+234...) ready for WhatsApp Business Broadcasts or bulk SMS software.
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyNumbers}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs py-2.5 px-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      id="btn_copy_broadcast_numbers"
                    >
                      {copiedType === 'numbers' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ({validPhonesCount})</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadTxt}
                      title="Download as .txt text file"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs p-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delimiter toggle */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Format:</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        type="button"
                        onClick={() => setPhoneDelimiter('comma')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          phoneDelimiter === 'comma' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-500'
                        }`}
                      >
                        Comma
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() => setPhoneDelimiter('newline')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          phoneDelimiter === 'newline' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-500'
                        }`}
                      >
                        Newline
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 3: Phone Address Book vCard (.vcf) */}
              <div className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-2xs hover:shadow-md">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 flex items-center justify-center mb-3">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Phone Contacts (.vcf)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Import all leads directly into iPhone, Android, or WhatsApp contacts with 1 click.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadVCard}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  id="btn_download_vcard"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .VCF File</span>
                </button>
              </div>

            </div>
          </div>

          {/* Step 3: Live Preview Table (First 5 Records) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                3. Live Data Preview (Sample {Math.min(5, activeExportUsers.length)} of {activeExportUsers.length})
              </label>
              <span className="text-[11px] text-slate-400">
                UTF-8 encoded with full international phone compliance
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto max-h-56">
                <table className="w-full text-left text-xs font-sans text-slate-600">
                  <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Lead Name</th>
                      <th className="py-2 px-3">Phone (WhatsApp)</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Paid Top-Up</th>
                      <th className="py-2 px-3 text-center">Chat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeExportUsers.slice(0, 5).map(u => {
                      const enriched = userEnrichedMap.get(u.id);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-[140px]">
                            {u.name}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                            {enriched?.phoneValidation.isValid ? (
                              <span className="text-emerald-700 font-bold">
                                {enriched.phoneValidation.formatted}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">
                                {u.phone || 'No phone'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-500 truncate max-w-[150px]">
                            {u.email}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            {enriched?.classification === 'real_paid_investor' ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                                PAID INVESTOR
                              </span>
                            ) : enriched?.classification === 'unfunded_lead' ? (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                                UNFUNDED LEAD
                              </span>
                            ) : (
                              <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                                CANVASSER
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            ₦{(enriched?.totalPaidTopup || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            {enriched?.whatsAppLink ? (
                              <a
                                href={enriched.whatsAppLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                              >
                                <span>WA</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-slate-300 text-[10px]">&mdash;</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {activeExportUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400 italic">
                          No accounts found in this segment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready to export {activeExportUsers.length} leads</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
