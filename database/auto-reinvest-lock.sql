-- Required schema patch for PM Invest auto-renew payout-cycle locks.
-- Run against the Supabase project connected to PM Invest before relying on
-- cross-device auto-renew lock persistence.
ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS "autoReinvestLockedUntil" text;
