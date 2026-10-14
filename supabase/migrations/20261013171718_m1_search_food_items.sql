-- M1: rewrite search_food_items
--   - Visibility comes from the food_items RLS policy: the public function is
--     SECURITY INVOKER, so a user can never see rows the policy hides.
--   - word_similarity instead of similarity: finds the query inside long names
--     ("oats" vs "Oats, rolled, raw, wholegrain": 1.00 vs 0.19).
--   - Typo tolerant: threshold 0.4 lets "chiken", "porige" etc. match. False
--     positives (egg -> Eggplant) score too high for any threshold to remove;
--     ranking puts them below exact word matches instead.
--   - Short queries: < 2 chars returns nothing, 2 chars matches word prefixes
--     (trigrams of a 2-char string match almost every row).
--   - Inputs are clamped: query <= 100 chars, limit 1..50, offset 0..500.
--   - Returns fiber/sugar/sodium, which the client needs when logging.


-- ---------------------------------------------------------------------------
-- Index probe (private, SECURITY DEFINER)
-- ---------------------------------------------------------------------------

-- Why this exists: under RLS, Postgres runs the policy's checks before any
-- user condition that isn't LEAKPROOF. pg_trgm's <% operator isn't (and only
-- a superuser can mark it), so when the search runs as `authenticated` the
-- planner can't use the trigram index and scans every row. This helper runs
-- as the owner, which bypasses RLS, so the index is used.
--
-- It applies the same visibility rule as food_items_select_policy, and
-- search_food_items joins its ids back to food_items under RLS. So if this copy
-- ever drifts from the policy, the result is missing foods, never leaked ones.
--
-- In a non-exposed schema so PostgREST doesn't publish it as an RPC.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create function private.food_item_search_candidates(p_query text, p_limit integer)
  returns table (id uuid)
  language plpgsql
  stable
  security definer
  set search_path to 'public', 'extensions', 'pg_temp'
as $function$
#variable_conflict use_column
begin
  -- Set here, not with a function-level SET clause: hosted Supabase runs
  -- migrations as the non-superuser postgres role, and pg_trgm's settings are
  -- unknown until its library loads, so CREATE FUNCTION ... SET pg_trgm.*
  -- fails with "permission denied". is_local => true lasts until the end of
  -- the transaction, which under PostgREST is this request.
  perform set_config('pg_trgm.word_similarity_threshold', '0.4', true);

  -- The <% expression must match food_items_search_trgm_idx exactly
  return query
  select f.id
  from food_items f
  where f.deleted_at is null
    and (f.is_public = true or f.source in ('api', 'admin') or f.created_by = (select auth.uid()))
    and p_query <% (f.name || ' ' || coalesce(f.brand, ''))
  order by
    word_similarity(p_query, f.name || ' ' || coalesce(f.brand, '')) desc,  -- query found in name/brand
    similarity(p_query, f.name) desc,                                        -- closer full name wins ties
    coalesce(f.usage_count, 0) desc,
    f.name,
    f.id                                                                     -- unique: stable order
  limit least(greatest(coalesce(p_limit, 1), 1), 550);
end;
$function$;

revoke all on function private.food_item_search_candidates(text, integer) from public, anon;
grant execute on function private.food_item_search_candidates(text, integer) to authenticated, service_role;


-- ---------------------------------------------------------------------------
-- search_food_items (public RPC, SECURITY INVOKER)
-- ---------------------------------------------------------------------------

drop function if exists public.search_food_items(text, integer, integer);

create function public.search_food_items(
  search_query text,
  limit_count  integer default 20,
  offset_count integer default 0
)
  returns table (
    id           uuid,
    name         text,
    brand        text,
    barcode      text,
    calories     integer,
    protein_g    numeric,
    carbs_g      numeric,
    fat_g        numeric,
    fiber_g      numeric,
    sugar_g      numeric,
    sodium_mg    numeric,
    serving_size numeric,
    serving_unit text,
    image_url    text,
    source       text,
    is_verified  boolean,
    relevance    real
  )
  language plpgsql
  stable
  security invoker
  set search_path to 'public', 'extensions', 'pg_temp'
as $function$
#variable_conflict use_column
declare
  v_query  text    := left(btrim(coalesce(search_query, '')), 100);
  v_limit  integer := least(greatest(coalesce(limit_count, 20), 1), 50);
  v_offset integer := least(greatest(coalesce(offset_count, 0), 0), 500);
  v_prefix text;
begin
  if char_length(v_query) < 2 then
    return;
  end if;

  if char_length(v_query) = 2 then
    -- Escape LIKE wildcards so "5%" or "a_" are matched literally
    v_prefix := replace(replace(replace(v_query, '\', '\\'), '%', '\%'), '_', '\_');

    -- Punctuation counts as a word break, like pg_trgm in the 3+ char path,
    -- so "sk" finds "Semi-skimmed" and "ro" finds "Oats (rolled)"
    return query
    select
      f.id, f.name, f.brand, f.barcode,
      f.calories, f.protein_g, f.carbs_g, f.fat_g,
      f.fiber_g, f.sugar_g, f.sodium_mg,
      f.serving_size, f.serving_unit, f.image_url, f.source, f.is_verified,
      word_similarity(v_query, f.name || ' ' || coalesce(f.brand, ''))
    from food_items f
    where f.deleted_at is null
      and (' ' || regexp_replace(f.name || ' ' || coalesce(f.brand, ''), '[^[:alnum:]]+', ' ', 'g'))
          ilike ('% ' || v_prefix || '%')
    order by
      (f.name ilike (v_prefix || '%')) desc,  -- name starts with it
      coalesce(f.usage_count, 0) desc,
      f.name,
      f.id
    limit v_limit offset v_offset;
    return;
  end if;

  -- Candidates come back ranked from the index probe; RLS filters them again here
  return query
  select
    f.id, f.name, f.brand, f.barcode,
    f.calories, f.protein_g, f.carbs_g, f.fat_g,
    f.fiber_g, f.sugar_g, f.sodium_mg,
    f.serving_size, f.serving_unit, f.image_url, f.source, f.is_verified,
    word_similarity(v_query, f.name || ' ' || coalesce(f.brand, ''))
  from private.food_item_search_candidates(v_query, v_limit + v_offset) with ordinality as c(id, rank)
  join food_items f on f.id = c.id
  order by c.rank
  limit v_limit offset v_offset;
end;
$function$;

revoke all on function public.search_food_items(text, integer, integer) from public, anon;
grant execute on function public.search_food_items(text, integer, integer) to authenticated, service_role;


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- Trigram index on the expression searched above. Replaces the name-only
-- trigram index and the full-text index, which only the old function used.
create index food_items_search_trgm_idx on public.food_items
  using gin ((name || ' ' || coalesce(brand, '')) extensions.gin_trgm_ops);

drop index if exists public.food_items_name_trgm_idx;
drop index if exists public.food_items_name_fts_idx;
