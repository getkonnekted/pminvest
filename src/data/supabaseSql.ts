export const FULL_SUPABASE_SQL = `-- =========================================================================
-- PM INVEST / TREASURE HOMES PLATFORM
-- PRODUCTION SUPABASE & POSTGRESQL SCHEMA WITH WALLET AUDIT & MARKETING SEPARATION
-- =========================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- 1. USERS TABLE (INVESTORS, ADMINS & MARKETING CANVASSERS)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    "referralCode" TEXT NOT NULL DEFAULT 'INV1000',
    "referredByCode" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kycStatus" TEXT NOT NULL DEFAULT 'unverified',
    "kycDetails" JSONB,
    role TEXT NOT NULL DEFAULT 'user',
    "createdAt" TEXT NOT NULL,
    "isDeactivated" BOOLEAN NOT NULL DEFAULT FALSE,
    "isMarketingAccount" BOOLEAN NOT NULL DEFAULT FALSE,
    "marketingAllocatedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- Safe migrations in case tables exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isDeactivated" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isMarketingAccount" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "marketingAllocatedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral ON public.users("referralCode");
CREATE INDEX IF NOT EXISTS idx_users_marketing ON public.users("isMarketingAccount");

-- -------------------------------------------------------------------------
-- 2. INVESTMENTS TABLE (PROPERTY PLANS & 4-WEEK CYCLES)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investments (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    cost DOUBLE PRECISION NOT NULL,
    "weeklyPayout" DOUBLE PRECISION NOT NULL,
    "totalReturns" DOUBLE PRECISION NOT NULL,
    "weeksPaid" INTEGER NOT NULL DEFAULT 0,
    "totalWeeks" INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'active',
    "createdAt" TEXT NOT NULL,
    "lastPayoutDate" TEXT,
    "nextPayoutDate" TEXT,
    "autoReinvest" BOOLEAN DEFAULT FALSE,
    "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "autoReinvest" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments("userId");
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_marketing ON public.investments("isMarketing");

-- -------------------------------------------------------------------------
-- 3. TRANSACTIONS TABLE (DEPOSITS, WITHDRAWALS & PAYOUTS)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    type TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL,
    "paymentMethod" TEXT,
    "accountDetails" TEXT,
    "proofUrl" TEXT,
    "gatewayReference" TEXT,
    "gatewayChannel" TEXT,
    "createdAt" TEXT NOT NULL,
    description TEXT NOT NULL,
    "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON public.transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_transactions_marketing ON public.transactions("isMarketing");

-- -------------------------------------------------------------------------
-- 4. SYSTEM SETTINGS TABLE (RESERVE, LIMITS & LIVE ACTIVITY TOGGLE)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'system_settings',
    "liquidityReserve" DOUBLE PRECISION NOT NULL,
    "hourlyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "dailyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 240000,
    "riskAlertLevel" TEXT NOT NULL DEFAULT 'low',
    "minWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "maxWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 1000000,
    "autoApproveDeposits" BOOLEAN NOT NULL DEFAULT FALSE,
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT FALSE,
    "pauseInvestments" BOOLEAN NOT NULL DEFAULT FALSE,
    "pauseWithdrawals" BOOLEAN NOT NULL DEFAULT FALSE,
    "enableLiveActivityToasts" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed default system settings row if missing
INSERT INTO public.settings (
    id, "liquidityReserve", "hourlyLiquidityGrowth", "dailyLiquidityGrowth",
    "riskAlertLevel", "minWithdrawal", "maxWithdrawal",
    "autoApproveDeposits", "isMaintenanceMode", "pauseInvestments", "pauseWithdrawals", "enableLiveActivityToasts"
)
VALUES (
    'system_settings', 92066059.975, 10000, 240000,
    'low', 5000, 1000000,
    FALSE, FALSE, FALSE, FALSE, TRUE
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------------
-- 5. TASK SUBMISSIONS & PROOF AUDIT
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id TEXT PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    proof TEXT NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" TEXT,
    "createdAt" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON public.task_submissions(status);

-- -------------------------------------------------------------------------
-- 6. SYSTEM STATE (WEEK TRACKING & TIME ANCHOR)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO public.system_state (key, value)
VALUES ('current_week', '1')
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------------------------------
-- 7. WALLET PERSISTENCE + INITIAL CREDIT AUDIT (DOUBLE-ENTRY LEDGER)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    user_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('initial_credit', 'credit', 'debit', 'marketing_allocation')),
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    balance_before NUMERIC(18,2) NOT NULL,
    balance_after NUMERIC(18,2) NOT NULL,
    description TEXT,
    reference TEXT NOT NULL UNIQUE,
    performed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id, created_at DESC);

-- Trigger for auto-updating updated_at on wallets
CREATE OR REPLACE FUNCTION public.set_wallet_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wallet_updated_at ON public.wallets;
CREATE TRIGGER wallet_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.set_wallet_updated_at();

-- -------------------------------------------------------------------------
-- 8. ATOMIC INITIAL WALLET & MARKETING CREDIT STORED PROCEDURE
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_initial_wallet_credit(
    p_user_id TEXT,
    p_amount NUMERIC,
    p_reference TEXT,
    p_description TEXT DEFAULT 'Initial wallet credit',
    p_admin_id TEXT DEFAULT NULL,
    p_transaction_type TEXT DEFAULT 'initial_credit'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_before NUMERIC(18,2);
    v_after NUMERIC(18,2);
    v_transaction_id UUID;
BEGIN
    IF p_user_id IS NULL OR p_amount IS NULL OR p_amount <= 0 OR p_reference IS NULL OR LENGTH(TRIM(p_reference)) = 0 THEN
        RAISE EXCEPTION 'Invalid wallet credit parameters';
    END IF;

    -- Ensure wallet exists
    INSERT INTO public.wallets (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Lock wallet to prevent race conditions
    SELECT id, balance
    INTO v_wallet_id, v_before
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Insert auditable transaction record (prevent duplicates via unique reference)
    INSERT INTO public.wallet_transactions (
        wallet_id,
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description,
        reference,
        performed_by
    )
    VALUES (
        v_wallet_id,
        p_user_id,
        p_transaction_type,
        p_amount,
        v_before,
        v_before + p_amount,
        p_description,
        p_reference,
        p_admin_id
    )
    ON CONFLICT (reference) DO NOTHING
    RETURNING id INTO v_transaction_id;

    IF v_transaction_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'duplicate', true,
            'message', 'Credit reference already processed'
        );
    END IF;

    -- Update balance
    UPDATE public.wallets
    SET balance = v_before + p_amount
    WHERE id = v_wallet_id;

    RETURN jsonb_build_object(
        'success', true,
        'duplicate', false,
        'wallet_id', v_wallet_id,
        'transaction_id', v_transaction_id,
        'balance_before', v_before,
        'amount_credited', p_amount,
        'balance_after', v_before + p_amount
    );
END;
$$;

-- -------------------------------------------------------------------------
-- 9. PERMISSIONS & ROW LEVEL SECURITY SETUP
-- -------------------------------------------------------------------------
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

COMMIT;`;
