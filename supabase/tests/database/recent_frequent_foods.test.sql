begin;
create extension if not exists pgtap with schema extensions;

select plan(18);

-- ---------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'carol@test.local');

insert into public.food_items (id, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, source) values
  ('f0000000-0000-0000-0000-00000000000a', 'Oats',           40,  'g', 150, 5,  27, 3, 'admin'),
  ('f0000000-0000-0000-0000-00000000000b', 'Banana',         120, 'g', 105, 1,  27, 0, 'admin'),
  ('f0000000-0000-0000-0000-00000000000c', 'Chicken Breast', 100, 'g', 165, 31, 0,  4, 'admin'),
  ('f0000000-0000-0000-0000-00000000000d', 'Rice',           75,  'g', 270, 5,  60, 1, 'admin'),
  ('f0000000-0000-0000-0000-00000000000e', 'Discontinued',   100, 'g', 100, 1,  1,  1, 'admin');

-- Alice's logs (consumed_at relative to now so the 90-day window is stable)
insert into public.food_logs (user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, consumed_at, date_logged)
select '11111111-1111-1111-1111-111111111111', food_id::uuid, meal, servings, 100, 1, 1, 1, now() - ago, (now() - ago)::date
from (values
  ('f0000000-0000-0000-0000-00000000000a', 'breakfast', 1.0, interval '5 days'),
  ('f0000000-0000-0000-0000-00000000000a', 'breakfast', 1.0, interval '4 days'),
  ('f0000000-0000-0000-0000-00000000000a', 'breakfast', 1.5, interval '3 days'),
  ('f0000000-0000-0000-0000-00000000000b', 'snack',     1.0, interval '2 days'),
  ('f0000000-0000-0000-0000-00000000000b', 'snack',     2.0, interval '1 hour'),
  ('f0000000-0000-0000-0000-00000000000c', 'dinner',    1.0, interval '1 day'),
  ('f0000000-0000-0000-0000-00000000000d', 'lunch',     1.0, interval '200 days'),
  ('f0000000-0000-0000-0000-00000000000d', 'lunch',     1.0, interval '201 days'),
  ('f0000000-0000-0000-0000-00000000000d', 'lunch',     1.0, interval '202 days'),
  ('f0000000-0000-0000-0000-00000000000d', 'lunch',     1.0, interval '203 days'),
  ('f0000000-0000-0000-0000-00000000000e', 'lunch',     1.0, interval '30 minutes')
) v(food_id, meal, servings, ago);

-- Bob logs chicken a lot; none of it should count for Alice
insert into public.food_logs (user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, consumed_at, date_logged)
select '22222222-2222-2222-2222-222222222222', 'f0000000-0000-0000-0000-00000000000c', 'dinner', 1, 165, 31, 0, 4, now() - n * interval '1 day', (now() - n * interval '1 day')::date
from generate_series(1, 5) n;

-- Food removed after Alice logged it
update public.food_items set deleted_at = now() where id = 'f0000000-0000-0000-0000-00000000000e';

-- Carol has 60 distinct recent foods, to check the limit cap
insert into public.food_items (id, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, source)
select ('c0000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid, 'Carol food ' || n, 1, 'g', 1, 1, 1, 1, 'admin'
from generate_series(1, 60) n;
insert into public.food_logs (user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, consumed_at, date_logged)
select '33333333-3333-3333-3333-333333333333', ('c0000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid, 'snack', 1, 1, 1, 1, 1, now() - n * interval '1 minute', current_date
from generate_series(1, 60) n;


-- ---------------------------------------------------------------------------
-- get_recent_foods (as Alice)
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select is(
  (select array_agg(name) from public.get_recent_foods()),
  array['Banana', 'Chicken Breast', 'Oats', 'Rice'],
  'recent: most recent first, one row per food, deleted food excluded');
select is(
  (select last_servings from public.get_recent_foods() where name = 'Banana'),
  2.0, 'recent: last_servings comes from the latest log');
select is(
  (select last_meal_type from public.get_recent_foods() where name = 'Chicken Breast'),
  'dinner', 'recent: last_meal_type comes from the latest log');
select is(
  (select array_agg(name) from public.get_recent_foods(10, 'breakfast')),
  array['Oats'], 'recent: meal_type filter');
select is(
  (select array_agg(name) from public.get_recent_foods(1)),
  array['Banana'], 'recent: limit respected');
select is(
  (select fiber_g from public.get_recent_foods() where name = 'Oats'),
  0::numeric, 'recent: returns nutrient columns for logging');

-- ---------------------------------------------------------------------------
-- get_frequent_foods (as Alice)
-- ---------------------------------------------------------------------------

select is(
  (select array_agg(name) from public.get_frequent_foods()),
  array['Oats', 'Banana', 'Chicken Breast'],
  'frequent: most logged first; logs older than 90 days and deleted foods excluded');
select is(
  (select log_count from public.get_frequent_foods() where name = 'Oats'),
  3, 'frequent: log_count');
select is(
  (select log_count from public.get_frequent_foods() where name = 'Chicken Breast'),
  1, 'frequent: other users'' logs are not counted');
select is(
  (select array_agg(name) from public.get_frequent_foods(10, 'snack')),
  array['Banana'], 'frequent: meal_type filter');

-- ---------------------------------------------------------------------------
-- Other users
-- ---------------------------------------------------------------------------

select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select is(
  (select array_agg(name || ':' || log_count) from public.get_frequent_foods()),
  array['Chicken Breast:5'], 'Bob sees only his own history');

select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
select is((select count(*)::int from public.get_recent_foods(1000)), 50, 'recent: limit capped at 50');
select is((select count(*)::int from public.get_frequent_foods(1000)), 50, 'frequent: limit capped at 50');

select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);
select is((select count(*)::int from public.get_recent_foods()), 0, 'new user: no recent foods');

reset role;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

select ok(not has_function_privilege('anon', 'public.get_recent_foods(integer, text)', 'execute'), 'anon cannot call get_recent_foods');
select ok(not has_function_privilege('anon', 'public.get_frequent_foods(integer, text)', 'execute'), 'anon cannot call get_frequent_foods');
select ok(not (select prosecdef from pg_proc where oid = 'public.get_recent_foods(integer, text)'::regprocedure), 'get_recent_foods is SECURITY INVOKER');
select ok(not (select prosecdef from pg_proc where oid = 'public.get_frequent_foods(integer, text)'::regprocedure), 'get_frequent_foods is SECURITY INVOKER');

select * from finish();
rollback;
