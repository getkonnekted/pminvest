-- PM Invest: server-enforced Auto-Renew payout-cycle lock.
-- Apply this migration to the Supabase project actually used by PM Invest.
-- The existing autoReinvestLockedUntil column must already exist.
--
-- Rules:
-- 1. New rows cannot start with Auto-Renew enabled or a client-supplied lock.
-- 2. A change to autoReinvest sets the lock from the existing row's scheduled
--    nextPayoutDate (or seven days from database time if no future payout exists).
-- 3. While that lock is active, direct REST/API updates cannot change either
--    autoReinvest or autoReinvestLockedUntil, even if the browser is modified.
-- 4. When no toggle occurs, clients cannot rewrite the lock timestamp.
--
-- This trigger protects the Auto-Renew setting. It does not secure unrelated
-- wallet/payout mutations; those require separate server-side authorization.

CREATE OR REPLACE FUNCTION public.enforce_auto_reinvest_lock()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  old_lock timestamptz;
  scheduled_payout timestamptz;
  old_lock_json jsonb;
  old_auto text;
  new_auto text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Auto-Renew must be opted into through an update, which starts a lock.
    NEW := jsonb_populate_record(
      NEW,
      jsonb_build_object(
        'autoReinvest', false,
        'autoReinvestLockedUntil', NULL
      )
    );
    RETURN NEW;
  END IF;

  old_lock_json := to_jsonb(OLD)->'autoReinvestLockedUntil';

  BEGIN
    old_lock := NULLIF(to_jsonb(OLD)->>'autoReinvestLockedUntil', '')::timestamptz;
  EXCEPTION WHEN others THEN
    old_lock := NULL;
  END;

  old_auto := to_jsonb(OLD)->>'autoReinvest';
  new_auto := to_jsonb(NEW)->>'autoReinvest';

  -- An active lock is authoritative. Ignore attempts to toggle or clear/extend it.
  IF old_lock IS NOT NULL AND old_lock > clock_timestamp() THEN
    NEW := jsonb_populate_record(
      NEW,
      jsonb_build_object(
        'autoReinvest', to_jsonb(OLD)->'autoReinvest',
        'autoReinvestLockedUntil', old_lock_json
      )
    );
    RETURN NEW;
  END IF;

  IF new_auto IS DISTINCT FROM old_auto THEN
    -- Use the schedule already stored in the database, never a client-supplied date.
    BEGIN
      scheduled_payout := NULLIF(to_jsonb(OLD)->>'nextPayoutDate', '')::timestamptz;
    EXCEPTION WHEN others THEN
      scheduled_payout := NULL;
    END;

    IF scheduled_payout IS NULL OR scheduled_payout <= clock_timestamp() THEN
      scheduled_payout := clock_timestamp() + interval '7 days';
    END IF;

    NEW := jsonb_populate_record(
      NEW,
      jsonb_build_object('autoReinvestLockedUntil', scheduled_payout)
    );
  ELSE
    -- A client cannot change the timestamp unless it is making a permitted toggle.
    NEW := jsonb_populate_record(
      NEW,
      jsonb_build_object('autoReinvestLockedUntil', old_lock_json)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS investments_enforce_auto_reinvest_lock ON public.investments;

CREATE TRIGGER investments_enforce_auto_reinvest_lock
BEFORE INSERT OR UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.enforce_auto_reinvest_lock();
