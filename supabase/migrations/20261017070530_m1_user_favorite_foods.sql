-- M1: user_favorite_foods
--
-- One row per (user, food). The composite primary key makes duplicates
-- impossible; the client can add with upsert + ignoreDuplicates
-- (ON CONFLICT DO NOTHING) and remove with delete.

create table public.user_favorite_foods (
  user_id      uuid        not null default auth.uid()
                           references auth.users (id) on delete cascade,
  food_item_id uuid        not null
                           references public.food_items (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, food_item_id)
);

-- Listing a user's favourites, newest first
create index user_favorite_foods_user_created_idx
  on public.user_favorite_foods (user_id, created_at desc);

-- The primary key leads with user_id, so deleting a food would otherwise scan
-- the whole table to cascade
create index user_favorite_foods_food_item_idx
  on public.user_favorite_foods (food_item_id);

alter table public.user_favorite_foods enable row level security;

create policy "favorites_select_own" on public.user_favorite_foods
  for select to authenticated
  using (user_id = (select auth.uid()));

-- The food must be visible to the user. The subquery runs under food_items
-- RLS, so another user's private food or a deleted food can't be favourited
-- even if its id is known.
create policy "favorites_insert_own" on public.user_favorite_foods
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.food_items f where f.id = food_item_id)
  );

create policy "favorites_delete_own" on public.user_favorite_foods
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- No update: a favourite has nothing to edit
revoke all on table public.user_favorite_foods from anon, authenticated;
grant select, insert, delete on table public.user_favorite_foods to authenticated;


-- Favourite foods, newest first. Same food columns as search_food_items.
-- Foods deleted after being favourited drop out (food_items RLS hides them).
create function public.get_favorite_foods(p_limit integer default 50)
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
    favorited_at timestamptz
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
    fav.created_at
  from user_favorite_foods fav
  join food_items f on f.id = fav.food_item_id
  where fav.user_id = (select auth.uid())
    and f.deleted_at is null
  order by fav.created_at desc, f.id
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$function$;

revoke all on function public.get_favorite_foods(integer) from public, anon;
grant execute on function public.get_favorite_foods(integer) to authenticated, service_role;
