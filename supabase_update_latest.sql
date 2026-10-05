-- =========================================================================
-- TREASURE HOMES / PM INVEST - SUPABASE MIGRATION UPDATE
-- NEW FEATURES: ACTIVE INVESTMENT CAPITAL, TIMER LOCK, FAST YIELD, 
-- PERMANENT USER PURGE, AND REFERRAL NETWORK TREE
-- =========================================================================

-- 1. COLUMNS UPDATE (Safe & Idempotent)
-- Adds presentation locking, marketing flags, and missing settings columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isTimerLocked" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isMarketingAccount" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "marketingAllocatedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isDeactivated" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "isTimerLocked" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "hourlyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 10000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 240000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "enableLiveActivityToasts" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "riskAlertLevel" TEXT NOT NULL DEFAULT 'low';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "minWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 5000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "maxWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 1000000;

-- Ensure defaults and drop NOT NULL from all non-id columns in settings
DO $$ 
DECLARE
    r RECORD;
BEGIN 
    FOR r IN (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'settings' 
          AND column_name != 'id'
          AND is_nullable = 'NO'
    ) LOOP
        EXECUTE format('ALTER TABLE public.settings ALTER COLUMN %I DROP NOT NULL;', r.column_name);
    END LOOP;
END $$;

-- Ensure default settings record exists with explicit fallback values
INSERT INTO public.settings (
    id, 
    "liquidityReserve", 
    "dailyLiquidityGrowth", 
    "riskAlertLevel", 
    "minWithdrawal", 
    "maxWithdrawal", 
    "autoApproveDeposits", 
    "automatedPayouts",
    "isMaintenanceMode",
    "pauseInvestments",
    "pauseWithdrawals",
    "paystackTestMode"
) 
VALUES (
    'system_settings', 
    92066059, 
    240000, 
    'low', 
    5000, 
    1000000, 
    FALSE, 
    TRUE,
    FALSE,
    FALSE,
    FALSE,
    FALSE
) 
ON CONFLICT (id) DO NOTHING;

-- 2. INDEXES FOR FAST NETWORK SEARCH & PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_sponsor_code ON public.users("referredByCode");
CREATE INDEX IF NOT EXISTS idx_users_timer_locked ON public.users("isTimerLocked");
CREATE INDEX IF NOT EXISTS idx_investments_timer_locked ON public.investments("isTimerLocked");
CREATE INDEX IF NOT EXISTS idx_transactions_referral ON public.transactions(type, status);

-- 3. PERMANENT USER PURGE FUNCTION
-- Cleanly deletes all associated user records across all tables with audit safety
CREATE OR REPLACE FUNCTION public.admin_delete_user(
    p_user_id TEXT,
    p_admin_id TEXT DEFAULT 'usr_admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    IF v_user.role = 'admin' OR v_user.id = p_admin_id THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Super Administrator account cannot be deleted.');
    END IF;

    -- Cleanly purge all child records across all tables
    DELETE FROM public.transactions WHERE "userId" = p_user_id;
    DELETE FROM public.investments WHERE "userId" = p_user_id;
    DELETE FROM public.task_submissions WHERE "userId" = p_user_id;
    DELETE FROM public.wallet_transactions WHERE user_id = p_user_id;
    DELETE FROM public.wallets WHERE user_id = p_user_id;
    DELETE FROM public.user_daily_progress WHERE user_id = p_user_id;

    -- Delete user profile
    DELETE FROM public.users WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Account for ' || v_user.name || ' (' || v_user.email || ') and all records permanently purged.'
    );
END;
$$;

-- 4. FAST YIELD BUILDER FOR MARKETERS
-- Credits weekly payout immediately to marketer's wallet and logs Friday payout receipt
CREATE OR REPLACE FUNCTION public.admin_fast_yield_marketer(
    p_marketer_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_inv RECORD;
    v_yield DOUBLE PRECISION := 17250;
    v_plan_name TEXT := 'Plan 2 (Urban Terrace)';
    v_new_bal DOUBLE PRECISION;
    v_tx_id TEXT;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_marketer_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User not found.');
    END IF;

    -- Determine payout amount from active investment if available
    SELECT * INTO v_inv FROM public.investments 
    WHERE "userId" = p_marketer_id AND status = 'active' 
    LIMIT 1;

    IF FOUND THEN
        v_yield := v_inv."weeklyPayout";
        v_plan_name := v_inv."planName";
        
        -- Advance weeksPaid
        UPDATE public.investments 
        SET "weeksPaid" = "weeksPaid" + 1,
            status = CASE WHEN "weeksPaid" + 1 >= "totalWeeks" THEN 'completed' ELSE 'active' END,
            "lastPayoutDate" = NOW()::TEXT
        WHERE id = v_inv.id;
    END IF;

    v_new_bal := v_user."walletBalance" + v_yield;

    -- Credit user balance
    UPDATE public.users 
    SET "walletBalance" = v_new_bal 
    WHERE id = p_marketer_id;

    -- Insert verified Friday payout transaction
    v_tx_id := 'tx_fast_yield_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
    )
    VALUES (
        v_tx_id,
        v_user.id,
        v_user.name,
        'payout',
        v_yield,
        'completed',
        NOW()::TEXT,
        'Verified Friday Cash Return: ' || v_plan_name || ' (+₦' || TO_CHAR(v_yield, 'FM999,999,999') || ')',
        TRUE
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'creditedAmount', v_yield,
        'newBalance', v_new_bal,
        'message', 'Fast yield credited ₦' || v_yield || ' to ' || v_user.name
    );
END;
$$;

-- 5. PRESENTATION TIMER LOCK TOGGLE
-- Freezes or unfreezes presentation countdowns
CREATE OR REPLACE FUNCTION public.admin_toggle_timer_lock(
    p_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_new_state BOOLEAN;
BEGIN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User not found.');
    END IF;

    v_new_state := NOT COALESCE(v_user."isTimerLocked", FALSE);

    UPDATE public.users SET "isTimerLocked" = v_new_state WHERE id = p_user_id;
    UPDATE public.investments SET "isTimerLocked" = v_new_state WHERE "userId" = p_user_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'isTimerLocked', v_new_state,
        'message', CASE WHEN v_new_state THEN 'Presentation timer locked.' ELSE 'Presentation timer unlocked.' END
    );
END;
$$;

-- 6. REFERRAL NETWORK TREE VIEW & SUMMARY
CREATE OR REPLACE VIEW public.view_referral_chains AS
SELECT 
    s.id AS sponsor_id,
    s.name AS sponsor_name,
    s.email AS sponsor_email,
    s.phone AS sponsor_phone,
    s.role AS sponsor_role,
    s."referralCode" AS sponsor_code,
    s."isMarketingAccount" AS sponsor_is_marketer,
    COUNT(m.id) AS total_downline_count,
    COALESCE(SUM(dep.total_funded), 0) AS total_capital_inflow,
    COALESCE(comm.total_commissions, 0) AS total_commissions_earned
FROM public.users s
JOIN public.users m ON UPPER(TRIM(m."referredByCode")) = UPPER(TRIM(s."referralCode"))
LEFT JOIN (
    SELECT "userId", SUM(amount) AS total_funded
    FROM public.transactions
    WHERE type = 'deposit' AND status = 'completed' AND "isMarketing" = FALSE
    GROUP BY "userId"
) dep ON dep."userId" = m.id
LEFT JOIN (
    SELECT "userId", SUM(amount) AS total_commissions
    FROM public.transactions
    WHERE type = 'referral_bonus' AND status = 'completed'
    GROUP BY "userId"
) comm ON comm."userId" = s.id
GROUP BY s.id, s.name, s.email, s.phone, s.role, s."referralCode", s."isMarketingAccount", comm.total_commissions;

-- 7. REALTIME REPLICATION PUBLICATION
-- Ensures WebSocket instant sync across devices for all tables
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.investments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
