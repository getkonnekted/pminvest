export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
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
  isDeactivated?: boolean;
  isMarketingAccount?: boolean;
  marketingAllocatedBalance?: number;
  isTimerLocked?: boolean;
  points?: number;
  dailyGamesHistory?: {
    lastWheelDate?: string;
    lastChestDate?: string;
    streak?: number;
  };
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
  propertyName?: string;
  propertyLocation?: string;
  propertyType?: string;
  deedTier?: string;
  deedReferenceCode?: string;
  cost: number;
  weeklyPayout: number;
  totalReturns: number;
  weeksPaid: number;
  totalWeeks: number;
  status: 'active' | 'completed';
  createdAt: string;
  lastPayoutDate?: string;
  nextPayoutDate?: string;
  autoReinvest?: boolean;
  autoReinvestLockedUntil?: string;
  isMarketing?: boolean;
  isTimerLocked?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'payout' | 'referral_bonus' | 'task_reward' | 'rollover_bonus' | 'game_reward';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  paymentMethod?: string;
  accountDetails?: string;
  proofUrl?: string; // Mock uploaded proof image
  gatewayReference?: string;
  gatewayChannel?: string;
  createdAt: string;
  description: string;
  isMarketing?: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  subtitle: string;
  category: 'attendance' | 'portfolio' | 'reinvest' | 'kyc' | 'social_share' | 'inspection' | 'pulse' | 'quiz' | 'milestone';
  rewardShare: number; // Share of daily reward pool (e.g., 0.4 for 40%, 0.3 for 30%)
  fixedReward?: number; // Optional fixed fallback or milestone bonus
  verificationType: 'instant' | 'submission';
  actionLabel: string;
  sponsorName?: string;
  sponsorBadge?: string;
  detailsContent?: {
    headline?: string;
    propertyName?: string;
    location?: string;
    progressPercentage?: number;
    paragraphs?: string[];
    keyTakeaway?: string;
    pollQuestion?: string;
    pollOptions?: { text: string; votes: number }[];
    shareTemplate?: string;
    quizQuestions?: {
      id: string;
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
    }[];
  };
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  proof: string;
  rewardAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
}

export interface UserDailyProgress {
  userId: string;
  currentDate: string; // YYYY-MM-DD
  completedTaskIds: string[];
  pendingSubmissionTaskIds: string[];
  streakCount: number;
  lastCompletedDate?: string;
  streakBonusClaimedDate?: string;
  pollAnswers?: Record<string, number>;
  quizScores?: Record<string, number>;
  adBoostedTaskIds?: string[];
  totalFreeEarningsWithdrawn?: number; // Tracks cumulative free starter earnings withdrawn (max ₦3,000)
}

export interface PayoutToastData {
  id: string;
  planName: string;
  amount: number;
  weeksPaid: number;
  totalWeeks: number;
  walletBalance: number;
  type: 'payout' | 'referral_bonus';
  timestamp: string;
  sourceUserName?: string;
}

export interface LiveActivityItem {
  id: string;
  type: 'purchase' | 'payout' | 'deposit' | 'reserve' | 'kyc';
  title: string;
  message: string;
  amount?: number;
  timeAgo: string;
  location?: string;
  iconType: 'investment' | 'payout' | 'deposit' | 'reserve' | 'verified';
  avatarInitials?: string;
  timestamp: number;
}

export interface SystemSettings {
  liquidityReserve: number;
  dailyLiquidityGrowth: number;
  hourlyLiquidityGrowth?: number;
  riskAlertLevel: 'low' | 'medium' | 'high';
  minWithdrawal: number;
  maxWithdrawal: number;
  autoApproveDeposits: boolean;
  automatedPayouts: boolean;
  paystackTestMode: boolean;
  isMaintenanceMode: boolean;
  pauseInvestments: boolean;
  pauseWithdrawals: boolean;
  dailyTaskEnabled: boolean;
  dailyTaskBonusRate: number; // e.g. 0.05 for 5% of weekly payout
  dailyTaskBaseReward: number; // e.g. 200 for users without active plans
  dailyTaskStreakBonus: number; // e.g. 1500 for 7-day streak
  freeStarterWithdrawalLimit: number; // e.g. 3000 naira max for users without active plans
  rewardedAdBonusMultiplier: number; // e.g. 2 for 2x yield
  estimatedAdRevenueTotal: number; // in NGN or USD
  enableLiveActivityToasts?: boolean; // Live purchase & activity social proof alerts
}

export interface InvestmentPlan {
  id: string;
  name: string;
  propertyName?: string;
  propertyLocation?: string;
  propertyType?: string;
  occupancyRate?: string;
  deedTier?: string;
  cost: number;
  totalReturns: number;
  weeklyPayout: number;
  weeksDuration: number;
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'plan_1',
    name: 'Plan 1',
    propertyName: 'Marina Bay Residences',
    propertyLocation: 'Dubai Marina 🇦🇪',
    propertyType: 'Executive Studio Waterfront Stake',
    occupancyRate: '98.4%',
    deedTier: 'Marina Bay Tier (₦30,000 Co-Owner)',
    cost: 30000,
    totalReturns: 156000,
    weeklyPayout: 6500,
    weeksDuration: 24
  },
  {
    id: 'plan_2',
    name: 'Plan 2',
    propertyName: 'Creek Horizon Suites',
    propertyLocation: 'Dubai Creek Harbour 🇦🇪',
    propertyType: '1-Bedroom Waterfront Apartment',
    occupancyRate: '97.2%',
    deedTier: 'Creek Horizon Tier (₦60,000 Co-Owner)',
    cost: 60000,
    totalReturns: 312000,
    weeklyPayout: 13000,
    weeksDuration: 24
  },
  {
    id: 'plan_3',
    name: 'Plan 3',
    propertyName: 'Downtown Sky Vista',
    propertyLocation: 'Downtown Burj Khalifa District 🇦🇪',
    propertyType: 'Serviced Luxury Residence Stake',
    occupancyRate: '99.1%',
    deedTier: 'Downtown Sky Tier (₦120,000 Co-Owner)',
    cost: 120000,
    totalReturns: 624000,
    weeklyPayout: 26000,
    weeksDuration: 24
  },
  {
    id: 'plan_4',
    name: 'Plan 4',
    propertyName: 'Sobha Sanctuary Estates',
    propertyLocation: 'Sobha Hartland / MBR City 🇦🇪',
    propertyType: '2-Bedroom Forest Villa Stake',
    occupancyRate: '96.8%',
    deedTier: 'Sobha Sanctuary Tier (₦250,000 Co-Owner)',
    cost: 250000,
    totalReturns: 1300000,
    weeklyPayout: 54166,
    weeksDuration: 24
  },
  {
    id: 'plan_5',
    name: 'Plan 5',
    propertyName: 'Palm Azure Ocean Villa',
    propertyLocation: 'Palm Jumeirah 🇦🇪',
    propertyType: 'Ultra-Luxury Waterfront Residence',
    occupancyRate: '98.9%',
    deedTier: 'Palm Azure Tier (₦600,000 Co-Owner)',
    cost: 600000,
    totalReturns: 3120000,
    weeklyPayout: 130000,
    weeksDuration: 24
  },
  {
    id: 'plan_6',
    name: 'Plan 6',
    propertyName: 'Emirates Financial Tower',
    propertyLocation: 'DIFC Financial District 🇦🇪',
    propertyType: 'Prime Grade-A Commercial Asset',
    occupancyRate: '99.4%',
    deedTier: 'Emirates Tower Tier (₦1,500,000 Co-Owner)',
    cost: 1500000,
    totalReturns: 7800000,
    weeklyPayout: 325000,
    weeksDuration: 24
  }
];
