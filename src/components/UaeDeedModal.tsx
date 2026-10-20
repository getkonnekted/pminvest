import React from 'react';
import { ShieldCheck, Download, Printer, X, Building, CheckCircle2, Award, Calendar, QrCode } from 'lucide-react';
import { UserInvestment } from '../types';

interface UaeDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: UserInvestment | null;
}

export const UaeDeedModal: React.FC<UaeDeedModalProps> = ({ isOpen, onClose, investment }) => {
  if (!isOpen || !investment) return null;

  const handlePrint = () => {
    window.print();
  };

  const propertyName = investment.propertyName || (
    investment.planName === 'Plan 1' ? 'Marina Bay Residences' :
    investment.planName === 'Plan 2' ? 'Creek Horizon Suites' :
    investment.planName === 'Plan 3' ? 'Downtown Sky Vista' :
    investment.planName === 'Plan 4' ? 'Sobha Sanctuary Estates' :
    investment.planName === 'Plan 5' ? 'Palm Azure Ocean Villa' :
    'Emirates Financial Tower'
  );

  const propertyLocation = investment.propertyLocation || (
    investment.planName === 'Plan 1' ? 'Dubai Marina, Dubai, UAE 🇦🇪' :
    investment.planName === 'Plan 2' ? 'Dubai Creek Harbour, Dubai, UAE 🇦🇪' :
    investment.planName === 'Plan 3' ? 'Downtown Burj Khalifa District, Dubai, UAE 🇦🇪' :
    investment.planName === 'Plan 4' ? 'Sobha Hartland / MBR City, Dubai, UAE 🇦🇪' :
    investment.planName === 'Plan 5' ? 'Palm Jumeirah, Dubai, UAE 🇦🇪' :
    'DIFC Financial Center, Dubai, UAE 🇦🇪'
  );

  const deedCode = investment.deedReferenceCode || `UAE-DLD-2026-${investment.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto text-slate-100 shadow-2xl relative font-sans">
        {/* Modal Controls Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              Official UAE Fractional Title Deed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Deed</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (High-fidelity Official Document Layout) */}
        <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 print:bg-white print:text-black">
          {/* Certificate Header with Gold Accents */}
          <div className="text-center space-y-2 border-b border-amber-500/20 pb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <Building className="w-6 h-6" />
            </div>
            <div className="text-[10px] tracking-widest uppercase font-mono text-amber-400/90 font-bold">
              UNITED ARAB EMIRATES · REAL ESTATE FRACTIONAL CO-OWNERSHIP
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide uppercase font-serif">
              Certificate of Allotment
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Treasure Homes Ltd &amp; Sovereign Escrow Property Trust
            </p>
          </div>

          {/* Deed Verification Metadata Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Deed Reference</span>
              <span className="font-bold text-amber-400 tracking-wider">{deedCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Issue Date</span>
              <span className="text-slate-300 font-semibold">{new Date(investment.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Tenure</span>
              <span className="text-emerald-400 font-bold">24-Week Guaranteed Dividend</span>
            </div>
          </div>

          {/* Core Co-Ownership Declaration */}
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed border-y border-slate-800 py-4">
            <p>
              This official Title Deed confirms that <strong className="text-white uppercase tracking-wider">{investment.userName}</strong> holds an authenticated fractional co-ownership stake in:
            </p>

            <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400 font-serif">{propertyName}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  {investment.planName}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-mono">
                <span>📍 {propertyLocation}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Allotted Capital</span>
                <span className="text-sm font-bold text-white">₦{investment.cost.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-emerald-400 block font-semibold">Friday Payout</span>
                <span className="text-sm font-bold text-emerald-400">₦{investment.weeklyPayout.toLocaleString()} / wk</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-amber-400 block font-semibold">Total 24w Return</span>
                <span className="text-sm font-bold text-amber-400">₦{investment.totalReturns.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 leading-normal">
              Profits are backed by physical asset appreciation, short-let hospitality, and corporate leasing across Dubai. Dividend disbursements are executed automatically every Friday directly to the holder's liquid platform wallet.
            </p>
          </div>

          {/* Signatures & Trust Seal */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0">
                <QrCode className="w-9 h-9 text-slate-900" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                <span className="text-white font-bold block">VERIFIED UAE ASSET</span>
                <span>Registry: Dubai Land &amp; Property Trust</span>
                <span className="text-emerald-400 block font-bold">● Active 24-Week Ledger</span>
              </div>
            </div>

            <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0 font-serif">
              <div className="text-amber-400 italic text-sm font-bold tracking-wider">Treasure Homes Ltd</div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Sovereign Property Trustee</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UaeDeedModal;
