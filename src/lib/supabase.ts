import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, InvestmentPlan, UserInvestment, Transaction, SystemSettings, TaskSubmission, UserDailyProgress } from '../types';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL || '';
  const envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('pm_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('pm_supabase_anon_key') || '' : '';

  const activeUrl = (envUrl && envUrl !== 'MY_SUPABASE_URL') ? envUrl.trim() : localUrl.trim();
  const activeKey = (envKey && envKey !== 'MY_SUPABASE_ANON_KEY') ? envKey.trim() : localKey.trim();

  return {
    url: activeUrl,
    key: activeKey,
    isConfigured: !!(activeUrl && activeKey && activeUrl.startsWith('http')),
    isFromEnv: !!(envUrl && envUrl !== 'MY_SUPABASE_URL')
  };
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

// Singleton Client
let clientInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!clientInstance || url !== lastUrl || key !== lastKey) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      lastUrl = url;
      lastKey = key;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
};

export const saveSupabaseCredentials = (url: string, key: string): boolean => {
  if (typeof window === 'undefined') return false;
  const trimmedUrl = url.trim();
  const trimmedKey = key.trim();

  if (!trimmedUrl || !trimmedKey) {
    localStorage.removeItem('pm_supabase_url');
    localStorage.removeItem('pm_supabase_anon_key');
    clientInstance = null;
    return true;
  }

  localStorage.setItem('pm_supabase_url', trimmedUrl);
  localStorage.setItem('pm_supabase_anon_key', trimmedKey);
  clientInstance = null; // Forces re-creation
  return true;
};

export const supabase = getSupabaseClient();

export interface SupabaseFetchResult {
  users: User[];
  investments: UserInvestment[];
  transactions: Transaction[];
  settings: SystemSettings | null;
  currentWeek: number | null;
  taskSubmissions: TaskSubmission[];
  userDailyProgress: Record<string, UserDailyProgress>;
  investmentPlans?: InvestmentPlan[];
}

export interface SupabaseConnectionTestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
  tablesFound?: string[];
}

export const testSupabaseConnection = async (testUrl?: string, testKey?: string): Promise<SupabaseConnectionTestResult> => {
  const url = testUrl?.trim() || getSupabaseConfig().url;
  const key = testKey?.trim() || getSupabaseConfig().key;

  if (!url || !key || !url.startsWith('http')) {
    return { ok: false, message: 'Please provide a valid Supabase Project URL (https://...) and API Key.' };
  }

  const start = Date.now();
  try {
    const testClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Test a lightweight select on public.users or public.settings
    const { error, count, status } = await testClient
      .from('users')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Date.now() - start;

    if (error) {
      // Analyze error
      if (status === 401 || status === 403 || error.message.toLowerCase().includes('apikey')) {
        return { ok: false, message: `Authentication failed: Invalid Supabase anon API key (${error.message}).`, latencyMs };
      }
      if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('does not exist')) {
        return { 
          ok: false, 
          message: `Connected to Supabase, but platform tables were not found in schema public! Please run the Setup SQL Script in your Supabase SQL Editor.`, 
          latencyMs 
        };
      }
      return { ok: false, message: `Supabase query responded with error: ${error.message}`, latencyMs };
    }

    return { 
      ok: true, 
      message: `Successfully connected to Supabase in ${latencyMs}ms! Schema is online and accessible.`, 
      latencyMs 
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return { ok: false, message: `Connection failed: ${err?.message || 'Network unreachable'}`, latencyMs };
  }
};

export const fetchAllSupabaseData = async (): Promise<SupabaseFetchResult | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      { data: users, error: uErr },
      { data: investments, error: iErr },
      { data: transactions, error: tErr },
      { data: settingsData, error: sErr },
      { data: stateData, error: stErr },
      { data: taskSubs, error: subErr },
      { data: dailyProgData, error: progErr },
      { data: plansData, error: plansErr }
    ] = await Promise.all([
      client.from('users').select('*'),
      client.from('investments').select('*'),
      client.from('transactions').select('*').order('createdAt', { ascending: false }),
      client.from('settings').select('*').eq('id', 'system_settings').single(),
      client.from('system_state').select('*').eq('key', 'current_week').single(),
      client.from('task_submissions').select('*').order('createdAt', { ascending: false }),
      client.from('user_daily_progress').select('*'),
      client.from('investment_plans').select('*').order('cost', { ascending: true })
    ]);

    if (uErr && uErr.code !== 'PGRST116') console.warn('Supabase users error:', uErr);
    if (iErr) console.warn('Supabase investments error:', iErr);
    if (tErr) console.warn('Supabase transactions error:', tErr);
    if (subErr) console.warn('Supabase task submissions error:', subErr);
    if (progErr) console.warn('Supabase daily progress error:', progErr);
    if (plansErr) console.warn('Supabase investment plans error (optional):', plansErr);

    const currentWeekVal = stateData ? parseInt(stateData.value, 10) : null;

    // Convert daily progress array to Record<string, UserDailyProgress>
    const progressMap: Record<string, UserDailyProgress> = {};
    if (dailyProgData && Array.isArray(dailyProgData)) {
      dailyProgData.forEach((row: any) => {
        if (row.user_id) {
          progressMap[row.user_id] = {
            userId: row.user_id,
            currentDate: row.current_date,
            completedTaskIds: row.completed_task_ids || [],
            pendingSubmissionTaskIds: row.pending_submission_task_ids || [],
            streakCount: row.streak_count || 0,
            lastCompletedDate: row.last_completed_date,
            streakBonusClaimedDate: row.streak_bonus_claimed_date,
            pollAnswers: row.poll_answers || {},
            quizScores: row.quiz_scores || {},
            adBoostedTaskIds: row.ad_boosted_task_ids || [],
            totalFreeEarningsWithdrawn: row.total_free_earnings_withdrawn || 0
          };
        }
      });
    }

    return {
      users: (users as User[]) || [],
      investments: (investments as UserInvestment[]) || [],
      transactions: (transactions as Transaction[]) || [],
      settings: (settingsData as SystemSettings) || null,
      currentWeek: isNaN(Number(currentWeekVal)) ? null : Number(currentWeekVal),
      taskSubmissions: (taskSubs as TaskSubmission[]) || [],
      userDailyProgress: progressMap,
      investmentPlans: (plansData && plansData.length > 0) ? (plansData as InvestmentPlan[]) : undefined
    };
  } catch (error) {
    console.error('Failed to fetch from Supabase:', error);
    return null;
  }
};

/**
 * Realtime Subscription for live updates across all devices
 */
export const subscribeToSupabaseRealtime = (onUpdate: (table: string) => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('schema_live_sync_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        onUpdate('users');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investments' }, () => {
        onUpdate('investments');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        onUpdate('transactions');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        onUpdate('settings');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_state' }, () => {
        onUpdate('system_state');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_submissions' }, () => {
        onUpdate('task_submissions');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_daily_progress' }, () => {
        onUpdate('user_daily_progress');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investment_plans' }, () => {
        onUpdate('investment_plans');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
        onUpdate('wallets');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => {
        onUpdate('wallet_transactions');
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription notice:', err);
    return () => {};
  }
};

export const syncInvestmentPlansToSupabase = async (plans: InvestmentPlan[]) => {
  const client = getSupabaseClient();
  if (!client || plans.length === 0) return;
  const { error } = await client.from('investment_plans').upsert(plans);
  if (error) console.error('Error syncing investment plans to Supabase:', error);
};

export const syncUserToSupabase = async (user: User) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('users').upsert(user);
  if (error) console.error('Error syncing user:', error);
};

export const syncMultipleUsersToSupabase = async (usersList: User[]) => {
  const client = getSupabaseClient();
  if (!client || usersList.length === 0) return;
  const { error } = await client.from('users').upsert(usersList);
  if (error) console.error('Error syncing multiple users:', error);
};

const isMissingAutoRenewLockColumn = (error: { message?: string; code?: string } | null): boolean =>
  Boolean(error && (
    error.message?.includes('autoReinvestLockedUntil') ||
    error.message?.includes('auto_reinvest_locked_until') ||
    error.code === 'PGRST204'
  ));

export const syncInvestmentToSupabase = async (investment: UserInvestment) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('investments').upsert(investment);
  if (!error) return;

  if (isMissingAutoRenewLockColumn(error)) {
    const { autoReinvestLockedUntil: _lockUntil, ...legacyInvestment } = investment;
    const { error: fallbackError } = await client.from('investments').upsert(legacyInvestment);
    if (fallbackError) console.error('Error syncing investment with legacy schema:', fallbackError);
    else console.warn('Auto-renew lock is stored locally only until the database column is added.');
    return;
  }

  console.error('Error syncing investment:', error);
};

export const syncMultipleInvestmentsToSupabase = async (investmentsList: UserInvestment[]) => {
  const client = getSupabaseClient();
  if (!client || investmentsList.length === 0) return;
  const { error } = await client.from('investments').upsert(investmentsList);
  if (!error) return;

  if (isMissingAutoRenewLockColumn(error)) {
    const legacyInvestments = investmentsList.map(({ autoReinvestLockedUntil: _lockUntil, ...investment }) => investment);
    const { error: fallbackError } = await client.from('investments').upsert(legacyInvestments);
    if (fallbackError) console.error('Error syncing investments with legacy schema:', fallbackError);
    else console.warn('Auto-renew lock is stored locally only until the database column is added.');
    return;
  }

  console.error('Error syncing multiple investments:', error);
};

export const syncTransactionToSupabase = async (transaction: Transaction) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('transactions').upsert(transaction);
  if (error) console.error('Error syncing transaction:', error);
};

export const syncMultipleTransactionsToSupabase = async (transactionsList: Transaction[]) => {
  const client = getSupabaseClient();
  if (!client || transactionsList.length === 0) return;
  const { error } = await client.from('transactions').upsert(transactionsList);
  if (error) console.error('Error syncing multiple transactions:', error);
};

export const syncSettingsToSupabase = async (settings: SystemSettings) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { hourlyLiquidityGrowth, ...safeSettings } = settings as any;
  const { error } = await client.from('settings').upsert({ id: 'system_settings', ...safeSettings });
  if (error) console.error('Error syncing settings:', error);
};

export const syncWeekToSupabase = async (week: number) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('system_state').upsert({ key: 'current_week', value: String(week) });
  if (error) console.error('Error syncing system state current_week:', error);
};

export const syncTaskSubmissionToSupabase = async (submission: TaskSubmission) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('task_submissions').upsert(submission);
  if (error) console.error('Error syncing task submission:', error);
};

export const syncMultipleTaskSubmissionsToSupabase = async (submissions: TaskSubmission[]) => {
  const client = getSupabaseClient();
  if (!client || submissions.length === 0) return;
  const { error } = await client.from('task_submissions').upsert(submissions);
  if (error) console.error('Error syncing multiple task submissions:', error);
};

export const syncUserDailyProgressToSupabase = async (progress: UserDailyProgress) => {
  const client = getSupabaseClient();
  if (!client) return;
  const dbRecord = {
    user_id: progress.userId,
    current_date: progress.currentDate,
    completed_task_ids: progress.completedTaskIds || [],
    pending_submission_task_ids: progress.pendingSubmissionTaskIds || [],
    streak_count: progress.streakCount || 0,
    last_completed_date: progress.lastCompletedDate || null,
    streak_bonus_claimed_date: progress.streakBonusClaimedDate || null,
    poll_answers: progress.pollAnswers || {},
    quiz_scores: progress.quizScores || {},
    ad_boosted_task_ids: progress.adBoostedTaskIds || [],
    total_free_earnings_withdrawn: progress.totalFreeEarningsWithdrawn || 0,
    updated_at: new Date().toISOString()
  };
  const { error } = await client.from('user_daily_progress').upsert(dbRecord, { onConflict: 'user_id' });
  if (error) console.error('Error syncing daily progress:', error);
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
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('wallets').upsert({
      user_id: audit.userId,
      balance: audit.balanceAfter,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    const { data: walletData } = await client
      .from('wallets')
      .select('id')
      .eq('user_id', audit.userId)
      .single();

    if (walletData?.id) {
      await client.from('wallet_transactions').insert({
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
