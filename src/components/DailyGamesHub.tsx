import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gift, 
  RotateCw, 
  Lock, 
  CheckCircle2, 
  Coins, 
  Building2, 
  Award, 
  Flame, 
  Zap, 
  ChevronRight,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { useAppState } from '../context/StateContext';

const WHEEL_SEGMENTS = [
  { label: '+50 Pts', points: 50, cash: 0, color: '#3b82f6', text: '#ffffff' },
  { label: '+100 Pts', points: 100, cash: 0, color: '#10b981', text: '#ffffff' },
  { label: '₦200 Cash', points: 20, cash: 200, color: '#f59e0b', text: '#000000' },
  { label: '+250 Pts', points: 250, cash: 0, color: '#8b5cf6', text: '#ffffff' },
  { label: '+500 Pts', points: 500, cash: 0, color: '#ec4899', text: '#ffffff' },
  { label: '2x Boost', points: 200, cash: 0, color: '#06b6d4', text: '#000000' }
];

export const DailyGamesHub: React.FC = () => {
  const { 
    currentUser, 
    playLuckySpinWheel, 
    openPropertyChest, 
    convertPointsToWallet 
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'wheel' | 'chest'>('wheel');
  
  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // Chest state
  const [selectedChest, setSelectedChest] = useState<number | null>(null);
  const [isOpeningChest, setIsOpeningChest] = useState(false);
  const [chestReward, setChestReward] = useState<{ name: string; points: number; cash: number } | null>(null);

  // Convert points feedback
  const [convertSuccessMsg, setConvertSuccessMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const userHistory = currentUser?.dailyGamesHistory || {};
  const hasSpunToday = userHistory.lastWheelDate === todayStr;
  const hasOpenedChestToday = userHistory.lastChestDate === todayStr;
  const userPoints = currentUser?.points || 0;

  // Spin wheel action
  const handleSpinWheel = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setWheelResult(null);

    // Pick random target segment
    const targetIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    // Additional full rotations + target angle
    const extraRotations = 360 * 5;
    const targetAngle = extraRotations + (360 - (targetIndex * segmentAngle + segmentAngle / 2));
    
    setSpinRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const won = WHEEL_SEGMENTS[targetIndex];
      setWheelResult(won.label);
      if (playLuckySpinWheel) {
        playLuckySpinWheel(won.points, won.cash);
      }
    }, 4000);
  };

  // Open chest action
  const handleOpenChest = (chestIdx: number) => {
    if (isOpeningChest || hasOpenedChestToday) return;

    setSelectedChest(chestIdx);
    setIsOpeningChest(true);
    setChestReward(null);

    setTimeout(() => {
      setIsOpeningChest(false);
      const rewards = [
        { name: 'Duplex Golden Deed', points: 300, cash: 150 },
        { name: 'Terrace Yield Key', points: 450, cash: 0 },
        { name: 'Penthouse Vault Dividend', points: 600, cash: 300 }
      ];
      const rew = rewards[chestIdx] || rewards[0];
      setChestReward(rew);
      if (openPropertyChest) {
        openPropertyChest(rew.name, rew.points, rew.cash);
      }
    }, 1500);
  };

  // Convert points to wallet cash
  const handleConvertPoints = () => {
    if (userPoints < 500) return;
    const convertiblePoints = Math.floor(userPoints / 500) * 500;
    const nairaAmount = convertiblePoints; // 1 point = ₦1
    if (convertPointsToWallet) {
      convertPointsToWallet(convertiblePoints, nairaAmount);
      setConvertSuccessMsg(`Successfully converted ${convertiblePoints} Points into ₦${nairaAmount.toLocaleString()} Cash!`);
      setTimeout(() => setConvertSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0c101c] via-[#090d18] to-[#06080e] border border-amber-500/25 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 backdrop-blur-md text-slate-200">
      
      {/* Header with Points and Streaks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shadow-inner">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#f7ecd5] tracking-wide uppercase flex items-center gap-2 font-mono">
                Daily Property Rewards & Mini-Games
                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  FREE DAILY CASH
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Spin the Lucky Wheel and unlock daily Property Chests to collect Points that convert into real wallet money.
              </p>
            </div>
          </div>
        </div>

        {/* User Points Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-[#070a13] border border-amber-500/25 rounded-xl px-3.5 py-2 text-right shadow-inner">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
              Property Points
            </span>
            <div className="text-base font-black font-mono text-amber-300 flex items-center justify-end gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{userPoints.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#070a13] border border-emerald-500/25 rounded-xl px-3.5 py-2 text-right shadow-inner">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
              Daily Streak
            </span>
            <div className="text-base font-black font-mono text-emerald-300 flex items-center justify-end gap-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{userHistory.streak || 1} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Points to Cash Conversion Bar */}
      <div className="bg-gradient-to-r from-[#0d1322] via-[#090d18] to-[#070a12] text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl border border-amber-500/30">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
            Points to Cash Conversion (500 Pts = ₦500 Wallet Cash)
          </span>
          <div className="text-xs text-slate-300 mt-0.5">
            You currently have <strong className="text-[#f7ecd5] font-mono">{userPoints} Points</strong> ({Math.floor(userPoints / 500) * 500} Points redeemable).
          </div>
        </div>

        <button
          type="button"
          onClick={handleConvertPoints}
          disabled={userPoints < 500}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
            userPoints >= 500
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black cursor-pointer active:scale-95'
              : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-60'
          }`}
        >
          <Coins className="w-4 h-4 text-slate-950" />
          <span>Convert {Math.floor(userPoints / 500) * 500} Pts to ₦{Math.floor(userPoints / 500) * 500}</span>
        </button>
      </div>

      {convertSuccessMsg && (
        <div className="p-3 bg-[#061811] border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{convertSuccessMsg}</span>
        </div>
      )}

      {/* Game Selector Tabs */}
      <div className="flex bg-[#06080e] p-1 rounded-xl border border-amber-500/25 max-w-md mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('wheel')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'wheel'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-amber-200'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Lucky Spin Wheel</span>
          {hasSpunToday && <span className="text-[9px] bg-black/40 px-1.5 py-0.2 rounded text-slate-300">Done</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chest')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'chest'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-amber-200'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Property Prize Chests</span>
          {hasOpenedChestToday && <span className="text-[9px] bg-black/40 px-1.5 py-0.2 rounded text-slate-300">Done</span>}
        </button>
      </div>

      {/* GAME 1: LUCKY SPIN WHEEL */}
      {activeTab === 'wheel' && (
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72">
            {/* Center Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />

            {/* SVG Wheel */}
            <div 
              className="w-full h-full rounded-full border-4 border-amber-500/40 shadow-2xl overflow-hidden transition-transform ease-out"
              style={{
                transform: `rotate(${spinRotation}deg)`,
                transitionDuration: isSpinning ? '4000ms' : '0ms'
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {WHEEL_SEGMENTS.map((seg, i) => {
                  const angle = 360 / WHEEL_SEGMENTS.length;
                  const startAngle = (i * angle - 90) * (Math.PI / 180);
                  const endAngle = ((i + 1) * angle - 90) * (Math.PI / 180);
                  const x1 = 50 + 50 * Math.cos(startAngle);
                  const y1 = 50 + 50 * Math.sin(startAngle);
                  const x2 = 50 + 50 * Math.cos(endAngle);
                  const y2 = 50 + 50 * Math.sin(endAngle);
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Text position
                  const textAngle = (i * angle + angle / 2 - 90) * (Math.PI / 180);
                  const textX = 50 + 32 * Math.cos(textAngle);
                  const textY = 50 + 32 * Math.sin(textAngle);

                  return (
                    <g key={i}>
                      <path d={pathData} fill={seg.color} stroke="#070a12" strokeWidth="0.8" />
                      <text
                        x={textX}
                        y={textY}
                        fill={seg.text}
                        fontSize="4.2"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${i * angle + angle / 2 + 90}, ${textX}, ${textY})`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Hub */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-[#06080e] border-2 border-amber-400 flex items-center justify-center text-amber-300 font-extrabold text-[10px] shadow-2xl">
                SPIN
              </div>
            </div>
          </div>

          {/* Wheel Result Toast */}
          {wheelResult && (
            <div className="bg-[#121626] border border-amber-400/40 text-amber-300 px-4 py-2 rounded-xl text-xs font-extrabold animate-bounce shadow-lg">
              🎉 Congratulations! You won: {wheelResult}!
            </div>
          )}

          {/* Spin Trigger Button */}
          <div>
            {hasSpunToday ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-[#070a13] px-4 py-2.5 rounded-xl border border-amber-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Daily Spin Completed! Return tomorrow for another free turn.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className={`px-8 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${
                  isSpinning
                    ? 'bg-slate-800 text-slate-500 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95 cursor-pointer'
                }`}
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Spinning Wheel...' : 'Spin Daily Lucky Wheel'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* GAME 2: PROPERTY PRIZE CHESTS */}
      {activeTab === 'chest' && (
        <div className="py-4 space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h4 className="font-bold text-sm text-[#f7ecd5] font-mono">Choose One Mystery Property Chest</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Unlock a random treasure chest every day to uncover deed bonuses, points, and surprise mini-dividends.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { id: 0, title: 'Duplex Chest', color: 'from-amber-500 to-amber-600' },
              { id: 1, title: 'Terrace Vault', color: 'from-emerald-600 to-emerald-700' },
              { id: 2, title: 'Penthouse Safe', color: 'from-purple-600 to-purple-700' }
            ].map(c => {
              const isSelected = selectedChest === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => !hasOpenedChestToday && handleOpenChest(c.id)}
                  className={`border-2 rounded-2xl p-5 text-center transition-all cursor-pointer ${
                    hasOpenedChestToday
                      ? 'opacity-50 cursor-not-allowed bg-[#070a13] border-slate-800'
                      : isSelected
                      ? 'border-amber-400 bg-amber-500/10 scale-105 shadow-xl'
                      : 'border-amber-500/20 hover:border-amber-400/50 hover:bg-[#0c101c] bg-[#070a13]'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <Gift className={`w-7 h-7 ${isSelected && isOpeningChest ? 'animate-bounce' : ''}`} />
                  </div>
                  <h5 className="font-bold text-[#f7ecd5] text-xs font-mono">{c.title}</h5>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {hasOpenedChestToday ? 'Chest Locked' : 'Tap to Unlock'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Chest Result */}
          {chestReward && (
            <div className="bg-[#121626] border border-amber-500/30 text-amber-200 p-4 rounded-xl text-xs max-w-md mx-auto text-center space-y-1 shadow-xl">
              <span className="font-black text-sm block text-amber-300">🎉 Chest Unlocked: {chestReward.name}!</span>
              <p className="text-slate-300">
                You collected <strong className="font-mono text-amber-300">+{chestReward.points} Points</strong>
                {chestReward.cash > 0 && <span> and <strong className="font-mono text-emerald-400">+₦{chestReward.cash} Instant Cash</strong></span>}!
              </p>
            </div>
          )}

          {hasOpenedChestToday && !chestReward && (
            <div className="text-center text-xs text-slate-400">
              ✓ You have opened your daily property chest today. New chests refresh at midnight!
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DailyGamesHub;
