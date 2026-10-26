import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Maximize2, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Clock,
  Building2
} from 'lucide-react';
import { UaeFlag } from './UaeFlag';

export interface SimulatedOrder {
  id: string;
  time: string;
  pair: string;
  location: string;
  type: 'BUY ORDER' | 'RENTAL YIELD' | 'COLLATERAL SETTLED';
  side: 'BUY' | 'YIELD' | 'SETTLE';
  amount: number;
  yieldRate: string;
  status: 'FILLED' | 'SETTLED' | 'DISTRIBUTED';
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isBull: boolean;
}

export interface LiveTradingSimulationCardProps {
  onExpandTerminal?: () => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export const UAE_PROPERTY_LOCATIONS = [
  { name: 'Marina Bay Residences', code: 'DXB-MB', district: 'Dubai Marina', baseYield: '15.2%' },
  { name: 'Creek Horizon Suites', code: 'DXB-CH', district: 'Dubai Creek Harbour', baseYield: '14.8%' },
  { name: 'Downtown Sky Vista', code: 'DXB-DT', district: 'Burj Khalifa District', baseYield: '16.5%' },
  { name: 'Sobha Sanctuary Estates', code: 'DXB-SB', district: 'Sobha Hartland / MBR City', baseYield: '17.4%' },
  { name: 'Palm Azure Ocean Villa', code: 'DXB-PJ', district: 'Palm Jumeirah', baseYield: '18.2%' },
  { name: 'Emirates Financial Tower', code: 'DXB-DIFC', district: 'DIFC Financial Center', baseYield: '15.9%' }
];

export const LiveTradingSimulationCard: React.FC<LiveTradingSimulationCardProps> = ({
  onExpandTerminal,
  className = '',
  variant = 'full'
}) => {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1D'>('5m');
  const [currentPrice, setCurrentPrice] = useState<number>(148650.0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(4.82);
  const [high24h, setHigh24h] = useState<number>(152100);
  const [low24h, setLow24h] = useState<number>(141800);
  const [volume24h, setVolume24h] = useState<number>(3842190000); // ₦3.84B
  const [activeTab, setActiveTab] = useState<'chart' | 'orders'>('chart');
  const [buyRatio, setBuyRatio] = useState<number>(68);

  // Candlestick historical dataset (14 periods)
  const [candles, setCandles] = useState<Candle[]>(() => {
    const list: Candle[] = [];
    let prevClose = 144200;
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const isBull = (i % 3 !== 0);
      const delta = (Math.sin(i * 1.5) * 600) + (isBull ? 850 : -450);
      const open = Math.round(prevClose);
      const close = Math.round(open + delta);
      const high = Math.round(Math.max(open, close) + Math.random() * 450 + 100);
      const low = Math.round(Math.min(open, close) - Math.random() * 400 - 80);
      const volume = Math.round(18000000 + Math.random() * 32000000);
      
      const t = new Date(now - i * 5 * 60 * 1000);
      const timeStr = t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      list.push({
        time: timeStr,
        open,
        high,
        low,
        close,
        volume,
        isBull: close >= open
      });
      prevClose = close;
    }
    return list;
  });

  // Recent simulated order executions stream (UAE Exclusive)
  const [orders, setOrders] = useState<SimulatedOrder[]>([
    {
      id: 'ORD-9841',
      time: '12:14:02',
      pair: 'UAE-REIT / DXB-MB',
      location: 'Marina Bay Residences (Dubai Marina)',
      type: 'RENTAL YIELD',
      side: 'YIELD',
      amount: 45000000,
      yieldRate: '+15.2% p.a.',
      status: 'DISTRIBUTED'
    },
    {
      id: 'ORD-9840',
      time: '12:13:41',
      pair: 'UAE-REIT / DXB-DT',
      location: 'Downtown Sky Vista (Burj Khalifa Dist.)',
      type: 'BUY ORDER',
      side: 'BUY',
      amount: 85000000,
      yieldRate: '+16.5% p.a.',
      status: 'FILLED'
    },
    {
      id: 'ORD-9839',
      time: '12:13:10',
      pair: 'UAE-REIT / DXB-CH',
      location: 'Creek Horizon Suites (Dubai Creek)',
      type: 'COLLATERAL SETTLED',
      side: 'SETTLE',
      amount: 32000000,
      yieldRate: '+14.8% p.a.',
      status: 'SETTLED'
    },
    {
      id: 'ORD-9838',
      time: '12:12:35',
      pair: 'UAE-REIT / DXB-PJ',
      location: 'Palm Azure Ocean Villa (Palm Jumeirah)',
      type: 'BUY ORDER',
      side: 'BUY',
      amount: 140000000,
      yieldRate: '+18.2% p.a.',
      status: 'FILLED'
    }
  ]);

  // Live price & candle micro-ticks
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const priceDelta = (Math.random() - 0.46) * 120; // slight bullish bias
      setCurrentPrice(prev => {
        const next = Math.max(138000, Math.round((prev + priceDelta) * 100) / 100);
        
        // Update current active candle (the last one)
        setCandles(prevCandles => {
          if (prevCandles.length === 0) return prevCandles;
          const copy = [...prevCandles];
          const lastIndex = copy.length - 1;
          const lastCandle = { ...copy[lastIndex] };
          
          lastCandle.close = next;
          lastCandle.high = Math.max(lastCandle.high, next);
          lastCandle.low = Math.min(lastCandle.low, next);
          lastCandle.isBull = lastCandle.close >= lastCandle.open;
          copy[lastIndex] = lastCandle;
          return copy;
        });

        // 24h high/low bounds check
        setHigh24h(h => Math.max(h, Math.round(next)));
        setLow24h(l => Math.min(l, Math.round(next)));
        return next;
      });

      // Micro volume growth
      setVolume24h(v => v + Math.floor(Math.random() * 180000));
      
      // Dynamic buy ratio fluctuation (between 62% and 78%)
      setBuyRatio(r => {
        const delta = (Math.random() - 0.5) * 2;
        return Math.min(78, Math.max(62, +(r + delta).toFixed(1)));
      });
    }, 1500);

    return () => clearInterval(tickInterval);
  }, []);

  // Periodic simulated order generator (UAE Exclusive)
  useEffect(() => {
    const orderInterval = setInterval(() => {
      const loc = UAE_PROPERTY_LOCATIONS[Math.floor(Math.random() * UAE_PROPERTY_LOCATIONS.length)];
      const types: ('BUY ORDER' | 'RENTAL YIELD' | 'COLLATERAL SETTLED')[] = [
        'BUY ORDER', 'BUY ORDER', 'RENTAL YIELD', 'COLLATERAL SETTLED'
      ];
      const selectedType = types[Math.floor(Math.random() * types.length)];
      
      const amounts = [15000000, 25000000, 40000000, 60000000, 85000000, 110000000, 140000000];
      const selectedAmount = amounts[Math.floor(Math.random() * amounts.length)];

      const side: 'BUY' | 'YIELD' | 'SETTLE' = 
        selectedType === 'BUY ORDER' ? 'BUY' : 
        selectedType === 'RENTAL YIELD' ? 'YIELD' : 'SETTLE';

      const status: 'FILLED' | 'SETTLED' | 'DISTRIBUTED' =
        side === 'BUY' ? 'FILLED' :
        side === 'YIELD' ? 'DISTRIBUTED' : 'SETTLED';

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const orderNum = Math.floor(1000 + Math.random() * 9000);

      const newOrder: SimulatedOrder = {
        id: `ORD-${orderNum}`,
        time: timeStr,
        pair: `UAE-REIT / ${loc.code}`,
        location: `${loc.name} (${loc.district})`,
        type: selectedType,
        side,
        amount: selectedAmount,
        yieldRate: `+${loc.baseYield} p.a.`,
        status
      };

      setOrders(prev => [newOrder, ...prev.slice(0, 9)]);
    }, 3200);

    return () => clearInterval(orderInterval);
  }, []);

  // SVG Candlestick rendering calculations
  const svgData = useMemo(() => {
    if (candles.length === 0) return { min: 0, max: 1, range: 1, candleWidth: 16 };
    const allLows = candles.map(c => c.low);
    const allHighs = candles.map(c => c.high);
    const minVal = Math.min(...allLows);
    const maxVal = Math.max(...allHighs);
    const padding = (maxVal - minVal) * 0.1 || 500;
    const min = minVal - padding;
    const max = maxVal + padding;
    const range = max - min || 1;
    return { min, max, range, candleWidth: 14 };
  }, [candles]);

  const chartHeight = 150;
  const chartWidth = 440;

  const getY = (val: number) => {
    return chartHeight - ((val - svgData.min) / svgData.range) * chartHeight;
  };

  const latestOrder = orders[0] || null;

  // COMPACT TICKER BAR (Image 3 Style: Placed directly above Active Investments)
  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-white rounded-2xl p-3.5 shadow-sm mb-5 relative overflow-hidden font-sans ${className}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
          {/* Index & Real-time Rate */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
              <TrendingUp className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight font-mono">
                  UAE-REIT / NGN
                </span>
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                <span className="font-bold text-white">₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-emerald-400 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3" />
                  +{priceChangePercent}%
                </span>
                <span className="text-slate-500 hidden sm:inline">·</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">24h Vol: ₦{(volume24h / 1000000000).toFixed(2)}B</span>
              </div>
            </div>
          </div>

          {/* Real-time Order Stream Bar (Latest UAE Execution) */}
          {latestOrder && (
            <div className="min-w-0 flex-1 bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  latestOrder.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  latestOrder.side === 'YIELD' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {latestOrder.type}
                </span>
                <span className="text-slate-200 truncate text-[11px]">
                  {latestOrder.location}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-emerald-400 font-bold text-[11px]">
                  +₦{(latestOrder.amount / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExpandTerminal}
              className="bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold text-xs py-2 px-3.5 rounded-xl border border-slate-700/80 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Trading Terminal</span>
              <Maximize2 className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FULL CARD (Candlestick chart, 24h stats, depth, and order book)
  return (
    <div className={`bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden font-sans ${className}`}>
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Pair, Price & Status Badge */}
      <div className="flex flex-wrap items-start justify-between gap-3 relative z-10 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 shrink-0">
            <TrendingUp className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight font-mono">
                UAE-REIT / NGN
              </span>
              <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                REALTIME FEED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Prime UAE Luxury Property Liquidity Index</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 font-medium flex items-center gap-1">
                <span>Dubai Asset Backing</span>
                <UaeFlag size="xs" />
              </span>
            </p>
          </div>
        </div>

        {/* Right CTA to expand full modal */}
        <div className="flex items-center gap-2">
          {onExpandTerminal && (
            <button
              onClick={onExpandTerminal}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Open Full Institutional Property Trading Terminal"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Price & 24h Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 relative z-10 font-mono">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Index Price</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-white tabular-nums">
              ₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +{priceChangePercent}% 24h
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">24h High</span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 block mt-0.5 tabular-nums">
            ₦{high24h.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Peak Yield</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">24h Low</span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 block mt-0.5 tabular-nums">
            ₦{low24h.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Support Level</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">24h Volume</span>
          <span className="text-xs sm:text-sm font-bold text-amber-400 block mt-0.5 tabular-nums">
            ₦{(volume24h / 1000000000).toFixed(2)}B
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Dubai Real Estate</span>
        </div>
      </div>

      {/* Middle Interactive Toggle: Candlestick Chart vs Real-time Executed Orders */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3 relative z-10">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chart' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Candlesticks</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Yield Stream ({orders.length})</span>
          </button>
        </div>

        {activeTab === 'chart' && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            {(['1m', '5m', '15m', '1D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  timeframe === tf ? 'bg-slate-800 text-amber-400 font-bold' : 'hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 min-h-[190px] flex flex-col justify-center">
        {activeTab === 'chart' ? (
          <div>
            {/* SVG Candlestick Chart */}
            <div className="w-full overflow-hidden bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 relative">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                <span>High: ₦{high24h.toLocaleString()}</span>
                <span>Timeframe: {timeframe}</span>
                <span>Low: ₦{low24h.toLocaleString()}</span>
              </div>

              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-36 overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="30" x2={chartWidth} y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2={chartWidth} y2="75" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Candlesticks */}
                {candles.map((candle, idx) => {
                  const spacing = chartWidth / candles.length;
                  const x = idx * spacing + spacing / 2;
                  const yHigh = getY(candle.high);
                  const yLow = getY(candle.low);
                  const yOpen = getY(candle.open);
                  const yClose = getY(candle.close);
                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(3, Math.abs(yClose - yOpen));
                  const color = candle.isBull ? '#10b981' : '#ef4444';

                  return (
                    <g key={idx} className="transition-all duration-300">
                      {/* Wick */}
                      <line 
                        x1={x} 
                        y1={yHigh} 
                        x2={x} 
                        y2={yLow} 
                        stroke={color} 
                        strokeWidth="1.5" 
                      />
                      {/* Candle Body */}
                      <rect
                        x={x - svgData.candleWidth / 2}
                        y={bodyTop}
                        width={svgData.candleWidth}
                        height={bodyHeight}
                        fill={color}
                        rx="1"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Real-time Order Depth indicator */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400 font-bold">Buyers: {buyRatio}%</span>
                <div className="w-1/2 bg-rose-500/40 h-1.5 rounded-full overflow-hidden mx-2">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${buyRatio}%` }} 
                  />
                </div>
                <span className="text-rose-400 font-bold">Sellers: {(100 - buyRatio).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Live Executed Orders Stream Table */
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs font-mono">
            {orders.map((ord) => (
              <div 
                key={ord.id} 
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-3 animate-fadeIn"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    ord.side === 'BUY' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : ord.side === 'YIELD' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {ord.type}
                  </span>
                  <div className="truncate">
                    <span className="text-white font-bold block text-[11px] truncate">
                      {ord.location}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {ord.pair} • {ord.time}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-white font-bold block text-[11px]">
                    ₦{(ord.amount / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {ord.yieldRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Institutional Transparency Footnote */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono relative z-10">
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>UAE Sovereign Property Model · Dubai Marina · Downtown · Palm</span>
        </span>
        <span className="text-slate-400">
          Payouts: <strong className="text-amber-400">Every Friday 12:00 AM WAT</strong>
        </span>
      </div>
    </div>
  );
};

export default LiveTradingSimulationCard;
