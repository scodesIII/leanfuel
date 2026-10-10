begin;
create extension if not exists pgtap with schema extensions;

select plan(22);

-- ---------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.local');

insert into public.food_items (id, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, source)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test oats', 40, 'g', 150, 5, 27, 3, 'admin');

-- Bob has a summary row so we can check Alice cannot touch it
insert into public.food_logs (user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, date_logged)
values ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lunch', 1, 500, 10, 10, 10, '2026-10-01');

-- ---------------------------------------------------------------------------
-- Act as Alice through RLS, the same path the app uses
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

-- Insert recalculates
insert into public.food_logs (id, user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, fiber_g, date_logged)
values
  ('b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'breakfast', 1, 300, 10, 40, 5, 4, '2026-10-01'),
  ('b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dinner',    1, 700, 40, 60, 20, null, '2026-10-01');

select is(
  (select total_calories from public.daily_nutrition_summary where date = '2026-10-01'),
  1000, 'insert: total_calories summed');
select is(
  (select entries_count from public.daily_nutrition_summary where date = '2026-10-01'),
  2, 'insert: entries_count');
select is(
  (select total_fiber_g from public.daily_nutrition_summary where date = '2026-10-01'),
  4::numeric, 'insert: null fiber_g treated as 0');
select is(
  (select breakfast_calories from public.daily_nutrition_summary where date = '2026-10-01'),
  300, 'insert: per-meal split');

-- Same-day update recalculates
update public.food_logs set calories = 800 where id = 'b0000000-0000-0000-0000-000000000002';
select is(
  (select total_calories from public.daily_nutrition_summary where date = '2026-10-01'),
  1100, 'update same day: total recalculated');

-- Move a log to another day: both days recalculated
update public.food_logs set date_logged = '2026-10-02' where id = 'b0000000-0000-0000-0000-000000000002';
select is(
  (select total_calories from public.daily_nutrition_summary where date = '2026-10-01'),
  300, 'date move: old day loses the log');
select is(
  (select total_calories from public.daily_nutrition_summary where date = '2026-10-02'),
  800, 'date move: new day gains the log');

-- Move the only log off a day: old day's row removed
update public.food_logs set date_logged = '2026-10-03' where id = 'b0000000-0000-0000-0000-000000000002';
select is_empty(
  $$ select 1 from public.daily_nutrition_summary where date = '2026-10-02' $$,
  'date move: day with no logs left has no summary row');

-- Delete one of several
insert into public.food_logs (user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, date_logged)
values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'snack', 1, 100, 1, 1, 1, '2026-10-01');
delete from public.food_logs where id = 'b0000000-0000-0000-0000-000000000001';
select is(
  (select total_calories from public.daily_nutrition_summary where date = '2026-10-01'),
  100, 'delete: remaining logs re-summed');

-- Delete the last log of a day
delete from public.food_logs where date_logged = '2026-10-01';
select is_empty(
  $$ select 1 from public.daily_nutrition_summary where date = '2026-10-01' $$,
  'delete last log: summary row removed');

-- ---------------------------------------------------------------------------
-- Clients can read but not write daily_nutrition_summary
-- ---------------------------------------------------------------------------

select is(
  (select count(*)::int from public.daily_nutrition_summary),
  1, 'select: Alice sees only her own row (2026-10-03)');

select throws_ok(
  $$ insert into public.daily_nutrition_summary (user_id, date, total_calories)
     values ('11111111-1111-1111-1111-111111111111', '2026-09-01', 9999) $$,
  '42501', null, 'client cannot insert summary');
select throws_ok(
  $$ update public.daily_nutrition_summary set total_calories = 9999 $$,
  '42501', null, 'client cannot update summary');
select throws_ok(
  $$ delete from public.daily_nutrition_summary $$,
  '42501', null, 'client cannot delete summary');
select throws_ok(
  $$ select public.recalculate_daily_summary('22222222-2222-2222-2222-222222222222', '2026-10-01') $$,
  '42501', null, 'client cannot call recalculate_daily_summary');

reset role;

select is(
  (select total_calories from public.daily_nutrition_summary
   where user_id = '22222222-2222-2222-2222-222222222222' and date = '2026-10-01'),
  500, 'Bob''s summary untouched');

-- ---------------------------------------------------------------------------
-- Internal functions are not callable by client roles
-- ---------------------------------------------------------------------------

select ok(not has_function_privilege('anon', 'public.increment_food_item_usage(uuid)', 'execute'),
  'anon cannot execute increment_food_item_usage');
select ok(not has_function_privilege('authenticated', 'public.increment_food_item_usage(uuid)', 'execute'),
  'authenticated cannot execute increment_food_item_usage');
select ok(not has_function_privilege('anon', 'public.refresh_popular_food_items()', 'execute'),
  'anon cannot execute refresh_popular_food_items');
select ok(not has_function_privilege('authenticated', 'public.refresh_popular_food_items()', 'execute'),
  'authenticated cannot execute refresh_popular_food_items');
select ok(has_function_privilege('service_role', 'public.refresh_popular_food_items()', 'execute'),
  'service_role can still execute refresh_popular_food_items');
select ok(not has_function_privilege('anon', 'public.recalculate_daily_summary(uuid, date)', 'execute'),
  'anon cannot execute recalculate_daily_summary');

select * from finish();
rollback;
