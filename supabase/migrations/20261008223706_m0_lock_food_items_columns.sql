-- M0 (part 3): clients can't write is_verified / usage_count / last_used_at
--
-- The RLS update policy limits *which rows* a user can change (their own
-- user-created foods) but not *which columns*, so a user could mark their own
-- food verified or inflate its usage_count. RLS can't express column rules;
-- column privileges can.
--
-- This is an allowlist: a column added to food_items later is not
-- client-writable until it is granted here. usage_count / last_used_at are
-- still maintained by track_food_item_usage, which runs as the owner.

-- anon never writes food_items (RLS requires auth.uid() anyway)
revoke insert, update, delete, truncate, references, trigger, maintain
  on table public.food_items from anon;

-- Table-level privileges cover every column, so they must go before
-- column-level grants mean anything. Deletes go through soft_delete_food_item.
revoke insert, update, delete, truncate, references, trigger, maintain
  on table public.food_items from authenticated;

grant insert (
  created_by, source,
  barcode, name, brand, serving_size, serving_unit,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
  saturated_fat_g, trans_fat_g, cholesterol_mg, potassium_mg,
  vitamin_a_mcg, vitamin_c_mg, calcium_mg, iron_mg,
  image_url, thumbnail_url, is_public
) on public.food_items to authenticated;

-- created_by / source are pinned by the RLS policy, so they aren't needed here
grant update (
  barcode, name, brand, serving_size, serving_unit,
  calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
  saturated_fat_g, trans_fat_g, cholesterol_mg, potassium_mg,
  vitamin_a_mcg, vitamin_c_mg, calcium_mg, iron_mg,
  image_url, thumbnail_url, is_public
) on public.food_items to authenticated;
