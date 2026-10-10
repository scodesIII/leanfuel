begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

-- ---------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.local');

insert into public.food_items (id, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, source)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test oats',   40,  'g', 150, 5, 27, 3, 'admin'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Test banana', 120, 'g', 105, 1, 27, 0, 'admin');

-- ---------------------------------------------------------------------------
-- Act as Alice: the trigger must work even though she can't call
-- increment_food_item_usage herself
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select throws_ok(
  $$ select public.increment_food_item_usage('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
  '42501', null, 'client cannot call increment_food_item_usage directly');

insert into public.food_logs (id, user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, date_logged)
values
  ('b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'breakfast', 1, 150, 5, 27, 3, '2026-10-01'),
  ('b0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lunch',     1, 150, 5, 27, 3, '2026-10-01');

-- Not changing food_item_id must not count as a new use
update public.food_logs set servings = 2, calories = 300 where id = 'b0000000-0000-0000-0000-000000000001';

-- Switching food counts as a use of the new food
update public.food_logs set food_item_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' where id = 'b0000000-0000-0000-0000-000000000002';

-- Deleting does not decrement
delete from public.food_logs where id = 'b0000000-0000-0000-0000-000000000002';

reset role;

select is(
  (select usage_count from public.food_items where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  2, 'oats: counted once per insert, not on unrelated updates or delete');
select is(
  (select usage_count from public.food_items where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  1, 'banana: counted when a log is switched to it');
select isnt(
  (select last_used_at from public.food_items where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  null, 'banana: last_used_at set');

-- Summary still correct with both triggers on food_logs
select is(
  (select total_calories from public.daily_nutrition_summary
   where user_id = '11111111-1111-1111-1111-111111111111' and date = '2026-10-01'),
  300, 'daily summary unaffected by usage trigger');

select ok(not has_function_privilege('authenticated', 'public.track_food_item_usage()', 'execute'),
  'authenticated cannot execute track_food_item_usage');

select * from finish();
rollback;
