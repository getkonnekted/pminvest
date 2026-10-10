-- =========================================================================
-- PM INVEST - 28-WEEK INVESTMENT TIERS & AUTO-RENEW PAYOUT ROLLOVER MIGRATION
-- =========================================================================

-- 1. Update investment_plans schema default to 28 weeks
ALTER TABLE IF EXISTS public.investment_plans 
ALTER COLUMN "weeksDuration" SET DEFAULT 28;

-- 2. Upsert all 6 official investment plan tiers to 28 weeks duration
INSERT INTO public.investment_plans (id, name, cost, "weeklyPayout", "totalReturns", "weeksDuration")
VALUES
  ('plan_1', 'Plan 1', 30000, 6500, 182000, 28),
  ('plan_2', 'Plan 2', 60000, 13000, 364000, 28),
  ('plan_3', 'Plan 3', 120000, 26000, 728000, 28),
  ('plan_4', 'Plan 4', 150000, 32500, 910000, 28),
  ('plan_5', 'Plan 5', 300000, 65000, 1820000, 28),
  ('plan_6', 'Plan 6', 1500000, 325000, 9100000, 28)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  cost = EXCLUDED.cost,
  "weeklyPayout" = EXCLUDED."weeklyPayout",
  "totalReturns" = EXCLUDED."totalReturns",
  "weeksDuration" = 28;

-- 3. Upgrade all active investments in the database to 28-week cycles
UPDATE public.investments
SET 
  "totalWeeks" = 28,
  "totalReturns" = "weeklyPayout" * 28
WHERE status = 'active' AND "totalWeeks" != 28;

-- 4. Ensure Auto-Renew column exists on investments
ALTER TABLE IF EXISTS public.investments 
ADD COLUMN IF NOT EXISTS "autoReinvest" BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Stored Procedure: User Claim Weekly Payout with 3% Auto-Renew Increment
CREATE OR REPLACE FUNCTION public.user_claim_weekly_payout(
    p_user_id TEXT,
    p_investment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inv RECORD;
    v_user RECORD;
    v_sponsor RECORD;
    v_next_week INTEGER;
    v_is_completed BOOLEAN;
    v_payout_amount DOUBLE PRECISION;
    v_rollover_increment DOUBLE PRECISION := 0;
    v_new_bal DOUBLE PRECISION;
    v_next_payout TEXT;
    v_sponsor_bonus DOUBLE PRECISION;
BEGIN
    SELECT * INTO v_inv FROM public.investments WHERE id = p_investment_id AND "userId" = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Investment plan not found.');
    END IF;

    IF v_inv.status = 'completed' OR v_inv."weeksPaid" >= v_inv."totalWeeks" THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'This investment plan has already completed all weekly payouts.');
    END IF;

    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'User account not found.');
    END IF;

    v_next_week := v_inv."weeksPaid" + 1;
    v_is_completed := (v_next_week >= v_inv."totalWeeks");
    
    -- Auto-Renew means rollover weekly payout with 3% increment on each payout rolled over
    IF v_inv."autoReinvest" THEN
        v_rollover_increment := ROUND((v_inv."weeklyPayout" * 0.03)::numeric, 2);
    END IF;
    
    v_payout_amount := v_inv."weeklyPayout" + v_rollover_increment;
    v_new_bal := v_user."walletBalance" + v_payout_amount;
    v_next_payout := (NOW() + INTERVAL '7 days')::TEXT;

    -- Credit user wallet
    UPDATE public.users SET "walletBalance" = v_new_bal WHERE id = p_user_id;

    -- Update investment
    IF v_is_completed AND v_inv."autoReinvest" THEN
        UPDATE public.investments
        SET 
            "weeksPaid" = 0,
            status = 'active',
            "lastPayoutDate" = NOW()::TEXT,
            "nextPayoutDate" = v_next_payout
        WHERE id = p_investment_id;
    ELSE
        UPDATE public.investments
        SET 
            "weeksPaid" = v_next_week,
            status = CASE WHEN v_is_completed THEN 'completed' ELSE 'active' END,
            "lastPayoutDate" = NOW()::TEXT,
            "nextPayoutDate" = CASE WHEN v_is_completed THEN NULL ELSE v_next_payout END
        WHERE id = p_investment_id;
    END IF;

    -- Log payout transaction
    INSERT INTO public.transactions (
        id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
    )
    VALUES (
        'tx_payout_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
        p_user_id,
        v_user.name,
        'payout',
        v_payout_amount,
        'completed',
        NOW()::TEXT,
        CASE 
          WHEN v_inv."autoReinvest" THEN 'Weekly payout rolled over (+3% increment: +₦' || v_rollover_increment || '): ' || v_inv."planName" || ' (Week ' || v_next_week || '/' || v_inv."totalWeeks" || ')'
          ELSE 'Weekly payout: ' || v_inv."planName" || ' (Week ' || v_next_week || '/' || v_inv."totalWeeks" || ')'
        END,
        v_inv."isMarketing"
    );

    -- Credit sponsor 7.5% referral bonus if exists
    IF v_user."referredByCode" IS NOT NULL AND v_user."referredByCode" != '' THEN
        SELECT * INTO v_sponsor FROM public.users WHERE "referralCode" = v_user."referredByCode";
        IF FOUND THEN
            v_sponsor_bonus := ROUND((v_inv."weeklyPayout" * 0.075)::numeric, 2);
            UPDATE public.users SET "walletBalance" = "walletBalance" + v_sponsor_bonus WHERE id = v_sponsor.id;

            INSERT INTO public.transactions (
                id, "userId", "userName", type, amount, status, "createdAt", description, "isMarketing"
            )
            VALUES (
                'tx_ref_' || TO_CHAR(NOW(), 'YYYYMMDD') || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6),
                v_sponsor.id,
                v_sponsor.name,
                'referral_bonus',
                v_sponsor_bonus,
                'completed',
                NOW()::TEXT,
                '7.5% Referral Commission from ' || v_user.name || '''s ' || v_inv."planName",
                v_sponsor."isMarketingAccount"
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'payoutAmount', v_payout_amount,
        'rolloverIncrement', v_rollover_increment,
        'newBalance', v_new_bal,
        'weeksPaid', v_next_week,
        'totalWeeks', v_inv."totalWeeks",
        'message', 'Weekly payout of ₦' || v_payout_amount || ' credited successfully!'
    );
END;
$$;
