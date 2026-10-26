-- =========================================================================
-- PM INVEST / TREASURE HOMES PLATFORM
-- PRODUCTION PURGE & DATABASE CLEANUP SCRIPT
-- =========================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to SQL Editor -> "+ New query"
-- 3. Paste and run this script to purge old test payments, deposits,
--    and test investments while keeping schemas, settings, and UAE plans.
-- =========================================================================

BEGIN;

-- 1. Truncate dynamic test transaction and investment tables
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.investments CASCADE;
TRUNCATE TABLE public.task_submissions CASCADE;
TRUNCATE TABLE public.user_daily_progress CASCADE;
TRUNCATE TABLE public.wallet_transactions CASCADE;
TRUNCATE TABLE public.investor_protection_logs CASCADE;
TRUNCATE TABLE public.admin_audit_logs CASCADE;

-- 2. Reset user balances to clean zero
UPDATE public.users 
SET 
    "walletBalance" = 0,
    "marketingAllocatedBalance" = CASE WHEN "isMarketingAccount" THEN 500000 ELSE 0 END;

UPDATE public.wallets 
SET 
    balance = 0, 
    updated_at = NOW();

-- 3. Ensure master admin exists with verified status and zero balance
INSERT INTO public.users (
    id, name, email, phone, password, "referralCode", "walletBalance", "kycStatus", role, "createdAt", "isMarketingAccount"
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
    NOW()::TEXT,
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    "walletBalance" = 0,
    "kycStatus" = 'verified',
    "isDeactivated" = FALSE;

INSERT INTO public.wallets (user_id, balance)
VALUES ('usr_admin', 0)
ON CONFLICT (user_id) DO UPDATE SET balance = 0;

-- 4. Reset timeline to Week 1
INSERT INTO public.system_state (key, value)
VALUES 
    ('current_week', '1'),
    ('virtual_day_offset', '0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. Re-seed / ensure the 6 Verified UAE Investment Plans (24 Weeks)
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

-- 6. Ensure default system settings (₦3.418B Reserve Backing)
INSERT INTO public.settings (id, "liquidityReserve", "dailyLiquidityGrowth", "hourlyLiquidityGrowth", "riskAlertLevel", "minWithdrawal", "maxWithdrawal", "autoApproveDeposits", "automatedPayouts", "dailyTaskEnabled")
VALUES ('system_settings', 3418520000, 4200000, 175000, 'low', 5000, 1000000, FALSE, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    "liquidityReserve" = 3418520000,
    "dailyLiquidityGrowth" = 4200000,
    "hourlyLiquidityGrowth" = 175000;

COMMIT;
