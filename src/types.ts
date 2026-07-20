export interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  referredByCode?: string;
  walletBalance: number;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  kycDetails?: {
    idType: string;
    idNumber: string;
    fullName: string;
  };
  role: 'user' | 'admin';
  createdAt: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  cost: number;
  totalReturns: number;
  weeklyPayout: number;
  weeksDuration: number;
}

export interface UserInvestment {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  cost: number;
  weeklyPayout: number;
  totalReturns: number;
  weeksPaid: number;
  totalWeeks: number;
  status: 'active' | 'completed';
  createdAt: string;
  lastPayoutDate?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'payout' | 'referral_bonus';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  paymentMethod?: string;
  accountDetails?: string;
  proofUrl?: string; // Mock uploaded proof image
  createdAt: string;
  description: string;
}

export interface SystemSettings {
  liquidityReserve: number;
  riskAlertLevel: 'low' | 'medium' | 'high';
  minWithdrawal: number;
  maxWithdrawal: number;
  autoApproveDeposits: boolean;
  isMaintenanceMode: boolean;
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'plan_1',
    name: 'Plan 1',
    cost: 15000,
    totalReturns: 65000,
    weeklyPayout: 16250,
    weeksDuration: 4
  },
  {
    id: 'plan_2',
    name: 'Plan 2',
    cost: 45000,
    totalReturns: 172485,
    weeklyPayout: 43121,
    weeksDuration: 4
  },
  {
    id: 'plan_3',
    name: 'Plan 3',
    cost: 115000,
    totalReturns: 383295,
    weeklyPayout: 95824,
    weeksDuration: 4
  },
  {
    id: 'plan_4',
    name: 'Plan 4',
    cost: 270000,
    totalReturns: 764910,
    weeklyPayout: 191228,
    weeksDuration: 4
  },
  {
    id: 'plan_5',
    name: 'Plan 5',
    cost: 500000,
    totalReturns: 1166500,
    weeklyPayout: 291625,
    weeksDuration: 4
  }
];
