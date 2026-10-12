import React, { useState } from 'react';
import { X, TrendingUp, Activity, Building2, ArrowUpRight, MapPin, Landmark, Clock3, Globe2 } from 'lucide-react';
import { UserInvestment } from '../types';

interface LivePropertyTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInvestments: UserInvestment[];
  onExplorePlans?: () => void;
}

const MARKETS = [
  { country: 'Nigeria', cities: 'Lagos · Abuja', focus: 'Prime residential · Commercial', code: 'NG', accent: 'from-emerald-500/20 to-emerald-900/5' },
  { country: 'United Arab Emirates', cities: 'Dubai · Abu Dhabi', focus: 'Premium residential · Waterfront', code: 'AE', accent: 'from-amber-500/20 to-amber-900/5' },
  { country: 'South Africa', cities: 'Johannesburg · Cape Town', focus: 'Luxury residential · Mixed-use', code: 'ZA', accent: 'from-sky-500/20 to-sky-900/5' },
  { country: 'Kenya', cities: 'Nairobi', focus: 'Prime residential · Commercial', code: 'KE', accent: 'from-violet-500/20 to-violet-900/5' },
  { country: 'Ghana', cities: 'Accra', focus: 'Premium residential · Mixed-use', code: 'GH', accent: 'from-rose-500/20 to-rose-900/5' },
  { country: 'Morocco', cities: 'Casablanca', focus: 'Urban residential · Commercial', code: 'MA', accent: 'from-orange-500/20 to-orange-900/5' },
  { country: 'Egypt', cities: 'Cairo', focus: 'Residential developments · Commercial', code: 'EG', accent: 'from-teal-500/20 to-teal-900/5' },
  { country: 'Rwanda', cities: 'Kigali', focus: 'Prime residential · Commercial', code: 'RW', accent: 'from-indigo-500/20 to-indigo-900/5' }
];

const INDEX_HISTORY = [4780, 4805, 4790, 4820, 4810, 4835, 4825, 4850, 4840, 4860, 4855, 4868];

export const LivePropertyTradingModal: React.FC<LivePropertyTradingModalProps> = ({
  isOpen,
  onClose,
  userInvestments,
  onExplorePlans
}) => {
  const [activeMarket, setActiveMarket] = useState('All markets');

  if (!isOpen) return null;

  const hasPlan = userInvestments.length > 0;
  const points = INDEX_HISTORY.map((value, index) => `${(index / (INDEX_HISTORY.length - 1)) * 400},${60 - ((value - 4750) / 150) * 50}`).join(' ');
  const visibleMarkets = activeMarket === 'All markets' ? MARKETS : MARKETS.filter(market => market.country === activeMarket);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 backdrop-blur-sm sm:p-4">
      <section className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#090D16] font-sans text-slate-100 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 bg-[#0D1322] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400">
              <Globe2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">Global Property Markets</h2>
              <p className="mt-1 text-[11px] text-slate-400">Company-managed market overview · Africa and the UAE</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close property markets" className="ml-3 rounded-xl bg-slate-800/70 p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>

        {!hasPlan ? (
          <div className="my-auto p-8 text-center sm:p-12">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-amber-400" />
            <h3 className="mb-2 text-lg font-bold text-white">Your property overview is not unlocked yet</h3>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-400">Purchase a property plan to access the company-managed market overview.</p>
            <button onClick={() => { onClose(); onExplorePlans?.(); }} className="rounded-xl bg-amber-500 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-950 transition hover:bg-amber-400">Explore property plans</button>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-3 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-[#0B101D] p-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Activity className="h-3.5 w-3.5 text-emerald-400" /> Global liquidity index</div>
                <div className="flex items-end gap-2"><strong className="text-2xl font-extrabold text-white">4,864.69</strong><span className="pb-1 text-xs text-slate-400">pts</span></div>
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-400"><ArrowUpRight className="h-3.5 w-3.5" /> +4.28%</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#0B101D] p-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Clock3 className="h-3.5 w-3.5 text-amber-400" /> Scheduled payout window</div>
                <strong className="text-xl font-extrabold text-white">Friday · 12:00 PM</strong>
                <p className="mt-1 text-xs text-slate-500">Investor plan payouts follow each plan’s recorded schedule.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#0B101D] p-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Landmark className="h-3.5 w-3.5 text-sky-400" /> Market coverage</div>
                <strong className="text-xl font-extrabold text-white">8 markets</strong>
                <p className="mt-1 text-xs text-slate-500">Property sectors across Africa and the UAE.</p>
              </div>
            </div>

            <section className="rounded-xl border border-slate-800 bg-[#0B101D] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Global index overview</h3>
                  <p className="mt-1 text-[10px] text-slate-500">TH-INDEX · GLOBAL</p>
                </div>
                <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] text-slate-400">Illustrative index figures</span>
              </div>
              <div className="h-24 w-full">
                <svg className="h-full w-full" viewBox="0 0 400 60" preserveAspectRatio="none" role="img" aria-label="Illustrative global property index trend">
                  <defs><linearGradient id="globalIndexFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.28" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
                  <polygon fill="url(#globalIndexFill)" points={`0,60 ${points} 400,60`} />
                  <polyline fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" points={points} />
                </svg>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Index values are illustrative display figures. Confirmed market performance and company transactions should be sourced from verified company records.</p>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#0B101D]">
              <div className="flex flex-col gap-3 border-b border-slate-800 bg-[#0D1322] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Markets monitored</h3>
                  <p className="mt-1 text-[10px] text-slate-500">The company manages any acquisitions and sales; investors view this overview only.</p>
                </div>
                <select value={activeMarket} onChange={event => setActiveMarket(event.target.value)} aria-label="Filter property markets" className="rounded-lg border border-slate-700 bg-[#080D18] px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500">
                  <option>All markets</option>
                  {MARKETS.map(market => <option key={market.code} value={market.country}>{market.country}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleMarkets.map(market => (
                  <article key={market.code} className={`rounded-xl border border-slate-800 bg-gradient-to-br ${market.accent} p-4`}>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-950/40 text-[10px] font-extrabold tracking-wider text-white">{market.code}</span><h4 className="text-xs font-bold text-white">{market.country}</h4></div>
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-300">{market.cities}</p>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{market.focus}</p>
                  </article>
                ))}
              </div>
            </section>
            <div className="rounded-xl border border-slate-800 bg-[#080C16] px-4 py-3 text-[11px] leading-relaxed text-slate-400">
              This dashboard is an investor-facing overview. It does not provide investor trade execution. Market figures are illustrative; company transactions should only appear here when verified company records are connected.
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default LivePropertyTradingModal;
