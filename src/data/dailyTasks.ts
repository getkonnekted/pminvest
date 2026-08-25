import { DailyTask } from '../types';

export const DEFAULT_DAILY_TASKS: DailyTask[] = [
  {
    id: 'task_property_inspect',
    title: 'Property Site Inspection',
    subtitle: 'Review Treasure Crest Phase 2 roofing & structural progress report',
    category: 'inspection',
    rewardShare: 0.40, // 40% of daily bonus pool
    verificationType: 'instant',
    actionLabel: 'Inspect & Claim Yield',
    detailsContent: {
      headline: 'Treasure Crest Phase 2 — Structural Milestone Achieved',
      propertyName: 'Treasure Crest Phase 2, Lekki-Epe Expressway, Lagos',
      location: 'Lekki Corridor, Lagos State',
      progressPercentage: 84,
      paragraphs: [
        'Our engineering site team completed the reinforced concrete roofing slabs across Blocks A & B ahead of schedule today.',
        'Interior electrical wiring and high-efficiency plumbing conduits are now 75% deployed, ensuring the planned Q4 tenant handover remains firmly on target.',
        'Independent structural valuation audit conducted this morning verified asset capital appreciation of +4.2% since ground-breaking.'
      ],
      keyTakeaway: 'Physical structural appraisal matches full collateral reserve backing for all active investor vaults.'
    }
  },
  {
    id: 'task_market_poll',
    title: 'Market Pulse & Daily Poll',
    subtitle: 'Cast your vote on prime commercial vs. residential yield corridors',
    category: 'pulse',
    rewardShare: 0.30, // 30% of daily bonus pool
    verificationType: 'instant',
    actionLabel: 'Vote & Claim Yield',
    detailsContent: {
      headline: 'Treasure Homes Daily Investor Sentiment Survey',
      pollQuestion: 'Which real estate asset class will deliver the strongest capital appreciation this quarter?',
      pollOptions: [
        { text: 'Lekki Phase 2 Luxury Residential Multi-Family', votes: 312 },
        { text: 'Commercial Logistics & E-Commerce Warehousing', votes: 194 },
        { text: 'Mixed-Use Retail & Serviced Corporate Suites', votes: 118 },
        { text: 'Strategic Land Banking along Free Trade Zone', votes: 265 }
      ],
      keyTakeaway: 'Community consensus informs PM Invest asset acquisition allocations for future payout cycles.'
    }
  },
  {
    id: 'task_daily_checkin',
    title: 'Daily Investor Attendance',
    subtitle: 'Verify your portfolio status & build your 7-day consistency streak',
    category: 'attendance',
    rewardShare: 0.30, // 30% of daily bonus pool
    verificationType: 'instant',
    actionLabel: 'Check In & Claim Yield',
    detailsContent: {
      headline: 'Daily Vault Attendance & Security Confirmation',
      paragraphs: [
        'Checking in daily confirms your active participant status, verifies the integrity of your linked vault, and advances your weekly consistency multiplier.',
        'Completing 7 consecutive days unlocks the ₦1,500 Unbroken Streak Bonus credited directly to your available balance!'
      ],
      keyTakeaway: 'Consistent engagement reinforces active investor status in Treasure Homes partner programs.'
    }
  },
  {
    id: 'task_social_share',
    title: 'Community Advocacy Bounty',
    subtitle: 'Share your Treasure Homes referral link on WhatsApp, Twitter/X or Telegram',
    category: 'social_share',
    rewardShare: 0,
    fixedReward: 500, // Fixed ₦500 bonus
    verificationType: 'submission',
    actionLabel: 'Submit Proof for Audit',
    detailsContent: {
      headline: 'Earn Extra ₦500 by Expanding the Investor Community',
      shareTemplate: 'I am earning steady weekly yields backed by physical real estate assets with PM Invest & Treasure Homes! Join with my referral code: ',
      paragraphs: [
        'Share your personalized referral code or invite link across your social or investment networks.',
        'Submit your post link, screenshot upload note, or broadcast group confirmation below for compliance verification.'
      ],
      keyTakeaway: 'Verified advocacy submissions are audited by admin and credited with an extra ₦500 bonus.'
    }
  }
];
