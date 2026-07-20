import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, InvestmentPlan, UserInvestment, Transaction, SystemSettings, INVESTMENT_PLANS } from '../types';

interface StateContextType {
  users: User[];
  currentUser: User | null;
  investments: UserInvestment[];
  transactions: Transaction[];
  settings: SystemSettings;
  currentWeek: number;
  errorMsg: string | null;
  successMsg: string | null;
  
  // Auth actions
  register: (name: string, email: string, referredByCode: string) => boolean;
  login: (email: string) => boolean;
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

const SEED_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Treasure Homes Admin',
    email: 'admin@treasurehomes.com',
    referralCode: 'TREASURE_ADMIN',
    walletBalance: 2500000,
    kycStatus: 'verified',
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'usr_ola',
    name: 'Chief Ola Williams',
    email: 'ola@gmail.com',
    referralCode: 'OLA500',
    walletBalance: 185000,
    kycStatus: 'verified',
    kycDetails: {
      fullName: 'Olatunji Williams',
      idType: 'National ID Card',
      idNumber: 'NIN-7649204732'
    },
    role: 'user',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'usr_emeka',
    name: 'Emeka Obi',
    email: 'emeka@gmail.com',
    referralCode: 'EMEKA12',
    referredByCode: 'OLA500',
    walletBalance: 24500,
    kycStatus: 'verified',
    kycDetails: {
      fullName: 'Emeka Chukwudi Obi',
      idType: "Driver's License",
      idNumber: 'DL-84739203'
    },
    role: 'user',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'usr_fatima',
    name: 'Fatima Yusuf',
    email: 'fatima@gmail.com',
    referralCode: 'FATIMA99',
    referredByCode: 'EMEKA12',
    walletBalance: 0,
    kycStatus: 'pending',
    kycDetails: {
      fullName: 'Fatima Yusuf',
      idType: 'International Passport',
      idNumber: 'PP-94820384'
    },
    role: 'user',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_INVESTMENTS: UserInvestment[] = [
  {
    id: 'inv_ola_1',
    userId: 'usr_ola',
    userName: 'Chief Ola Williams',
    planId: 'plan_4',
    planName: 'Plan 4',
    cost: 270000,
    weeklyPayout: 191228,
    totalReturns: 764910,
    weeksPaid: 2,
    totalWeeks: 4,
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastPayoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inv_emeka_1',
    userId: 'usr_emeka',
    userName: 'Emeka Obi',
    planId: 'plan_2',
    planName: 'Plan 2',
    cost: 45000,
    weeklyPayout: 43121,
    totalReturns: 172485,
    weeksPaid: 1,
    totalWeeks: 4,
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastPayoutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_ola_dep',
    userId: 'usr_ola',
    userName: 'Chief Ola Williams',
    type: 'deposit',
    amount: 500000,
    status: 'completed',
    paymentMethod: 'Bank Transfer (Treasure Homes Escrow)',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Initial capital deposit'
  },
  {
    id: 'tx_ola_inv',
    userId: 'usr_ola',
    userName: 'Chief Ola Williams',
    type: 'withdrawal', // Recorded as a deduction to buy plan
    amount: 270000,
    status: 'completed',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Purchased Plan 4 (₦270,000)'
  },
  {
    id: 'tx_emeka_dep',
    userId: 'usr_emeka',
    userName: 'Emeka Obi',
    type: 'deposit',
    amount: 100000,
    status: 'completed',
    paymentMethod: 'Bank Transfer (Treasure Homes Escrow)',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Capital deposit'
  },
  {
    id: 'tx_emeka_inv',
    userId: 'usr_emeka',
    userName: 'Emeka Obi',
    type: 'withdrawal',
    amount: 45000,
    status: 'completed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Purchased Plan 2 (₦45,000)'
  },
  {
    id: 'tx_payout_ola_1',
    userId: 'usr_ola',
    userName: 'Chief Ola Williams',
    type: 'payout',
    amount: 191228,
    status: 'completed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Weekly payout: Plan 4 (Week 1/4)'
  },
  {
    id: 'tx_payout_ola_2',
    userId: 'usr_ola',
    userName: 'Chief Ola Williams',
    type: 'payout',
    amount: 191228,
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Weekly payout: Plan 4 (Week 2/4)'
  },
  {
    id: 'tx_payout_emeka_1',
    userId: 'usr_emeka',
    userName: 'Emeka Obi',
    type: 'payout',
    amount: 43121,
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Weekly payout: Plan 2 (Week 1/4)'
  },
  {
    id: 'tx_ref_ola_1',
    userId: 'usr_ola',
    userName: 'Chief Ola Williams',
    type: 'referral_bonus',
    amount: 21560.5, // 50% of Emeka's weekly payout (₦43,121 * 0.5)
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: "50% Referral bonus from Emeka Obi's Plan 2 Weekly Payout"
  },
  {
    id: 'tx_fatima_pending',
    userId: 'usr_fatima',
    userName: 'Fatima Yusuf',
    type: 'deposit',
    amount: 15000,
    status: 'pending',
    paymentMethod: 'Bank Transfer (Treasure Homes Escrow)',
    proofUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    description: 'Deposit for Plan 1 activation'
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  liquidityReserve: 15000000, // Total reserve backing (Treasure Homes Backed)
  riskAlertLevel: 'low',
  minWithdrawal: 5000,
  maxWithdrawal: 1000000,
  autoApproveDeposits: false,
  isMaintenanceMode: false
};

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pm_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pm_current_user');
    // Default to the first regular investor for preview, or admin
    return saved ? JSON.parse(saved) : SEED_USERS[1]; 
  });

  const [investments, setInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('pm_investments');
    return saved ? JSON.parse(saved) : SEED_INVESTMENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pm_transactions');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('pm_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentWeek, setCurrentWeek] = useState<number>(() => {
    const saved = localStorage.getItem('pm_current_week');
    return saved ? Number(saved) : 2;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pm_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pm_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('pm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pm_current_week', String(currentWeek));
  }, [currentWeek]);

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

    // Initial base liquidity reserve (₦15,000,000) + deposits - withdrawals - payouts
    const activeLiquidity = 15000000 + totalDeposits - totalWithdrawals - totalPayouts;
    
    // Risk assessment
    let risk: 'low' | 'medium' | 'high' = 'low';
    const pendingWithdrawalSum = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    if (activeLiquidity < 10000000 || pendingWithdrawalSum > activeLiquidity * 0.4) {
      risk = 'high';
    } else if (activeLiquidity < 12000000 || pendingWithdrawalSum > activeLiquidity * 0.2) {
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

  const register = (name: string, email: string, referredByCode: string): boolean => {
    clearMessages();

    if (!name.trim() || !email.trim() || !referredByCode.trim()) {
      setErrorMsg('All registration fields are required.');
      return false;
    }

    // Email uniqueness check
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg('This email is already registered.');
      return false;
    }

    // Validate referral code
    const sponsor = users.find(u => u.referralCode.toUpperCase() === referredByCode.toUpperCase());
    if (!sponsor) {
      setErrorMsg(`Invalid referral code. A valid sponsor referral code is required.`);
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

  const login = (email: string): boolean => {
    clearMessages();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setSuccessMsg(`Logged in successfully as ${user.name}.`);
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
    localStorage.removeItem('pm_users');
    localStorage.removeItem('pm_current_user');
    localStorage.removeItem('pm_investments');
    localStorage.removeItem('pm_transactions');
    localStorage.removeItem('pm_settings');
    localStorage.removeItem('pm_current_week');

    setUsers(SEED_USERS);
    setCurrentUser(SEED_USERS[1]); // Ola (Sponsor/User)
    setInvestments(SEED_INVESTMENTS);
    setTransactions(SEED_TRANSACTIONS);
    setSettings(DEFAULT_SETTINGS);
    setCurrentWeek(2);
    clearMessages();
    setSuccessMsg('Platform reset to original seeded demo database state.');
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
