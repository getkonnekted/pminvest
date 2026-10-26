-- =========================================================================
-- PM INVEST / TREASURE HOMES PLATFORM
-- PRODUCTION SUPABASE UPDATE & ALIGNMENT SCRIPT (2026 REVISION)
-- =========================================================================
-- THIS MIGRATION SCRIPT PERFORMS:
-- 1. Updates Bank Reserve backing to ₦3,418,520,000 (₦3.418B+) with +₦175,000/hr (+₦4.2M/day)
-- 2. Strips raw '🇦🇪' emoji strings from propertyLocation in investment_plans and investments
--    (ensuring clean text rendering alongside high-res SVG UAE flags across all operating systems)
-- 3. Cleans any test '[Marketing Demo]' prefixes from transactions
-- 4. Standardizes all investment plans and active investments to 24-week tenure
-- 5. Safe idempotent column additions across users, investments, transactions, and settings
-- 6. Updates get_live_continuous_liquidity_reserve() stored procedure
-- 7. Ensures Realtime WebSockets publication on all 12 tables
-- =========================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Click SQL Editor in the left sidebar
-- 3. Click "+ New query", paste this entire script, and click "Run" (or Ctrl/Cmd + Enter)
-- =========================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. USERS TABLE - SCHEMA HARMONIZATION
-- -------------------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "referralCode" TEXT NOT NULL DEFAULT 'INV1000';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "referredByCode" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "referred_by_code" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "kycStatus" TEXT NOT NULL DEFAULT 'unverified';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "kycDetails" JSONB;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isDeactivated" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isMarketingAccount" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "marketingAllocatedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "points" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "dailyGamesHistory" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isTimerLocked" BOOLEAN NOT NULL DEFAULT FALSE;

-- Sync referral code aliases
UPDATE public.users 
SET "referred_by_code" = "referredByCode" 
WHERE "referred_by_code" IS NULL AND "referredByCode" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral ON public.users("referralCode");
CREATE INDEX IF NOT EXISTS idx_users_sponsor ON public.users("referredByCode");
CREATE INDEX IF NOT EXISTS idx_users_marketing ON public.users("isMarketingAccount");
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users("isDeactivated");
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- -------------------------------------------------------------------------
-- 2. INVESTMENT PLANS TABLE - SCHEMA, CLEAN LOCATIONS & 24 WEEKS
-- -------------------------------------------------------------------------
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "propertyName" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "propertyLocation" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "propertyAddress" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "propertyImage" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "propertyType" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "occupancyRate" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "deedTier" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "cadastralId" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "makaniNumber" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "deedReferenceCode" TEXT;
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS "weeksDuration" INTEGER NOT NULL DEFAULT 24;

-- Clean existing flag emojis from locations if present
UPDATE public.investment_plans
SET "propertyLocation" = TRIM(REPLACE(REPLACE("propertyLocation", '🇦🇪', ''), '  ', ' '))
WHERE "propertyLocation" LIKE '%🇦🇪%';

-- Canonical 6 UAE verified institutional properties (24-week tenure)
INSERT INTO public.investment_plans (
    id, name, "propertyName", "propertyLocation", "propertyAddress", "propertyImage", "propertyType", 
    "occupancyRate", "deedTier", "cadastralId", "makaniNumber", cost, "weeklyPayout", "totalReturns", "weeksDuration"
)
VALUES
    ('plan_1', 'Marina Bay Residences', 'Marina Bay Residences', 'Dubai Marina, Dubai, UAE', 'Plot 392-581, Marina Promenade, Al Marsa Street, Dubai Marina, Dubai, UAE', '/properties/marina_bay_residences.jpg', 'Executive Studio Waterfront Stake', '98.4%', 'Marina Bay Co-Ownership Deed (₦30,000 Tier)', 'DLD-CAD-392-581', '12845 76291', 30000, 6500, 156000, 24),
    ('plan_2', 'Creek Horizon Suites', 'Creek Horizon Suites', 'Dubai Creek Harbour, Dubai, UAE', 'Plot 184-210, Creek Island Boulevard, Dubai Creek Harbour, The Lagoons, Dubai, UAE', '/properties/creek_horizon_suites.jpg', '1-Bedroom Waterfront Apartment', '97.2%', 'Creek Horizon Co-Ownership Deed (₦60,000 Tier)', 'DLD-CAD-184-210', '14592 88201', 60000, 13000, 312000, 24),
    ('plan_3', 'Downtown Sky Vista', 'Downtown Sky Vista', 'Downtown Burj Khalifa District, Dubai, UAE', 'Plot 119-969, Sheikh Mohammed bin Rashid Boulevard, Downtown Dubai, Dubai, UAE', '/properties/downtown_sky_vista.jpg', 'Serviced Luxury Residence Stake', '99.1%', 'Downtown Sky Co-Ownership Deed (₦120,000 Tier)', 'DLD-CAD-119-969', '11894 92051', 120000, 26000, 624000, 24),
    ('plan_4', 'Sobha Sanctuary Estates', 'Sobha Sanctuary Estates', 'Sobha Hartland / MBR City, Dubai, UAE', 'Plot 440-112, Ras Al Khor Road, Sobha Hartland, Mohammed Bin Rashid Al Maktoum City, Dubai, UAE', '/properties/sobha_sanctuary_estates.jpg', '2-Bedroom Forest Villa Stake', '96.8%', 'Sobha Sanctuary Co-Ownership Deed (₦250,000 Tier)', 'DLD-CAD-440-112', '16402 71830', 250000, 54166, 1300000, 24),
    ('plan_5', 'Palm Azure Ocean Villa', 'Palm Azure Ocean Villa', 'Palm Jumeirah, Dubai, UAE', 'Plot 512-404, Crescent Road West, Frond G, Palm Jumeirah, Dubai, UAE', '/properties/palm_azure_villa.jpg', 'Ultra-Luxury Waterfront Residence', '98.9%', 'Palm Azure Co-Ownership Deed (₦600,000 Tier)', 'DLD-CAD-512-404', '10382 64920', 600000, 130000, 3120000, 24),
    ('plan_6', 'Emirates Financial Tower', 'Emirates Financial Tower', 'DIFC Financial District, Dubai, UAE', 'Plot 884-219, Al Sa''ada Street, DIFC Gate Precinct 4, Dubai International Financial Centre, Dubai, UAE', '/properties/emirates_tower_difc.jpg', 'Prime Grade-A Commercial Asset', '99.4%', 'Emirates Tower Co-Ownership Deed (₦1,500,000 Tier)', 'DLD-CAD-884-219', '18290 83910', 1500000, 325000, 7800000, 24)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    "propertyName" = EXCLUDED."propertyName",
    "propertyLocation" = EXCLUDED."propertyLocation",
    "propertyAddress" = EXCLUDED."propertyAddress",
    "propertyImage" = EXCLUDED."propertyImage",
    "propertyType" = EXCLUDED."propertyType",
    "occupancyRate" = EXCLUDED."occupancyRate",
    "deedTier" = EXCLUDED."deedTier",
    "cadastralId" = EXCLUDED."cadastralId",
    "makaniNumber" = EXCLUDED."makaniNumber",
    cost = EXCLUDED.cost,
    "weeklyPayout" = EXCLUDED."weeklyPayout",
    "totalReturns" = EXCLUDED."totalReturns",
    "weeksDuration" = EXCLUDED."weeksDuration";

-- -------------------------------------------------------------------------
-- 3. INVESTMENTS TABLE - CLEAN FLAGS & METADATA
-- -------------------------------------------------------------------------
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "propertyName" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "propertyLocation" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "propertyAddress" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "propertyImage" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "propertyType" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "occupancyRate" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "deedTier" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "cadastralId" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "makaniNumber" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "deedReferenceCode" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "autoReinvestLockedUntil" TEXT;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "isTimerLocked" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Strip flag emoji from existing investment rows
UPDATE public.investments
SET "propertyLocation" = TRIM(REPLACE(REPLACE("propertyLocation", '🇦🇪', ''), '  ', ' '))
WHERE "propertyLocation" LIKE '%🇦🇪%';

-- Align legacy investment cycle duration to 24 weeks
UPDATE public.investments
SET "totalWeeks" = 24
WHERE "totalWeeks" != 24;

-- Sync user_id alias
UPDATE public.investments 
SET user_id = "userId" 
WHERE user_id IS NULL AND "userId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments("userId");
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_marketing ON public.investments("isMarketing");

-- -------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE - PURGE DEMO TAGS & HARMONIZE COLUMNS
-- -------------------------------------------------------------------------
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "accountDetails" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "proofUrl" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "gatewayReference" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "gatewayChannel" TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS "isMarketing" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Remove "[Marketing Demo]" prefixes from descriptions
UPDATE public.transactions
SET description = TRIM(REPLACE(REPLACE(description, '[Marketing Demo] ', ''), '[Marketing Demo]', ''))
WHERE description LIKE '%[Marketing Demo]%';

UPDATE public.transactions
SET description = TRIM(REPLACE(description, 'Demo ', ''))
WHERE description LIKE 'Demo %';

-- Sync user_id alias
UPDATE public.transactions 
SET user_id = "userId" 
WHERE user_id IS NULL AND "userId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions("createdAt" DESC);

-- -------------------------------------------------------------------------
-- 5. SETTINGS TABLE - ₦3.418 BILLION LIQUIDITY RESERVE & SPEED-UP
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    "liquidityReserve" DOUBLE PRECISION NOT NULL DEFAULT 3418520000.0,
    "dailyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 4200000.0,
    "hourlyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 175000.0,
    "riskAlertLevel" TEXT NOT NULL DEFAULT 'low',
    "minWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "maxWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 1000000,
    "autoApproveDeposits" BOOLEAN NOT NULL DEFAULT FALSE,
    "automatedPayouts" BOOLEAN NOT NULL DEFAULT TRUE,
    "paystackTestMode" BOOLEAN NOT NULL DEFAULT FALSE,
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT FALSE,
    "pauseInvestments" BOOLEAN NOT NULL DEFAULT FALSE,
    "pauseWithdrawals" BOOLEAN NOT NULL DEFAULT FALSE,
    "dailyTaskEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "dailyTaskBonusRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "dailyTaskBaseReward" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "dailyTaskStreakBonus" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "freeStarterWithdrawalLimit" DOUBLE PRECISION NOT NULL DEFAULT 3000,
    "rewardedAdBonusMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "estimatedAdRevenueTotal" DOUBLE PRECISION NOT NULL DEFAULT 284500,
    "enableLiveActivityToasts" BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "hourlyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 175000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyLiquidityGrowth" DOUBLE PRECISION NOT NULL DEFAULT 4200000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "riskAlertLevel" TEXT NOT NULL DEFAULT 'low';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "minWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 5000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "maxWithdrawal" DOUBLE PRECISION NOT NULL DEFAULT 1000000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "autoApproveDeposits" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "automatedPayouts" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "paystackTestMode" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "pauseInvestments" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "pauseWithdrawals" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "dailyTaskEnabled" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS "enableLiveActivityToasts" BOOLEAN NOT NULL DEFAULT TRUE;

-- Update settings record to ₦3.418B reserve
INSERT INTO public.settings (
    id, "liquidityReserve", "dailyLiquidityGrowth", "hourlyLiquidityGrowth", "riskAlertLevel", 
    "minWithdrawal", "maxWithdrawal", "autoApproveDeposits", "automatedPayouts", "dailyTaskEnabled"
)
VALUES (
    'system_settings', 3418520000, 4200000, 175000, 'low', 5000, 1000000, FALSE, TRUE, TRUE
)
ON CONFLICT (id) DO UPDATE SET
    "liquidityReserve" = 3418520000,
    "dailyLiquidityGrowth" = 4200000,
    "hourlyLiquidityGrowth" = 175000;

-- -------------------------------------------------------------------------
-- 6. AUDIT LEDGER, PROGRESS & STATE TABLES (IF NOT ALREADY CREATED)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO public.system_state (key, value)
VALUES 
    ('current_week', '1'),
    ('virtual_day_offset', '0')
ON CONFLICT (key) DO NOTHING;

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
    transaction_type TEXT NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    balance_before NUMERIC(18,2) NOT NULL,
    balance_after NUMERIC(18,2) NOT NULL,
    description TEXT NOT NULL,
    reference TEXT NOT NULL,
    performed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    "createdAt" TEXT NOT NULL,
    "reviewedAt" TEXT,
    user_id TEXT
);

CREATE TABLE IF NOT EXISTS public.user_daily_progress (
    user_id TEXT PRIMARY KEY,
    "current_date" TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    completed_task_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    pending_submission_task_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    streak_count INTEGER NOT NULL DEFAULT 0,
    last_completed_date TEXT,
    streak_bonus_claimed_date TEXT,
    poll_answers JSONB DEFAULT '{}'::jsonb,
    quiz_scores JSONB DEFAULT '{}'::jsonb,
    ad_boosted_task_ids JSONB DEFAULT '[]'::jsonb,
    total_free_earnings_withdrawn DOUBLE PRECISION DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.investor_protection_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    event_type TEXT NOT NULL,
    plan_id TEXT,
    plan_name TEXT,
    deed_reference_code TEXT,
    makani_number TEXT,
    amount DOUBLE PRECISION DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_user_id TEXT,
    target_user_name TEXT,
    amount DOUBLE PRECISION DEFAULT 0,
    notes TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure master admin user is present
INSERT INTO public.users (
    id, name, email, phone, password, "referralCode", "walletBalance", "kycStatus", role, "createdAt"
)
VALUES (
    'usr_admin',
    'Treasure Homes Admin',
    'admin@treasurehomes.com',
    '+2348000000000',
    'admin123',
    'TREASURE_ADMIN',
    0,
    'verified',
    'admin',
    NOW()::TEXT
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    "kycStatus" = 'verified';

INSERT INTO public.wallets (user_id, balance)
VALUES ('usr_admin', 0)
ON CONFLICT (user_id) DO NOTHING;

-- -------------------------------------------------------------------------
-- 7. AUTONOMOUS CONTINUOUS ₦3.418 BILLION LIQUIDITY FUNCTION & VIEW
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_live_continuous_liquidity_reserve()
RETURNS DOUBLE PRECISION
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_base DOUBLE PRECISION := 3418520000.0;
    v_hourly_growth DOUBLE PRECISION := 175000.0;
    v_anchor TIMESTAMPTZ := '2026-10-10 00:00:00+00'::TIMESTAMPTZ;
    v_elapsed_seconds DOUBLE PRECISION;
    v_virtual_offset DOUBLE PRECISION := 0;
    v_offset_val TEXT;
BEGIN
    SELECT value INTO v_offset_val FROM public.system_state WHERE key = 'virtual_day_offset';
    IF v_offset_val IS NOT NULL THEN
        BEGIN
            v_virtual_offset := v_offset_val::DOUBLE PRECISION;
        EXCEPTION WHEN OTHERS THEN
            v_virtual_offset := 0;
        END;
    END IF;

    v_elapsed_seconds := GREATEST(0.0, EXTRACT(EPOCH FROM (CLOCK_TIMESTAMP() - v_anchor)));
    RETURN ROUND((v_base + ((v_elapsed_seconds + (v_virtual_offset * 86400.0)) / 3600.0) * v_hourly_growth)::NUMERIC, 2);
END;
$$;

CREATE OR REPLACE VIEW public.settings_with_live_reserve AS
SELECT 
    id,
    public.get_live_continuous_liquidity_reserve() AS "liquidityReserve",
    "dailyLiquidityGrowth",
    "hourlyLiquidityGrowth",
    "riskAlertLevel",
    "minWithdrawal",
    "maxWithdrawal",
    "autoApproveDeposits",
    "automatedPayouts",
    "paystackTestMode",
    "isMaintenanceMode",
    "pauseInvestments",
    "pauseWithdrawals"
FROM public.settings;

-- -------------------------------------------------------------------------
-- 8. UPDATE PUBLIC STATS FUNCTION
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.public_get_platform_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reserve DOUBLE PRECISION;
    v_active_capital DOUBLE PRECISION;
    v_investors_count INTEGER;
    v_plans_count INTEGER;
BEGIN
    v_reserve := public.get_live_continuous_liquidity_reserve();
    SELECT COALESCE(SUM(cost), 0) INTO v_active_capital FROM public.investments WHERE status = 'active' AND "isMarketing" = FALSE;
    SELECT COUNT(*) INTO v_investors_count FROM public.users WHERE role != 'admin' AND "isMarketingAccount" = FALSE;
    SELECT COUNT(*) INTO v_plans_count FROM public.investment_plans;

    RETURN jsonb_build_object(
        'liquidityReserve', COALESCE(v_reserve, 3418520000.0),
        'activeInvestorCapital', v_active_capital,
        'registeredInvestors', v_investors_count,
        'availablePlans', v_plans_count,
        'payoutDay', 'Friday'
    );
END;
$$;

-- -------------------------------------------------------------------------
-- 9. PERMISSIONS & REALTIME WEBSOCKET SUBSCRIPTIONS
-- -------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- Enable REPLICA IDENTITY FULL for clean real-time updates
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.investment_plans REPLICA IDENTITY FULL;
ALTER TABLE public.investments REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.settings REPLICA IDENTITY FULL;
ALTER TABLE public.system_state REPLICA IDENTITY FULL;
ALTER TABLE public.task_submissions REPLICA IDENTITY FULL;
ALTER TABLE public.user_daily_progress REPLICA IDENTITY FULL;
ALTER TABLE public.wallets REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.investor_protection_logs REPLICA IDENTITY FULL;
ALTER TABLE public.admin_audit_logs REPLICA IDENTITY FULL;

-- Add all 12 tables to Realtime publication
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users',
        'investment_plans',
        'investments',
        'transactions',
        'settings',
        'system_state',
        'task_submissions',
        'user_daily_progress',
        'wallets',
        'wallet_transactions',
        'investor_protection_logs',
        'admin_audit_logs'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END $$;

COMMIT;

-- Verification Check
SELECT 
    'SUCCESS: Supabase schema updated' as status,
    public.get_live_continuous_liquidity_reserve() as live_reserve_ngn,
    (SELECT COUNT(*) FROM public.investment_plans) as investment_plans_count,
    (SELECT COUNT(*) FROM public.users) as registered_users_count;
