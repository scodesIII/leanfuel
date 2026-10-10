-- M0: data integrity
--   1. Fix update_daily_summary so the summary stays correct when the last log
--      of a day is deleted, or a log is moved to another day.
--   2. daily_nutrition_summary is written only by the trigger: drop the client
--      write policies and grants.
--   3. Revoke increment_food_item_usage / refresh_popular_food_items from client roles.


-- ---------------------------------------------------------------------------
-- 1. Daily summary recalculation
-- ---------------------------------------------------------------------------

-- Recomputes one (user, day) summary from food_logs. Deletes the row when the
-- day has no logs left; the old trigger's GROUP BY returned zero rows in that
-- case, so the upsert did nothing and the stale totals stayed behind.
--
-- SECURITY INVOKER: it is only called from the SECURITY DEFINER trigger below,
-- so it runs as the function owner there. Called directly by a client it would
-- be subject to RLS, which no longer allows writes.
create or replace function public.recalculate_daily_summary(p_user_id uuid, p_date date)
  returns void
  language plpgsql
  security invoker
  set search_path to 'public', 'pg_temp'
as $function$
declare
  user_goals record;
begin
  if not exists (
    select 1 from food_logs where user_id = p_user_id and date_logged = p_date
  ) then
    delete from daily_nutrition_summary where user_id = p_user_id and date = p_date;
    return;
  end if;

  select daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g
  into user_goals
  from profiles
  where id = p_user_id;

  insert into daily_nutrition_summary (
    user_id,
    date,
    total_calories,
    total_protein_g,
    total_carbs_g,
    total_fat_g,
    total_fiber_g,
    total_sugar_g,
    total_sodium_mg,
    breakfast_calories,
    breakfast_protein_g,
    breakfast_carbs_g,
    breakfast_fat_g,
    lunch_calories,
    lunch_protein_g,
    lunch_carbs_g,
    lunch_fat_g,
    dinner_calories,
    dinner_protein_g,
    dinner_carbs_g,
    dinner_fat_g,
    snacks_calories,
    snacks_protein_g,
    snacks_carbs_g,
    snacks_fat_g,
    calorie_goal,
    protein_goal_g,
    carbs_goal_g,
    fat_goal_g,
    entries_count,
    last_meal_time
  )
  select
    user_id,
    date_logged,
    sum(calories),
    sum(protein_g),
    sum(carbs_g),
    sum(fat_g),
    -- fiber/sugar/sodium are nullable on food_logs but NOT NULL here
    coalesce(sum(fiber_g), 0),
    coalesce(sum(sugar_g), 0),
    coalesce(sum(sodium_mg), 0),
    sum(case when meal_type = 'breakfast' then calories else 0 end),
    sum(case when meal_type = 'breakfast' then protein_g else 0 end),
    sum(case when meal_type = 'breakfast' then carbs_g else 0 end),
    sum(case when meal_type = 'breakfast' then fat_g else 0 end),
    sum(case when meal_type = 'lunch' then calories else 0 end),
    sum(case when meal_type = 'lunch' then protein_g else 0 end),
    sum(case when meal_type = 'lunch' then carbs_g else 0 end),
    sum(case when meal_type = 'lunch' then fat_g else 0 end),
    sum(case when meal_type = 'dinner' then calories else 0 end),
    sum(case when meal_type = 'dinner' then protein_g else 0 end),
    sum(case when meal_type = 'dinner' then carbs_g else 0 end),
    sum(case when meal_type = 'dinner' then fat_g else 0 end),
    sum(case when meal_type = 'snack' then calories else 0 end),
    sum(case when meal_type = 'snack' then protein_g else 0 end),
    sum(case when meal_type = 'snack' then carbs_g else 0 end),
    sum(case when meal_type = 'snack' then fat_g else 0 end),
    user_goals.daily_calorie_goal,
    user_goals.protein_goal_g,
    user_goals.carbs_goal_g,
    user_goals.fat_goal_g,
    count(*),
    max(consumed_at)
  from food_logs
  where user_id = p_user_id and date_logged = p_date
  group by user_id, date_logged
  on conflict (user_id, date) do update set
    total_calories = excluded.total_calories,
    total_protein_g = excluded.total_protein_g,
    total_carbs_g = excluded.total_carbs_g,
    total_fat_g = excluded.total_fat_g,
    total_fiber_g = excluded.total_fiber_g,
    total_sugar_g = excluded.total_sugar_g,
    total_sodium_mg = excluded.total_sodium_mg,
    breakfast_calories = excluded.breakfast_calories,
    breakfast_protein_g = excluded.breakfast_protein_g,
    breakfast_carbs_g = excluded.breakfast_carbs_g,
    breakfast_fat_g = excluded.breakfast_fat_g,
    lunch_calories = excluded.lunch_calories,
    lunch_protein_g = excluded.lunch_protein_g,
    lunch_carbs_g = excluded.lunch_carbs_g,
    lunch_fat_g = excluded.lunch_fat_g,
    dinner_calories = excluded.dinner_calories,
    dinner_protein_g = excluded.dinner_protein_g,
    dinner_carbs_g = excluded.dinner_carbs_g,
    dinner_fat_g = excluded.dinner_fat_g,
    snacks_calories = excluded.snacks_calories,
    snacks_protein_g = excluded.snacks_protein_g,
    snacks_carbs_g = excluded.snacks_carbs_g,
    snacks_fat_g = excluded.snacks_fat_g,
    calorie_goal = excluded.calorie_goal,
    protein_goal_g = excluded.protein_goal_g,
    carbs_goal_g = excluded.carbs_goal_g,
    fat_goal_g = excluded.fat_goal_g,
    entries_count = excluded.entries_count,
    last_meal_time = excluded.last_meal_time,
    updated_at = now();
end;
$function$;

revoke all on function public.recalculate_daily_summary(uuid, date) from public, anon, authenticated;
grant execute on function public.recalculate_daily_summary(uuid, date) to service_role;

-- An UPDATE can move a log to another day (or user), so both the OLD and NEW
-- days need recalculating. The old trigger only recalculated NEW.
create or replace function public.update_daily_summary()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public', 'pg_temp'
as $function$
begin
  if TG_OP in ('UPDATE', 'DELETE') then
    perform recalculate_daily_summary(OLD.user_id, OLD.date_logged);
  end if;

  if TG_OP = 'INSERT'
     or (TG_OP = 'UPDATE'
         and (NEW.user_id, NEW.date_logged) is distinct from (OLD.user_id, OLD.date_logged)) then
    perform recalculate_daily_summary(NEW.user_id, NEW.date_logged);
  end if;

  return null; -- AFTER trigger: return value is ignored
end;
$function$;


-- ---------------------------------------------------------------------------
-- 2. daily_nutrition_summary is trigger-maintained: clients read only
-- ---------------------------------------------------------------------------

drop policy if exists "daily_summary_insert_policy" on public.daily_nutrition_summary;
drop policy if exists "daily_summary_update_policy" on public.daily_nutrition_summary;
drop policy if exists "daily_summary_delete_policy" on public.daily_nutrition_summary;

-- Defence in depth: without these grants a write fails even if a permissive
-- policy is added back by mistake.
revoke insert, update, delete, truncate, references, trigger, maintain
  on table public.daily_nutrition_summary from anon, authenticated;


-- ---------------------------------------------------------------------------
-- 3. Internal functions: not callable by clients
-- ---------------------------------------------------------------------------

-- Both were granted to PUBLIC, which every role inherits, so revoking from
-- anon alone would have no effect.
revoke execute on function public.increment_food_item_usage(uuid) from public, anon, authenticated;
revoke execute on function public.refresh_popular_food_items() from public, anon, authenticated;
