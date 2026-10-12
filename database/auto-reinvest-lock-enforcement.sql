-- PM Invest: server-enforced Auto-Renew payout-cycle lock.
-- Apply this migration to the Supabase project actually used by PM Invest.
-- The existing autoReinvestLockedUntil column must already exist.
--
-- Rules for UPDATEs:
-- 1. While a lock is active, clients cannot toggle Auto-Renew or clear/extend the lock.
-- 2. When a permitted toggle occurs, the database derives the lock from the existing
--    row's nextPayoutDate (or seven days from database time if no future payout exists).
-- 3. If no toggle occurs, clients cannot rewrite the lock timestamp.
--
-- This deliberately runs on UPDATE, not INSERT, because the current client uses
-- upsert for existing investments; a BEFORE INSERT trigger would alter the row
-- supplied by an upsert before PostgreSQL handles its conflict.
--
-- IMPORTANT: Keep direct INSERT/DELETE access to public.investments restricted
-- by RLS/policies. This trigger protects Auto-Renew changes on existing rows; it
-- does not secure wallet/payout mutations or replace user-level authorization.

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
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION public.enforce_auto_reinvest_lock();
