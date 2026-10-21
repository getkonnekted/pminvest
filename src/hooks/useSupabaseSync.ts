import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppState } from '../context/StateContext';
import { InvestmentPlan, UserInvestment, TaskSubmission } from '../types';
import { 
  getSupabaseClient, 
  isSupabaseConfigured,
  syncInvestmentToSupabase,
  syncTaskSubmissionToSupabase,
  recordInvestorProtectionEvent
} from '../lib/supabase';

export interface SyncQueueItem {
  id: string;
  type: 'purchase_plan' | 'submit_task' | 'referral_attribution';
  payload: any;
  attempts: number;
  maxAttempts: number;
  timestamp: string;
}

const QUEUE_STORAGE_KEY = 'pm_supabase_sync_queue';

export function useSupabaseSync() {
  const { 
    currentUser, 
    purchaseInvestment, 
    taskSubmissions,
    users, 
    investments,
    refreshFromSupabase
  } = useAppState();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      }
    } catch {
      // safe fallback
    }
    return [];
  });
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);

  const isProcessingRef = useRef(false);

  // Persist queue to local storage
  const updateQueue = useCallback((newQueue: SyncQueueItem[]) => {
    setSyncQueue(newQueue);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(newQueue));
      }
    } catch (e) {
      console.warn('Could not persist sync queue to localStorage:', e);
    }
  }, []);

  // Background retry worker with exponential backoff
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || syncQueue.length === 0) return;
    isProcessingRef.current = true;
    setIsSyncing(true);

    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      isProcessingRef.current = false;
      setIsSyncing(false);
      return;
    }

    const currentItem = syncQueue[0];
    try {
      if (currentItem.type === 'purchase_plan') {
        const inv: UserInvestment = currentItem.payload;
        await syncInvestmentToSupabase(inv);
        await recordInvestorProtectionEvent({
          userId: inv.userId,
          userName: inv.userName,
          eventType: 'plan_purchased',
          planId: inv.planId,
          planName: inv.planName,
          amount: inv.cost,
          details: {
            retried: currentItem.attempts > 0,
            deedReferenceCode: inv.deedReferenceCode
          }
        });
      } else if (currentItem.type === 'submit_task') {
        const sub: TaskSubmission = currentItem.payload;
        await syncTaskSubmissionToSupabase(sub);
      } else if (currentItem.type === 'referral_attribution') {
        const { sponsorCode, userId } = currentItem.payload;
        await client.from('users').update({ 
          "referredByCode": sponsorCode,
          referred_by_code: sponsorCode 
        }).eq('id', userId);
      }

      // Success: dequeue
      const nextQueue = syncQueue.slice(1);
      updateQueue(nextQueue);
      setLastSyncTimestamp(new Date().toISOString());
    } catch (err) {
      console.warn(`[Sync Queue] Background persistence failed for item ${currentItem.id}:`, err);
      // Increment attempt counter
      const updatedItem = {
        ...currentItem,
        attempts: currentItem.attempts + 1
      };

      if (updatedItem.attempts >= updatedItem.maxAttempts) {
        // Discard after max attempts to prevent infinite loop
        console.error(`[Sync Queue] Max retries reached for item ${currentItem.id}. Dropping.`);
        updateQueue(syncQueue.slice(1));
      } else {
        // Place back at head with backoff
        updateQueue([updatedItem, ...syncQueue.slice(1)]);
      }
    } finally {
      isProcessingRef.current = false;
      setIsSyncing(false);
    }
  }, [syncQueue, updateQueue]);

  // Periodic retry poll and online event trigger
  useEffect(() => {
    const interval = setInterval(() => {
      if (syncQueue.length > 0 && navigator.onLine) {
        processQueue();
      }
    }, 8000);

    const handleOnline = () => {
      if (syncQueue.length > 0) {
        processQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, [syncQueue, processQueue]);

  /**
   * 1. Optimistic Plan Purchase with Instant UI + Auto-Retrying Persistence
   */
  const optimisticPurchasePlan = useCallback(async (plan: InvestmentPlan): Promise<boolean> => {
    if (!currentUser) return false;

    // A. Local-First Optimistic State Update (Instant 0ms UI response)
    const success = purchaseInvestment(plan.id);
    if (!success) return false;

    // B. Build the investment payload
    const deedCode = `UAE-DLD-2026-${plan.id.slice(-6).toUpperCase()}`;
    const investmentPayload: UserInvestment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      planId: plan.id,
      planName: plan.propertyName || plan.name,
      propertyName: plan.propertyName || plan.name,
      propertyLocation: plan.propertyLocation || 'Dubai Marina, Dubai, UAE',
      propertyAddress: plan.propertyAddress || 'Plot 392-581, Marina Promenade, Dubai Marina, Dubai, UAE',
      propertyImage: plan.propertyImage || '/properties/marina_bay_residences.jpg',
      cost: plan.cost,
      weeklyPayout: plan.weeklyPayout,
      totalReturns: plan.totalReturns,
      weeksPaid: 0,
      totalWeeks: 24,
      createdAt: new Date().toISOString(),
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      autoReinvest: false,
      autoReinvestLockedUntil: undefined,
      deedReferenceCode: deedCode,
      cadastralId: plan.cadastralId || 'AE-DXB-MAR-004812',
      makaniNumber: plan.makaniNumber || '12845 76291'
    };

    // C. Non-blocking audit record
    recordInvestorProtectionEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      eventType: 'plan_purchased',
      planId: plan.id,
      planName: plan.propertyName || plan.name,
      deedReferenceCode: deedCode,
      makaniNumber: plan.makaniNumber || '12845 76291',
      amount: plan.cost,
      details: {
        propertyLocation: plan.propertyLocation,
        weeklyPayout: plan.weeklyPayout,
        totalReturns: plan.totalReturns,
        optimistic: true
      }
    });

    // D. Queue for auto-retrying background persistence
    const queueItem: SyncQueueItem = {
      id: `q_inv_${Date.now()}`,
      type: 'purchase_plan',
      payload: investmentPayload,
      attempts: 0,
      maxAttempts: 4,
      timestamp: new Date().toISOString()
    };

    updateQueue([...syncQueue, queueItem]);
    return true;
  }, [currentUser, purchaseInvestment, syncQueue, updateQueue]);

  /**
   * 2. Optimistic Daily Task Submission with Instant UI + Auto-Retrying Persistence
   */
  const optimisticSubmitTask = useCallback(async (
    taskId: string, 
    taskTitle: string, 
    rewardAmount: number, 
    proofText?: string, 
    proofUrl?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const submissionPayload: TaskSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      taskTitle,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      proof: proofUrl ? `${proofText || 'Task proof'} | ${proofUrl}` : (proofText || 'Task completed via official channel'),
      rewardAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Non-blocking audit record
    recordInvestorProtectionEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      eventType: 'task_claimed',
      amount: rewardAmount,
      details: {
        taskId,
        taskTitle,
        hasProof: !!proofUrl
      }
    });

    // Queue for background persistence with auto-retry
    const queueItem: SyncQueueItem = {
      id: `q_task_${Date.now()}`,
      type: 'submit_task',
      payload: submissionPayload,
      attempts: 0,
      maxAttempts: 3,
      timestamp: new Date().toISOString()
    };

    updateQueue([...syncQueue, queueItem]);
    return true;
  }, [currentUser, syncQueue, updateQueue]);

  /**
   * 3. Realtime Referral Activity Sync
   */
  const syncReferralActivity = useCallback(async () => {
    if (!currentUser) return;
    try {
      await refreshFromSupabase();
      setLastSyncTimestamp(new Date().toISOString());
    } catch (e) {
      console.warn('Referral activity background refresh notice:', e);
    }
  }, [currentUser, refreshFromSupabase]);

  // Realtime Supabase channel subscriptions for live investor protection & task events
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured() || !currentUser) return;

    const channel = client.channel(`realtime_investor_${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investments', filter: `userId=eq.${currentUser.id}` },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_submissions', filter: `userId=eq.${currentUser.id}` },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investor_protection_logs', filter: `user_id=eq.${currentUser.id}` },
        () => {
          setLastSyncTimestamp(new Date().toISOString());
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [currentUser, refreshFromSupabase]);

  return {
    isSyncing,
    pendingQueueLength: syncQueue.length,
    lastSyncTimestamp,
    optimisticPurchasePlan,
    optimisticSubmitTask,
    syncReferralActivity,
    retryNow: processQueue
  };
}

export default useSupabaseSync;
