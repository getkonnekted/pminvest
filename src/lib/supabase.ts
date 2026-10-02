import { createClient } from '@supabase/supabase-js';
import { User, UserInvestment, Transaction, SystemSettings } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL');
};

// Lazy initialization of Supabase client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL SCHEMA FOR SUPABASE EDITOR
 * 
 * Copy and run this script in the Supabase SQL Editor to provision the exact tables required:
 * 
  -- 1. USERS
  create table if not exists public.users (
    id text primary key,
    name text not null,
    email text unique not null,
    phone text,
    "referralCode" text not null default 'INV1000',
    "referredByCode" text,
    "walletBalance" double precision not null default 0,
    "kycStatus" text not null default 'unverified',
    "kycDetails" jsonb,
    role text not null default 'user',
    "createdAt" text not null,
    "isDeactivated" boolean not null default false
  );
  alter table public.users disable row level security;

  -- 2. INVESTMENTS
  create table if not exists public.investments (
    id text primary key,
    "userId" text not null,
    "userName" text not null,
    "planId" text not null,
    "planName" text not null,
    cost double precision not null,
    "weeklyPayout" double precision not null,
    "totalReturns" double precision not null,
    "weeksPaid" integer not null default 0,
    "totalWeeks" integer not null default 4,
    status text not null default 'active',
    "createdAt" text not null,
    "lastPayoutDate" text,
    "nextPayoutDate" text,
    "autoReinvest" boolean default false
  );
  alter table public.investments disable row level security;

  -- 3. TRANSACTIONS
  create table if not exists public.transactions (
    id text primary key,
    "userId" text not null,
    "userName" text not null,
    type text not null,
    amount double precision not null,
    status text not null,
    "paymentMethod" text,
    "accountDetails" text,
    "proofUrl" text,
    "createdAt" text not null,
    description text not null
  );
  alter table public.transactions disable row level security;

  -- 4. SETTINGS
  create table if not exists public.settings (
    id text primary key default 'system_settings',
    "liquidityReserve" double precision not null,
    "riskAlertLevel" text not null,
    "minWithdrawal" double precision not null,
    "maxWithdrawal" double precision not null,
    "autoApproveDeposits" boolean not null,
    "isMaintenanceMode" boolean not null
  );
  alter table public.settings disable row level security;

  -- 5. TASK SUBMISSIONS
  create table if not exists public.task_submissions (
    id text primary key,
    "taskId" text not null,
    "taskTitle" text not null,
    "userId" text not null,
    "userName" text not null,
    "userEmail" text not null,
    proof text not null,
    "rewardAmount" double precision not null,
    status text not null default 'pending',
    "reviewedAt" text,
    "createdAt" text not null
  );
  alter table public.task_submissions disable row level security;

  -- 6. SYSTEM STATE
  create table if not exists public.system_state (
    key text primary key,
    value text not null
  );
  alter table public.system_state disable row level security;

  -- 7. WALLET PERSISTENCE + INITIAL CREDIT AUDIT (PRODUCTION AUDIT LEDGER)
  create table if not exists public.wallets (
    id uuid primary key default gen_random_uuid(),
    user_id text not null unique,
    balance numeric(18,2) not null default 0 check (balance >= 0),
    currency text not null default 'NGN',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists public.wallet_transactions (
    id uuid primary key default gen_random_uuid(),
    wallet_id uuid not null references public.wallets(id) on delete restrict,
    user_id text not null,
    transaction_type text not null check (transaction_type in ('initial_credit', 'credit', 'debit')),
    amount numeric(18,2) not null check (amount > 0),
    balance_before numeric(18,2) not null,
    balance_after numeric(18,2) not null,
    description text,
    reference text not null unique,
    performed_by text,
    created_at timestamptz not null default now()
  );

  create index if not exists idx_wallet_transactions_user on public.wallet_transactions(user_id, created_at desc);
  create index if not exists idx_wallet_transactions_wallet on public.wallet_transactions(wallet_id, created_at desc);
 */

export interface SupabaseFetchResult {
  users: User[];
  investments: UserInvestment[];
  transactions: Transaction[];
  settings: SystemSettings | null;
  currentWeek: number | null;
}

export const fetchAllSupabaseData = async (): Promise<SupabaseFetchResult | null> => {
  if (!supabase) return null;

  try {
    const [
      { data: users, error: uErr },
      { data: investments, error: iErr },
      { data: transactions, error: tErr },
      { data: settingsData, error: sErr },
      { data: stateData, error: stErr }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('investments').select('*'),
      supabase.from('transactions').select('*').order('createdAt', { ascending: false }),
      supabase.from('settings').select('*').eq('id', 'system_settings').single(),
      supabase.from('system_state').select('*').eq('key', 'current_week').single()
    ]);

    if (uErr && uErr.code !== 'PGRST116') console.warn('Supabase users error:', uErr);
    if (iErr) console.warn('Supabase investments error:', iErr);
    if (tErr) console.warn('Supabase transactions error:', tErr);

    const currentWeekVal = stateData ? parseInt(stateData.value, 10) : null;

    return {
      users: (users as User[]) || [],
      investments: (investments as UserInvestment[]) || [],
      transactions: (transactions as Transaction[]) || [],
      settings: (settingsData as SystemSettings) || null,
      currentWeek: isNaN(Number(currentWeekVal)) ? null : Number(currentWeekVal)
    };
  } catch (error) {
    console.error('Failed to fetch from Supabase:', error);
    return null;
  }
};

export const syncUserToSupabase = async (user: User) => {
  if (!supabase) return;
  // Strip password to avoid column missing error in Supabase
  const { password, ...dbUser } = user;
  const { error } = await supabase.from('users').upsert(dbUser);
  if (error) console.error('Error syncing user:', error);
};

export const syncMultipleUsersToSupabase = async (usersList: User[]) => {
  if (!supabase || usersList.length === 0) return;
  // Strip password from all users before upserting to Supabase
  const sanitized = usersList.map(({ password, ...u }) => u);
  const { error } = await supabase.from('users').upsert(sanitized);
  if (error) console.error('Error syncing multiple users:', error);
};

export const syncInvestmentToSupabase = async (investment: UserInvestment) => {
  if (!supabase) return;
  const { error } = await supabase.from('investments').upsert(investment);
  if (error) console.error('Error syncing investment:', error);
};

export const syncMultipleInvestmentsToSupabase = async (investmentsList: UserInvestment[]) => {
  if (!supabase || investmentsList.length === 0) return;
  const { error } = await supabase.from('investments').upsert(investmentsList);
  if (error) console.error('Error syncing multiple investments:', error);
};

export const syncTransactionToSupabase = async (transaction: Transaction) => {
  if (!supabase) return;
  const { error } = await supabase.from('transactions').upsert(transaction);
  if (error) console.error('Error syncing transaction:', error);
};

export const syncMultipleTransactionsToSupabase = async (transactionsList: Transaction[]) => {
  if (!supabase || transactionsList.length === 0) return;
  const { error } = await supabase.from('transactions').upsert(transactionsList);
  if (error) console.error('Error syncing multiple transactions:', error);
};

export const syncSettingsToSupabase = async (settings: SystemSettings) => {
  if (!supabase) return;
  const { error } = await supabase.from('settings').upsert({ id: 'system_settings', ...settings });
  if (error) console.error('Error syncing settings:', error);
};

export const syncWeekToSupabase = async (week: number) => {
  if (!supabase) return;
  const { error } = await supabase.from('system_state').upsert({ key: 'current_week', value: String(week) });
  if (error) console.error('Error syncing system state current_week:', error);
};

export const recordWalletAuditToSupabase = async (audit: {
  userId: string;
  transactionType: 'initial_credit' | 'credit' | 'debit' | 'marketing_allocation';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference: string;
  performedBy?: string;
}) => {
  if (!supabase) return;
  try {
    // 1. Ensure wallet row exists
    await supabase.from('wallets').upsert({
      user_id: audit.userId,
      balance: audit.balanceAfter,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    // 2. Fetch wallet id
    const { data: walletData } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', audit.userId)
      .single();

    if (walletData?.id) {
      await supabase.from('wallet_transactions').insert({
        wallet_id: walletData.id,
        user_id: audit.userId,
        transaction_type: audit.transactionType,
        amount: audit.amount,
        balance_before: audit.balanceBefore,
        balance_after: audit.balanceAfter,
        description: audit.description,
        reference: audit.reference,
        performed_by: audit.performedBy || null
      });
    }
  } catch (err) {
    console.warn('Wallet audit log notice:', err);
  }
};
