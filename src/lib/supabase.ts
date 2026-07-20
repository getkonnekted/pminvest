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
  -- Users Table
  create table if not exists users (
    id text primary key,
    name text not null,
    email text unique not null,
    "referralCode" text not null,
    "referredByCode" text,
    "walletBalance" double precision not null default 0,
    "kycStatus" text not null default 'unverified',
    "kycDetails" jsonb,
    role text not null default 'user',
    "createdAt" text not null
  );

  -- Investments Table
  create table if not exists investments (
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
    "lastPayoutDate" text
  );

  -- Transactions Table
  create table if not exists transactions (
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

  -- Settings Table
  create table if not exists settings (
    id text primary key default 'system_settings',
    "liquidityReserve" double precision not null,
    "riskAlertLevel" text not null,
    "minWithdrawal" double precision not null,
    "maxWithdrawal" double precision not null,
    "autoApproveDeposits" boolean not null,
    "isMaintenanceMode" boolean not null
  );

  -- System State Table
  create table if not exists system_state (
    key text primary key,
    value text not null
  );

  -- Enable RLS (or disable for simple fast testing by clicking Disable RLS in Supabase UI)
  alter table users enable row level security;
  alter table investments enable row level security;
  alter table transactions enable row level security;
  alter table settings enable row level security;
  alter table system_state enable row level security;

  -- Create permissive policies for development (replace with proper auth filters for production RLS)
  create policy "Allow all public reads" on users for select using (true);
  create policy "Allow all public inserts" on users for insert with check (true);
  create policy "Allow all public updates" on users for update using (true);

  create policy "Allow all public reads" on investments for select using (true);
  create policy "Allow all public inserts" on investments for insert with check (true);
  create policy "Allow all public updates" on investments for update using (true);

  create policy "Allow all public reads" on transactions for select using (true);
  create policy "Allow all public inserts" on transactions for insert with check (true);
  create policy "Allow all public updates" on transactions for update using (true);

  create policy "Allow all public reads" on settings for select using (true);
  create policy "Allow all public upserts" on settings for all using (true);

  create policy "Allow all public reads" on system_state for select using (true);
  create policy "Allow all public upserts" on system_state for all using (true);
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
  const { error } = await supabase.from('users').upsert(user);
  if (error) console.error('Error syncing user:', error);
};

export const syncMultipleUsersToSupabase = async (usersList: User[]) => {
  if (!supabase || usersList.length === 0) return;
  const { error } = await supabase.from('users').upsert(usersList);
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
