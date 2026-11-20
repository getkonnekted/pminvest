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

  // COMPACT TICKER BAR
  if (variant === 'compact') {
    return (
      <div className={`pm-card rounded-xl p-3.5 mb-5 font-sans ${className}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Index & Real-time Rate */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#0B7A4E]/12 text-[#0B7A4E] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm tracking-tight font-mono">
                  UAE-REIT / NGN
                </span>
                <span className="text-[10px] text-[#0B7A4E] font-mono font-semibold">
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                <span className="font-semibold tabular-nums">₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-[#0B7A4E] font-semibold flex items-center">
                  <ArrowUpRight className="w-3 h-3" />
                  +{priceChangePercent}%
                </span>
                <span className="opacity-35 hidden sm:inline">·</span>
                <span className="opacity-60 text-[11px] hidden sm:inline">24h Vol ₦{(volume24h / 1000000000).toFixed(2)}B</span>
              </div>
            </div>
          </div>

          {/* Latest UAE Execution */}
          {latestOrder && (
            <div className="min-w-0 flex-1 pm-card-subtle rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className={`text-[10px] font-semibold ${
                  latestOrder.side === 'BUY' ? 'text-[#0B7A4E]' : 'text-[#9A7B3E]'
                }`}>
                  {latestOrder.type}
                </span>
                <span className="opacity-80 truncate text-[11px]">
                  {latestOrder.location}
                </span>
              </div>
              <span className="text-[#0B7A4E] font-semibold text-[11px] shrink-0 tabular-nums">
                +₦{(latestOrder.amount / 1000000).toFixed(1)}M
              </span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExpandTerminal}
              className="pm-btn-secondary font-medium text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-[#0B7A4E]" />
              <span>Market Terminal</span>
              <Maximize2 className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FULL CARD (Candlestick chart, 24h stats, depth, and order book)
  return (
    <div className={`pm-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden font-sans ${className}`}>
      {/* Top Header: Pair, Price & Status */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--pm-border)] pb-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0B7A4E]/12 text-[#0B7A4E] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base tracking-tight font-mono">
                UAE-REIT / NGN
              </span>
              <span className="text-[10px] text-[#0B7A4E] font-mono font-semibold">
                LIVE FEED
              </span>
            </div>
            <p className="text-[11px] opacity-65 flex items-center gap-1.5 mt-0.5">
              <span>Dubai Property Liquidity Index</span>
              <UaeFlag size="xs" />
            </p>
          </div>
        </div>

        {/* Right CTA to expand full modal */}
        <div className="flex items-center gap-2">
          {onExpandTerminal && (
            <button
              onClick={onExpandTerminal}
              className="px-3 py-1.5 rounded-lg pm-btn-secondary cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Open Market Terminal"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#0B7A4E]" />
              <span className="hidden sm:inline">Terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Price & 24h Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 font-mono">
        <div className="pm-card-subtle rounded-xl p-2.5">
          <span className="text-[10px] opacity-60 uppercase tracking-wider block font-sans">Index Price</span>
          <span className="text-base sm:text-lg font-semibold block mt-0.5 tabular-nums">
            ₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#0B7A4E] font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +{priceChangePercent}% 24h
          </span>
        </div>

        <div className="pm-card-subtle rounded-xl p-2.5">
          <span className="text-[10px] opacity-60 uppercase tracking-wider block font-sans">24h High</span>
          <span className="text-xs sm:text-sm font-semibold block mt-0.5 tabular-nums">
            ₦{high24h.toLocaleString()}
          </span>
          <span className="text-[10px] opacity-55 block mt-0.5">Peak Yield</span>
        </div>

        <div className="pm-card-subtle rounded-xl p-2.5">
          <span className="text-[10px] opacity-60 uppercase tracking-wider block font-sans">24h Low</span>
          <span className="text-xs sm:text-sm font-semibold block mt-0.5 tabular-nums">
            ₦{low24h.toLocaleString()}
          </span>
          <span className="text-[10px] opacity-55 block mt-0.5">Support</span>
        </div>

        <div className="pm-card-subtle rounded-xl p-2.5">
          <span className="text-[10px] opacity-60 uppercase tracking-wider block font-sans">24h Volume</span>
          <span className="text-xs sm:text-sm font-semibold text-[#9A7B3E] block mt-0.5 tabular-nums">
            ₦{(volume24h / 1000000000).toFixed(2)}B
          </span>
          <span className="text-[10px] opacity-55 block mt-0.5">Dubai Real Estate</span>
        </div>
      </div>

      {/* Middle Interactive Toggle */}
      <div className="flex items-center justify-between border-b border-[var(--pm-border)] pb-2.5 mb-3">
        <div className="flex items-center gap-1 pm-card-subtle p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-[#0B7A4E] text-white'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Candlesticks</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0B7A4E] text-white'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Yield Stream ({orders.length})</span>
          </button>
        </div>

        {activeTab === 'chart' && (
          <div className="flex items-center gap-1 text-[11px] font-mono opacity-75">
            {(['1m', '5m', '15m', '1D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  timeframe === tf ? 'bg-[#0B7A4E]/15 text-[#0B7A4E] font-semibold' : 'opacity-65 hover:opacity-100'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[190px] flex flex-col justify-center">
        {activeTab === 'chart' ? (
          <div className="w-full overflow-hidden pm-card-subtle rounded-xl p-3 relative">
            <div className="flex items-center justify-between text-[10px] opacity-60 font-mono mb-1">
              <span>High: ₦{high24h.toLocaleString()}</span>
              <span>Timeframe: {timeframe}</span>
              <span>Low: ₦{low24h.toLocaleString()}</span>
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-36 overflow-visible"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="30" x2={chartWidth} y2="30" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2={chartWidth} y2="75" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="currentColor" strokeOpacity="0.12" strokeDasharray="3 3" />

              {candles.map((candle, idx) => {
                const spacing = chartWidth / candles.length;
                const x = idx * spacing + spacing / 2;
                const yHigh = getY(candle.high);
                const yLow = getY(candle.low);
                const yOpen = getY(candle.open);
                const yClose = getY(candle.close);
                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(3, Math.abs(yClose - yOpen));
                const color = candle.isBull ? '#0B7A4E' : '#dc2626';

                return (
                  <g key={idx}>
                    <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
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

            <div className="mt-2.5 pt-2 border-t border-[var(--pm-border)] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#0B7A4E] font-semibold">Buyers {buyRatio}%</span>
              <div className="w-1/2 bg-rose-500/30 h-1.5 rounded-full overflow-hidden mx-2">
                <div
                  className="bg-[#0B7A4E] h-full rounded-full transition-all duration-500"
                  style={{ width: `${buyRatio}%` }}
                />
              </div>
              <span className="text-rose-600 font-semibold">Sellers {(100 - buyRatio).toFixed(1)}%</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs font-mono">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="pm-card-subtle rounded-xl p-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`text-[10px] font-semibold ${
                    ord.side === 'BUY' ? 'text-[#0B7A4E]' : 'text-[#9A7B3E]'
                  }`}>
                    {ord.type}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold block text-[11px] truncate">
                      {ord.location}
                    </span>
                    <span className="text-[10px] opacity-60">
                      {ord.pair} · {ord.time}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-semibold block text-[11px] tabular-nums">
                    ₦{(ord.amount / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-[10px] text-[#0B7A4E] font-semibold">
                    {ord.yieldRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footnote */}
      <div className="mt-3.5 pt-3 border-t border-[var(--pm-border)] flex flex-wrap items-center justify-between gap-2 text-[10px] opacity-65 font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0B7A4E]" />
          <span>Dubai Marina · Downtown · Palm</span>
        </span>
        <span>Payouts: Every Friday 12:00 PM WAT</span>
      </div>
    </div>
  );
};

export default LiveTradingSimulationCard;
