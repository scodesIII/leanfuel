begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

-- ---------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'carol@test.local');

insert into public.food_items (id, name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g, source, created_by, deleted_at) values
  ('f0000000-0000-0000-0000-00000000000a', 'Oats',         40,  'g', 150, 5, 27, 3, 4, 'admin', null, null),
  ('f0000000-0000-0000-0000-00000000000b', 'Banana',       120, 'g', 105, 1, 27, 0, 3, 'admin', null, null),
  ('f0000000-0000-0000-0000-00000000000c', 'Old recipe',   100, 'g', 100, 1, 1,  1, 0, 'admin', null, null),
  ('f0000000-0000-0000-0000-00000000000d', 'Bob secret',   100, 'g', 100, 1, 1,  1, 0, 'user-created', '22222222-2222-2222-2222-222222222222', null),
  ('f0000000-0000-0000-0000-00000000000e', 'Already gone', 100, 'g', 100, 1, 1,  1, 0, 'admin', null, now());

-- Bob and Carol favourite Banana
insert into public.user_favorite_foods (user_id, food_item_id) values
  ('22222222-2222-2222-2222-222222222222', 'f0000000-0000-0000-0000-00000000000b'),
  ('33333333-3333-3333-3333-333333333333', 'f0000000-0000-0000-0000-00000000000b');

-- ---------------------------------------------------------------------------
-- As Alice
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.user_favorite_foods (food_item_id, created_at) values
       ('f0000000-0000-0000-0000-00000000000a', now() - interval '2 days'),
       ('f0000000-0000-0000-0000-00000000000c', now() - interval '1 day'),
       ('f0000000-0000-0000-0000-00000000000b', now()) $$,
  'can favourite visible foods; user_id defaults to auth.uid()');

select throws_ok(
  $$ insert into public.user_favorite_foods (food_item_id) values ('f0000000-0000-0000-0000-00000000000a') $$,
  '23505', null, 'duplicate favourite is rejected');
select lives_ok(
  $$ insert into public.user_favorite_foods (food_item_id) values ('f0000000-0000-0000-0000-00000000000a')
     on conflict do nothing $$,
  'duplicate with ON CONFLICT DO NOTHING (client upsert + ignoreDuplicates) is a no-op');

select throws_ok(
  $$ insert into public.user_favorite_foods (user_id, food_item_id)
     values ('22222222-2222-2222-2222-222222222222', 'f0000000-0000-0000-0000-00000000000a') $$,
  '42501', null, 'cannot add a favourite for another user');
select throws_ok(
  $$ insert into public.user_favorite_foods (food_item_id) values ('f0000000-0000-0000-0000-00000000000d') $$,
  '42501', null, 'cannot favourite another user''s private food');
select throws_ok(
  $$ insert into public.user_favorite_foods (food_item_id) values ('f0000000-0000-0000-0000-00000000000e') $$,
  '42501', null, 'cannot favourite a deleted food');
select throws_ok(
  $$ update public.user_favorite_foods set created_at = now() $$,
  '42501', null, 'favourites cannot be updated');

select is((select count(*)::int from public.user_favorite_foods), 3, 'sees only own favourites');

reset role;
-- Food deleted after Alice favourited it
update public.food_items set deleted_at = now() where id = 'f0000000-0000-0000-0000-00000000000c';
set local role authenticated;

select is(
  (select array_agg(name) from public.get_favorite_foods()),
  array['Banana', 'Oats'],
  'get_favorite_foods: newest first, foods deleted later drop out');
select is(
  (select fiber_g from public.get_favorite_foods() where name = 'Oats'),
  4::numeric, 'get_favorite_foods: returns nutrient columns for logging');
select is((select count(*)::int from public.get_favorite_foods(1)), 1, 'get_favorite_foods: limit respected');

-- Alice deletes her Banana; Bob's Banana must survive
delete from public.user_favorite_foods where food_item_id = 'f0000000-0000-0000-0000-00000000000b';
select is((select array_agg(name) from public.get_favorite_foods()), array['Oats'], 'can remove own favourite');

reset role;

select is(
  (select count(*)::int from public.user_favorite_foods where user_id = '22222222-2222-2222-2222-222222222222'),
  1, 'another user''s favourites are untouched by Alice''s delete');

-- ---------------------------------------------------------------------------
-- Cascades and privileges
-- ---------------------------------------------------------------------------

-- Carol, not Bob: deleting a user who created foods currently fails (backlog)
delete from auth.users where id = '33333333-3333-3333-3333-333333333333';
select is(
  (select count(*)::int from public.user_favorite_foods where user_id = '33333333-3333-3333-3333-333333333333'),
  0, 'deleting a user deletes their favourites');

select ok(not has_table_privilege('anon', 'public.user_favorite_foods', 'select'), 'anon cannot read favourites');
select ok(not has_function_privilege('anon', 'public.get_favorite_foods(integer)', 'execute'), 'anon cannot call get_favorite_foods');
select ok(not (select prosecdef from pg_proc where oid = 'public.get_favorite_foods(integer)'::regprocedure),
  'get_favorite_foods is SECURITY INVOKER');

select * from finish();
rollback;
