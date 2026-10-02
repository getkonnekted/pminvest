import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, UserInvestment, Transaction, SystemSettings } from '../types';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

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
}

export const fetchAllSupabaseData = async (): Promise<SupabaseFetchResult | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      { data: users, error: uErr },
      { data: investments, error: iErr },
      { data: transactions, error: tErr },
      { data: settingsData, error: sErr },
      { data: stateData, error: stErr }
    ] = await Promise.all([
      client.from('users').select('*'),
      client.from('investments').select('*'),
      client.from('transactions').select('*').order('createdAt', { ascending: false }),
      client.from('settings').select('*').eq('id', 'system_settings').single(),
      client.from('system_state').select('*').eq('key', 'current_week').single()
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
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription notice:', err);
    return () => {};
  }
};

export const syncUserToSupabase = async (user: User) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { password, ...dbUser } = user;
  const { error } = await client.from('users').upsert(dbUser);
  if (error) console.error('Error syncing user:', error);
};

export const syncMultipleUsersToSupabase = async (usersList: User[]) => {
  const client = getSupabaseClient();
  if (!client || usersList.length === 0) return;
  const sanitized = usersList.map(({ password, ...u }) => u);
  const { error } = await client.from('users').upsert(sanitized);
  if (error) console.error('Error syncing multiple users:', error);
};

export const syncInvestmentToSupabase = async (investment: UserInvestment) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('investments').upsert(investment);
  if (error) console.error('Error syncing investment:', error);
};

export const syncMultipleInvestmentsToSupabase = async (investmentsList: UserInvestment[]) => {
  const client = getSupabaseClient();
  if (!client || investmentsList.length === 0) return;
  const { error } = await client.from('investments').upsert(investmentsList);
  if (error) console.error('Error syncing multiple investments:', error);
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
  const { error } = await client.from('settings').upsert({ id: 'system_settings', ...settings });
  if (error) console.error('Error syncing settings:', error);
};

export const syncWeekToSupabase = async (week: number) => {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('system_state').upsert({ key: 'current_week', value: String(week) });
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
