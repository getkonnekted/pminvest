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
  initialInvestmentId?: string;
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
}

const LOCATIONS = [
  'Lekki Phase 1 Prime Terraces',
  'Epe Expressway Corridor Plot 4B',
  'Ibeju-Lekki Coastal Green Villa',
  'Guzape Hills Luxury Duplex Wing',
  'Victoria Island Commercial Office Suite',
  'Ikeja GRA Residential Development',
  'Maitama Diplomatic Zone Advance',
  'Alalubosa GRA Ibadan Waterfront'
];

export const LivePropertyTradingModal: React.FC<LivePropertyTradingModalProps> = ({
  isOpen,
  onClose,
  userInvestments,
  initialInvestmentId,
  onExplorePlans
}) => {
  const activeInvestments = userInvestments.filter(i => i.status === 'active');
  const [selectedInvId, setSelectedInvId] = useState<string>(
    initialInvestmentId || (activeInvestments[0]?.id ?? '')
  );
  const [activeCategory, setActiveCategory] = useState<'All' | 'Trading' | 'Rental Yields' | 'Flips' | 'Settlements'>('All');
  
  // Real-time market state (Crypto trading terminal style)
  const [indexPrice, setIndexPrice] = useState<number>(4860.50);
  const [priceChange24h, setPriceChange24h] = useState<number>(4.28);
  const [volume24h, setVolume24h] = useState<number>(184250000);
  const [candleData, setCandleData] = useState<number[]>([
    4780, 4805, 4790, 4820, 4810, 4835, 4825, 4850, 4840, 4860, 4855, 4868
  ]);

  const [trades, setTrades] = useState<SimulatedTrade[]>([
    {
      id: 'tr_101',
      time: 'Just now',
      pair: 'TH-LEKKI/NGN',
      category: 'Trading',
      type: 'BUY',
      amount: 450000,
      price: 4868.5,
      status: 'FILLED',
      location: 'Lekki Phase 1 Prime Terraces'
    },
    {
      id: 'tr_102',
      time: '12s ago',
      pair: 'TH-EPE/NGN',
      category: 'Flips',
      type: 'SELL',
      amount: 1250000,
      price: 4865.0,
      status: 'FILLED',
      location: 'Epe Expressway Corridor Plot 4B'
    },
    {
      id: 'tr_103',
      time: '28s ago',
      pair: 'TH-IBEJU/NGN',
      category: 'Rental Yields',
      type: 'YIELD',
      amount: 85000,
      price: 4862.0,
      status: 'SETTLED',
      location: 'Ibeju-Lekki Coastal Green Villa'
    },
    {
      id: 'tr_104',
      time: '45s ago',
      pair: 'TH-GUZAPE/NGN',
      category: 'Settlements',
      type: 'BUY',
      amount: 720000,
      price: 4859.0,
      status: 'CLEARED',
      location: 'Guzape Hills Luxury Duplex Wing'
    }
  ]);

  const selectedInvestment = activeInvestments.find(i => i.id === selectedInvId) || activeInvestments[0];

  // Accrued yield micro-counter
  const [accruedMicroYield, setAccruedMicroYield] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    if (initialInvestmentId && activeInvestments.some(i => i.id === initialInvestmentId)) {
      setSelectedInvId(initialInvestmentId);
    } else if (activeInvestments.length > 0 && !selectedInvId) {
      setSelectedInvId(activeInvestments[0].id);
    }
  }, [isOpen, initialInvestmentId, activeInvestments]);

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
        pair: `TH-${loc.split(' ')[0].toUpperCase()}/NGN`,
        category: cat,
        type: tradeType,
        amount,
        price: +(indexPrice + (Math.random() - 0.5) * 3).toFixed(2),
        status: tradeType === 'YIELD' ? 'SETTLED' : 'FILLED',
        location: loc
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen, indexPrice]);

  // Live Micro-ticker for weekly payout accumulation
  useEffect(() => {
    if (!isOpen || !selectedInvestment) return;
    const weeklyTarget = selectedInvestment.weeklyPayout || 6500;
    // Micro-accrual: simulate current progress in the weekly cycle (e.g., 42% through)
    const baseProgress = weeklyTarget * 0.435;
    setAccruedMicroYield(baseProgress);

    const ticker = setInterval(() => {
      setAccruedMicroYield(prev => prev + 0.15);
    }, 150);

    return () => clearInterval(ticker);
  }, [isOpen, selectedInvestment]);

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
                  Treasure Homes Real-Time Property Trading Simulator
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE EXECUTION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Institutional real estate liquidity engine • Asset flips, rental cashflows & automated Friday yield settlements
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
              <span className="text-slate-400 font-bold">TH-INDEX/NGN</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                ₦{indexPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-emerald-400 text-[10px] flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +{priceChange24h}%
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-slate-400 text-[11px]">
              <div>24h High: <span className="text-white">₦4,892.00</span></div>
              <div>24h Low: <span className="text-white">₦4,755.20</span></div>
              <div>24h Vol: <span className="text-amber-400">₦{(volume24h / 1000000).toFixed(1)}M</span></div>
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
              The Real-Time Property Trading Simulator streams live operations for active investor capital. Acquire any 28-week property plan to unlock real-time allocation, plot flips, and rental yield tracking.
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
            
            {/* Active Plan Selector & Allocation Card */}
            {selectedInvestment && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Plan Details & Capital Deployed */}
                <div className="bg-[#0E1526] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                        Active Monitored Plan
                      </span>
                      {activeInvestments.length > 1 && (
                        <select
                          value={selectedInvId}
                          onChange={(e) => setSelectedInvId(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5 text-[10px] focus:outline-none"
                        >
                          {activeInvestments.map(inv => (
                            <option key={inv.id} value={inv.id}>{inv.planName} (₦{inv.cost.toLocaleString()})</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-white">{selectedInvestment.planName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Cycle Progress: Week {selectedInvestment.weeksPaid} of {selectedInvestment.totalWeeks || 28}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Capital Deployed:</span>
                      <span className="text-sm font-extrabold text-white font-mono">₦{selectedInvestment.cost.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 block font-bold">Friday Payout:</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">₦{selectedInvestment.weeklyPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Live Micro-Yield Accrual Ticker */}
                <div className="bg-[#0E1526] border border-emerald-500/20 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" /> Live Yield Ticker
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Weekly Target: ₦{selectedInvestment.weeklyPayout.toLocaleString()}</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-400 mt-1 tabular-nums">
                      ₦{accruedMicroYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Continuous rental remissions & plot trading arbitrage accruing into your Friday 12:00 PM settlement wallet credit.
                    </p>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (accruedMicroYield / (selectedInvestment.weeklyPayout || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>Mon 00:00</span>
                      <span>Fri 12:00 PM Settlement</span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Asset Allocation */}
                <div className="bg-[#0E1526] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-2">
                      Asset Backing Allocation
                    </span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-300">Residential Rental Cashflow</span>
                          <span className="font-mono text-emerald-400 font-bold">45%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[45%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-300">Commercial Plot Arbitrage</span>
                          <span className="font-mono text-amber-400 font-bold">35%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-amber-400 h-full w-[35%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-slate-300">Off-Plan Finishing Advances</span>
                          <span className="font-mono text-sky-400 font-bold">20%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                          <div className="bg-sky-400 h-full w-[20%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center gap-1.5 mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Underwritten by Treasure Homes Asset Trustees</span>
                  </div>
                </div>

              </div>
            )}

            {/* Simulated Price Sparkline / Mini Depth Chart */}
            <div className="bg-[#0B101D] border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Real Estate Liquidity Index Action (TH-INDEX)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  ● Real-Time Feed Active
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
                      <th className="py-2 px-3">Asset / Location</th>
                      <th className="py-2 px-3 text-right">₦ Amount</th>
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
                          {t.location}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-white">
                          ₦{t.amount.toLocaleString()}
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
                <strong className="text-slate-200">Treasure Homes Asset Management Policy:</strong> Your capital is deployed by accredited real estate asset managers into audited developments. Returns are fixed at 21.67% weekly and paid directly into your withdrawable wallet every Friday.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default LivePropertyTradingModal;
