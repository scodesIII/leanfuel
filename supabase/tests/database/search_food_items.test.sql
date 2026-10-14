begin;
create extension if not exists pgtap with schema extensions;

select plan(26);

-- ---------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.local');

insert into public.food_items (name, brand, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g, source, usage_count, created_by, deleted_at)
values
  ('Chicken Breast',                null,    100, 'g', 165, 31, 0,  4,  0,   'admin', 0,  null, null),
  ('Chicken Breast, Skinless, Raw', null,    100, 'g', 120, 23, 0,  2,  0,   'admin', 0,  null, null),
  ('Chicken Tikka Masala',          null,    100, 'g', 150, 12, 8,  8,  1,   'admin', 50, null, null),
  ('Oats, rolled, raw, wholegrain', null,    40,  'g', 150, 5,  27, 3,  4,   'admin', 0,  null, null),
  ('Porridge oats',                 null,    40,  'g', 150, 5,  27, 3,  4,   'admin', 0,  null, null),
  ('Goat cheese',                   null,    30,  'g', 100, 6,  0,  8,  0,   'admin', 0,  null, null),
  ('Egg, boiled',                   null,    50,  'g', 78,  6,  1,  5,  0,   'admin', 0,  null, null),
  ('Eggplant',                      null,    100, 'g', 25,  1,  6,  0,  3,   'admin', 9,  null, null),
  ('Greek Yoghurt',                 'Tesco', 100, 'g', 97,  9,  4,  5,  0.5, 'admin', 0,  null, null),
  ('Chicken nuggets',               null,    100, 'g', 250, 15, 15, 15, 1,   'admin', 0,  null, now()),
  ('Alice flapjack',                null,    60,  'g', 250, 4,  30, 12, 2,   'user-created', 0, '11111111-1111-1111-1111-111111111111', null),
  ('Bob secret chicken',            null,    100, 'g', 200, 20, 0,  10, 0,   'user-created', 0, '22222222-2222-2222-2222-222222222222', null),
  ('Semi-skimmed milk',             null,    200, 'ml', 94, 7,  10, 3,  0,   'admin', 0,  null, null),
  ('Bran (toasted)',                null,    30,  'g', 100, 4,  20, 1,  8,   'admin', 0,  null, null);

-- 60 matching rows to check the limit cap
insert into public.food_items (name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, source)
select 'Apple variety ' || n, 100, 'g', 52, 0, 14, 0, 'admin' from generate_series(1, 60) n;

-- Search as Alice
create function pg_temp.names(q text, lim int default 20) returns text[] language sql as
  $$ select coalesce(array_agg(name order by ord), '{}')
     from public.search_food_items(q, lim) with ordinality as s(id, name, brand, barcode, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, serving_size, serving_unit, image_url, source, is_verified, relevance, ord) $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

-- ---------------------------------------------------------------------------
-- Ranking
-- ---------------------------------------------------------------------------

select is((pg_temp.names('chicken breast'))[1:2],
  array['Chicken Breast', 'Chicken Breast, Skinless, Raw'],
  'exact name first, then longer name containing the query');
select ok(array_position(pg_temp.names('chicken breast'), 'Chicken Tikka Masala') > 2,
  'popular partial match (Tikka, 50 uses) ranks below exact matches');
-- Both score 1.00 on word_similarity; the shorter, closer name breaks the tie
select is((pg_temp.names('oats'))[1:2],
  array['Porridge oats', 'Oats, rolled, raw, wholegrain'],
  'long names containing the word still match fully');
select ok(not ('Goat cheese' = any(pg_temp.names('oats'))),
  'oats does not match Goat cheese (below threshold)');
select ok(array_position(pg_temp.names('egg'), 'Egg, boiled') < array_position(pg_temp.names('egg'), 'Eggplant'),
  'whole-word match beats prefix false positive, even when less popular');

-- ---------------------------------------------------------------------------
-- Typos and brand
-- ---------------------------------------------------------------------------

select ok('Chicken Breast' = any(pg_temp.names('chiken')), 'typo: chiken finds chicken');
select ok('Porridge oats' = any(pg_temp.names('porige')), 'typo: porige finds porridge (needs threshold <= 0.43)');
select ok('Greek Yoghurt' = any(pg_temp.names('yogurt')), 'spelling variant: yogurt finds yoghurt');
select ok('Greek Yoghurt' = any(pg_temp.names('tesco yoghurt')), 'brand is searchable');

-- ---------------------------------------------------------------------------
-- Visibility (RLS via SECURITY INVOKER)
-- ---------------------------------------------------------------------------

select ok('Alice flapjack' = any(pg_temp.names('flapjack')), 'user sees own private food');
select ok(not ('Bob secret chicken' = any(pg_temp.names('secret chicken'))), 'user cannot see another user''s private food');
select ok(not ('Chicken nuggets' = any(pg_temp.names('chicken nuggets'))), 'soft-deleted foods are excluded');

-- ---------------------------------------------------------------------------
-- Input handling
-- ---------------------------------------------------------------------------

select is(cardinality(pg_temp.names('a')), 0, '1-char query returns nothing');
select is(cardinality(pg_temp.names(null)), 0, 'null query returns nothing');
select is(pg_temp.names('ch'),
  array['Chicken Tikka Masala', 'Chicken Breast', 'Chicken Breast, Skinless, Raw', 'Goat cheese'],
  '2-char query: names starting with it first (by usage), then other word matches');
select is(cardinality(pg_temp.names('%%')), 0, 'LIKE wildcards in a 2-char query are literal');
select ok('Semi-skimmed milk' = any(pg_temp.names('sk')), '2-char: hyphen is a word break');
select ok('Bran (toasted)' = any(pg_temp.names('to')), '2-char: bracket is a word break');
select is(cardinality(pg_temp.names('apple', 1000)), 50, 'limit is capped at 50');

select is(
  (select fiber_g from public.search_food_items('greek yoghurt') limit 1),
  0.5::numeric, 'returns fiber_g for logging');

-- The index probe applies the visibility rule itself
select is(
  (select count(*)::int from private.food_item_search_candidates('secret chicken', 50) c
   join public.food_items f using (id) where f.name = 'Bob secret chicken'),
  0, 'index probe does not return another user''s private food');

reset role;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

select ok(not has_function_privilege('anon', 'public.search_food_items(text, integer, integer)', 'execute'),
  'anon cannot search');
select ok(not (select prosecdef from pg_proc where oid = 'public.search_food_items(text, integer, integer)'::regprocedure),
  'search_food_items is SECURITY INVOKER');
select ok((select prosecdef from pg_proc where oid = 'private.food_item_search_candidates(text, integer)'::regprocedure),
  'index probe is SECURITY DEFINER (so the trigram index is usable)');
select ok(not has_function_privilege('anon', 'private.food_item_search_candidates(text, integer)', 'execute'),
  'anon cannot call the index probe');

-- Defence in depth: replace the probe with one that ignores visibility and
-- returns every row. RLS on search_food_items must still hide Bob's food.
create or replace function private.food_item_search_candidates(p_query text, p_limit integer)
  returns table (id uuid) language sql stable security definer set search_path to 'public'
  as $$ select f.id from food_items f $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select ok(not ('Bob secret chicken' = any(pg_temp.names('secret chicken', 50))),
  'leaky index probe still cannot leak: RLS filters search_food_items');
reset role;

select * from finish();
rollback;
