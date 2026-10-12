-- =========================================================================
-- PM INVEST / TREASURE HOMES PLATFORM
-- COMPREHENSIVE SUPABASE VERIFICATION & AUDIT SCRIPT
-- =========================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to SQL Editor -> "+ New query"
-- 3. Paste and run this script to inspect your tables, row counts, 
--    28-week plans, realtime publications, and data integrity.
-- =========================================================================

-- SECTION 1: VERIFY ALL 10 REQUIRED TABLES EXIST IN SCHEMA PUBLIC
SELECT 
    t.table_name,
    CASE 
        WHEN t.table_name IN (
            'users', 
            'investment_plans', 
            'investments', 
            'transactions', 
            'settings', 
            'system_state', 
            'task_submissions', 
            'user_daily_progress', 
            'wallets', 
            'wallet_transactions'
        ) THEN '✅ Expected by Application'
        ELSE 'ℹ️ Additional'
    END AS status,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))) AS total_size
FROM information_schema.tables t
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name ASC;


-- SECTION 2: CHECK RECORD COUNTS ACROSS ALL 10 TABLES
SELECT 
    'users' AS table_name, COUNT(*) AS row_count FROM public.users
UNION ALL
SELECT 
    'investment_plans', COUNT(*) FROM public.investment_plans
UNION ALL
SELECT 
    'investments', COUNT(*) FROM public.investments
UNION ALL
SELECT 
    'transactions', COUNT(*) FROM public.transactions
UNION ALL
SELECT 
    'settings', COUNT(*) FROM public.settings
UNION ALL
SELECT 
    'system_state', COUNT(*) FROM public.system_state
UNION ALL
SELECT 
    'task_submissions', COUNT(*) FROM public.task_submissions
UNION ALL
SELECT 
    'user_daily_progress', COUNT(*) FROM public.user_daily_progress
UNION ALL
SELECT 
    'wallets', COUNT(*) FROM public.wallets
UNION ALL
SELECT 
    'wallet_transactions', COUNT(*) FROM public.wallet_transactions;


-- SECTION 3: VERIFY CANONICAL 28-WEEK INVESTMENT PLANS (TIERS 1 TO 6)
-- Confirms 28-week cycle duration, weekly payouts, and total returns
SELECT 
    id AS plan_id,
    name,
    '₦' || TO_CHAR(cost, 'FM999,999,999') AS cost,
    '₦' || TO_CHAR("weeklyPayout", 'FM999,999,999') AS weekly_payout,
    '₦' || TO_CHAR("totalReturns", 'FM999,999,999') AS total_returns,
    "weeksDuration" AS weeks_duration,
    CASE 
        WHEN "weeksDuration" = 28 AND ("weeklyPayout" * 28) = "totalReturns" THEN '✅ Valid 28-Week Plan'
        ELSE '⚠️ Needs Update to 28 Weeks'
    END AS verification_status
FROM public.investment_plans
ORDER BY cost ASC;


-- SECTION 4: VERIFY SYSTEM SETTINGS & TIMELINE STATE
SELECT 
    id,
    '₦' || TO_CHAR("liquidityReserve", 'FM999,999,999') AS liquidity_reserve,
    '₦' || TO_CHAR("minWithdrawal", 'FM999,999,999') AS min_withdrawal,
    '₦' || TO_CHAR("maxWithdrawal", 'FM999,999,999') AS max_withdrawal,
    "dailyTaskEnabled" AS daily_tasks_enabled,
    "automatedPayouts" AS automated_payouts
FROM public.settings
WHERE id = 'system_settings';

SELECT 
    key AS state_key, 
    value AS state_value 
FROM public.system_state;


-- SECTION 5: VERIFY REALTIME WEBSOCKET REPLICATION PUBLICATION
-- Confirms that changes push to active browsers and phones in real-time
SELECT 
    schemaname,
    tablename,
    '✅ Realtime Enabled' AS realtime_status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename ASC;
