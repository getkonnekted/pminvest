import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, InvestmentPlan, UserInvestment, Transaction, SystemSettings, INVESTMENT_PLANS, DailyTask, TaskSubmission, UserDailyProgress, PayoutToastData } from '../types';
import { DEFAULT_DAILY_TASKS } from '../data/dailyTasks';
import { playPayoutChime } from '../lib/sound';
import { 
  isSupabaseConfigured, 
  supabase, 
  fetchAllSupabaseData, 
  syncUserToSupabase, 
  syncInvestmentToSupabase, 
  syncTransactionToSupabase, 
  syncSettingsToSupabase, 
  syncWeekToSupabase,
  syncMultipleUsersToSupabase,
  syncMultipleInvestmentsToSupabase,
  syncMultipleTransactionsToSupabase
} from '../lib/supabase';

interface StateContextType {
  users: User[];
  currentUser: User | null;
  investments: UserInvestment[];
  transactions: Transaction[];
  settings: SystemSettings;
  currentWeek: number;
  errorMsg: string | null;
  successMsg: string | null;
  supabaseStatus: 'idle' | 'loading' | 'connected' | 'error' | 'not_configured';
  isDbLoaded: boolean;
  
  // Daily Tasks state & helpers
  dailyTasks: DailyTask[];
  taskSubmissions: TaskSubmission[];
  userDailyProgress: Record<string, UserDailyProgress>;
  virtualDate: string;
  getUserActiveWeeklyPayout: (userId: string) => number;
  getUserDailyPool: (userId: string) => number;
  getUserDailyTaskReward: (userId: string, task: DailyTask) => number;
  getUserProgress: (userId: string) => UserDailyProgress;
  
  // Auth actions
  register: (name: string, email: string, referredByCode?: string, password?: string) => boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  
  // User actions
  submitDeposit: (amount: number, method: string, accountDetails: string, proofUrl?: string) => void;
  submitWithdrawal: (amount: number, accountDetails: string) => boolean;
  purchaseInvestment: (planId: string) => boolean;
  submitKyc: (fullName: string, idType: string, idNumber: string) => void;

  // Daily Tasks user actions
  completeInstantTask: (taskId: string, answerIndex?: number, isAdBoosted?: boolean) => boolean;
  applyRewardedAdBoost: (taskId: string) => boolean;
  submitTaskProof: (taskId: string, proof: string) => boolean;
  claimStreakBonus: () => boolean;
  claimGuestTrialEarnings: () => number;
  
  // Admin actions
  approveDeposit: (txId: string) => void;
  rejectDeposit: (txId: string) => void;
  approveWithdrawal: (txId: string) => void;
  rejectWithdrawal: (txId: string) => void;
  reviewKyc: (userId: string, approve: boolean) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  approveTaskSubmission: (subId: string) => void;
  rejectTaskSubmission: (subId: string) => void;
  recordAdImpression: (adRevenue: number) => void;
  
  // Payout Notification Toasts
  payoutToasts: PayoutToastData[];
  dismissPayoutToast: (id: string) => void;
  triggerPayoutToast: (toast: Omit<PayoutToastData, 'id' | 'timestamp'>) => void;
  processSingleInvestmentPayout: (invId: string) => boolean;

  // Simulator
  simulateWeek: () => void;
  simulateNextDay: () => void;
  resetAll: () => void;
  clearMessages: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ADMIN_EMAIL = (import.meta as any).env.VITE_ADMIN_EMAIL || 'admin@treasurehomes.com';
const ADMIN_PASSWORD = (import.meta as any).env.VITE_ADMIN_PASSWORD || 'admin123';

const getSeedUsers = (): User[] => [
  {
    id: 'usr_admin',
    name: 'Treasure Homes Admin',
    email: ADMIN_EMAIL.toLowerCase().trim(),
    referralCode: 'TREASURE_ADMIN',
    walletBalance: 0,
    kycStatus: 'verified',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_demo_investor',
    name: 'Jude Eze (Demo Investor)',
    email: 'demo_investor@pminvest.org.ng',
    password: 'investor123',
    referralCode: 'DEMO_INVESTOR',
    referredByCode: 'TREASURE_ADMIN',
    walletBalance: 250000,
    kycStatus: 'verified',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

const SEED_INVESTMENTS: UserInvestment[] = [];

const SEED_TRANSACTIONS: Transaction[] = [];

// Base liquidity reserve backing and automated daily growth rate
export const BASE_LIQUIDITY_RESERVE = 78387045; // Base reserve backing (Treasure Homes Backed)
export const DAILY_LIQUIDITY_GROWTH = 530234; // Daily accretion (+₦530,234 Naira per day)
export const LIQUIDITY_ANCHOR_DATE = '2026-09-02T00:00:00.000Z'; // Reference baseline anchor

export function calculateDailyLiquidity(virtualDayOffset: number = 0): number {
  const anchorTime = new Date(LIQUIDITY_ANCHOR_DATE).getTime();
  const now = Date.now();
  const calendarDays = Math.max(0, Math.floor((now - anchorTime) / (1000 * 60 * 60 * 24)));
  const totalDays = calendarDays + virtualDayOffset;
  return BASE_LIQUIDITY_RESERVE + (totalDays * DAILY_LIQUIDITY_GROWTH);
}

const DEFAULT_SETTINGS: SystemSettings = {
  liquidityReserve: calculateDailyLiquidity(0), // Dynamic reserve backing (+₦530,234 daily)
  dailyLiquidityGrowth: DAILY_LIQUIDITY_GROWTH,
  riskAlertLevel: 'low',
  minWithdrawal: 5000,
  maxWithdrawal: 1000000,
  autoApproveDeposits: false,
  isMaintenanceMode: false,
  pauseInvestments: false,
  pauseWithdrawals: false,
  dailyTaskEnabled: true,
  dailyTaskBonusRate: 0.05, // 5% of weekly payout
  dailyTaskBaseReward: 200, // ₦200 base for users with no active plan
  dailyTaskStreakBonus: 1500, // ₦1,500 bonus for 7-day streak
  freeStarterWithdrawalLimit: 3000, // ₦3,000 max free starter cashout
  rewardedAdBonusMultiplier: 2, // 2x yield booster on video ad view
  estimatedAdRevenueTotal: 284500 // Simulated external advertiser revenue pool
};

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pm_prod_users_v1');
    const parsed = saved ? JSON.parse(saved) : null;
    const defaultSeed = getSeedUsers();
    
    if (!parsed) return defaultSeed;

    // Dynamically update existing seeded admin in case user updated VITE_ADMIN_EMAIL
    const adminIndex = parsed.findIndex((u: any) => u.id === 'usr_admin' || u.role === 'admin');
    if (adminIndex > -1) {
      parsed[adminIndex].email = ADMIN_EMAIL.toLowerCase().trim();
    } else {
      parsed.push(defaultSeed[0]);
    }

    // Dynamically inject demo user if missing or outdated in old localStorage
    const demoIndex = parsed.findIndex((u: any) => u.id === 'usr_demo_investor');
    if (demoIndex === -1) {
      const demoUser = defaultSeed.find(u => u.id === 'usr_demo_investor');
      if (demoUser) parsed.push(demoUser);
    } else {
      const demoUser = defaultSeed.find(u => u.id === 'usr_demo_investor');
      if (demoUser) {
        parsed[demoIndex].email = demoUser.email;
        parsed[demoIndex].password = demoUser.password;
      }
    }

    return parsed;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pm_prod_current_user_v1');
    return saved ? JSON.parse(saved) : null; 
  });

  const [investments, setInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('pm_prod_investments_v1');
    return saved ? JSON.parse(saved) : SEED_INVESTMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pm_prod_transactions_v1');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('pm_prod_settings_v1');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [currentWeek, setCurrentWeek] = useState<number>(() => {
    const saved = localStorage.getItem('pm_prod_current_week_v1');
    return saved ? Number(saved) : 1;
  });

  // Daily Tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(DEFAULT_DAILY_TASKS);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>(() => {
    const saved = localStorage.getItem('pm_prod_task_submissions_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [userDailyProgress, setUserDailyProgress] = useState<Record<string, UserDailyProgress>>(() => {
    const saved = localStorage.getItem('pm_prod_daily_progress_v1');
    return saved ? JSON.parse(saved) : {};
  });
  const [virtualDayOffset, setVirtualDayOffset] = useState<number>(() => {
    const saved = localStorage.getItem('pm_prod_virtual_day_v1');
    return saved ? Number(saved) : 0;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Payout Notification Toasts
  const [payoutToasts, setPayoutToasts] = useState<PayoutToastData[]>([]);

  // Periodic calendar tick to ensure reserve updates daily
  const [calendarTick, setCalendarTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCalendarTick(prev => prev + 1);
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const dismissPayoutToast = (id: string) => {
    setPayoutToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerPayoutToast = (toastData: Omit<PayoutToastData, 'id' | 'timestamp'>) => {
    const newToast: PayoutToastData = {
      ...toastData,
      id: 'toast_payout_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setPayoutToasts(prev => [newToast, ...prev]);
    playPayoutChime();
  };

  // Supabase states
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'loading' | 'connected' | 'error' | 'not_configured'>('idle');
  const [isDbLoaded, setIsDbLoaded] = useState<boolean>(false);

  // Initialize and Fetch from Supabase
  useEffect(() => {
    const initSupabase = async () => {
      if (!isSupabaseConfigured()) {
        setSupabaseStatus('not_configured');
        setIsDbLoaded(true);
        return;
      }

      setSupabaseStatus('loading');
      try {
        const dbData = await fetchAllSupabaseData();

        if (dbData) {
          setSupabaseStatus('connected');
          
          if (dbData.users.length === 0) {
            console.log('Seeding Supabase with default admin...');
            // Seed base users
            const defaultSeed = getSeedUsers();
            await syncMultipleUsersToSupabase(defaultSeed);
            setUsers(defaultSeed);
            // Sync default settings and current week
            await syncSettingsToSupabase(settings);
            await syncWeekToSupabase(currentWeek);
          } else {
            // Load state from remote DB
            const loadedUsers = [...dbData.users];
            const defaultSeed = getSeedUsers();

            // Dynamically update existing seeded admin in case user updated VITE_ADMIN_EMAIL
            const adminIndex = loadedUsers.findIndex((u: any) => u.id === 'usr_admin' || u.role === 'admin');
            if (adminIndex > -1) {
              loadedUsers[adminIndex].email = ADMIN_EMAIL.toLowerCase().trim();
            } else {
              loadedUsers.push(defaultSeed[0]);
            }

            // Dynamically inject demo user if missing or outdated in remote database
            const demoIndex = loadedUsers.findIndex((u: any) => u.id === 'usr_demo_investor');
            if (demoIndex === -1) {
              const demoUser = defaultSeed.find(u => u.id === 'usr_demo_investor');
              if (demoUser) loadedUsers.push(demoUser);
            } else {
              const demoUser = defaultSeed.find(u => u.id === 'usr_demo_investor');
              if (demoUser) {
                loadedUsers[demoIndex].email = demoUser.email;
                loadedUsers[demoIndex].password = demoUser.password;
              }
            }

            setUsers(loadedUsers);
            setInvestments(dbData.investments);
            setTransactions(dbData.transactions);
            if (dbData.settings) {
              setSettings(prev => ({ ...prev, ...dbData.settings }));
            }
            if (dbData.currentWeek !== null) {
              setCurrentWeek(dbData.currentWeek);
            }

            // Refresh currentUser reference
            const savedUser = localStorage.getItem('pm_prod_current_user_v1');
            if (savedUser) {
              try {
                const parsed = JSON.parse(savedUser);
                const freshUser = loadedUsers.find(u => u.id === parsed.id);
                if (freshUser) {
                  setCurrentUser(freshUser);
                } else {
                  setCurrentUser(null);
                }
              } catch (e) {
                setCurrentUser(null);
              }
            }
          }
        } else {
          setSupabaseStatus('error');
        }
      } catch (err) {
        console.error('Supabase setup exception:', err);
        setSupabaseStatus('error');
      }
      setIsDbLoaded(true);
    };

    initSupabase();
  }, []);

  // Sync to local storage and Supabase
  useEffect(() => {
    localStorage.setItem('pm_prod_users_v1', JSON.stringify(users));
    if (isDbLoaded && isSupabaseConfigured() && users.length > 0) {
      syncMultipleUsersToSupabase(users);
    }
  }, [users, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_current_user_v1', JSON.stringify(currentUser));
    if (isDbLoaded && isSupabaseConfigured() && currentUser) {
      syncUserToSupabase(currentUser);
    }
  }, [currentUser, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_investments_v1', JSON.stringify(investments));
    if (isDbLoaded && isSupabaseConfigured()) {
      syncMultipleInvestmentsToSupabase(investments);
    }
  }, [investments, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_transactions_v1', JSON.stringify(transactions));
    if (isDbLoaded && isSupabaseConfigured()) {
      syncMultipleTransactionsToSupabase(transactions);
    }
  }, [transactions, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_settings_v1', JSON.stringify(settings));
    if (isDbLoaded && isSupabaseConfigured()) {
      syncSettingsToSupabase(settings);
    }
  }, [settings, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_current_week_v1', String(currentWeek));
    if (isDbLoaded && isSupabaseConfigured()) {
      syncWeekToSupabase(currentWeek);
    }
  }, [currentWeek, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pm_prod_task_submissions_v1', JSON.stringify(taskSubmissions));
  }, [taskSubmissions]);

  useEffect(() => {
    localStorage.setItem('pm_prod_daily_progress_v1', JSON.stringify(userDailyProgress));
  }, [userDailyProgress]);

  useEffect(() => {
    localStorage.setItem('pm_prod_virtual_day_v1', String(virtualDayOffset));
  }, [virtualDayOffset]);


  // Recalculate liquidity and risk alert level based on stats and automated daily growth (+₦530,234 Naira/day)
  useEffect(() => {
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPayouts = transactions
      .filter((t) => (t.type === 'payout' || t.type === 'referral_bonus') && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Initial base liquidity reserve with daily growth (+₦530,234 Naira per day) + deposits - withdrawals - payouts
    const dynamicBaseReserve = calculateDailyLiquidity(virtualDayOffset);
    const activeLiquidity = dynamicBaseReserve + totalDeposits - totalWithdrawals - totalPayouts;
    
    // Risk assessment
    let risk: 'low' | 'medium' | 'high' = 'low';
    const pendingWithdrawalSum = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    if (activeLiquidity < 50000000 || pendingWithdrawalSum > activeLiquidity * 0.4) {
      risk = 'high';
    } else if (activeLiquidity < 65000000 || pendingWithdrawalSum > activeLiquidity * 0.2) {
      risk = 'medium';
    }

    if (
      settings.liquidityReserve !== activeLiquidity || 
      settings.riskAlertLevel !== risk || 
      settings.dailyLiquidityGrowth !== DAILY_LIQUIDITY_GROWTH
    ) {
      setSettings(prev => ({
        ...prev,
        liquidityReserve: activeLiquidity,
        dailyLiquidityGrowth: DAILY_LIQUIDITY_GROWTH,
        riskAlertLevel: risk
      }));
    }
  }, [transactions, virtualDayOffset, calendarTick]);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const register = (name: string, email: string, referredByCode?: string, password?: string): boolean => {
    clearMessages();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setErrorMsg('Full legal name and email address are required.');
      return false;
    }

    // Basic email format check
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }

    // Email uniqueness check
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      setErrorMsg('An account with this email already exists. Please sign in instead.');
      return false;
    }

    if (password && password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return false;
    }

    // Normalize referral code or fall back to TREASURE_ADMIN
    const codeToUse = (referredByCode || '').trim() || 'TREASURE_ADMIN';

    // Validate referral code
    const sponsor = users.find(u => u.referralCode.toUpperCase() === codeToUse.toUpperCase());
    if (!sponsor) {
      setErrorMsg(`Invalid sponsor referral code "${codeToUse}". Please use a valid sponsor code (e.g. TREASURE_ADMIN, DEMO_INVESTOR).`);
      return false;
    }

    // Create new user
    const refCode = trimmedName.split(' ')[0].replace(/[^A-Za-z]/g, '').toUpperCase() + Math.floor(100 + Math.random() * 900);
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      password: password || undefined,
      referralCode: refCode || ('INV' + Math.floor(1000 + Math.random() * 9000)),
      referredByCode: sponsor.referralCode,
      walletBalance: 0,
      kycStatus: 'unverified',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setSuccessMsg(`Account created successfully! Welcome to PM Invest, ${trimmedName}.`);
    return true;
  };

  const login = (email: string, password?: string): boolean => {
    clearMessages();
    const normEmail = email.toLowerCase().trim();

    if (!normEmail) {
      setErrorMsg('Please enter your email address to sign in.');
      return false;
    }
    
    // If admin email, verify password
    if (normEmail === ADMIN_EMAIL.toLowerCase().trim()) {
      if (!password) {
        setErrorMsg('Administrator password is required.');
        return false;
      }
      if (password !== ADMIN_PASSWORD) {
        setErrorMsg('Incorrect administrator password.');
        return false;
      }
    }

    const user = users.find(u => u.email.toLowerCase() === normEmail);
    if (user) {
      if (user.password && user.password !== password) {
        setErrorMsg('Incorrect password. Please verify and try again.');
        return false;
      }
      setCurrentUser(user);
      setSuccessMsg(`Welcome back, ${user.name}!`);
      return true;
    }

    // Fallback: If it's the admin but they aren't seeded in the current state list yet
    if (normEmail === ADMIN_EMAIL.toLowerCase().trim()) {
      const newAdmin: User = {
        id: 'usr_admin',
        name: 'Treasure Homes Admin',
        email: normEmail,
        referralCode: 'TREASURE_ADMIN',
        walletBalance: 0,
        kycStatus: 'verified',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [newAdmin, ...prev.filter(u => u.id !== 'usr_admin')]);
      setCurrentUser(newAdmin);
      setSuccessMsg('Logged in successfully as Treasure Homes Admin.');
      return true;
    }

    setErrorMsg('No account found with this email address. Please register a new account.');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSuccessMsg('Logged out successfully.');
  };

  const switchUser = (userId: string) => {
    clearMessages();
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setSuccessMsg(`Switched view to ${user.name} (${user.role.toUpperCase()})`);
    }
  };

  const submitDeposit = (amount: number, method: string, accountDetails: string, proofUrl?: string) => {
    clearMessages();
    if (!currentUser) return;

    if (currentUser.id === 'usr_demo_investor') {
      setErrorMsg('Demo Account Protection: Sandbox payment submission is restricted on the shared demo account. Please register a free personal account to test custom proof of payment uploads.');
      return;
    }

    if (amount <= 0) {
      setErrorMsg('Deposit amount must be greater than zero.');
      return;
    }

    const txId = 'tx_' + Date.now();
    const newTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'deposit',
      amount,
      status: settings.autoApproveDeposits ? 'completed' : 'pending',
      paymentMethod: method,
      accountDetails,
      proofUrl: proofUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60', // Default placeholder
      createdAt: new Date().toISOString(),
      description: `Deposit request of ₦${amount.toLocaleString()}`
    };

    setTransactions(prev => [newTx, ...prev]);

    if (settings.autoApproveDeposits) {
      // Instantly credit
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          const updated = { ...u, walletBalance: u.walletBalance + amount };
          if (currentUser.id === u.id) setCurrentUser(updated);
          return updated;
        }
        return u;
      }));
      setSuccessMsg(`Deposit of ₦${amount.toLocaleString()} has been automatically credited!`);
    } else {
      setSuccessMsg(`Deposit of ₦${amount.toLocaleString()} submitted successfully. Awaiting Treasure Homes Escrow confirmation.`);
    }
  };

  const submitWithdrawal = (amount: number, accountDetails: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (settings.pauseWithdrawals) {
      setErrorMsg('Withdrawal Restored Limit: Withdrawals are currently paused by the administrator for regular system balance checks. Please check back later.');
      return false;
    }

    if (currentUser.id === 'usr_demo_investor') {
      setErrorMsg('Demo Account Protection: Sandbox withdrawals are restricted on the shared demo account. Please register a free personal account to test custom withdrawal submissions.');
      return false;
    }

    const userActiveCapital = getUserActiveWeeklyPayout(currentUser.id);
    const progress = getUserProgress(currentUser.id);
    const freeLimit = settings.freeStarterWithdrawalLimit ?? 3000;
    const previouslyWithdrawn = progress.totalFreeEarningsWithdrawn || 0;
    const hasActivePlans = userActiveCapital > 0;

    // If user has NO active plan, allow them to withdraw up to their ₦3,000 free trial limit
    if (!hasActivePlans) {
      if (previouslyWithdrawn >= freeLimit) {
        setErrorMsg(`Starter Milestone Reached: You have successfully withdrawn your maximum free trial starter limit of ₦${freeLimit.toLocaleString()}. To unlock unlimited daily yields and larger withdrawals, please activate an investment plan.`);
        return false;
      }

      if (previouslyWithdrawn + amount > freeLimit) {
        const remainingFree = freeLimit - previouslyWithdrawn;
        setErrorMsg(`Free Trial Cap: Your remaining free starter cashout allowance is ₦${remainingFree.toLocaleString()} (out of ₦${freeLimit.toLocaleString()} max). Please adjust withdrawal amount or activate an investment plan.`);
        return false;
      }

      // Allow starter user to withdraw with a lower starter minimum (e.g., ₦1,000 or up to ₦3,000)
      const starterMin = Math.min(1000, settings.minWithdrawal);
      if (amount < starterMin) {
        setErrorMsg(`Minimum starter withdrawal limit is ₦${starterMin.toLocaleString()}`);
        return false;
      }
    } else {
      // Standard paid investor thresholds
      if (amount < settings.minWithdrawal) {
        setErrorMsg(`Minimum withdrawal limit is ₦${settings.minWithdrawal.toLocaleString()}`);
        return false;
      }

      if (amount > settings.maxWithdrawal) {
        setErrorMsg(`Maximum single withdrawal limit is ₦${settings.maxWithdrawal.toLocaleString()}`);
        return false;
      }
    }

    if (currentUser.walletBalance < amount) {
      setErrorMsg('Insufficient wallet balance.');
      return false;
    }

    if (!accountDetails.trim()) {
      setErrorMsg('Bank account details/wallet address is required.');
      return false;
    }

    // Deduct immediately on request for safety
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance - amount };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // If starter user, update their totalFreeEarningsWithdrawn
    if (!hasActivePlans) {
      setUserDailyProgress(prev => ({
        ...prev,
        [currentUser.id]: {
          ...progress,
          totalFreeEarningsWithdrawn: (progress.totalFreeEarningsWithdrawn || 0) + amount
        }
      }));
    }

    const txId = 'tx_' + Date.now();
    const newTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'withdrawal',
      amount,
      status: 'pending',
      accountDetails,
      createdAt: new Date().toISOString(),
      description: hasActivePlans 
        ? `Investment Payout Withdrawal of ₦${amount.toLocaleString()} to: ${accountDetails}`
        : `Free Starter Task Yield Withdrawal (₦3k Trial) of ₦${amount.toLocaleString()} to: ${accountDetails}`
    };

    setTransactions(prev => [newTx, ...prev]);
    setSuccessMsg(`Withdrawal of ₦${amount.toLocaleString()} submitted. Manual review pending for stability control.`);
    return true;
  };

  const purchaseInvestment = (planId: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (settings.pauseInvestments) {
      setErrorMsg('Investment Notice: Initiating new investment plans is currently paused by the administrator. Existing plans will continue to yield returns as normal.');
      return false;
    }

    if (currentUser.id === 'usr_demo_investor') {
      setErrorMsg('Demo Account Protection: Sandbox investment purchases are restricted on the shared demo account. Please register a free personal account to test custom plan acquisitions.');
      return false;
    }

    const plan = INVESTMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      setErrorMsg('Selected investment plan is invalid.');
      return false;
    }

    if (currentUser.walletBalance < plan.cost) {
      setErrorMsg(`Insufficient balance. Plan cost is ₦${plan.cost.toLocaleString()}. Your balance: ₦${currentUser.walletBalance.toLocaleString()}`);
      return false;
    }

    // Deduct balance
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance - plan.cost };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Create Investment record
    const invId = 'inv_' + Date.now();
    const newInv: UserInvestment = {
      id: invId,
      userId: currentUser.id,
      userName: currentUser.name,
      planId: plan.id,
      planName: plan.name,
      cost: plan.cost,
      weeklyPayout: plan.weeklyPayout,
      totalReturns: plan.totalReturns,
      weeksPaid: 0,
      totalWeeks: plan.weeksDuration,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Log internally
    const logTx: Transaction = {
      id: 'tx_inv_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'withdrawal', // Recorded transaction in history
      amount: plan.cost,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Purchased ${plan.name} (₦${plan.cost.toLocaleString()})`
    };

    setInvestments(prev => [...prev, newInv]);
    setTransactions(prev => [logTx, ...prev]);
    setSuccessMsg(`Successfully invested ₦${plan.cost.toLocaleString()} in ${plan.name}! Direct weekly payouts will start.`);
    return true;
  };

  const processSingleInvestmentPayout = (invId: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    const inv = investments.find(i => i.id === invId && i.userId === currentUser.id);
    if (!inv) {
      setErrorMsg('Active investment plan not found.');
      return false;
    }

    if (inv.status === 'completed' || inv.weeksPaid >= inv.totalWeeks) {
      setErrorMsg('This investment plan has already completed all scheduled weekly payouts.');
      return false;
    }

    const nextWeeksPaid = inv.weeksPaid + 1;
    const payoutAmount = inv.weeklyPayout;
    const isCompleted = nextWeeksPaid === inv.totalWeeks;
    const updatedBalance = currentUser.walletBalance + payoutAmount;

    // 1. Credit User
    const updatedUser = { ...currentUser, walletBalance: updatedBalance };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // 2. Update Investment
    const updatedInv: UserInvestment = {
      ...inv,
      weeksPaid: nextWeeksPaid,
      status: isCompleted ? 'completed' : 'active',
      lastPayoutDate: new Date().toISOString()
    };
    setInvestments(prev => prev.map(i => i.id === invId ? updatedInv : i));

    // 3. Create Transaction
    const payoutTxId = 'tx_payout_' + Date.now() + '_' + inv.id;
    const logTx: Transaction = {
      id: payoutTxId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'payout',
      amount: payoutAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Weekly payout: ${inv.planName} (Week ${nextWeeksPaid}/${inv.totalWeeks})`
    };
    setTransactions(prev => [logTx, ...prev]);

    // 4. Trigger slide-in notification toast
    triggerPayoutToast({
      planName: inv.planName,
      amount: payoutAmount,
      weeksPaid: nextWeeksPaid,
      totalWeeks: inv.totalWeeks,
      walletBalance: updatedBalance,
      type: 'payout'
    });

    // 5. If investor was referred, credit sponsor 20% bonus
    if (currentUser.referredByCode) {
      const sponsorUser = users.find(u => u.referralCode === currentUser.referredByCode);
      if (sponsorUser) {
        const bonusAmount = payoutAmount * 0.2;
        const updatedSponsorBal = sponsorUser.walletBalance + bonusAmount;
        setUsers(prev => prev.map(u => u.id === sponsorUser.id ? { ...u, walletBalance: updatedSponsorBal } : u));
        
        const bonusTxId = 'tx_ref_bonus_' + Date.now() + '_' + inv.id;
        const refTx: Transaction = {
          id: bonusTxId,
          userId: sponsorUser.id,
          userName: sponsorUser.name,
          type: 'referral_bonus',
          amount: bonusAmount,
          status: 'completed',
          createdAt: new Date().toISOString(),
          description: `20% Referral bonus from ${currentUser.name}'s ${inv.planName} weekly payout`
        };
        setTransactions(prev => [refTx, ...prev]);
      }
    }

    setSuccessMsg(`₦${payoutAmount.toLocaleString()} weekly yield credited directly to your wallet!`);
    return true;
  };

  const submitKyc = (fullName: string, idType: string, idNumber: string) => {
    clearMessages();
    if (!currentUser) return;

    if (!fullName.trim() || !idType || !idNumber.trim()) {
      setErrorMsg('All KYC details are required.');
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated: User = {
          ...u,
          kycStatus: 'pending',
          kycDetails: { fullName, idType, idNumber }
        };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    setSuccessMsg('KYC documents submitted. Treasure Homes compliance team will review shortly.');
  };

  // Admin approval workflow
  const approveDeposit = (txId: string) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'deposit' || tx.status !== 'pending') return;

    // Update transaction
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'completed' } : t));

    // Credit user wallet
    setUsers(prev => prev.map(u => {
      if (u.id === tx.userId) {
        const updated = { ...u, walletBalance: u.walletBalance + tx.amount };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    setSuccessMsg(`Approved deposit of ₦${tx.amount.toLocaleString()} for ${tx.userName}.`);
  };

  const rejectDeposit = (txId: string) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'deposit' || tx.status !== 'pending') return;

    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'rejected' } : t));
    setSuccessMsg(`Rejected deposit of ₦${tx.amount.toLocaleString()} for ${tx.userName}.`);
  };

  const approveWithdrawal = (txId: string) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') return;

    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'completed' } : t));
    setSuccessMsg(`Approved and paid withdrawal of ₦${tx.amount.toLocaleString()} for ${tx.userName}.`);
  };

  const rejectWithdrawal = (txId: string) => {
    clearMessages();
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') return;

    // Refund wallet balance!
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'rejected' } : t));
    setUsers(prev => prev.map(u => {
      if (u.id === tx.userId) {
        const updated = { ...u, walletBalance: u.walletBalance + tx.amount };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    setSuccessMsg(`Rejected and refunded withdrawal of ₦${tx.amount.toLocaleString()} for ${tx.userName}.`);
  };

  const reviewKyc = (userId: string, approve: boolean) => {
    clearMessages();
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated: User = {
          ...u,
          kycStatus: approve ? 'verified' : 'rejected'
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    setSuccessMsg(`KYC verification ${approve ? 'APPROVED' : 'REJECTED'} for selected user.`);
  };

  // Daily Task Calculation Helpers
  const getCurrentDateStr = (): string => {
    const d = new Date(Date.now() + virtualDayOffset * 86400000);
    return d.toISOString().split('T')[0];
  };

  const virtualDate = getCurrentDateStr();

  const getUserActiveWeeklyPayout = (userId: string): number => {
    return investments
      .filter(i => i.userId === userId && i.status === 'active')
      .reduce((sum, i) => sum + i.weeklyPayout, 0);
  };

  const getUserDailyPool = (userId: string): number => {
    const activeWeekly = getUserActiveWeeklyPayout(userId);
    if (activeWeekly > 0) {
      const rate = settings.dailyTaskBonusRate ?? 0.05;
      return Math.round(activeWeekly * rate);
    }
    return settings.dailyTaskBaseReward ?? 200;
  };

  const getUserDailyTaskReward = (userId: string, task: DailyTask): number => {
    if (task.fixedReward && task.rewardShare === 0) {
      return task.fixedReward;
    }
    const pool = getUserDailyPool(userId);
    return Math.max(50, Math.round(pool * task.rewardShare));
  };

  const getUserProgress = (userId: string): UserDailyProgress => {
    const today = getCurrentDateStr();
    const existing = userDailyProgress[userId];
    if (!existing || existing.currentDate !== today) {
      const prevStreak = existing ? existing.streakCount : 0;
      return {
        userId,
        currentDate: today,
        completedTaskIds: [],
        pendingSubmissionTaskIds: [],
        streakCount: prevStreak,
        lastCompletedDate: existing?.lastCompletedDate,
        streakBonusClaimedDate: existing?.streakBonusClaimedDate,
        pollAnswers: existing?.pollAnswers || {}
      };
    }
    return existing;
  };

  // Instant Task Completion (Check-in, Property Inspection, Daily Poll, Sponsored Quiz)
  const completeInstantTask = (taskId: string, answerIndex?: number, isAdBoosted?: boolean): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (!settings.dailyTaskEnabled) {
      setErrorMsg('Daily Tasks are temporarily disabled in system controls.');
      return false;
    }

    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) {
      setErrorMsg('Task not found.');
      return false;
    }

    const today = getCurrentDateStr();
    const progress = getUserProgress(currentUser.id);

    if (progress.completedTaskIds.includes(taskId)) {
      setErrorMsg('You have already completed and claimed this task today!');
      return false;
    }

    let rewardAmount = getUserDailyTaskReward(currentUser.id, task);
    if (isAdBoosted) {
      rewardAmount = rewardAmount * (settings.rewardedAdBonusMultiplier || 2);
    }

    // 1. Credit User Wallet
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance + rewardAmount };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // 2. Create Transaction Log
    const txId = 'tx_task_' + Date.now();
    const taskTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'task_reward',
      amount: rewardAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: isAdBoosted 
        ? `Daily Task Reward (2X Ad Boosted): ${task.title}`
        : `Daily Task Reward: ${task.title}`
    };
    setTransactions(prev => [taskTx, ...prev]);

    // 3. Update User Progress & Streak calculation
    const updatedCompleted = [...progress.completedTaskIds, taskId];
    const updatedBoosted = isAdBoosted 
      ? [...(progress.adBoostedTaskIds || []), taskId]
      : (progress.adBoostedTaskIds || []);
    
    // Check if user completed all primary daily instant tasks today
    const instantTaskIds = dailyTasks.filter(t => t.verificationType === 'instant').map(t => t.id);
    const allInstantDone = instantTaskIds.every(id => updatedCompleted.includes(id));
    
    let newStreak = progress.streakCount;
    let newLastCompletedDate = progress.lastCompletedDate;

    if (allInstantDone && progress.lastCompletedDate !== today) {
      newStreak = (progress.streakCount || 0) + 1;
      newLastCompletedDate = today;
    }

    const updatedPollAnswers = { ...progress.pollAnswers };
    if (answerIndex !== undefined) {
      updatedPollAnswers[taskId] = answerIndex;
    }

    const updatedProg: UserDailyProgress = {
      ...progress,
      currentDate: today,
      completedTaskIds: updatedCompleted,
      adBoostedTaskIds: updatedBoosted,
      streakCount: newStreak,
      lastCompletedDate: newLastCompletedDate,
      pollAnswers: updatedPollAnswers
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: updatedProg
    }));

    // Record simulated sponsor ad revenue for system
    setSettings(prev => ({
      ...prev,
      estimatedAdRevenueTotal: (prev.estimatedAdRevenueTotal || 0) + (isAdBoosted ? 35 : 15)
    }));

    setSuccessMsg(`🎉 Task Completed! Credited ₦${rewardAmount.toLocaleString()} to your available balance.`);
    return true;
  };

  // Apply rewarded ad boost retroactively or immediately
  const applyRewardedAdBoost = (taskId: string): boolean => {
    if (!currentUser) return false;
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return false;

    const progress = getUserProgress(currentUser.id);
    if (!progress.completedTaskIds.includes(taskId)) return false;
    if (progress.adBoostedTaskIds?.includes(taskId)) {
      setErrorMsg('You have already applied the 2x Rewarded Ad boost to this task today.');
      return false;
    }

    const baseReward = getUserDailyTaskReward(currentUser.id, task);
    const bonusDifference = baseReward * ((settings.rewardedAdBonusMultiplier || 2) - 1);

    // Credit user wallet with the bonus difference
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance + bonusDifference };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Log transaction
    const txId = 'tx_task_boost_' + Date.now();
    const boostTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'task_reward',
      amount: bonusDifference,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `2X Rewarded Ad Boost: ${task.title}`
    };
    setTransactions(prev => [boostTx, ...prev]);

    // Update progress
    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: {
        ...progress,
        adBoostedTaskIds: [...(progress.adBoostedTaskIds || []), taskId]
      }
    }));

    // Record sponsor revenue
    setSettings(prev => ({
      ...prev,
      estimatedAdRevenueTotal: (prev.estimatedAdRevenueTotal || 0) + 25
    }));

    setSuccessMsg(`⚡ 2X Ad Yield Boost Applied! Credited additional +₦${bonusDifference.toLocaleString()} to your balance.`);
    return true;
  };

  // Claim guest trial earnings when user registers or logs in
  const claimGuestTrialEarnings = (): number => {
    if (!currentUser) return 0;
    const guestStored = localStorage.getItem('pm_guest_trial_earnings');
    if (!guestStored) return 0;

    const guestAmount = Number(guestStored);
    if (guestAmount > 0) {
      // Credit to user balance
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser.id) {
          const updated = { ...u, walletBalance: u.walletBalance + guestAmount };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      }));

      // Log transaction
      const guestTx: Transaction = {
        id: 'tx_guest_claim_' + Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'task_reward',
        amount: guestAmount,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: `Claimed Guest Trial Task Earnings (+₦${guestAmount.toLocaleString()})`
      };
      setTransactions(prev => [guestTx, ...prev]);

      localStorage.removeItem('pm_guest_trial_earnings');
      setSuccessMsg(`🎁 Welcome Bonus! Successfully transferred your ₦${guestAmount.toLocaleString()} guest trial earnings to your official investment wallet.`);
      return guestAmount;
    }
    return 0;
  };

  const recordAdImpression = (adRevenue: number) => {
    setSettings(prev => ({
      ...prev,
      estimatedAdRevenueTotal: (prev.estimatedAdRevenueTotal || 0) + adRevenue
    }));
  };

  // Task Submission (e.g., Social Share proof)
  const submitTaskProof = (taskId: string, proof: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (!proof.trim()) {
      setErrorMsg('Please provide your post link, screenshot details, or proof text.');
      return false;
    }

    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return false;

    const today = getCurrentDateStr();
    const progress = getUserProgress(currentUser.id);

    if (progress.completedTaskIds.includes(taskId) || progress.pendingSubmissionTaskIds.includes(taskId)) {
      setErrorMsg('You already have a submitted or completed entry for this task today.');
      return false;
    }

    const rewardAmount = getUserDailyTaskReward(currentUser.id, task);

    const submission: TaskSubmission = {
      id: 'sub_' + Date.now(),
      taskId: task.id,
      taskTitle: task.title,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      proof: proof.trim(),
      rewardAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setTaskSubmissions(prev => [submission, ...prev]);

    // Mark as pending in progress
    const updatedProg: UserDailyProgress = {
      ...progress,
      currentDate: today,
      pendingSubmissionTaskIds: [...progress.pendingSubmissionTaskIds, taskId]
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: updatedProg
    }));

    setSuccessMsg(`Proof submitted! Treasure Homes compliance team will review and credit ₦${rewardAmount.toLocaleString()} to your wallet.`);
    return true;
  };

  // Claim 7-day Streak Jackpot Bonus
  const claimStreakBonus = (): boolean => {
    clearMessages();
    if (!currentUser) return false;

    const today = getCurrentDateStr();
    const progress = getUserProgress(currentUser.id);

    if (progress.streakCount < 7) {
      setErrorMsg(`You need a 7-day streak to claim this bonus. Current streak: ${progress.streakCount}/7 days.`);
      return false;
    }

    if (progress.streakBonusClaimedDate === today) {
      setErrorMsg('You have already claimed your 7-day streak milestone for this cycle!');
      return false;
    }

    const streakBonusAmount = settings.dailyTaskStreakBonus || 1500;

    // Credit User Wallet
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updated = { ...u, walletBalance: u.walletBalance + streakBonusAmount };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    }));

    // Log Transaction
    const streakTx: Transaction = {
      id: 'tx_streak_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'task_reward',
      amount: streakBonusAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `🔥 7-Day Consistency Streak Bonus (+₦${streakBonusAmount.toLocaleString()})`
    };
    setTransactions(prev => [streakTx, ...prev]);

    // Update Progress
    const updatedProg: UserDailyProgress = {
      ...progress,
      streakBonusClaimedDate: today,
      streakCount: 0 // Reset for next 7-day cycle
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [currentUser.id]: updatedProg
    }));

    setSuccessMsg(`🔥 Boom! 7-Day Consistency Streak Bonus of ₦${streakBonusAmount.toLocaleString()} credited to your balance!`);
    return true;
  };

  // Admin Task Submission Review Actions
  const approveTaskSubmission = (subId: string) => {
    clearMessages();
    const sub = taskSubmissions.find(s => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    // Update submission
    setTaskSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'approved', reviewedAt: new Date().toISOString() } : s));

    // Credit user wallet
    setUsers(prev => prev.map(u => {
      if (u.id === sub.userId) {
        const updated = { ...u, walletBalance: u.walletBalance + sub.rewardAmount };
        if (currentUser && currentUser.id === u.id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    // Create Transaction
    const taskTx: Transaction = {
      id: 'tx_task_sub_' + Date.now(),
      userId: sub.userId,
      userName: sub.userName,
      type: 'task_reward',
      amount: sub.rewardAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Approved Task Reward: ${sub.taskTitle}`
    };
    setTransactions(prev => [taskTx, ...prev]);

    // Update user's progress
    const today = getCurrentDateStr();
    const targetProg = userDailyProgress[sub.userId] || {
      userId: sub.userId,
      currentDate: today,
      completedTaskIds: [],
      pendingSubmissionTaskIds: [],
      streakCount: 0
    };

    const updatedProg: UserDailyProgress = {
      ...targetProg,
      pendingSubmissionTaskIds: targetProg.pendingSubmissionTaskIds.filter(id => id !== sub.taskId),
      completedTaskIds: [...targetProg.completedTaskIds, sub.taskId]
    };

    setUserDailyProgress(prev => ({
      ...prev,
      [sub.userId]: updatedProg
    }));

    setSuccessMsg(`Approved task submission from ${sub.userName} (+₦${sub.rewardAmount.toLocaleString()}).`);
  };

  const rejectTaskSubmission = (subId: string) => {
    clearMessages();
    const sub = taskSubmissions.find(s => s.id === subId);
    if (!sub || sub.status !== 'pending') return;

    setTaskSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'rejected', reviewedAt: new Date().toISOString() } : s));

    // Remove from pending in progress
    const targetProg = userDailyProgress[sub.userId];
    if (targetProg) {
      setUserDailyProgress(prev => ({
        ...prev,
        [sub.userId]: {
          ...targetProg,
          pendingSubmissionTaskIds: targetProg.pendingSubmissionTaskIds.filter(id => id !== sub.taskId)
        }
      }));
    }

    setSuccessMsg(`Rejected task submission for ${sub.userName}.`);
  };

  // Fast testing: Simulate next day (Midnight Reset & Liquidity Accretion)
  const simulateNextDay = () => {
    clearMessages();
    setVirtualDayOffset(prev => prev + 1);
    setSuccessMsg('Simulated next day! Daily tasks board has reset with fresh daily yield opportunities.');
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    clearMessages();
    setSettings(prev => ({ ...prev, ...newSettings }));
    setSuccessMsg('System settings updated successfully.');
  };

  // WEEKLY PAYOUT SIMULATOR - CRUCIAL FEATURE!
  const simulateWeek = () => {
    clearMessages();
    
    let payoutLog: string[] = [];
    let updatedUsers = [...users];
    let newTransactions: Transaction[] = [];
    let pendingToasts: PayoutToastData[] = [];

    const updatedInvestments = investments.map(inv => {
      if (inv.status === 'completed' || inv.weeksPaid >= inv.totalWeeks) {
        return inv;
      }

      const nextWeeksPaid = inv.weeksPaid + 1;
      const payoutAmount = inv.weeklyPayout;
      const isCompleted = nextWeeksPaid === inv.totalWeeks;

      // Credit the investor
      let newInvestorBal = 0;
      updatedUsers = updatedUsers.map(u => {
        if (u.id === inv.userId) {
          newInvestorBal = u.walletBalance + payoutAmount;
          return { ...u, walletBalance: newInvestorBal };
        }
        return u;
      });

      // If this investment belongs to the currently logged in user, trigger slide-in toast
      if (currentUser && currentUser.id === inv.userId) {
        pendingToasts.push({
          id: 'toast_payout_' + Date.now() + '_' + inv.id + '_' + Math.random().toString(36).substring(2, 6),
          planName: inv.planName,
          amount: payoutAmount,
          weeksPaid: nextWeeksPaid,
          totalWeeks: inv.totalWeeks,
          walletBalance: newInvestorBal,
          type: 'payout',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // Create payout transaction
      const payoutTxId = 'tx_payout_' + Date.now() + '_' + inv.id;
      newTransactions.push({
        id: payoutTxId,
        userId: inv.userId,
        userName: inv.userName,
        type: 'payout',
        amount: payoutAmount,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: `Weekly payout: ${inv.planName} (Week ${nextWeeksPaid}/${inv.totalWeeks})`
      });

      payoutLog.push(`Credited ₦${payoutAmount.toLocaleString()} to ${inv.userName} (Week ${nextWeeksPaid}/${inv.totalWeeks})`);

      // REFERRAL BONUS SYSTEM: "Users earn 20% of their referral's weekly payout."
      const investorUser = users.find(u => u.id === inv.userId);
      if (investorUser && investorUser.referredByCode) {
        const sponsorUser = updatedUsers.find(u => u.referralCode === investorUser.referredByCode);
        if (sponsorUser) {
          const bonusAmount = payoutAmount * 0.2;
          let newSponsorBal = 0;
          
          // Credit the sponsor
          updatedUsers = updatedUsers.map(u => {
            if (u.id === sponsorUser.id) {
              newSponsorBal = u.walletBalance + bonusAmount;
              return { ...u, walletBalance: newSponsorBal };
            }
            return u;
          });

          // If current logged-in user is the sponsor, trigger referral bonus slide-in toast
          if (currentUser && currentUser.id === sponsorUser.id) {
            pendingToasts.push({
              id: 'toast_ref_' + Date.now() + '_' + inv.id + '_' + Math.random().toString(36).substring(2, 6),
              planName: `20% Referral Commission (${investorUser.name})`,
              amount: bonusAmount,
              weeksPaid: nextWeeksPaid,
              totalWeeks: inv.totalWeeks,
              walletBalance: newSponsorBal,
              type: 'referral_bonus',
              sourceUserName: investorUser.name,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }

          // Create referral bonus transaction
          const bonusTxId = 'tx_ref_bonus_' + Date.now() + '_' + inv.id;
          newTransactions.push({
            id: bonusTxId,
            userId: sponsorUser.id,
            userName: sponsorUser.name,
            type: 'referral_bonus',
            amount: bonusAmount,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: `20% Referral bonus from ${investorUser.name}'s ${inv.planName} weekly payout`
          });

          payoutLog.push(`Ref Bonus: Credited ₦${bonusAmount.toLocaleString()} to sponsor ${sponsorUser.name}`);
        }
      }

      return {
        ...inv,
        weeksPaid: nextWeeksPaid,
        status: isCompleted ? 'completed' : 'active',
        lastPayoutDate: new Date().toISOString()
      };
    });

    setUsers(updatedUsers);
    setInvestments(updatedInvestments);
    setTransactions(prev => [...newTransactions, ...prev]);
    setCurrentWeek(prev => prev + 1);

    // Sync current user context state
    if (currentUser) {
      const refreshedCur = updatedUsers.find(u => u.id === currentUser.id);
      if (refreshedCur) setCurrentUser(refreshedCur);
    }

    if (pendingToasts.length > 0) {
      setPayoutToasts(prev => [...pendingToasts, ...prev]);
      playPayoutChime();
    }

    if (payoutLog.length > 0) {
      setSuccessMsg(`Week ${currentWeek + 1} payout processed! Advanced payout cycle. ${payoutLog.length} active plans received yields.`);
    } else {
      setSuccessMsg(`Week ${currentWeek + 1} payout processed. No active investments received payouts this week.`);
    }
  };

  const resetAll = () => {
    localStorage.removeItem('pm_prod_users_v1');
    localStorage.removeItem('pm_prod_current_user_v1');
    localStorage.removeItem('pm_prod_investments_v1');
    localStorage.removeItem('pm_prod_transactions_v1');
    localStorage.removeItem('pm_prod_settings_v1');
    localStorage.removeItem('pm_prod_current_week_v1');
    localStorage.removeItem('pm_prod_task_submissions_v1');
    localStorage.removeItem('pm_prod_daily_progress_v1');
    localStorage.removeItem('pm_prod_virtual_day_v1');

    setUsers(getSeedUsers());
    setCurrentUser(null);
    setInvestments(SEED_INVESTMENTS);
    setTransactions(SEED_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setTaskSubmissions([]);
    setUserDailyProgress({});
    setVirtualDayOffset(0);
    setCurrentWeek(1);
    clearMessages();
    setSuccessMsg('Platform reset to original production database state.');
  };

  return (
    <StateContext.Provider value={{
      users,
      currentUser,
      investments,
      transactions,
      settings,
      currentWeek,
      errorMsg,
      successMsg,
      supabaseStatus,
      isDbLoaded,
      dailyTasks,
      taskSubmissions,
      userDailyProgress,
      virtualDate,
      getUserActiveWeeklyPayout,
      getUserDailyPool,
      getUserDailyTaskReward,
      getUserProgress,
      register,
      login,
      logout,
      switchUser,
      submitDeposit,
      submitWithdrawal,
      purchaseInvestment,
      submitKyc,
      completeInstantTask,
      applyRewardedAdBoost,
      submitTaskProof,
      claimStreakBonus,
      claimGuestTrialEarnings,
      approveDeposit,
      rejectDeposit,
      approveWithdrawal,
      rejectWithdrawal,
      reviewKyc,
      updateSettings,
      approveTaskSubmission,
      rejectTaskSubmission,
      recordAdImpression,
      payoutToasts,
      dismissPayoutToast,
      triggerPayoutToast,
      processSingleInvestmentPayout,
      simulateWeek,
      simulateNextDay,
      resetAll,
      clearMessages
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
