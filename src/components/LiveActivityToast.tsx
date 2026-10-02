import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ArrowDownLeft, 
  CheckCircle, 
  Sparkles, 
  X, 
  TrendingUp,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { LiveActivityItem } from '../types';

interface SimulatedActivity {
  type: LiveActivityItem['type'];
  name: string;
  location: string;
  actionText: string;
  subText: string;
  amount?: number;
  iconType: LiveActivityItem['iconType'];
}

const SIMULATED_POOL: SimulatedActivity[] = [
  {
    type: 'purchase',
    name: 'Chinedu E.',
    location: 'Lekki, Lagos',
    actionText: 'Activated Plan 2 (₦45,000)',
    subText: 'Weekly return: ₦17,250 every Friday',
    amount: 45000,
    iconType: 'investment'
  },
  {
    type: 'payout',
    name: 'Ngozi U.',
    location: 'Abuja, FCT',
    actionText: 'Received ₦34,500 Weekly Payout',
    subText: 'Direct settlement to GTBank',
    amount: 34500,
    iconType: 'payout'
  },
  {
    type: 'purchase',
    name: 'Amina B.',
    location: 'Kano State',
    actionText: 'Started with Plan 1 (₦15,000)',
    subText: 'First property yield due next Friday',
    amount: 15000,
    iconType: 'investment'
  },
  {
    type: 'payout',
    name: 'Babatunde R.',
    location: 'Ibadan, Oyo',
    actionText: 'Withdrew ₦81,000 Cash Return',
    subText: 'Disbursed via Zenith Bank',
    amount: 81000,
    iconType: 'payout'
  },
  {
    type: 'purchase',
    name: 'Emeka O.',
    location: 'Port Harcourt, Rivers',
    actionText: 'Invested ₦270,000 in Plan 4',
    subText: 'Total scheduled returns: ₦626,400',
    amount: 270000,
    iconType: 'investment'
  },
  {
    type: 'payout',
    name: 'Folake A.',
    location: 'Ikeja, Lagos',
    actionText: 'Received ₦103,500 Friday Payout',
    subText: 'Instant transfer to Access Bank',
    amount: 103500,
    iconType: 'payout'
  },
  {
    type: 'reserve',
    name: 'Treasure Homes Vault',
    location: 'Bank Reserve',
    actionText: '₦10,000 Continuous Growth Added',
    subText: 'Total cash reserve pool exceeds ₦92.06M',
    amount: 10000,
    iconType: 'reserve'
  },
  {
    type: 'purchase',
    name: 'Blessing K.',
    location: 'Enugu State',
    actionText: 'Purchased Plan 3 (₦115,000)',
    subText: '₦44,850 credited every Friday',
    amount: 115000,
    iconType: 'investment'
  },
  {
    type: 'payout',
    name: 'Ibrahim S.',
    location: 'Kaduna Central',
    actionText: 'Received ₦243,000 Weekly Yield',
    subText: 'Disbursed to Kuda MFB Account',
    amount: 243000,
    iconType: 'payout'
  },
  {
    type: 'kyc',
    name: 'Dayo A.',
    location: 'Victoria Island, Lagos',
    actionText: 'Identity Verified & Approved',
    subText: 'Tier-1 Verified Real Estate Investor',
    iconType: 'verified'
  },
  {
    type: 'purchase',
    name: 'Musa D.',
    location: 'Gwarinpa, Abuja',
    actionText: 'Acquired Plan 5 (₦500,000)',
    subText: 'High-yield commercial development backing',
    amount: 50000,
    iconType: 'investment'
  },
  {
    type: 'payout',
    name: 'Chioma M.',
    location: 'Owerri, Imo',
    actionText: 'Withdrew ₦51,750 Friday Payout',
    subText: 'Paid to First Bank Nigeria',
    amount: 51750,
    iconType: 'payout'
  }
];

export const LiveActivityToast: React.FC = () => {
  const { settings, activeLiveActivity, dismissLiveActivity } = useAppState();
  const [currentToast, setCurrentToast] = useState<LiveActivityItem | null>(null);
  const [isDismissedSession, setIsDismissedSession] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const poolIndexRef = useRef<number>(0);

  // If disabled by Admin settings or dismissed by user for the session
  const isEnabled = settings.enableLiveActivityToasts !== false && !isDismissedSession;

  // React to REAL platform activity triggered from StateContext
  useEffect(() => {
    if (!isEnabled || !activeLiveActivity) return;

    if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
    setCurrentToast(activeLiveActivity);

    // Auto-dismiss after 5.5 seconds unless hovered
    displayTimeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setCurrentToast(null);
        dismissLiveActivity();
      }
    }, 5500);

    return () => {
      if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
    };
  }, [activeLiveActivity, isEnabled, isHovered, dismissLiveActivity]);

  // Periodic subtle simulated updates when page is quiet (every 26-38 seconds)
  useEffect(() => {
    if (!isEnabled) {
      setCurrentToast(null);
      return;
    }

    const scheduleNextSimulated = () => {
      // Random interval between 25 and 38 seconds
      const delay = Math.floor(Math.random() * (38000 - 25000 + 1)) + 25000;

      intervalRef.current = setTimeout(() => {
        // Only trigger if no active real event is currently showing
        if (!currentToast && !isHovered) {
          const item = SIMULATED_POOL[poolIndexRef.current % SIMULATED_POOL.length];
          poolIndexRef.current += 1;

          const toastData: LiveActivityItem = {
            id: 'sim_' + Date.now(),
            type: item.type,
            title: `${item.name} (${item.location})`,
            message: item.actionText,
            amount: item.amount,
            timeAgo: 'Just now',
            location: item.location,
            iconType: item.iconType,
            avatarInitials: item.name.split(' ').map(n => n[0]).join('').substring(0, 2),
            timestamp: Date.now()
          };

          setCurrentToast(toastData);

          // Show for 5 seconds
          displayTimeoutRef.current = setTimeout(() => {
            if (!isHovered) {
              setCurrentToast(null);
            }
          }, 5000);
        }

        // Loop to next
        scheduleNextSimulated();
      }, delay);
    };

    // First appearance after 12 seconds of quiet browsing
    const initialTimer = setTimeout(() => {
      scheduleNextSimulated();
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (displayTimeoutRef.current) clearTimeout(displayTimeoutRef.current);
    };
  }, [isEnabled, isHovered, currentToast]);

  const handleManualClose = () => {
    setCurrentToast(null);
    dismissLiveActivity();
  };

  const handleMuteAll = () => {
    setIsDismissedSession(true);
    setCurrentToast(null);
    dismissLiveActivity();
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:right-auto sm:bottom-5 sm:left-5 z-40 max-w-sm pointer-events-none select-none">
      <AnimatePresence>
        {currentToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl shadow-black/50 relative overflow-hidden"
          >
            {/* Top glowing ambient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 animate-pulse" />

            <div className="flex items-start gap-3">
              {/* Icon badge */}
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner ${
                  currentToast.iconType === 'payout'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : currentToast.iconType === 'investment'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : currentToast.iconType === 'reserve'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {currentToast.iconType === 'payout' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : currentToast.iconType === 'investment' ? (
                    <Building2 className="w-5 h-5" />
                  ) : currentToast.iconType === 'reserve' ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>

                {/* Pulsing live active dot */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-white truncate max-w-[190px]">
                    {currentToast.title}
                  </span>
                  <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full font-medium border border-emerald-500/20">
                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                    Verified
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-semibold mt-0.5 leading-snug">
                  {currentToast.message}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span>Real-time Activity</span>
                  </span>
                  <span>•</span>
                  <span>{currentToast.timeAgo}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleManualClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subtle progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: isHovered ? '100%' : '0%' }}
              transition={{ duration: isHovered ? 0 : 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-[2px] bg-emerald-500/60"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityToast;
