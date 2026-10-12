import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Maximize2, 
  Building2, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  BarChart3,
  RefreshCw,
  Clock
} from 'lucide-react';

interface SimulatedOrder {
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

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isBull: boolean;
}

interface LiveTradingSimulationCardProps {
  onExpandTerminal?: () => void;
  className?: string;
}

const PROPERTY_LOCATIONS = [
  { name: 'Lekki Phase 1 Prime Suites', code: 'LK-01', baseYield: '14.2%' },
  { name: 'Victoria Island Commercial Wing', code: 'VI-09', baseYield: '15.8%' },
  { name: 'Epe Express Corridor Agro-Hub', code: 'EP-04', baseYield: '18.1%' },
  { name: 'Guzape Hills Terraces Abuja', code: 'GZ-02', baseYield: '16.4%' },
  { name: 'Maitama Diplomatic Villa Wing', code: 'MT-07', baseYield: '13.9%' },
  { name: 'Ibeju-Lekki Coastal Green Villa', code: 'IB-03', baseYield: '17.5%' },
  { name: 'Ikeja GRA Executive Enclave', code: 'IK-05', baseYield: '15.0%' }
];

export const LiveTradingSimulationCard: React.FC<LiveTradingSimulationCardProps> = ({
  onExpandTerminal,
  className = ''
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

  // Recent simulated order executions stream
  const [orders, setOrders] = useState<SimulatedOrder[]>([
    {
      id: 'ORD-9841',
      time: '12:14:02',
      pair: 'PM-REIT / LK-01',
      location: 'Lekki Phase 1 Prime Suites',
      type: 'RENTAL YIELD',
      side: 'YIELD',
      amount: 45000000,
      yieldRate: '+14.2% p.a.',
      status: 'DISTRIBUTED'
    },
    {
      id: 'ORD-9840',
      time: '12:13:41',
      pair: 'PM-REIT / VI-09',
      location: 'Victoria Island Commercial Wing',
      type: 'BUY ORDER',
      side: 'BUY',
      amount: 85000000,
      yieldRate: '+15.8% p.a.',
      status: 'FILLED'
    },
    {
      id: 'ORD-9839',
      time: '12:13:10',
      pair: 'PM-REIT / EP-04',
      location: 'Epe Express Corridor Agro-Hub',
      type: 'COLLATERAL SETTLED',
      side: 'SETTLE',
      amount: 32000000,
      yieldRate: '+18.1% p.a.',
      status: 'SETTLED'
    },
    {
      id: 'ORD-9838',
      time: '12:12:35',
      pair: 'PM-REIT / GZ-02',
      location: 'Guzape Hills Terraces Abuja',
      type: 'BUY ORDER',
      side: 'BUY',
      amount: 120000000,
      yieldRate: '+16.4% p.a.',
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

  // Periodic simulated order generator (every ~3.2 seconds)
  useEffect(() => {
    const orderInterval = setInterval(() => {
      const loc = PROPERTY_LOCATIONS[Math.floor(Math.random() * PROPERTY_LOCATIONS.length)];
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
        pair: `PM-REIT / ${loc.code}`,
        location: loc.name,
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
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                PM-REIT / NGN
              </span>
              <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                REALTIME FEED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Treasure Homes Prime Property Liquidity Index</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 font-medium">Verified Yield Model</span>
            </p>
          </div>
        </div>

        {/* Right CTA to expand full modal */}
        <div className="flex items-center gap-2">
          {onExpandTerminal && (
            <button
              type="button"
              onClick={onExpandTerminal}
              className="bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Open Full Institutional Property Trading Terminal"
            >
              <span>Expand Terminal</span>
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}
        </div>
      </div>

      {/* Price & 24h Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3.5 py-2.5 px-3 bg-slate-950/60 border border-slate-800/60 rounded-xl relative z-10">
        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Index Price</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg font-extrabold text-white font-mono tabular-nums">
              ₦{currentPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center font-mono">
              <ArrowUpRight className="w-3 h-3 inline" /> +{priceChangePercent}%
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">24h High</span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 font-mono tabular-nums mt-0.5 block">
            ₦{high24h.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">24h Low</span>
          <span className="text-xs sm:text-sm font-bold text-slate-300 font-mono tabular-nums mt-0.5 block">
            ₦{low24h.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">24h Volume</span>
          <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono tabular-nums mt-0.5 block">
            ₦{(volume24h / 1000000000).toFixed(2)}B
          </span>
        </div>
      </div>

      {/* View Switcher: Candlestick Chart vs Orders Stream */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chart' 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Candlestick</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Executed Yields ({orders.length})</span>
          </button>
        </div>

        {/* Timeframe Selector (Only active in chart tab) */}
        {activeTab === 'chart' && (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            {(['1m', '5m', '15m', '1D'] as const).map(tf => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive Display */}
      <div className="relative z-10">
        {activeTab === 'chart' ? (
          <div>
            {/* SVG Candlestick Chart */}
            <div className="w-full bg-[#060a12] border border-slate-800/90 rounded-xl p-2.5 relative overflow-hidden shadow-inner">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-36 sm:h-40 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="gridLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#334155" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                <line x1="0" y1="30" x2={chartWidth} y2="30" stroke="url(#gridLine)" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2={chartWidth} y2="75" stroke="url(#gridLine)" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="url(#gridLine)" strokeDasharray="3 3" />

                {/* Candlesticks */}
                {candles.map((candle, idx) => {
                  const spacing = chartWidth / candles.length;
                  const x = idx * spacing + spacing / 2;
                  const yOpen = getY(candle.open);
                  const yClose = getY(candle.close);
                  const yHigh = getY(candle.high);
                  const yLow = getY(candle.low);
                  
                  const isBull = candle.isBull;
                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(3, Math.abs(yClose - yOpen));
                  const candleColor = isBull ? '#10b981' : '#ef4444';
                  const isLatest = idx === candles.length - 1;

                  return (
                    <g key={idx} className="transition-all duration-300">
                      {/* Upper and lower wick */}
                      <line 
                        x1={x} 
                        y1={yHigh} 
                        x2={x} 
                        y2={yLow} 
                        stroke={candleColor} 
                        strokeWidth="1.25"
                      />
                      {/* Candle body */}
                      <rect
                        x={x - svgData.candleWidth / 2}
                        y={bodyTop}
                        width={svgData.candleWidth}
                        height={bodyHeight}
                        fill={candleColor}
                        rx="1"
                      />
                      {/* Pulsing indicator on the latest active candle */}
                      {isLatest && (
                        <circle 
                          cx={x} 
                          cy={bodyTop + bodyHeight / 2} 
                          r="3" 
                          fill="#f59e0b" 
                          className="animate-ping"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Real-time Order Depth Gauge */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span>BUY DEPTH: {buyRatio}%</span>
                </span>
                <div className="w-32 sm:w-48 bg-rose-950/70 h-1.5 rounded-full overflow-hidden flex mx-2 border border-slate-800">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${buyRatio}%` }}
                  />
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    style={{ width: `${100 - buyRatio}%` }}
                  />
                </div>
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <span>SELL DEPTH: {+(100 - buyRatio).toFixed(1)}%</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Automated Real-time Orders & Yields Stream */
          <div className="bg-[#060a12] border border-slate-800/90 rounded-xl p-2.5 max-h-52 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
            {orders.map((ord, idx) => (
              <div 
                key={ord.id} 
                className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs font-mono transition-all ${
                  idx === 0 
                    ? 'bg-slate-800/80 border-amber-500/40 shadow-xs animate-fadeIn' 
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
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
          <span>Simulated Institutional Liquidity Engine • 100% Backed Property Models</span>
        </span>
        <span className="text-slate-400">
          Live Yield Cycle: <strong className="text-amber-400">Every Friday 12:00 AM WAT</strong>
        </span>
      </div>
    </div>
  );
};

export default LiveTradingSimulationCard;
