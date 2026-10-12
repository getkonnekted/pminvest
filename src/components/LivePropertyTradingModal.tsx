import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  TrendingUp, 
  Activity, 
  Building2, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  DollarSign, 
  Layers, 
  Sparkles,
  Zap
} from 'lucide-react';
import { UserInvestment } from '../types';

interface LivePropertyTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInvestments: UserInvestment[];
  onExplorePlans?: () => void;
}

interface SimulatedTrade {
  id: string;
  time: string;
  pair: string;
  category: 'Trading' | 'Rental Yields' | 'Flips' | 'Settlements';
  type: 'BUY' | 'SELL' | 'YIELD';
  amount: number;
  price: number;
  status: 'FILLED' | 'CLEARED' | 'SETTLED';
  location: string;
  market: string;
  currency: 'NGN' | 'ZAR' | 'KES' | 'GHS' | 'MAD' | 'EGP' | 'AED' | 'RWF';
  currencySymbol: string;
}

const LOCATIONS = [
  { market: 'Nigeria', location: 'Victoria Island Luxury Residences, Lagos', pair: 'TH-LAGOS/NGN', currency: 'NGN' as const, currencySymbol: '₦' },
  { market: 'Nigeria', location: 'Maitama Prime Residential, Abuja', pair: 'TH-ABUJA/NGN', currency: 'NGN' as const, currencySymbol: '₦' },
  { market: 'South Africa', location: 'Sandton Premium Apartments, Johannesburg', pair: 'TH-JOHANNESBURG/ZAR', currency: 'ZAR' as const, currencySymbol: 'R' },
  { market: 'South Africa', location: 'Atlantic Seaboard Luxury Villa, Cape Town', pair: 'TH-CAPETOWN/ZAR', currency: 'ZAR' as const, currencySymbol: 'R' },
  { market: 'Kenya', location: 'Westlands Premium Residence, Nairobi', pair: 'TH-NAIROBI/KES', currency: 'KES' as const, currencySymbol: 'KSh ' },
  { market: 'Ghana', location: 'Airport Residential Luxury Suites, Accra', pair: 'TH-ACCRA/GHS', currency: 'GHS' as const, currencySymbol: 'GH₵' },
  { market: 'Morocco', location: 'Anfa Place Luxury Residence, Casablanca', pair: 'TH-CASABLANCA/MAD', currency: 'MAD' as const, currencySymbol: 'MAD ' },
  { market: 'Egypt', location: 'New Cairo Premium Development, Cairo', pair: 'TH-CAIRO/EGP', currency: 'EGP' as const, currencySymbol: 'E£' },
  { market: 'United Arab Emirates', location: 'Dubai Marina Waterfront Residence, Dubai', pair: 'TH-DUBAI/AED', currency: 'AED' as const, currencySymbol: 'AED ' },
  { market: 'United Arab Emirates', location: 'Downtown Dubai Luxury Apartment, Dubai', pair: 'TH-DOWNTOWN/AED', currency: 'AED' as const, currencySymbol: 'AED ' },
  { market: 'United Arab Emirates', location: 'Saadiyat Island Premium Villa, Abu Dhabi', pair: 'TH-ABUDHABI/AED', currency: 'AED' as const, currencySymbol: 'AED ' },
  { market: 'Rwanda', location: 'Kigali Heights Premium Residence, Kigali', pair: 'TH-KIGALI/RWF', currency: 'RWF' as const, currencySymbol: 'RF ' }
];

export const LivePropertyTradingModal: React.FC<LivePropertyTradingModalProps> = ({
  isOpen,
  onClose,
  userInvestments,
  onExplorePlans
}) => {
  const activeInvestments = userInvestments;
  const [activeCategory, setActiveCategory] = useState<'All' | 'Trading' | 'Rental Yields' | 'Flips' | 'Settlements'>('All');
  
  // Real-time market state (Crypto trading terminal style)
  const [indexPrice, setIndexPrice] = useState<number>(4860.50);
  const [priceChange24h, setPriceChange24h] = useState<number>(4.28);
  const [volume24h, setVolume24h] = useState<number>(184250000);
  const [candleData, setCandleData] = useState<number[]>([
    4780, 4805, 4790, 4820, 4810, 4835, 4825, 4850, 4840, 4860, 4855, 4868
  ]);

  const [trades, setTrades] = useState<SimulatedTrade[]>([
    { id: 'tr_101', time: 'Just now', pair: 'TH-LAGOS/NGN', category: 'Trading', type: 'BUY', amount: 45000000, price: 4868.5, status: 'FILLED', location: 'Victoria Island Luxury Residences, Lagos', market: 'Nigeria', currency: 'NGN', currencySymbol: '₦' },
    { id: 'tr_102', time: '12s ago', pair: 'TH-DUBAI/AED', category: 'Flips', type: 'SELL', amount: 2850000, price: 4865.0, status: 'FILLED', location: 'Dubai Marina Waterfront Residence, Dubai', market: 'United Arab Emirates', currency: 'AED', currencySymbol: 'AED ' },
    { id: 'tr_103', time: '28s ago', pair: 'TH-CAPETOWN/ZAR', category: 'Rental Yields', type: 'YIELD', amount: 1850000, price: 4862.0, status: 'SETTLED', location: 'Atlantic Seaboard Luxury Villa, Cape Town', market: 'South Africa', currency: 'ZAR', currencySymbol: 'R' },
    { id: 'tr_104', time: '45s ago', pair: 'TH-NAIROBI/KES', category: 'Settlements', type: 'BUY', amount: 18500000, price: 4859.0, status: 'CLEARED', location: 'Westlands Premium Residence, Nairobi', market: 'Kenya', currency: 'KES', currencySymbol: 'KSh ' }
  ]);

  // Real-time market tick generator & continuous streaming trades
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // 1. Tick the index price slightly
      const delta = (Math.random() - 0.48) * 4.5;
      setIndexPrice(prev => {
        const next = Math.max(4500, +(prev + delta).toFixed(2));
        setCandleData(c => [...c.slice(1), next]);
        return next;
      });
      setVolume24h(prev => prev + Math.floor(Math.random() * 85000));

      // 2. Continuous incoming trades (without pause/resume)
      const categories: ('Trading' | 'Rental Yields' | 'Flips' | 'Settlements')[] = [
        'Trading', 'Rental Yields', 'Flips', 'Settlements'
      ];
      const types: ('BUY' | 'SELL' | 'YIELD')[] = ['BUY', 'SELL', 'YIELD'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const tradeType = cat === 'Rental Yields' ? 'YIELD' : types[Math.floor(Math.random() * types.length)];
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const amount = Math.floor(40000 + Math.random() * 850000);
      const nowStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newTrade: SimulatedTrade = {
        id: 'tr_' + Date.now().toString().slice(-6),
        time: nowStr,
        pair: loc.pair,
        category: cat,
        type: tradeType,
        amount,
        price: +(indexPrice + (Math.random() - 0.5) * 3).toFixed(2),
        status: tradeType === 'YIELD' ? 'SETTLED' : 'FILLED',
        location: loc.location,
        market: loc.market,
        currency: loc.currency,
        currencySymbol: loc.currencySymbol
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen, indexPrice]);


  if (!isOpen) return null;

  const filteredTrades = activeCategory === 'All' 
    ? trades 
    : trades.filter(t => t.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#090D16] border border-slate-800 text-slate-100 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Terminal Header */}
        <div className="bg-[#0D1322] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
                  Trading Simulation
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Cross-border property simulation across high-value African markets and the United Arab Emirates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Ticker Bar (Crypto Trading Style) */}
        <div className="bg-[#060911] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">TH-INDEX · GLOBAL</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                {indexPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} pts
              </span>
              <span className="text-emerald-400 text-[10px] flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +{priceChange24h}%
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-slate-400 text-[11px]">
              <div>24h High: <span className="text-white">4,892.00 pts</span></div>
              <div>24h Low: <span className="text-white">4,755.20 pts</span></div>
              <div>Simulated Volume: <span className="text-amber-400">{(volume24h / 1000000).toFixed(1)}M units</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Next Friday Settlement:</span>
            <span className="text-amber-400 font-bold text-xs">Friday 12:00 PM</span>
          </div>
        </div>

        {/* Main Body */}
        {activeInvestments.length === 0 ? (
          /* Empty state: User has no active plans */
          <div className="p-8 sm:p-12 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">No Active Property Plan Monitored</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
              Purchase any investment plan to unlock this illustrative property market simulation. The activity shown here is simulated and does not represent live executed trades.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onExplorePlans) onExplorePlans();
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Explore 28-Week Property Plans (From ₦30k) →
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Simulated Price Sparkline / Mini Depth Chart */}
            <div className="bg-[#0B101D] border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Real Estate Liquidity Index Action (TH-INDEX)
                </span>

              </div>

              {/* Visual SVG Price Line */}
              <div className="h-16 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Area */}
                  <polygon
                    fill="url(#gradientLine)"
                    points={`0,60 ${candleData.map((val, idx) => `${(idx / (candleData.length - 1)) * 400},${60 - ((val - 4750) / 150) * 50}`).join(' ')} 400,60`}
                  />
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points={candleData.map((val, idx) => `${(idx / (candleData.length - 1)) * 400},${60 - ((val - 4750) / 150) * 50}`).join(' ')}
                  />
                </svg>
              </div>
            </div>

            {/* Trading Terminal Stream with Categories (Including 'Trading') */}
            <div className="bg-[#0B101D] border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-[#0D1322] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {(['All', 'Trading', 'Rental Yields', 'Flips', 'Settlements'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  Streaming Operations Log
                </div>
              </div>

              {/* Terminal Order/Execution Log Table */}
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#080D18] text-slate-500 uppercase text-[9px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Action</th>
                      <th className="py-2 px-3">Asset / Location · Market</th>
                      <th className="py-2 px-3 text-right">Amount · Local Currency</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-300">
                    {filteredTrades.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2 px-3 text-slate-500 text-[10px] whitespace-nowrap">{t.time}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            t.category === 'Trading' 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : t.category === 'Rental Yields'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : t.category === 'Flips'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}>
                            {t.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold">
                          {t.type === 'BUY' ? (
                            <span className="text-emerald-400">BUY</span>
                          ) : t.type === 'SELL' ? (
                            <span className="text-rose-400">SELL</span>
                          ) : (
                            <span className="text-amber-400">YIELD</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-sans text-xs text-slate-200 truncate max-w-[220px]">
                          <span>{t.location}</span>
                          <span className="block text-[9px] text-slate-500">{t.market} · {t.pair}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-white">
                          {t.currencySymbol}{t.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="text-emerald-400 text-[10px] font-bold">
                            ✓ {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Disclaimer & Transparency Footer */}
            <div className="bg-[#080C16] border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong className="text-slate-200">Simulation notice:</strong> Prices, categories and order entries shown here are illustrative simulated activity, not a live market feed or proof of executed trades.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default LivePropertyTradingModal;
