import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, InvestmentPlan, UserInvestment, Transaction, SystemSettings, INVESTMENT_PLANS } from '../types';
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
  
  // Auth actions
  register: (name: string, email: string, referredByCode?: string) => boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  
  // User actions
  submitDeposit: (amount: number, method: string, accountDetails: string, proofUrl?: string) => void;
  submitWithdrawal: (amount: number, accountDetails: string) => boolean;
  purchaseInvestment: (planId: string) => boolean;
  submitKyc: (fullName: string, idType: string, idNumber: string) => void;
  
  // Admin actions
  approveDeposit: (txId: string) => void;
  rejectDeposit: (txId: string) => void;
  approveWithdrawal: (txId: string) => void;
  rejectWithdrawal: (txId: string) => void;
  reviewKyc: (userId: string, approve: boolean) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  
  // Simulator
  simulateWeek: () => void;
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

const DEFAULT_SETTINGS: SystemSettings = {
  liquidityReserve: 78387045, // Total reserve backing (Treasure Homes Backed)
  riskAlertLevel: 'low',
  minWithdrawal: 5000,
  maxWithdrawal: 1000000,
  autoApproveDeposits: false,
  isMaintenanceMode: false
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
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentWeek, setCurrentWeek] = useState<number>(() => {
    const saved = localStorage.getItem('pm_prod_current_week_v1');
    return saved ? Number(saved) : 1;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
              setSettings(dbData.settings);
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


  // Recalculate liquidity and risk alert level based on stats
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

    // Initial base liquidity reserve (₦78,387,045) + deposits - withdrawals - payouts
    const activeLiquidity = 78387045 + totalDeposits - totalWithdrawals - totalPayouts;
    
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

    if (settings.liquidityReserve !== activeLiquidity || settings.riskAlertLevel !== risk) {
      setSettings(prev => ({
        ...prev,
        liquidityReserve: activeLiquidity,
        riskAlertLevel: risk
      }));
    }
  }, [transactions]);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const register = (name: string, email: string, referredByCode?: string): boolean => {
    clearMessages();

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required.');
      return false;
    }

    // Email uniqueness check
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg('This email is already registered.');
      return false;
    }

    // Normalize referral code or fall back to TREASURE_ADMIN
    const codeToUse = (referredByCode || '').trim() || 'TREASURE_ADMIN';

    // Validate referral code
    const sponsor = users.find(u => u.referralCode.toUpperCase() === codeToUse.toUpperCase());
    if (!sponsor) {
      setErrorMsg(`Invalid referral code. Please use a valid sponsor referral code (e.g., TREASURE_ADMIN).`);
      return false;
    }

    // Create new user
    const refCode = name.split(' ')[0].toUpperCase() + Math.floor(100 + Math.random() * 900);
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      referralCode: refCode,
      referredByCode: sponsor.referralCode,
      walletBalance: 0,
      kycStatus: 'unverified',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setSuccessMsg(`Welcome to PM Invest, ${name}! Registered successfully under sponsor: ${sponsor.name}.`);
    return true;
  };

  const login = (email: string, password?: string): boolean => {
    clearMessages();
    const normEmail = email.toLowerCase().trim();
    
    // If admin email, verify password
    if (normEmail === ADMIN_EMAIL.toLowerCase().trim()) {
      if (!password) {
        setErrorMsg('Administrator password is required.');
        return false;
      }
      if (password !== ADMIN_PASSWORD) {
        setErrorMsg('Invalid administrator password.');
        return false;
      }
    }

    const user = users.find(u => u.email.toLowerCase() === normEmail);
    if (user) {
      if (user.password && user.password !== password) {
        setErrorMsg('Invalid password.');
        return false;
      }
      setCurrentUser(user);
      setSuccessMsg(`Logged in successfully as ${user.name}.`);
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

    setErrorMsg('Invalid email address.');
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
      setErrorMsg('Demo Account Protection: Simulated payment submission is restricted on the shared demo account. Please register a free personal account to test custom proof of payment uploads.');
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

    if (currentUser.id === 'usr_demo_investor') {
      setErrorMsg('Demo Account Protection: Simulated withdrawals are restricted on the shared demo account. Please register a free personal account to test custom withdrawal submissions.');
      return false;
    }

    if (amount < settings.minWithdrawal) {
      setErrorMsg(`Minimum withdrawal limit is ₦${settings.minWithdrawal.toLocaleString()}`);
      return false;
    }

    if (amount > settings.maxWithdrawal) {
      setErrorMsg(`Maximum single withdrawal limit is ₦${settings.maxWithdrawal.toLocaleString()}`);
      return false;
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
      description: `Withdrawal request of ₦${amount.toLocaleString()} to: ${accountDetails}`
    };

    setTransactions(prev => [newTx, ...prev]);
    setSuccessMsg(`Withdrawal of ₦${amount.toLocaleString()} submitted. Manual review pending for stability control.`);
    return true;
  };

  const purchaseInvestment = (planId: string): boolean => {
    clearMessages();
    if (!currentUser) return false;

    if (currentUser.id === 'usr_demo_investor') {
      setErrorMsg('Demo Account Protection: Simulated investment purchases are restricted on the shared demo account. Please register a free personal account to test custom plan acquisitions.');
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

    const updatedInvestments = investments.map(inv => {
      if (inv.status === 'completed' || inv.weeksPaid >= inv.totalWeeks) {
        return inv;
      }

      const nextWeeksPaid = inv.weeksPaid + 1;
      const payoutAmount = inv.weeklyPayout;
      const isCompleted = nextWeeksPaid === inv.totalWeeks;

      // Credit the investor
      updatedUsers = updatedUsers.map(u => {
        if (u.id === inv.userId) {
          return { ...u, walletBalance: u.walletBalance + payoutAmount };
        }
        return u;
      });

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

      // REFERRAL BONUS SYSTEM: "Users earn 50% of their referral's weekly payout."
      const investorUser = users.find(u => u.id === inv.userId);
      if (investorUser && investorUser.referredByCode) {
        const sponsorUser = updatedUsers.find(u => u.referralCode === investorUser.referredByCode);
        if (sponsorUser) {
          const bonusAmount = payoutAmount * 0.5;
          
          // Credit the sponsor
          updatedUsers = updatedUsers.map(u => {
            if (u.id === sponsorUser.id) {
              return { ...u, walletBalance: u.walletBalance + bonusAmount };
            }
            return u;
          });

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
            description: `50% Referral bonus from ${investorUser.name}'s ${inv.planName} weekly payout`
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

    if (payoutLog.length > 0) {
      setSuccessMsg(`Simulated Week ${currentWeek + 1}! Advanced payout cycle. ${payoutLog.length} actions triggered.`);
    } else {
      setSuccessMsg(`Simulated Week ${currentWeek + 1}. No active investments received payouts this week.`);
    }
  };

  const resetAll = () => {
    localStorage.removeItem('pm_prod_users_v1');
    localStorage.removeItem('pm_prod_current_user_v1');
    localStorage.removeItem('pm_prod_investments_v1');
    localStorage.removeItem('pm_prod_transactions_v1');
    localStorage.removeItem('pm_prod_settings_v1');
    localStorage.removeItem('pm_prod_current_week_v1');

    setUsers(getSeedUsers());
    setCurrentUser(null);
    setInvestments(SEED_INVESTMENTS);
    setTransactions(SEED_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
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
      register,
      login,
      logout,
      switchUser,
      submitDeposit,
      submitWithdrawal,
      purchaseInvestment,
      submitKyc,
      approveDeposit,
      rejectDeposit,
      approveWithdrawal,
      rejectWithdrawal,
      reviewKyc,
      updateSettings,
      simulateWeek,
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
