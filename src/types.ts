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

export interface UserInvestment {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  propertyName?: string;
  propertyLocation?: string;
  propertyAddress?: string;
  propertyImage?: string;
  propertyType?: string;
  occupancyRate?: string;
  deedTier?: string;
  cadastralId?: string;
  makaniNumber?: string;
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
  propertyName: string;
  propertyLocation: string;
  propertyAddress: string;
  propertyImage: string;
  propertyType: string;
  occupancyRate: string;
  deedTier: string;
  cadastralId: string;
  makaniNumber: string;
  cost: number;
  totalReturns: number;
  weeklyPayout: number;
  weeksDuration: number;
  deedReferenceCode?: string;
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'plan_1',
    name: 'Marina Bay Residences',
    propertyName: 'Marina Bay Residences',
    propertyLocation: 'Dubai Marina, Dubai, UAE',
    propertyAddress: 'Plot 392-581, Marina Promenade, Al Marsa Street, Dubai Marina, Dubai, UAE',
    propertyImage: '/properties/marina_bay_residences.jpg',
    propertyType: 'Executive Studio Waterfront Stake',
    occupancyRate: '98.4%',
    deedTier: 'Marina Bay Co-Ownership Deed (₦30,000 Tier)',
    cadastralId: 'DLD-CAD-392-581',
    makaniNumber: '12845 76291',
    cost: 30000,
    totalReturns: 156000,
    weeklyPayout: 6500,
    weeksDuration: 24
  },
  {
    id: 'plan_2',
    name: 'Creek Horizon Suites',
    propertyName: 'Creek Horizon Suites',
    propertyLocation: 'Dubai Creek Harbour, Dubai, UAE',
    propertyAddress: 'Plot 184-210, Creek Island Boulevard, Dubai Creek Harbour, The Lagoons, Dubai, UAE',
    propertyImage: '/properties/creek_horizon_suites.jpg',
    propertyType: '1-Bedroom Waterfront Apartment',
    occupancyRate: '97.2%',
    deedTier: 'Creek Horizon Co-Ownership Deed (₦60,000 Tier)',
    cadastralId: 'DLD-CAD-184-210',
    makaniNumber: '14592 88201',
    cost: 60000,
    totalReturns: 312000,
    weeklyPayout: 13000,
    weeksDuration: 24
  },
  {
    id: 'plan_3',
    name: 'Downtown Sky Vista',
    propertyName: 'Downtown Sky Vista',
    propertyLocation: 'Downtown Burj Khalifa District, Dubai, UAE',
    propertyAddress: 'Plot 119-969, Sheikh Mohammed bin Rashid Boulevard, Downtown Dubai, Dubai, UAE',
    propertyImage: '/properties/downtown_sky_vista.jpg',
    propertyType: 'Serviced Luxury Residence Stake',
    occupancyRate: '99.1%',
    deedTier: 'Downtown Sky Co-Ownership Deed (₦120,000 Tier)',
    cadastralId: 'DLD-CAD-119-969',
    makaniNumber: '11894 92051',
    cost: 120000,
    totalReturns: 624000,
    weeklyPayout: 26000,
    weeksDuration: 24
  },
  {
    id: 'plan_4',
    name: 'Sobha Sanctuary Estates',
    propertyName: 'Sobha Sanctuary Estates',
    propertyLocation: 'Sobha Hartland / MBR City, Dubai, UAE',
    propertyAddress: 'Plot 440-112, Ras Al Khor Road, Sobha Hartland, Mohammed Bin Rashid Al Maktoum City, Dubai, UAE',
    propertyImage: '/properties/sobha_sanctuary_estates.jpg',
    propertyType: '2-Bedroom Forest Villa Stake',
    occupancyRate: '96.8%',
    deedTier: 'Sobha Sanctuary Co-Ownership Deed (₦250,000 Tier)',
    cadastralId: 'DLD-CAD-440-112',
    makaniNumber: '16402 71830',
    cost: 250000,
    totalReturns: 1300000,
    weeklyPayout: 54166,
    weeksDuration: 24
  },
  {
    id: 'plan_5',
    name: 'Palm Azure Ocean Villa',
    propertyName: 'Palm Azure Ocean Villa',
    propertyLocation: 'Palm Jumeirah, Dubai, UAE',
    propertyAddress: 'Plot 512-404, Crescent Road West, Frond G, Palm Jumeirah, Dubai, UAE',
    propertyImage: '/properties/palm_azure_villa.jpg',
    propertyType: 'Ultra-Luxury Waterfront Residence',
    occupancyRate: '98.9%',
    deedTier: 'Palm Azure Co-Ownership Deed (₦600,000 Tier)',
    cadastralId: 'DLD-CAD-512-404',
    makaniNumber: '10382 64920',
    cost: 600000,
    totalReturns: 3120000,
    weeklyPayout: 130000,
    weeksDuration: 24
  },
  {
    id: 'plan_6',
    name: 'Emirates Financial Tower',
    propertyName: 'Emirates Financial Tower',
    propertyLocation: 'DIFC Financial District, Dubai, UAE',
    propertyAddress: 'Plot 884-219, Al Sa\'ada Street, DIFC Gate Precinct 4, Dubai International Financial Centre, Dubai, UAE',
    propertyImage: '/properties/emirates_tower_difc.jpg',
    propertyType: 'Prime Grade-A Commercial Asset',
    occupancyRate: '99.4%',
    deedTier: 'Emirates Tower Co-Ownership Deed (₦1,500,000 Tier)',
    cadastralId: 'DLD-CAD-884-219',
    makaniNumber: '18290 83910',
    cost: 1500000,
    totalReturns: 7800000,
    weeklyPayout: 325000,
    weeksDuration: 24
  }
];
