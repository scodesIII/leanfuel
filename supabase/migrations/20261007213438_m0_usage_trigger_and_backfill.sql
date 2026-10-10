-- M0 (part 2)
--   1. Serialise concurrent recalculations of the same daily summary.
--   2. Track food_items.usage_count from a food_logs trigger.
--   3. Backfill usage_count and daily summaries from existing food_logs.


-- ---------------------------------------------------------------------------
-- 1. Daily summary: advisory lock per (user, day)
-- ---------------------------------------------------------------------------

-- Two transactions logging to the same day (e.g. two devices) each recalculated
-- from a snapshot that could not see the other's uncommitted log, so the last
-- writer could drop an entry. An xact-scoped advisory lock makes the second
-- writer wait until the first commits; its recalculation then runs in a new
-- statement snapshot that includes the first writer's log.
create or replace function public.update_daily_summary()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public', 'pg_temp'
as $function$
declare
  old_key bigint;
  new_key bigint;
begin
  if TG_OP in ('UPDATE', 'DELETE') then
    old_key := hashtextextended(OLD.user_id::text || ':' || OLD.date_logged::text, 0);
  end if;

  if TG_OP = 'INSERT'
     or (TG_OP = 'UPDATE'
         and (NEW.user_id, NEW.date_logged) is distinct from (OLD.user_id, OLD.date_logged)) then
    new_key := hashtextextended(NEW.user_id::text || ':' || NEW.date_logged::text, 0);
  end if;

  -- Lock in a fixed order so two date moves in opposite directions can't deadlock
  if old_key is not null and new_key is not null then
    perform pg_advisory_xact_lock(least(old_key, new_key));
    perform pg_advisory_xact_lock(greatest(old_key, new_key));
  else
    perform pg_advisory_xact_lock(coalesce(old_key, new_key));
  end if;

  if old_key is not null then
    perform recalculate_daily_summary(OLD.user_id, OLD.date_logged);
  end if;

  if new_key is not null then
    perform recalculate_daily_summary(NEW.user_id, NEW.date_logged);
  end if;

  return null; -- AFTER trigger: return value is ignored
end;
$function$;


-- ---------------------------------------------------------------------------
-- 2. usage_count tracking
-- ---------------------------------------------------------------------------

-- usage_count means "times this food was chosen for a log": it goes up when a
-- log is created or switched to this food, and is not decremented on delete.
--
-- SECURITY DEFINER is required: the EXECUTE check on increment_food_item_usage
-- is made against current_user, and client roles no longer have it.
create or replace function public.track_food_item_usage()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public', 'pg_temp'
as $function$
begin
  if TG_OP = 'INSERT' or NEW.food_item_id is distinct from OLD.food_item_id then
    perform increment_food_item_usage(NEW.food_item_id);
  end if;

  return null;
end;
$function$;

revoke all on function public.track_food_item_usage() from public, anon, authenticated;

create trigger food_logs_track_usage_trigger
  after insert or update of food_item_id on public.food_logs
  for each row
  execute function public.track_food_item_usage();


-- ---------------------------------------------------------------------------
-- 3. Backfill (idempotent)
-- ---------------------------------------------------------------------------

-- Nothing ever incremented usage_count before this migration, so seed it from
-- the logs that exist now. Logs deleted in the past can't be recovered.
update public.food_items fi
set usage_count = u.log_count,
    last_used_at = u.last_used_at
from (
  select food_item_id, count(*) as log_count, max(consumed_at) as last_used_at
  from public.food_logs
  group by food_item_id
) u
where fi.id = u.food_item_id;

-- Recalculate every day that has logs or a summary row, so summaries left
-- stale by the old trigger are corrected or removed.
select public.recalculate_daily_summary(k.user_id, k.date)
from (
  select user_id, date_logged as date from public.food_logs
  union
  select user_id, date from public.daily_nutrition_summary
) k;
