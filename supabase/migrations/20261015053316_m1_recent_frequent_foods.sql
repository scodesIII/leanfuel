-- M1: recent and frequent foods for the current user
--
-- Both are SECURITY INVOKER. Unlike search_food_items, no DEFINER helper is
-- needed: the RLS check on food_logs is a uuid equality, which is LEAKPROOF,
-- so food_logs_user_consumed_idx (user_id, consumed_at DESC) is still usable.
--
-- Both return the same food columns as search_food_items so the client can
-- render every section with one type, plus a few extra columns.
-- p_meal_type is optional: null means all meals.


-- Distinct foods, most recently logged first. last_servings / last_meal_type
-- come from that most recent log so a re-log can prefill them.
create function public.get_recent_foods(
  p_limit     integer default 10,
  p_meal_type text    default null
)
  returns table (
    id             uuid,
    name           text,
    brand          text,
    barcode        text,
    calories       integer,
    protein_g      numeric,
    carbs_g        numeric,
    fat_g          numeric,
    fiber_g        numeric,
    sugar_g        numeric,
    sodium_mg      numeric,
    serving_size   numeric,
    serving_unit   text,
    image_url      text,
    source         text,
    is_verified    boolean,
    last_servings  numeric,
    last_meal_type text,
    last_logged_at timestamptz
  )
  language sql
  stable
  security invoker
  set search_path to 'public', 'pg_temp'
as $function$
  with latest as (
    select distinct on (l.food_item_id)
      l.food_item_id, l.servings, l.meal_type, l.consumed_at
    from food_logs l
    where l.user_id = (select auth.uid())
      and (p_meal_type is null or l.meal_type = p_meal_type)
    order by l.food_item_id, l.consumed_at desc, l.id desc
  )
  select
    f.id, f.name, f.brand, f.barcode,
    f.calories, f.protein_g, f.carbs_g, f.fat_g,
    f.fiber_g, f.sugar_g, f.sodium_mg,
    f.serving_size, f.serving_unit, f.image_url, f.source, f.is_verified,
    r.servings, r.meal_type, r.consumed_at
  from latest r
  join food_items f on f.id = r.food_item_id
  where f.deleted_at is null
  order by r.consumed_at desc, f.id
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$function$;


-- Foods logged most often in the last 90 days. A fixed window keeps last
-- year's habits from outranking this month's.
create function public.get_frequent_foods(
  p_limit     integer default 10,
  p_meal_type text    default null
)
  returns table (
    id             uuid,
    name           text,
    brand          text,
    barcode        text,
    calories       integer,
    protein_g      numeric,
    carbs_g        numeric,
    fat_g          numeric,
    fiber_g        numeric,
    sugar_g        numeric,
    sodium_mg      numeric,
    serving_size   numeric,
    serving_unit   text,
    image_url      text,
    source         text,
    is_verified    boolean,
    log_count      integer,
    last_logged_at timestamptz
  )
  language sql
  stable
  security invoker
  set search_path to 'public', 'pg_temp'
as $function$
  select
    f.id, f.name, f.brand, f.barcode,
    f.calories, f.protein_g, f.carbs_g, f.fat_g,
    f.fiber_g, f.sugar_g, f.sodium_mg,
    f.serving_size, f.serving_unit, f.image_url, f.source, f.is_verified,
    count(*)::integer,
    max(l.consumed_at)
  from food_logs l
  join food_items f on f.id = l.food_item_id
  where l.user_id = (select auth.uid())
    and l.consumed_at >= now() - interval '90 days'
    and (p_meal_type is null or l.meal_type = p_meal_type)
    and f.deleted_at is null
  group by f.id
  order by count(*) desc, max(l.consumed_at) desc, f.id
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$function$;


revoke all on function public.get_recent_foods(integer, text) from public, anon;
revoke all on function public.get_frequent_foods(integer, text) from public, anon;
grant execute on function public.get_recent_foods(integer, text) to authenticated, service_role;
grant execute on function public.get_frequent_foods(integer, text) to authenticated, service_role;
