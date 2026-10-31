import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Building2, 
  Landmark, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Printer, 
  ExternalLink, 
  Scale, 
  MapPin, 
  BadgeCheck 
} from 'lucide-react';
import { INVESTMENT_PLANS } from '../types';

interface DIFCTrustRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty?: (planId: string) => void;
}

export const DIFCTrustRegistryModal: React.FC<DIFCTrustRegistryModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty
}) => {
  const [activeTab, setActiveTab] = useState<'charter' | 'dossier' | 'escrow'>('charter');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#0B0C10] border border-[#B8964E]/40 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="difc_registry_title"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#B8964E]/25 bg-gradient-to-r from-[#12141D] via-[#0E1017] to-[#12141D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B8964E]/15 border border-[#B8964E]/40 flex items-center justify-center text-[#D4AF37]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8964E] font-bold">
                  Sovereign Legal Trust Framework
                </span>
                <span className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[9px] font-mono px-1.5 py-0.5 rounded-sm uppercase font-bold">
                  Active
                </span>
              </div>
              <h2 id="difc_registry_title" className="text-base sm:text-lg font-bold text-[#FAF8F5] tracking-tight">
                DIFC SPV Legal Trust &amp; DLD Deed Registry
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B8964E]/30 bg-[#161822] hover:bg-[#1C2030] text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              title="Print official SPV trust summary"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Print Charter</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#B8964E]/20 bg-[#0E1017] px-6 gap-2">
          <button
            onClick={() => setActiveTab('charter')}
            className={`py-3 px-3 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all cursor-pointer ${
              activeTab === 'charter'
                ? 'border-[#D4AF37] text-[#FAF8F5]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. DIFC SPV Trust Charter
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 px-3 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all cursor-pointer ${
              activeTab === 'dossier'
                ? 'border-[#D4AF37] text-[#FAF8F5]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. DLD Asset Deeds (6 Properties)
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`py-3 px-3 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all cursor-pointer ${
              activeTab === 'escrow'
                ? 'border-[#D4AF37] text-[#FAF8F5]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Escrow &amp; Friday Settlement
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300 leading-relaxed font-sans">
          {activeTab === 'charter' && (
            <div className="space-y-6">
              {/* Trust Overview */}
              <div className="bg-[#13151F] border border-[#B8964E]/25 rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B8964E]/15 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#B8964E] font-bold">Entity Verification</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Treasure Homes Prime SPV Limited</h3>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-400">
                    <div>Registration: <span className="text-[#D4AF37] font-bold">DIFC-SPV-4982</span></div>
                    <div>Jurisdiction: <span className="text-slate-200 font-bold">DIFC Common Law</span></div>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  Established under the <strong>Dubai International Financial Centre (DIFC) Special Purpose Vehicle Regulations (DIFC Law No. 4 of 2019)</strong>. All co-investors hold beneficial co-ownership units ring-fenced from operational commercial risk, with legal enforcement governed by the independent English-language <strong>DIFC Courts</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                  <div className="bg-[#0B0C10] border border-white/5 p-3 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Asset Isolation</span>
                    <p className="font-semibold text-[#FAF8F5] mt-1">Bankruptcy-Remote</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Assets cannot be attached by outside corporate claims.</p>
                  </div>
                  <div className="bg-[#0B0C10] border border-white/5 p-3 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Judicial Jurisdiction</span>
                    <p className="font-semibold text-[#FAF8F5] mt-1">DIFC Courts Precedent</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Common Law contract enforcement and fiduciary protection.</p>
                  </div>
                  <div className="bg-[#0B0C10] border border-white/5 p-3 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Land Registrar</span>
                    <p className="font-semibold text-emerald-400 mt-1">DLD Freehold Title</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Directly recorded with Dubai Land Department.</p>
                  </div>
                </div>
              </div>

              {/* Legal Clauses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#13151F] border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Scale className="w-4 h-4 text-[#D4AF37]" />
                    <span>Clause 4.1: Beneficial Title Allocation</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Every capital contribution allocates pro-rata fractional ownership shares directly in the underlying real estate deed. Capital is never converted to speculative tokens or pooled into non-property derivatives.
                  </p>
                </div>

                <div className="bg-[#13151F] border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Clause 7.2: Friday Disbursement Guarantee</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Rental yields collected from authenticated tenants are held in dedicated escrow clearing accounts and disbursed automatically every Friday at 12:00 PM West Africa Time to registered Nigerian bank accounts or wallets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dossier' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                <span>Verified Dubai Land Department (DLD) Freehold Assets:</span>
                <span className="font-mono text-[#D4AF37]">6 Active Property Dossiers</span>
              </div>

              <div className="space-y-3">
                {INVESTMENT_PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className="bg-[#13151F] border border-white/10 hover:border-[#B8964E]/40 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                        <img 
                          src={plan.propertyImage || '/properties/marina_bay_residences.jpg'} 
                          alt={plan.propertyName || plan.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{plan.propertyName || plan.name}</h4>
                          <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[9px] font-mono px-1.5 py-0.2 rounded-sm uppercase">
                            DLD Title
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>Cadastral: {plan.cadastralId || 'DLD-CAD-100'}</span>
                          <span>·</span>
                          <span>Makani: {plan.makaniNumber || '12845 76291'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {plan.propertyAddress || plan.propertyLocation}
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-white/10 sm:pl-4 flex sm:flex-col justify-between items-end gap-1">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">Weekly Friday Payout</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">₦{plan.weeklyPayout.toLocaleString()} / wk</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#D4AF37]">24w Total: ₦{plan.totalReturns.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div className="space-y-4">
              <div className="bg-[#13151F] border border-[#B8964E]/25 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Central Bank &amp; Commercial Escrow Settlement Protocol</span>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  All investor disbursements operate through direct banking integration via NIBSS (Nigeria Inter-Bank Settlement System) clearing and licensed payment switches. Funds never traverse unvetted intermediary wallets.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-[#0B0C10] border border-white/5 p-3.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Settlement Frequency</span>
                    <p className="font-bold text-white text-sm">Every Friday at 12:00 PM WAT</p>
                    <p className="text-[11px] text-slate-400">Direct wallet crediting and 100% same-day bank withdrawal clearance.</p>
                  </div>
                  <div className="bg-[#0B0C10] border border-white/5 p-3.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Contractual Tenure</span>
                    <p className="font-bold text-white text-sm">24-Week Fixed Property Cycle</p>
                    <p className="text-[11px] text-slate-400">Full capital return and optional 3% rollover increment upon cycle completion.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#B8964E]/20 bg-[#0E1017] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Treasure Homes Ltd · UAE &amp; Nigeria Corporate Trust Registrations</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-[#B8964E] to-[#9C7B38] hover:from-[#C7A55C] hover:to-[#B8964E] text-[#0B0C10] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
