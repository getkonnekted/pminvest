import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, InvestmentPlan, UserInvestment, Transaction, SystemSettings, TaskSubmission, UserDailyProgress, INVESTMENT_PLANS } from '../types';

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
  // null means the investments query failed; [] means it succeeded and found no rows.
  investments: UserInvestment[] | null;
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

    const enrichedInvestments: UserInvestment[] | null = iErr ? null : ((investments as UserInvestment[]) || []).map(inv => {
      const match = INVESTMENT_PLANS.find(p => p.id === inv.planId || p.name.toLowerCase() === (inv.planName || '').toLowerCase());
      return {
        ...inv,
        propertyName: inv.propertyName || match?.propertyName || match?.name || inv.planName,
        propertyLocation: inv.propertyLocation || match?.propertyLocation || 'Dubai Marina, Dubai, UAE 🇦🇪',
        propertyAddress: inv.propertyAddress || match?.propertyAddress || 'Plot 392-581, Marina Promenade, Dubai Marina, Dubai, UAE',
        propertyImage: inv.propertyImage || match?.propertyImage || '/properties/marina_bay_residences.jpg',
        propertyType: inv.propertyType || match?.propertyType || 'Executive Luxury Asset',
        occupancyRate: inv.occupancyRate || match?.occupancyRate || '98.5%',
        deedTier: inv.deedTier || match?.deedTier || `${inv.planName} Title Deed`,
        cadastralId: inv.cadastralId || match?.cadastralId || 'DLD-CAD-392-581',
        makaniNumber: inv.makaniNumber || match?.makaniNumber || '12845 76291',
        deedReferenceCode: inv.deedReferenceCode || `UAE-DLD-2026-${inv.id.slice(-6).toUpperCase()}`
      };
    });

    return {
      users: (users as User[]) || [],
      // Never turn a failed query into an empty list: callers must preserve existing state on errors.
      investments: enrichedInvestments,
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investor_protection_logs' }, () => {
        onUpdate('investor_protection_logs');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_audit_logs' }, () => {
        onUpdate('admin_audit_logs');
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

const toCoreInvestment = (inv: UserInvestment) => ({
  id: inv.id,
  userId: inv.userId,
  userName: inv.userName,
  planId: inv.planId,
  planName: inv.planName,
  cost: inv.cost,
  weeklyPayout: inv.weeklyPayout,
  totalReturns: inv.totalReturns,
  weeksPaid: inv.weeksPaid,
  totalWeeks: inv.totalWeeks,
  status: inv.status,
  createdAt: inv.createdAt,
  lastPayoutDate: inv.lastPayoutDate || null,
  nextPayoutDate: inv.nextPayoutDate || null,
  autoReinvest: inv.autoReinvest || false,
  isMarketing: inv.isMarketing || false
});

export const syncInvestmentToSupabase = async (investment: UserInvestment) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('investments').upsert(investment);
  if (!error) return;

  // If new columns are not yet applied on remote table, fallback to core columns
  try {
    const fallbackRecord = toCoreInvestment(investment);
    const { error: fallbackError } = await client.from('investments').upsert(fallbackRecord);
    if (fallbackError) {
      console.error('Error syncing investment with fallback schema:', fallbackError);
    }
  } catch (err) {
    console.error('Error in investment fallback sync:', err);
  }
};

export const syncMultipleInvestmentsToSupabase = async (investmentsList: UserInvestment[]) => {
  const client = getSupabaseClient();
  if (!client || investmentsList.length === 0) return;
  const { error } = await client.from('investments').upsert(investmentsList);
  if (!error) return;

  try {
    const fallbackRecords = investmentsList.map(toCoreInvestment);
    const { error: fallbackError } = await client.from('investments').upsert(fallbackRecords);
    if (fallbackError) {
      console.error('Error syncing multiple investments with fallback schema:', fallbackError);
    }
  } catch (err) {
    console.error('Error in multiple investments fallback sync:', err);
  }
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

export interface InvestorProtectionLog {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  eventType: 'plan_purchased' | 'deed_issued' | 'task_claimed' | 'referral_linked' | 'withdrawal_requested' | 'payout_claimed' | 'deposit_receipt_uploaded';
  planId?: string;
  planName?: string;
  deedReferenceCode?: string;
  makaniNumber?: string;
  amount?: number;
  details?: Record<string, any>;
  createdAt: string;
}

export interface AdminSecurityAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  actionType: 'approve_deposit' | 'reject_deposit' | 'settle_withdrawal' | 'reject_withdrawal' | 'approve_kyc' | 'reject_kyc' | 'approve_task_bounty' | 'reject_task_bounty' | 'system_override' | 'manual_balance_credit' | 'manual_balance_debit';
  targetUserId?: string;
  targetUserName?: string;
  amount?: number;
  notes?: string;
  details?: Record<string, any>;
  createdAt: string;
}

/**
 * Non-blocking realtime event logging for Investor Protection
 * Stores immediately in local buffer and asynchronously flushes to Supabase
 */
export const recordInvestorProtectionEvent = async (event: Omit<InvestorProtectionLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<void> => {
  const fullEvent: InvestorProtectionLog = {
    id: event.id || `inv_prot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: event.createdAt || new Date().toISOString(),
    ...event
  };

  // Local storage buffer for instant recovery and zero data loss
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pm_investor_protection_logs');
      const list: InvestorProtectionLog[] = stored ? JSON.parse(stored) : [];
      list.unshift(fullEvent);
      localStorage.setItem('pm_investor_protection_logs', JSON.stringify(list.slice(0, 500)));
    }
  } catch (e) {
    // storage safety
  }

  // Non-blocking asynchronous sync to Supabase
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const dbRecord = {
      id: fullEvent.id,
      user_id: fullEvent.userId,
      user_name: fullEvent.userName || null,
      user_email: fullEvent.userEmail || null,
      event_type: fullEvent.eventType,
      plan_id: fullEvent.planId || null,
      plan_name: fullEvent.planName || null,
      deed_reference_code: fullEvent.deedReferenceCode || null,
      makani_number: fullEvent.makaniNumber || null,
      amount: fullEvent.amount || 0,
      details: fullEvent.details || {},
      created_at: fullEvent.createdAt
    };

    client.from('investor_protection_logs').upsert(dbRecord).then(
      ({ error }: any) => {
        if (error && error.code !== '42P01') {
          console.warn('Investor protection sync notice:', error.message);
        }
      },
      () => {
        // Ignore network dropouts
      }
    );
  } catch (err) {
    // Non-blocking fire-and-forget
  }
};

/**
 * Non-blocking realtime logging for Administrator actions & overrides
 */
export const recordAdminSecurityAudit = async (audit: Omit<AdminSecurityAuditLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<void> => {
  const fullAudit: AdminSecurityAuditLog = {
    id: audit.id || `adm_audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: audit.createdAt || new Date().toISOString(),
    ...audit
  };

  // Local storage buffer
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pm_admin_audit_logs');
      const list: AdminSecurityAuditLog[] = stored ? JSON.parse(stored) : [];
      list.unshift(fullAudit);
      localStorage.setItem('pm_admin_audit_logs', JSON.stringify(list.slice(0, 500)));
    }
  } catch (e) {
    // storage safety
  }

  const client = getSupabaseClient();
  if (!client) return;

  try {
    const dbRecord = {
      id: fullAudit.id,
      admin_id: fullAudit.adminId,
      admin_name: fullAudit.adminName,
      action_type: fullAudit.actionType,
      target_user_id: fullAudit.targetUserId || null,
      target_user_name: fullAudit.targetUserName || null,
      amount: fullAudit.amount || 0,
      notes: fullAudit.notes || null,
      details: fullAudit.details || {},
      created_at: fullAudit.createdAt
    };

    client.from('admin_audit_logs').upsert(dbRecord).then(
      ({ error }: any) => {
        if (error && error.code !== '42P01') {
          console.warn('Admin audit sync notice:', error.message);
        }
      },
      () => {
        // Ignore network dropouts
      }
    );
  } catch (err) {
    // Non-blocking fire-and-forget
  }
};

export const fetchInvestorProtectionLogs = async (userId?: string): Promise<InvestorProtectionLog[]> => {
  // First try local buffer
  let localLogs: InvestorProtectionLog[] = [];
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pm_investor_protection_logs');
      if (stored) {
        localLogs = JSON.parse(stored);
        if (userId) {
          localLogs = localLogs.filter(l => l.userId === userId);
        }
      }
    }
  } catch (e) {
    // ignore
  }

  const client = getSupabaseClient();
  if (!client) return localLogs;

  try {
    let query = client.from('investor_protection_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !data) return localLogs;

    const mapped: InvestorProtectionLog[] = data.map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      userName: d.user_name,
      userEmail: d.user_email,
      eventType: d.event_type,
      planId: d.plan_id,
      planName: d.plan_name,
      deedReferenceCode: d.deed_reference_code,
      makaniNumber: d.makani_number,
      amount: d.amount,
      details: d.details,
      createdAt: d.created_at
    }));

    return mapped.length > 0 ? mapped : localLogs;
  } catch (e) {
    return localLogs;
  }
};

export const fetchAdminAuditLogs = async (): Promise<AdminSecurityAuditLog[]> => {
  let localLogs: AdminSecurityAuditLog[] = [];
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pm_admin_audit_logs');
      if (stored) {
        localLogs = JSON.parse(stored);
      }
    }
  } catch (e) {
    // ignore
  }

  const client = getSupabaseClient();
  if (!client) return localLogs;

  try {
    const { data, error } = await client.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error || !data) return localLogs;

    const mapped: AdminSecurityAuditLog[] = data.map((d: any) => ({
      id: d.id,
      adminId: d.admin_id,
      adminName: d.admin_name,
      actionType: d.action_type,
      targetUserId: d.target_user_id,
      targetUserName: d.target_user_name,
      amount: d.amount,
      notes: d.notes,
      details: d.details,
      createdAt: d.created_at
    }));

    return mapped.length > 0 ? mapped : localLogs;
  } catch (e) {
    return localLogs;
  }
};
