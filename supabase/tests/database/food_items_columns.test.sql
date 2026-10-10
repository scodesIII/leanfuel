begin;
create extension if not exists pgtap with schema extensions;

select plan(10);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.local');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

-- Allowed columns (id isn't one: it's generated server-side)
select lives_ok(
  $$ insert into public.food_items (created_by, source, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g)
     values ('11111111-1111-1111-1111-111111111111', 'user-created', 'My flapjack', 60, 'g', 250, 4, 30, 12) $$,
  'client can create a food with editable columns');
select lives_ok(
  $$ update public.food_items set name = 'My flapjack v2', calories = 260
     where name like 'My flapjack%' $$,
  'client can edit nutrition on own food');

-- Locked columns
select throws_ok(
  $$ insert into public.food_items (created_by, source, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, is_verified)
     values ('11111111-1111-1111-1111-111111111111', 'user-created', 'Fake', 1, 'g', 1, 1, 1, 1, true) $$,
  '42501', null, 'client cannot insert is_verified');
select throws_ok(
  $$ insert into public.food_items (created_by, source, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, usage_count)
     values ('11111111-1111-1111-1111-111111111111', 'user-created', 'Fake', 1, 'g', 1, 1, 1, 1, 9999) $$,
  '42501', null, 'client cannot insert usage_count');
select throws_ok(
  $$ update public.food_items set is_verified = true where name like 'My flapjack%' $$,
  '42501', null, 'client cannot update is_verified');
select throws_ok(
  $$ update public.food_items set usage_count = 9999 where name like 'My flapjack%' $$,
  '42501', null, 'client cannot update usage_count');
select throws_ok(
  $$ update public.food_items set last_used_at = now() where name like 'My flapjack%' $$,
  '42501', null, 'client cannot update last_used_at');

-- The usage trigger still works when Alice logs her own food
insert into public.food_logs (user_id, food_item_id, meal_type, servings, calories, protein_g, carbs_g, fat_g, date_logged)
values ('11111111-1111-1111-1111-111111111111', (select id from public.food_items where name like 'My flapjack%'), 'snack', 1, 260, 4, 30, 12, '2026-10-01');

select is(
  (select usage_count from public.food_items where name like 'My flapjack%'),
  1, 'usage trigger still increments usage_count');

reset role;

select ok(not has_table_privilege('anon', 'public.food_items', 'insert'), 'anon cannot insert food_items');
select ok(not (select is_verified from public.food_items where name like 'My flapjack%'),
  'food still unverified');

select * from finish();
rollback;
