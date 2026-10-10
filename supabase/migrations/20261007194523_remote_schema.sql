SET local check_function_bodies = off;

CREATE EXTENSION "pg_trgm" SCHEMA "extensions";

CREATE TABLE "public"."daily_nutrition_summary" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"             uuid                     NOT NULL,
  "date"                date                     NOT NULL,
  "total_calories"      integer                  NOT NULL DEFAULT 0,
  "total_protein_g"     numeric                  NOT NULL DEFAULT 0,
  "total_carbs_g"       numeric                  NOT NULL DEFAULT 0,
  "total_fat_g"         numeric                  NOT NULL DEFAULT 0,
  "total_fiber_g"       numeric                  NOT NULL DEFAULT 0,
  "total_sugar_g"       numeric                  NOT NULL DEFAULT 0,
  "total_sodium_mg"     numeric                  NOT NULL DEFAULT 0,
  "breakfast_calories"  integer                  DEFAULT 0,
  "lunch_calories"      integer                  DEFAULT 0,
  "dinner_calories"     integer                  DEFAULT 0,
  "snacks_calories"     integer                  DEFAULT 0,
  "breakfast_protein_g" numeric                  DEFAULT 0,
  "breakfast_carbs_g"   numeric                  DEFAULT 0,
  "breakfast_fat_g"     numeric                  DEFAULT 0,
  "lunch_protein_g"     numeric                  DEFAULT 0,
  "lunch_carbs_g"       numeric                  DEFAULT 0,
  "lunch_fat_g"         numeric                  DEFAULT 0,
  "dinner_protein_g"    numeric                  DEFAULT 0,
  "dinner_carbs_g"      numeric                  DEFAULT 0,
  "dinner_fat_g"        numeric                  DEFAULT 0,
  "snacks_protein_g"    numeric                  DEFAULT 0,
  "snacks_carbs_g"      numeric                  DEFAULT 0,
  "snacks_fat_g"        numeric                  DEFAULT 0,
  "calorie_goal"        integer,
  "protein_goal_g"      numeric,
  "carbs_goal_g"        numeric,
  "fat_goal_g"          numeric,
  "entries_count"       integer                  DEFAULT 0,
  "last_meal_time"      timestamp with time zone,
  "created_at"          timestamp with time zone DEFAULT now(),
  "updated_at"          timestamp with time zone DEFAULT now(),
  CONSTRAINT "daily_nutrition_summary_breakfast_calories_check" CHECK ((breakfast_calories >= 0)),
  CONSTRAINT "daily_nutrition_summary_dinner_calories_check" CHECK ((dinner_calories >= 0)),
  CONSTRAINT "daily_nutrition_summary_entries_count_check" CHECK ((entries_count >= 0)),
  CONSTRAINT "daily_nutrition_summary_lunch_calories_check" CHECK ((lunch_calories >= 0)),
  CONSTRAINT "daily_nutrition_summary_pkey" PRIMARY KEY (id),
  CONSTRAINT "daily_nutrition_summary_snacks_calories_check" CHECK ((snacks_calories >= 0)),
  CONSTRAINT "daily_nutrition_summary_total_calories_check" CHECK ((total_calories >= 0)),
  CONSTRAINT "daily_nutrition_summary_total_carbs_g_check" CHECK ((total_carbs_g >= (0)::numeric)),
  CONSTRAINT "daily_nutrition_summary_total_fat_g_check" CHECK ((total_fat_g >= (0)::numeric)),
  CONSTRAINT "daily_nutrition_summary_total_fiber_g_check" CHECK ((total_fiber_g >= (0)::numeric)),
  CONSTRAINT "daily_nutrition_summary_total_protein_g_check" CHECK ((total_protein_g >= (0)::numeric)),
  CONSTRAINT "daily_nutrition_summary_total_sodium_mg_check" CHECK ((total_sodium_mg >= (0)::numeric)),
  CONSTRAINT "daily_nutrition_summary_total_sugar_g_check" CHECK ((total_sugar_g >= (0)::numeric)),
  CONSTRAINT "daily_nutrition_summary_unique" UNIQUE (user_id, date)
);

ALTER TABLE "public"."daily_nutrition_summary"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."daily_water_summary" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "date"           date                     NOT NULL,
  "total_ml"       integer                  NOT NULL DEFAULT 0,
  "total_glasses"  integer                  NOT NULL DEFAULT 0,
  "entries_count"  integer                  NOT NULL DEFAULT 0,
  "daily_goal_ml"  integer,
  "first_log_time" time without time zone,
  "last_log_time"  time without time zone,
  "created_at"     timestamp with time zone DEFAULT now(),
  "updated_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "daily_water_summary_pkey" PRIMARY KEY (id),
  CONSTRAINT "daily_water_summary_user_id_date_key" UNIQUE (user_id, date)
);

ALTER TABLE "public"."daily_water_summary"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."food_items" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "barcode"         text,
  "name"            text                     NOT NULL,
  "brand"           text,
  "serving_size"    numeric                  NOT NULL,
  "serving_unit"    text                     NOT NULL,
  "calories"        integer                  NOT NULL,
  "protein_g"       numeric                  NOT NULL,
  "carbs_g"         numeric                  NOT NULL,
  "fat_g"           numeric                  NOT NULL,
  "fiber_g"         numeric                  DEFAULT 0,
  "sugar_g"         numeric                  DEFAULT 0,
  "sodium_mg"       numeric                  DEFAULT 0,
  "saturated_fat_g" numeric,
  "trans_fat_g"     numeric,
  "cholesterol_mg"  numeric,
  "potassium_mg"    numeric,
  "vitamin_a_mcg"   numeric,
  "vitamin_c_mg"    numeric,
  "calcium_mg"      numeric,
  "iron_mg"         numeric,
  "created_by"      uuid,
  "is_public"       boolean                  DEFAULT false,
  "is_verified"     boolean                  DEFAULT false,
  "source"          text                     NOT NULL,
  "source_id"       text,
  "api_provider"    text,
  "image_url"       text,
  "thumbnail_url"   text,
  "usage_count"     integer                  DEFAULT 0,
  "created_at"      timestamp with time zone DEFAULT now(),
  "updated_at"      timestamp with time zone DEFAULT now(),
  "last_used_at"    timestamp with time zone,
  "deleted_at"      timestamp with time zone,
  CONSTRAINT "api_items_must_have_source_id" CHECK ((((source = 'api'::text) AND (source_id IS NOT NULL) AND (api_provider IS NOT NULL)) OR (source <> 'api'::text))),
  CONSTRAINT "brand_length" CHECK (((char_length(brand) <= 100) OR (brand IS NULL))),
  CONSTRAINT "food_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "food_items_source_check" CHECK ((source = ANY (ARRAY['api'::text, 'user-created'::text, 'admin'::text]))),
  CONSTRAINT "name_length" CHECK ((char_length(name) <= 200)),
  CONSTRAINT "name_not_empty" CHECK ((char_length(TRIM(BOTH FROM name)) > 0)),
  CONSTRAINT "user_created_must_have_creator" CHECK ((((source = 'user-created'::text) AND (created_by IS NOT NULL)) OR (source <> 'user-created'::text))),
  CONSTRAINT "valid_calories" CHECK ((calories >= 0)),
  CONSTRAINT "valid_fiber" CHECK (((fiber_g IS NULL) OR (fiber_g >= (0)::numeric))),
  CONSTRAINT "valid_image_url" CHECK (((image_url IS NULL) OR (image_url ~ '^https?://[a-zA-Z0-9-._~:/?#[\]@!$&''()*+,;=%]+$'::text))),
  CONSTRAINT "valid_macros" CHECK (((protein_g >= (0)::numeric) AND (carbs_g >= (0)::numeric) AND (fat_g >= (0)::numeric))),
  CONSTRAINT "valid_serving_size" CHECK ((serving_size > (0)::numeric)),
  CONSTRAINT "valid_serving_unit" CHECK ((char_length(serving_unit) <= 50)),
  CONSTRAINT "valid_sodium" CHECK (((sodium_mg IS NULL) OR (sodium_mg >= (0)::numeric))),
  CONSTRAINT "valid_sugar" CHECK (((sugar_g IS NULL) OR (sugar_g >= (0)::numeric))),
  CONSTRAINT "valid_thumbnail_url" CHECK (((thumbnail_url IS NULL) OR (thumbnail_url ~ '^https?://[a-zA-Z0-9-._~:/?#[\]@!$&''()*+,;=%]+$'::text)))
);

ALTER TABLE "public"."food_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."food_logs" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"               uuid                     NOT NULL,
  "food_item_id"          uuid                     NOT NULL,
  "meal_type"             text                     NOT NULL,
  "servings"              numeric                  NOT NULL,
  "serving_size_override" numeric,
  "serving_unit_override" text,
  "calories"              integer                  NOT NULL,
  "protein_g"             numeric                  NOT NULL,
  "carbs_g"               numeric                  NOT NULL,
  "fat_g"                 numeric                  NOT NULL,
  "fiber_g"               numeric                  DEFAULT 0,
  "sugar_g"               numeric                  DEFAULT 0,
  "sodium_mg"             numeric                  DEFAULT 0,
  "consumed_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "date_logged"           date                     NOT NULL,
  "notes"                 text,
  "created_at"            timestamp with time zone DEFAULT now(),
  "updated_at"            timestamp with time zone DEFAULT now(),
  CONSTRAINT "food_logs_calories_check" CHECK ((calories >= 0)),
  CONSTRAINT "food_logs_carbs_g_check" CHECK ((carbs_g >= (0)::numeric)),
  CONSTRAINT "food_logs_fat_g_check" CHECK ((fat_g >= (0)::numeric)),
  CONSTRAINT "food_logs_fiber_g_check" CHECK ((fiber_g >= (0)::numeric)),
  CONSTRAINT "food_logs_meal_type_check" CHECK ((meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text]))),
  CONSTRAINT "food_logs_pkey" PRIMARY KEY (id),
  CONSTRAINT "food_logs_protein_g_check" CHECK ((protein_g >= (0)::numeric)),
  CONSTRAINT "food_logs_servings_check" CHECK ((servings > (0)::numeric)),
  CONSTRAINT "food_logs_sodium_mg_check" CHECK ((sodium_mg >= (0)::numeric)),
  CONSTRAINT "food_logs_sugar_g_check" CHECK ((sugar_g >= (0)::numeric)),
  CONSTRAINT "notes_length" CHECK (((notes IS NULL) OR (char_length(notes) <= 500))),
  CONSTRAINT "serving_size_override_positive" CHECK (((serving_size_override IS NULL) OR (serving_size_override > (0)::numeric))),
  CONSTRAINT "serving_unit_length" CHECK (((serving_unit_override IS NULL) OR (char_length(serving_unit_override) <= 50))),
  CONSTRAINT "valid_servings" CHECK (((servings > (0)::numeric) AND (servings <= (50)::numeric)))
);

ALTER TABLE "public"."food_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"                      uuid                     NOT NULL,
  "display_name"            text,
  "avatar_url"              text,
  "email"                   text,
  "full_name"               text,
  "daily_calorie_goal"      integer                  DEFAULT 2000,
  "protein_goal_g"          integer                  DEFAULT 150,
  "carbs_goal_g"            integer                  DEFAULT 225,
  "fat_goal_g"              integer                  DEFAULT 67,
  "preferred_units"         text                     DEFAULT 'metric'::text,
  "timezone"                text                     DEFAULT 'UTC'::text,
  "onboarding_completed"    boolean                  DEFAULT false,
  "profile_completed"       boolean                  DEFAULT false,
  "created_at"              timestamp with time zone DEFAULT now(),
  "updated_at"              timestamp with time zone DEFAULT now(),
  "last_login"              timestamp with time zone DEFAULT now(),
  "goal"                    text,
  "activity_level"          text,
  "dietary_preferences"     jsonb                    DEFAULT '[]'::jsonb,
  "age"                     integer,
  "gender"                  text,
  "current_weight"          numeric(5,1),
  "target_weight"           numeric(5,1),
  "height"                  numeric(5,1),
  "timeframe"               text,
  "tdee"                    integer,
  "bmr"                     integer,
  "onboarding_completed_at" timestamp with time zone,
  "daily_water_goal_ml"     integer                  DEFAULT 2000,
  CONSTRAINT "display_name_length" CHECK ((char_length(display_name) >= 3)),
  CONSTRAINT "positive_goals" CHECK (((daily_calorie_goal > 0) AND (protein_goal_g >= 0) AND (carbs_goal_g >= 0) AND (fat_goal_g >= 0))),
  CONSTRAINT "profiles_activity_level_check" CHECK ((activity_level = ANY (ARRAY['sedentary'::text, 'light'::text, 'moderate'::text, 'very'::text, 'extra'::text]))),
  CONSTRAINT "profiles_daily_water_goal_ml_check" CHECK (((daily_water_goal_ml >= 1000) AND (daily_water_goal_ml <= 5000))),
  CONSTRAINT "profiles_gender_check" CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text]))),
  CONSTRAINT "profiles_goal_check" CHECK ((goal = ANY (ARRAY['lose'::text, 'maintain'::text, 'gain'::text]))),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_preferred_units_check" CHECK ((preferred_units = ANY (ARRAY['metric'::text, 'imperial'::text]))),
  CONSTRAINT "profiles_timeframe_check" CHECK ((timeframe = ANY (ARRAY['3months'::text, '6months'::text, '12months'::text, 'flexible'::text]))),
  CONSTRAINT "valid_avatar_url" CHECK (((avatar_url IS NULL) OR (avatar_url ~ '^https?://[a-zA-Z0-9-._~:/?#[\]@!$&''()*+,;=%]+$'::text)))
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."water_logs" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid                     NOT NULL,
  "amount_ml"      integer                  NOT NULL,
  "container_type" text,
  "logged_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "date_logged"    date                     NOT NULL DEFAULT CURRENT_DATE,
  "notes"          text,
  "created_at"     timestamp with time zone DEFAULT now(),
  "updated_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "water_logs_amount_ml_check" CHECK (((amount_ml >= 50) AND (amount_ml <= 2000))),
  CONSTRAINT "water_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."water_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."weight_logs" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "weight"     numeric(5,1)             NOT NULL,
  "date"       date                     NOT NULL DEFAULT CURRENT_DATE,
  "notes"      text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "weight_logs_pkey" PRIMARY KEY (id),
  CONSTRAINT "weight_logs_user_id_date_key" UNIQUE (user_id, date)
);

ALTER TABLE "public"."weight_logs"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."daily_water_summary"
  ADD COLUMN "goal_percentage" integer GENERATED ALWAYS AS (
CASE
    WHEN (daily_goal_ml > 0) THEN ((total_ml * 100) / daily_goal_ml)
    ELSE 0
END) STORED;

CREATE OR REPLACE FUNCTION public.add_water_bottle()
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$ BEGIN RETURN log_water(500, 'bottle'); END; $function$;

CREATE OR REPLACE FUNCTION public.add_water_glass()
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$ BEGIN RETURN log_water(250, 'glass'); END; $function$;

CREATE OR REPLACE FUNCTION public.add_water_liter()
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$ BEGIN RETURN log_water(1000, 'liter'); END; $function$;

CREATE OR REPLACE FUNCTION public.calculate_macro_goals (
  p_daily_calories integer,
  p_goal           text
)
  RETURNS TABLE (
    protein_g numeric,
    carbs_g   numeric,
    fat_g     numeric
  )
  LANGUAGE plpgsql
  IMMUTABLE
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_protein_ratio NUMERIC;
  v_fat_ratio NUMERIC;
  v_carbs_ratio NUMERIC;
BEGIN
  -- Macro ratios based on goal
  CASE p_goal
    WHEN 'lose' THEN
      v_protein_ratio := 0.35;
      v_fat_ratio := 0.30;
      v_carbs_ratio := 0.35;
    WHEN 'maintain' THEN
      v_protein_ratio := 0.30;
      v_fat_ratio := 0.30;
      v_carbs_ratio := 0.40;
    WHEN 'gain' THEN
      v_protein_ratio := 0.30;
      v_fat_ratio := 0.25;
      v_carbs_ratio := 0.45;
    ELSE
      v_protein_ratio := 0.30;
      v_fat_ratio := 0.30;
      v_carbs_ratio := 0.40;
  END CASE;

  RETURN QUERY SELECT
    ROUND((p_daily_calories * v_protein_ratio) / 4.0, 1),
    ROUND((p_daily_calories * v_carbs_ratio) / 4.0, 1),
    ROUND((p_daily_calories * v_fat_ratio) / 9.0, 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_macro_goals (
  p_tdee           integer,
  p_goal           text,
  p_current_weight numeric,
  p_target_weight  numeric
)
  RETURNS json
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_calorie_goal INTEGER;
  v_protein_goal INTEGER;
  v_fat_goal INTEGER;
  v_carbs_goal INTEGER;
  v_protein_multiplier NUMERIC;
  v_fat_multiplier NUMERIC;
  v_weight_for_protein NUMERIC;
  v_protein_calories INTEGER;
  v_fat_calories INTEGER;
  v_remaining_calories INTEGER;
  v_min_fat_calories INTEGER;
BEGIN
  -- STEP 1: Adjust calories based on goal
  CASE p_goal
    WHEN 'lose' THEN
      v_calorie_goal := p_tdee - 500; -- 500 cal deficit (~0.5kg/week loss)
    WHEN 'gain' THEN
      v_calorie_goal := p_tdee + 300; -- 300 cal surplus (lean gains)
    ELSE -- maintain
      v_calorie_goal := p_tdee;
  END CASE;

  -- STEP 2: Calculate PROTEIN (evidence-based: 1.6-2.2 g/kg)
  -- If user is trying to lose significant weight (>15%), use average weight
  v_weight_for_protein := p_current_weight;
  
  IF p_goal = 'lose' AND p_target_weight < (p_current_weight * 0.85) THEN
    v_weight_for_protein := (p_current_weight + p_target_weight) / 2;
  END IF;

  -- Set protein multiplier based on goal
  v_protein_multiplier := CASE p_goal
    WHEN 'lose' THEN 2.0  -- 2.0 g/kg during deficit (preserves muscle)
    WHEN 'gain' THEN 1.8  -- 1.8 g/kg during surplus
    ELSE 1.8              -- 1.8 g/kg for maintenance
  END CASE;

  v_protein_goal := ROUND(v_weight_for_protein * v_protein_multiplier);
  v_protein_calories := v_protein_goal * 4; -- 4 cal/g

  -- STEP 3: Calculate FAT (minimum: 0.9 g/kg OR 25% of calories)
  v_fat_multiplier := 0.9;
  v_fat_goal := ROUND(p_current_weight * v_fat_multiplier);
  v_fat_calories := v_fat_goal * 9; -- 9 cal/g
  
  -- Ensure fat is at least 25% of total calories (hormone health)
  v_min_fat_calories := ROUND(v_calorie_goal * 0.25);
  IF v_fat_calories < v_min_fat_calories THEN
    v_fat_calories := v_min_fat_calories;
    v_fat_goal := ROUND(v_fat_calories / 9);
  END IF;

  -- STEP 4: Calculate CARBS (fill remaining calories)
  v_remaining_calories := v_calorie_goal - v_protein_calories - v_fat_calories;
  v_carbs_goal := ROUND(v_remaining_calories / 4); -- 4 cal/g

  -- Safety check: ensure carbs aren't too low
  IF v_carbs_goal < 50 THEN
    v_carbs_goal := 50;
    v_remaining_calories := v_calorie_goal - v_protein_calories - (v_carbs_goal * 4);
    v_fat_goal := ROUND(v_remaining_calories / 9);
  END IF;

  RETURN json_build_object(
    'calorie_goal', v_calorie_goal,
    'protein_goal_g', v_protein_goal,
    'carbs_goal_g', v_carbs_goal,
    'fat_goal_g', v_fat_goal,
    'protein_multiplier', v_protein_multiplier,
    'fat_multiplier', v_fat_multiplier,
    'weight_used_for_protein', ROUND(v_weight_for_protein, 1),
    'protein_percentage', ROUND((v_protein_calories::NUMERIC / v_calorie_goal) * 100),
    'fat_percentage', ROUND((v_fat_goal * 9::NUMERIC / v_calorie_goal) * 100),
    'carbs_percentage', ROUND((v_carbs_goal * 4::NUMERIC / v_calorie_goal) * 100)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_tdee (
  p_age            integer,
  p_weight         numeric,
  p_height         numeric,
  p_gender         text,
  p_activity_level text
)
  RETURNS json
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_temp'
  AS $function$
DECLARE
  v_bmr NUMERIC;
  v_activity_multiplier NUMERIC;
  v_tdee INTEGER;
BEGIN
  -- Calculate BMR using Mifflin-St Jeor equation
  -- Men: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) + 5
  -- Women: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) − 161
  
  IF p_gender = 'male' THEN
    v_bmr := (10 * p_weight) + (6.25 * p_height) - (5 * p_age) + 5;
  ELSIF p_gender = 'female' THEN
    v_bmr := (10 * p_weight) + (6.25 * p_height) - (5 * p_age) - 161;
  ELSE
    -- Use average for 'other'
    v_bmr := (10 * p_weight) + (6.25 * p_height) - (5 * p_age) - 78;
  END IF;

  -- Apply activity multiplier
  v_activity_multiplier := CASE p_activity_level
    WHEN 'sedentary' THEN 1.2
    WHEN 'light' THEN 1.375
    WHEN 'moderate' THEN 1.55
    WHEN 'very' THEN 1.725
    WHEN 'extra' THEN 1.9
    ELSE 1.2
  END;

  v_tdee := ROUND(v_bmr * v_activity_multiplier);

  RETURN json_build_object(
    'bmr', ROUND(v_bmr),
    'tdee', v_tdee,
    'activity_multiplier', v_activity_multiplier
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_tdee (
  p_bmr            integer,
  p_activity_level text
)
  RETURNS integer
  LANGUAGE plpgsql
  IMMUTABLE
  SET search_path TO 'public', 'pg_temp'
  AS $function$
BEGIN
  RETURN CASE p_activity_level
    WHEN 'sedentary' THEN ROUND(p_bmr * 1.2)
    WHEN 'light' THEN ROUND(p_bmr * 1.375)
    WHEN 'moderate' THEN ROUND(p_bmr * 1.55)
    WHEN 'very' THEN ROUND(p_bmr * 1.725)
    WHEN 'extra' THEN ROUND(p_bmr * 1.9)
    ELSE p_bmr
  END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_onboarding (
  p_user_id             uuid,
  p_goal                text,
  p_activity_level      text,
  p_dietary_preferences jsonb,
  p_age                 integer,
  p_gender              text,
  p_current_weight      numeric,
  p_target_weight       numeric,
  p_height              numeric,
  p_timeframe           text
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_tdee_result JSON;
  v_macro_result JSON;
  v_tdee INTEGER;
  v_bmr INTEGER;
  v_calorie_goal INTEGER;
  v_protein_goal INTEGER;
  v_carbs_goal INTEGER;
  v_fat_goal INTEGER;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Validate user is authenticated
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only update own profile';
  END IF;

  -- Calculate TDEE and BMR
  v_tdee_result := calculate_tdee(p_age, p_current_weight, p_height, p_gender, p_activity_level);
  v_tdee := (v_tdee_result->>'tdee')::INTEGER;
  v_bmr := (v_tdee_result->>'bmr')::INTEGER;

  -- Calculate macro goals
  v_macro_result := calculate_macro_goals(v_tdee, p_goal, p_current_weight, p_target_weight);
  v_calorie_goal := (v_macro_result->>'calorie_goal')::INTEGER;
  v_protein_goal := (v_macro_result->>'protein_goal_g')::INTEGER;
  v_carbs_goal := (v_macro_result->>'carbs_goal_g')::INTEGER;
  v_fat_goal := (v_macro_result->>'fat_goal_g')::INTEGER;

  -- Update profile (ATOMIC - all or nothing)
  UPDATE profiles
  SET
    goal = p_goal,
    activity_level = p_activity_level,
    dietary_preferences = p_dietary_preferences,
    age = p_age,
    gender = p_gender,
    current_weight = p_current_weight,
    target_weight = p_target_weight,
    height = p_height,
    timeframe = p_timeframe,
    tdee = v_tdee,
    bmr = v_bmr,
    daily_calorie_goal = v_calorie_goal,
    protein_goal_g = v_protein_goal,
    carbs_goal_g = v_carbs_goal,
    fat_goal_g = v_fat_goal,
    onboarding_completed = true,
    onboarding_completed_at = now(),
    profile_completed = true,
    updated_at = now()
  WHERE id = p_user_id;

  -- Insert initial weight log
  INSERT INTO weight_logs (user_id, weight, date, notes)
  VALUES (p_user_id, p_current_weight, CURRENT_DATE, 'Initial weight from onboarding')
  ON CONFLICT (user_id, date) DO UPDATE
  SET weight = p_current_weight, notes = 'Updated from onboarding';

  -- Return complete profile data
  RETURN json_build_object(
    'success', true,
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = p_user_id),
    'calculations', json_build_object(
      'bmr', v_bmr,
      'tdee', v_tdee,
      'calorie_goal', v_calorie_goal,
      'protein_goal_g', v_protein_goal,
      'carbs_goal_g', v_carbs_goal,
      'fat_goal_g', v_fat_goal,
      'protein_percentage', (v_macro_result->>'protein_percentage')::INTEGER,
      'fat_percentage', (v_macro_result->>'fat_percentage')::INTEGER,
      'carbs_percentage', (v_macro_result->>'carbs_percentage')::INTEGER
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_water_log (
  p_water_log_id uuid
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_user_id UUID;
  v_date_logged DATE;
  v_goal_ml INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  -- Verify ownership
  SELECT date_logged INTO v_date_logged
  FROM water_logs
  WHERE id = p_water_log_id AND user_id = v_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Water log not found';
  END IF;

  -- Delete entry
  DELETE FROM water_logs WHERE id = p_water_log_id;

  -- Get goal
  SELECT daily_water_goal_ml INTO v_goal_ml
  FROM profiles
  WHERE id = v_user_id;

  -- Recalculate summary
  UPDATE daily_water_summary SET
    total_ml = (SELECT COALESCE(SUM(amount_ml), 0) FROM water_logs WHERE user_id = v_user_id AND date_logged = v_date_logged),
    total_glasses = (SELECT ROUND(COALESCE(SUM(amount_ml), 0) / 250.0) FROM water_logs WHERE user_id = v_user_id AND date_logged = v_date_logged),
    entries_count = (SELECT COUNT(*) FROM water_logs WHERE user_id = v_user_id AND date_logged = v_date_logged),
    updated_at = now()
  WHERE user_id = v_user_id AND date = v_date_logged;

  RETURN json_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_weight_log (
  p_id uuid
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_latest  weight_logs;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM weight_logs WHERE id = p_id AND user_id = v_user_id;

  SELECT * INTO v_latest
  FROM weight_logs
  WHERE user_id = v_user_id
  ORDER BY date DESC
  LIMIT 1;

  -- v_latest.weight is NULL when no rows remain → current_weight clears, correctly.
  UPDATE profiles SET current_weight = v_latest.weight, updated_at = now()
  WHERE id = v_user_id;

  RETURN json_build_object('success', true, 'current_weight', v_latest.weight);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_nutrition_goals (
  p_user_id uuid
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT 
    daily_calorie_goal,
    protein_goal_g,
    carbs_goal_g,
    fat_goal_g
  INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Profile not found');
  END IF;

  RETURN json_build_object(
    'daily_calories', v_profile.daily_calorie_goal,
    'protein_g', v_profile.protein_goal_g,
    'carbs_g', v_profile.carbs_goal_g,
    'fat_g', v_profile.fat_goal_g
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_nutrition_range (
  start_date date,
  end_date   date
)
  RETURNS TABLE (
    date            date,
    total_calories  integer,
    total_protein_g numeric,
    total_carbs_g   numeric,
    total_fat_g     numeric,
    calorie_goal    integer,
    entries_count   integer
  )
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'extensions'
  AS $function$
begin
  return query
  select 
    s.date,
    s.total_calories,
    s.total_protein_g,
    s.total_carbs_g,
    s.total_fat_g,
    s.calorie_goal,
    s.entries_count
  from daily_nutrition_summary s
  where s.user_id = (select auth.uid())
    and s.date between start_date and end_date
  order by s.date desc;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_todays_nutrition()
  RETURNS TABLE (
    total_calories  integer,
    total_protein_g numeric,
    total_carbs_g   numeric,
    total_fat_g     numeric,
    calorie_goal    integer,
    protein_goal_g  numeric,
    carbs_goal_g    numeric,
    fat_goal_g      numeric,
    entries_count   integer
  )
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'extensions'
  AS $function$
begin
  return query
  select 
    s.total_calories,
    s.total_protein_g,
    s.total_carbs_g,
    s.total_fat_g,
    s.calorie_goal,
    s.protein_goal_g,
    s.carbs_goal_g,
    s.fat_goal_g,
    s.entries_count
  from daily_nutrition_summary s
  where s.user_id = (select auth.uid())
    and s.date = current_date;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_todays_water()
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_user_id UUID;
  v_summary RECORD;
  v_goal_ml INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's goal
  SELECT daily_water_goal_ml INTO v_goal_ml
  FROM profiles
  WHERE id = v_user_id;

  -- Get today's summary
  SELECT * INTO v_summary
  FROM daily_water_summary
  WHERE user_id = v_user_id AND date = CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'total_ml', 0,
      'total_glasses', 0,
      'entries_count', 0,
      'goal_ml', v_goal_ml,
      'percentage', 0,
      'remaining_ml', v_goal_ml
    );
  END IF;

  RETURN json_build_object(
    'total_ml', v_summary.total_ml,
    'total_glasses', v_summary.total_glasses,
    'entries_count', v_summary.entries_count,
    'goal_ml', v_summary.daily_goal_ml,
    'percentage', v_summary.goal_percentage,
    'remaining_ml', GREATEST(0, v_summary.daily_goal_ml - v_summary.total_ml),
    'first_log_time', v_summary.first_log_time,
    'last_log_time', v_summary.last_log_time
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_water_history (
  p_days integer DEFAULT 7
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  RETURN (
    SELECT COALESCE(json_agg(
      json_build_object(
        'date', date,
        'total_ml', total_ml,
        'total_glasses', total_glasses,
        'goal_ml', daily_goal_ml,
        'percentage', goal_percentage,
        'entries_count', entries_count
      )
      ORDER BY date DESC
    ), '[]'::json)
    FROM daily_water_summary
    WHERE user_id = v_user_id
      AND date >= CURRENT_DATE - p_days
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_food_items_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  insert into public.profiles (
    id, 
    display_name, 
    avatar_url, 
    email,
    full_name
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'name', 
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  update public.profiles
  set 
    email = new.email,
    avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', avatar_url),
    full_name = coalesce(new.raw_user_meta_data->>'full_name', full_name),
    updated_at = now()
  where id = new.id;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.increment_food_item_usage (
  food_item_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  update food_items
  set 
    usage_count = usage_count + 1,
    last_used_at = now()
  where id = food_item_id and deleted_at is null;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_water (
  p_amount_ml      integer,
  p_container_type text    DEFAULT NULL::text,
  p_notes          text    DEFAULT NULL::text
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_user_id UUID;
  v_water_log_id UUID;
  v_date_logged DATE;
  v_total_ml INTEGER;
  v_goal_ml INTEGER;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate amount
  IF p_amount_ml < 50 OR p_amount_ml > 2000 THEN
    RAISE EXCEPTION 'Amount must be between 50ml and 2000ml';
  END IF;

  v_date_logged := CURRENT_DATE;

  -- Insert water log
  INSERT INTO water_logs (user_id, amount_ml, container_type, notes, date_logged)
  VALUES (v_user_id, p_amount_ml, p_container_type, p_notes, v_date_logged)
  RETURNING id INTO v_water_log_id;

  -- Get user's goal
  SELECT daily_water_goal_ml INTO v_goal_ml
  FROM profiles
  WHERE id = v_user_id;

  -- Update daily summary
  INSERT INTO daily_water_summary (
    user_id, date, total_ml, total_glasses, entries_count, daily_goal_ml,
    first_log_time, last_log_time, updated_at
  )
  SELECT
    v_user_id,
    v_date_logged,
    SUM(amount_ml),
    ROUND(SUM(amount_ml) / 250.0),
    COUNT(*),
    v_goal_ml,
    MIN(logged_at::time),
    MAX(logged_at::time),
    now()
  FROM water_logs
  WHERE user_id = v_user_id AND date_logged = v_date_logged
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_ml = EXCLUDED.total_ml,
    total_glasses = EXCLUDED.total_glasses,
    entries_count = EXCLUDED.entries_count,
    last_log_time = EXCLUDED.last_log_time,
    updated_at = now();

  -- Get updated total
  SELECT total_ml INTO v_total_ml
  FROM daily_water_summary
  WHERE user_id = v_user_id AND date = v_date_logged;

  RETURN json_build_object(
    'success', true,
    'water_log_id', v_water_log_id,
    'amount_ml', p_amount_ml,
    'total_ml', v_total_ml,
    'goal_ml', v_goal_ml,
    'percentage', ROUND((v_total_ml::NUMERIC / NULLIF(v_goal_ml, 0)) * 100, 0)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_weight (
  p_weight numeric,
  p_date   date    DEFAULT CURRENT_DATE,
  p_notes  text    DEFAULT NULL::text
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_user_id     UUID := auth.uid();
  v_latest_date DATE;
  v_log         weight_logs;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO weight_logs (user_id, weight, date, notes)
  VALUES (v_user_id, p_weight, p_date, p_notes)
  ON CONFLICT (user_id, date) DO UPDATE
    SET weight = EXCLUDED.weight,
        notes  = EXCLUDED.notes
  RETURNING * INTO v_log;

  -- Only sync the denormalized latest weight if this entry IS the latest
  -- (guards against a backdated log clobbering current_weight).
  SELECT max(date) INTO v_latest_date FROM weight_logs WHERE user_id = v_user_id;

  IF p_date >= v_latest_date THEN
    UPDATE profiles SET current_weight = p_weight, updated_at = now()
    WHERE id = v_user_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'log', row_to_json(v_log),
    'current_weight_synced', (p_date >= v_latest_date)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.preview_goals (
  p_age            integer,
  p_gender         text,
  p_current_weight numeric,
  p_target_weight  numeric,
  p_height         numeric,
  p_activity_level text,
  p_goal           text
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_tdee_result  JSON;
  v_macro_result JSON;
  v_tdee INTEGER;
  v_bmr  INTEGER;
BEGIN
  v_tdee_result := calculate_tdee(p_age, p_current_weight, p_height, p_gender, p_activity_level);
  v_tdee := (v_tdee_result->>'tdee')::INTEGER;
  v_bmr  := (v_tdee_result->>'bmr')::INTEGER;

  v_macro_result := calculate_macro_goals(v_tdee, p_goal, p_current_weight, p_target_weight);

  RETURN json_build_object(
    'bmr',  v_bmr,
    'tdee', v_tdee,
    'calorie_goal',       (v_macro_result->>'calorie_goal')::INTEGER,
    'protein_goal_g',     (v_macro_result->>'protein_goal_g')::INTEGER,
    'carbs_goal_g',       (v_macro_result->>'carbs_goal_g')::INTEGER,
    'fat_goal_g',         (v_macro_result->>'fat_goal_g')::INTEGER,
    'protein_percentage', (v_macro_result->>'protein_percentage')::INTEGER,
    'carbs_percentage',   (v_macro_result->>'carbs_percentage')::INTEGER,
    'fat_percentage',     (v_macro_result->>'fat_percentage')::INTEGER
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.recalculate_profile_goals (
  p_user_id        uuid,
  p_age            integer,
  p_gender         text,
  p_height         numeric,
  p_target_weight  numeric,
  p_goal           text,
  p_activity_level text,
  p_timeframe      text
)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
  v_current_weight NUMERIC;
  v_tdee_result    JSON;
  v_macro_result   JSON;
  v_tdee           INTEGER;
  v_bmr            INTEGER;
  v_calorie_goal   INTEGER;
  v_protein_goal   INTEGER;
  v_carbs_goal     INTEGER;
  v_fat_goal       INTEGER;
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: can only update own profile';
  END IF;

  SELECT current_weight INTO v_current_weight FROM profiles WHERE id = p_user_id;
  IF v_current_weight IS NULL THEN
    RAISE EXCEPTION 'current_weight not set; log a weight first';
  END IF;

  v_tdee_result := calculate_tdee(p_age, v_current_weight, p_height, p_gender, p_activity_level);
  v_tdee := (v_tdee_result->>'tdee')::INTEGER;
  v_bmr  := (v_tdee_result->>'bmr')::INTEGER;

  v_macro_result := calculate_macro_goals(v_tdee, p_goal, v_current_weight, p_target_weight);
  v_calorie_goal := (v_macro_result->>'calorie_goal')::INTEGER;
  v_protein_goal := (v_macro_result->>'protein_goal_g')::INTEGER;
  v_carbs_goal   := (v_macro_result->>'carbs_goal_g')::INTEGER;
  v_fat_goal     := (v_macro_result->>'fat_goal_g')::INTEGER;

  UPDATE profiles SET
    age                = p_age,
    gender             = p_gender,
    height             = p_height,
    target_weight      = p_target_weight,
    goal               = p_goal,
    activity_level     = p_activity_level,
    timeframe          = p_timeframe,
    tdee               = v_tdee,
    bmr                = v_bmr,
    daily_calorie_goal = v_calorie_goal,
    protein_goal_g     = v_protein_goal,
    carbs_goal_g       = v_carbs_goal,
    fat_goal_g         = v_fat_goal,
    updated_at         = now()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = p_user_id),
    'calculations', json_build_object(
      'bmr', v_bmr, 'tdee', v_tdee,
      'calorie_goal', v_calorie_goal,
      'protein_goal_g', v_protein_goal,
      'carbs_goal_g', v_carbs_goal,
      'fat_goal_g', v_fat_goal
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_popular_food_items()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  refresh materialized view concurrently popular_food_items_mv;
end;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.search_food_items (
  search_query text,
  limit_count  integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
  RETURNS TABLE (
    id           uuid,
    name         text,
    brand        text,
    barcode      text,
    calories     integer,
    protein_g    numeric,
    carbs_g      numeric,
    fat_g        numeric,
    serving_size numeric,
    serving_unit text,
    image_url    text,
    source       text,
    similarity   real
  )
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  return query
  select 
    f.id,
    f.name,
    f.brand,
    f.barcode,
    f.calories,
    f.protein_g,
    f.carbs_g,
    f.fat_g,
    f.serving_size,
    f.serving_unit,
    f.image_url,
    f.source,
    similarity(f.name || ' ' || coalesce(f.brand, ''), search_query) as similarity
  from food_items f
  where 
    f.deleted_at is null and
    (f.is_public = true or f.source in ('api', 'admin') or f.created_by = auth.uid()) and
    (
      f.name ilike '%' || search_query || '%' or
      f.brand ilike '%' || search_query || '%' or
      to_tsvector('english', f.name || ' ' || coalesce(f.brand, '')) @@ plainto_tsquery('english', search_query)
    )
  order by 
    similarity desc,
    f.usage_count desc,
    f.created_at desc
  limit limit_count
  offset offset_count;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_date_logged()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
    -- Only set date_logged if not provided
    IF NEW.date_logged IS NULL THEN
        NEW.date_logged := date(NEW.consumed_at);
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.soft_delete_food_item (
  food_item_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  update food_items
  set deleted_at = now()
  where id = food_item_id 
    and created_by = auth.uid() 
    and source = 'user-created'
    and deleted_at is null;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_daily_summary()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'extensions'
  AS $function$
declare
  summary_date date;
  user_uuid uuid;
  user_goals record;
begin
  -- Determine which user and date to update
  if TG_OP = 'DELETE' then
    summary_date := OLD.date_logged;
    user_uuid := OLD.user_id;
  else
    summary_date := NEW.date_logged;
    user_uuid := NEW.user_id;
  end if;

  -- Get user's current goals
  select 
    daily_calorie_goal,
    protein_goal_g,
    carbs_goal_g,
    fat_goal_g
  into user_goals
  from profiles
  where id = user_uuid;

  -- Recalculate summary for that day
  insert into daily_nutrition_summary (
    user_id,
    date,
    total_calories,
    total_protein_g,
    total_carbs_g,
    total_fat_g,
    total_fiber_g,
    total_sugar_g,
    total_sodium_mg,
    breakfast_calories,
    breakfast_protein_g,
    breakfast_carbs_g,
    breakfast_fat_g,
    lunch_calories,
    lunch_protein_g,
    lunch_carbs_g,
    lunch_fat_g,
    dinner_calories,
    dinner_protein_g,
    dinner_carbs_g,
    dinner_fat_g,
    snacks_calories,
    snacks_protein_g,
    snacks_carbs_g,
    snacks_fat_g,
    calorie_goal,
    protein_goal_g,
    carbs_goal_g,
    fat_goal_g,
    entries_count,
    last_meal_time
  )
  select
    user_id,
    date_logged,
    sum(calories),
    sum(protein_g),
    sum(carbs_g),
    sum(fat_g),
    sum(fiber_g),
    sum(sugar_g),
    sum(sodium_mg),
    sum(case when meal_type = 'breakfast' then calories else 0 end),
    sum(case when meal_type = 'breakfast' then protein_g else 0 end),
    sum(case when meal_type = 'breakfast' then carbs_g else 0 end),
    sum(case when meal_type = 'breakfast' then fat_g else 0 end),
    sum(case when meal_type = 'lunch' then calories else 0 end),
    sum(case when meal_type = 'lunch' then protein_g else 0 end),
    sum(case when meal_type = 'lunch' then carbs_g else 0 end),
    sum(case when meal_type = 'lunch' then fat_g else 0 end),
    sum(case when meal_type = 'dinner' then calories else 0 end),
    sum(case when meal_type = 'dinner' then protein_g else 0 end),
    sum(case when meal_type = 'dinner' then carbs_g else 0 end),
    sum(case when meal_type = 'dinner' then fat_g else 0 end),
    sum(case when meal_type = 'snack' then calories else 0 end),
    sum(case when meal_type = 'snack' then protein_g else 0 end),
    sum(case when meal_type = 'snack' then carbs_g else 0 end),
    sum(case when meal_type = 'snack' then fat_g else 0 end),
    user_goals.daily_calorie_goal,
    user_goals.protein_goal_g,
    user_goals.carbs_goal_g,
    user_goals.fat_goal_g,
    count(*),
    max(consumed_at)
  from food_logs
  where user_id = user_uuid and date_logged = summary_date
  group by user_id, date_logged
  on conflict (user_id, date) do update set
    total_calories = excluded.total_calories,
    total_protein_g = excluded.total_protein_g,
    total_carbs_g = excluded.total_carbs_g,
    total_fat_g = excluded.total_fat_g,
    total_fiber_g = excluded.total_fiber_g,
    total_sugar_g = excluded.total_sugar_g,
    total_sodium_mg = excluded.total_sodium_mg,
    breakfast_calories = excluded.breakfast_calories,
    breakfast_protein_g = excluded.breakfast_protein_g,
    breakfast_carbs_g = excluded.breakfast_carbs_g,
    breakfast_fat_g = excluded.breakfast_fat_g,
    lunch_calories = excluded.lunch_calories,
    lunch_protein_g = excluded.lunch_protein_g,
    lunch_carbs_g = excluded.lunch_carbs_g,
    lunch_fat_g = excluded.lunch_fat_g,
    dinner_calories = excluded.dinner_calories,
    dinner_protein_g = excluded.dinner_protein_g,
    dinner_carbs_g = excluded.dinner_carbs_g,
    dinner_fat_g = excluded.dinner_fat_g,
    snacks_calories = excluded.snacks_calories,
    snacks_protein_g = excluded.snacks_protein_g,
    snacks_carbs_g = excluded.snacks_carbs_g,
    snacks_fat_g = excluded.snacks_fat_g,
    calorie_goal = excluded.calorie_goal,
    protein_goal_g = excluded.protein_goal_g,
    carbs_goal_g = excluded.carbs_goal_g,
    fat_goal_g = excluded.fat_goal_g,
    entries_count = excluded.entries_count,
    last_meal_time = excluded.last_meal_time,
    updated_at = now();

  return NEW;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_last_login()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  update public.profiles
  set last_login = now()
  where id = auth.uid();
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_timestamp()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

ALTER TABLE "public"."daily_nutrition_summary"
  ADD CONSTRAINT "daily_nutrition_summary_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."food_items"
  ADD CONSTRAINT "food_items_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."food_logs"
  ADD CONSTRAINT "food_logs_food_item_id_fkey" FOREIGN KEY (food_item_id) REFERENCES public.food_items(id) ON DELETE RESTRICT;

ALTER TABLE "public"."food_logs"
  ADD CONSTRAINT "food_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."daily_water_summary"
  ADD CONSTRAINT "daily_water_summary_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."water_logs"
  ADD CONSTRAINT "water_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."weight_logs"
  ADD CONSTRAINT "weight_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE VIEW "public"."popular_food_items" WITH (security_invoker=true) AS  SELECT id,
    name,
    brand,
    barcode,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    serving_size,
    serving_unit,
    image_url,
    source,
    usage_count
   FROM public.food_items
  WHERE ((deleted_at IS NULL) AND ((is_public = true) OR (source = ANY (ARRAY['api'::text, 'admin'::text]))) AND (usage_count > 0))
  ORDER BY usage_count DESC, created_at DESC
 LIMIT 100;

CREATE MATERIALIZED VIEW "public"."popular_food_items_mv"
  AS  SELECT id,
    name,
    brand,
    barcode,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    serving_size,
    serving_unit,
    image_url,
    source,
    usage_count,
    last_used_at
   FROM public.food_items
  WHERE ((deleted_at IS NULL) AND ((is_public = true) OR (source = ANY (ARRAY['api'::text, 'admin'::text]))) AND (usage_count > 0))
  ORDER BY usage_count DESC, created_at DESC
 LIMIT 100;

REVOKE ALL ON TABLE "public"."popular_food_items_mv" FROM "anon", "authenticated";

CREATE INDEX daily_summary_date_range_idx ON public.daily_nutrition_summary USING btree (date DESC, user_id);

CREATE INDEX daily_summary_updated_idx ON public.daily_nutrition_summary USING btree (user_id, updated_at DESC);

CREATE INDEX daily_summary_user_date_idx ON public.daily_nutrition_summary USING btree (user_id, date DESC);

CREATE UNIQUE INDEX food_items_api_source_unique_idx ON public.food_items USING btree (source_id, api_provider)
  WHERE ((source = 'api'::text) AND (deleted_at IS NULL));

CREATE UNIQUE INDEX food_items_barcode_unique_idx ON public.food_items USING btree (barcode)
  WHERE ((barcode IS NOT NULL) AND (deleted_at IS NULL));

CREATE INDEX food_items_brand_idx ON public.food_items USING btree (brand)
  WHERE (brand IS NOT NULL);

CREATE INDEX food_items_created_at_idx ON public.food_items USING btree (created_at DESC);

CREATE INDEX food_items_created_by_idx ON public.food_items USING btree (created_by)
  WHERE (created_by IS NOT NULL);

CREATE INDEX food_items_deleted_at_idx ON public.food_items USING btree (deleted_at)
  WHERE (deleted_at IS NOT NULL);

CREATE INDEX food_items_is_public_idx ON public.food_items USING btree (is_public)
  WHERE (is_public = true);

CREATE INDEX food_items_name_fts_idx ON public.food_items USING gin (to_tsvector('english'::regconfig, ((name || ' '::text) || COALESCE(brand, ''::text))));

CREATE INDEX food_items_name_trgm_idx ON public.food_items USING gin (name extensions.gin_trgm_ops);

CREATE INDEX food_items_public_recent_idx ON public.food_items USING btree (created_at DESC)
  WHERE ((is_public = true) AND (deleted_at IS NULL));

CREATE INDEX food_items_source_idx ON public.food_items USING btree (source);

CREATE INDEX food_items_usage_count_idx ON public.food_items USING btree (usage_count DESC)
  WHERE (deleted_at IS NULL);

CREATE INDEX food_items_user_items_idx ON public.food_items USING btree (created_by, created_at DESC)
  WHERE (deleted_at IS NULL);

CREATE INDEX food_logs_date_range_idx ON public.food_logs USING btree (user_id, date_logged DESC, consumed_at DESC);

CREATE INDEX food_logs_food_item_idx ON public.food_logs USING btree (food_item_id);

CREATE INDEX food_logs_meal_type_idx ON public.food_logs USING btree (user_id, meal_type, date_logged DESC);

CREATE INDEX food_logs_user_consumed_idx ON public.food_logs USING btree (user_id, consumed_at DESC);

CREATE INDEX food_logs_user_date_idx ON public.food_logs USING btree (user_id, date_logged DESC);

CREATE INDEX idx_daily_water_summary_user_date ON public.daily_water_summary USING btree (user_id, date DESC);

CREATE INDEX idx_water_logs_logged_at ON public.water_logs USING btree (logged_at DESC);

CREATE INDEX idx_water_logs_user_date ON public.water_logs USING btree (user_id, date_logged DESC);

CREATE INDEX idx_weight_logs_user_date ON public.weight_logs USING btree (user_id, date DESC);

CREATE UNIQUE INDEX popular_food_items_mv_id_idx ON public.popular_food_items_mv USING btree (id);

CREATE INDEX profiles_created_at_idx ON public.profiles USING btree (created_at);

CREATE INDEX profiles_display_name_idx ON public.profiles USING btree (display_name);

CREATE INDEX profiles_email_idx ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_email_unique_idx ON public.profiles USING btree (email)
  WHERE (email IS NOT NULL);

CREATE INDEX profiles_last_login_idx ON public.profiles USING btree (last_login DESC);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

CREATE TRIGGER daily_summary_updated_at_trigger
  BEFORE UPDATE ON public.daily_nutrition_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER daily_water_summary_updated_at
  BEFORE UPDATE ON public.daily_water_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER handle_food_items_updated_at
  BEFORE UPDATE ON public.food_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_food_items_updated_at();

CREATE TRIGGER food_logs_set_date_trigger
  BEFORE INSERT OR UPDATE ON public.food_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_date_logged();

CREATE TRIGGER food_logs_updated_at_trigger
  BEFORE UPDATE ON public.food_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_daily_summary_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.food_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_summary();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER water_logs_updated_at
  BEFORE UPDATE ON public.water_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE POLICY "daily_summary_delete_policy" ON "public"."daily_nutrition_summary"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "daily_summary_insert_policy" ON "public"."daily_nutrition_summary"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "daily_summary_select_policy" ON "public"."daily_nutrition_summary"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "daily_summary_update_policy" ON "public"."daily_nutrition_summary"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_summary_delete" ON "public"."daily_water_summary"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_summary_insert" ON "public"."daily_water_summary"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_summary_select" ON "public"."daily_water_summary"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_summary_update" ON "public"."daily_water_summary"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "food_items_insert_policy" ON "public"."food_items"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND (source = 'user-created'::text)));

CREATE POLICY "food_items_select_policy" ON "public"."food_items"
  FOR SELECT
  TO PUBLIC
  USING (((deleted_at IS NULL) AND ((is_public = true) OR (source = ANY (ARRAY['api'::text, 'admin'::text])) OR (created_by = ( SELECT auth.uid() AS uid)))));

CREATE POLICY "food_items_update_policy" ON "public"."food_items"
  FOR UPDATE
  TO PUBLIC
  USING (((created_by = ( SELECT auth.uid() AS uid)) AND (source = 'user-created'::text)))
  WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND (source = 'user-created'::text)));

CREATE POLICY "food_logs_delete_policy" ON "public"."food_logs"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "food_logs_insert_policy" ON "public"."food_logs"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "food_logs_select_policy" ON "public"."food_logs"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "food_logs_update_policy" ON "public"."food_logs"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "profiles_insert_policy" ON "public"."profiles"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "profiles_select_policy" ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING ((id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "profiles_update_policy" ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_logs_delete" ON "public"."water_logs"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_logs_insert" ON "public"."water_logs"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_logs_select" ON "public"."water_logs"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "water_logs_update" ON "public"."water_logs"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "weight_logs_delete" ON "public"."weight_logs"
  FOR DELETE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "weight_logs_insert" ON "public"."weight_logs"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "weight_logs_select" ON "public"."weight_logs"
  FOR SELECT
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "weight_logs_update" ON "public"."weight_logs"
  FOR UPDATE
  TO PUBLIC
  USING ((user_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

COMMENT ON COLUMN "public"."profiles"."activity_level" IS 'Daily activity level for TDEE calculation';

COMMENT ON COLUMN "public"."profiles"."age" IS 'User age in years';

COMMENT ON COLUMN "public"."profiles"."bmr" IS 'Basal Metabolic Rate in calories';

COMMENT ON COLUMN "public"."profiles"."current_weight" IS 'Current weight in kilograms';

COMMENT ON COLUMN "public"."profiles"."daily_water_goal_ml" IS 'Daily water goal in ml (default: 2000ml)';

COMMENT ON COLUMN "public"."profiles"."dietary_preferences" IS 'Array of dietary preferences (vegetarian, vegan, etc.)';

COMMENT ON COLUMN "public"."profiles"."gender" IS 'User gender for BMR calculation';

COMMENT ON COLUMN "public"."profiles"."goal" IS 'Fitness goal: lose, maintain, or gain weight';

COMMENT ON COLUMN "public"."profiles"."height" IS 'Height in centimeters';

COMMENT ON COLUMN "public"."profiles"."onboarding_completed_at" IS 'Timestamp when onboarding was completed';

COMMENT ON COLUMN "public"."profiles"."target_weight" IS 'Target weight in kilograms';

COMMENT ON COLUMN "public"."profiles"."tdee" IS 'Total Daily Energy Expenditure in calories';

COMMENT ON COLUMN "public"."profiles"."timeframe" IS 'Timeframe to reach target weight';

COMMENT ON COLUMN "public"."water_logs"."amount_ml" IS 'Water amount in milliliters (50-2000ml)';

COMMENT ON COLUMN "public"."weight_logs"."date" IS 'Date of weight measurement';

COMMENT ON COLUMN "public"."weight_logs"."notes" IS 'Optional notes about the measurement';

COMMENT ON COLUMN "public"."weight_logs"."weight" IS 'Weight in kilograms';

COMMENT ON EXTENSION "pg_trgm" IS 'text similarity measurement and index searching based on trigrams';

COMMENT ON FUNCTION "public"."calculate_macro_goals"(integer, text, numeric, numeric) IS 'Calculates macros using evidence-based formulas (protein: 1.6-2.2g/kg, fat: 0.9g/kg or 25%, carbs: remainder)';

COMMENT ON FUNCTION "public"."calculate_tdee"(integer, numeric, numeric, text, text) IS 'Calculates BMR and TDEE using Mifflin-St Jeor equation';

COMMENT ON FUNCTION "public"."complete_onboarding"(uuid, text, text, jsonb, integer, text, numeric, numeric, numeric, text) IS 'Atomically saves all onboarding data and calculates nutrition goals';

COMMENT ON FUNCTION "public"."get_nutrition_goals"(uuid) IS 'Returns user nutrition goals and profile data';

COMMENT ON TABLE "public"."daily_water_summary" IS 'Aggregated daily water totals for fast dashboard';

COMMENT ON TABLE "public"."water_logs" IS 'Individual water intake entries';

COMMENT ON TABLE "public"."weight_logs" IS 'Tracks user weight over time for progress monitoring';

GRANT EXECUTE ON FUNCTION "public"."add_water_bottle"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."add_water_bottle"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."add_water_bottle"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."add_water_bottle"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."add_water_glass"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."add_water_glass"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."add_water_glass"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."add_water_glass"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."add_water_liter"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."add_water_liter"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."add_water_liter"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."add_water_liter"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."calculate_macro_goals"(integer, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."calculate_macro_goals"(integer, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_macro_goals"(integer, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_macro_goals"(integer, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."calculate_macro_goals"(integer, text, numeric, numeric) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."calculate_macro_goals"(integer, text, numeric, numeric) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_macro_goals"(integer, text, numeric, numeric) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_macro_goals"(integer, text, numeric, numeric) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."calculate_tdee"(integer, numeric, numeric, text, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."calculate_tdee"(integer, numeric, numeric, text, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_tdee"(integer, numeric, numeric, text, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_tdee"(integer, numeric, numeric, text, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."calculate_tdee"(integer, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."calculate_tdee"(integer, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_tdee"(integer, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."calculate_tdee"(integer, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."complete_onboarding"(uuid, text, text, jsonb, integer, text, numeric, numeric, numeric, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."complete_onboarding"(uuid, text, text, jsonb, integer, text, numeric, numeric, numeric, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."complete_onboarding"(uuid, text, text, jsonb, integer, text, numeric, numeric, numeric, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."complete_onboarding"(uuid, text, text, jsonb, integer, text, numeric, numeric, numeric, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."delete_water_log"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."delete_water_log"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."delete_water_log"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."delete_water_log"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."delete_weight_log"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."delete_weight_log"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."delete_weight_log"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."delete_weight_log"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_nutrition_goals"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_nutrition_goals"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_nutrition_goals"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_nutrition_goals"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_nutrition_range"(date, date) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_nutrition_range"(date, date) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_nutrition_range"(date, date) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_nutrition_range"(date, date) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_todays_nutrition"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_todays_nutrition"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_todays_nutrition"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_todays_nutrition"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_todays_water"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_todays_water"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_todays_water"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_todays_water"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."get_water_history"(integer) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_water_history"(integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_water_history"(integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_water_history"(integer) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_food_items_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_food_items_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_food_items_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_food_items_updated_at"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_updated_at"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_user_update"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_user_update"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_user_update"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_user_update"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."increment_food_item_usage"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."increment_food_item_usage"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."increment_food_item_usage"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."increment_food_item_usage"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."log_water"(integer, text, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."log_water"(integer, text, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."log_water"(integer, text, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."log_water"(integer, text, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."log_weight"(numeric, date, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."log_weight"(numeric, date, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."log_weight"(numeric, date, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."log_weight"(numeric, date, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."preview_goals"(integer, text, numeric, numeric, numeric, text, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."preview_goals"(integer, text, numeric, numeric, numeric, text, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."preview_goals"(integer, text, numeric, numeric, numeric, text, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."preview_goals"(integer, text, numeric, numeric, numeric, text, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."recalculate_profile_goals"(uuid, integer, text, numeric, numeric, text, text, text) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."recalculate_profile_goals"(uuid, integer, text, numeric, numeric, text, text, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."recalculate_profile_goals"(uuid, integer, text, numeric, numeric, text, text, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."recalculate_profile_goals"(uuid, integer, text, numeric, numeric, text, text, text) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."refresh_popular_food_items"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."refresh_popular_food_items"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."refresh_popular_food_items"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."refresh_popular_food_items"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."rls_auto_enable"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."search_food_items"(text, integer, integer) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."search_food_items"(text, integer, integer) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."search_food_items"(text, integer, integer) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."search_food_items"(text, integer, integer) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_date_logged"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."set_date_logged"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."set_date_logged"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."set_date_logged"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."soft_delete_food_item"(uuid) TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."soft_delete_food_item"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."soft_delete_food_item"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."soft_delete_food_item"(uuid) TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_daily_summary"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_daily_summary"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_daily_summary"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_daily_summary"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_last_login"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_last_login"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_last_login"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_last_login"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_timestamp"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_timestamp"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_timestamp"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_timestamp"() TO "service_role";

REVOKE ALL ON TABLE "public"."popular_food_items_mv" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."popular_food_items_mv" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."popular_food_items_mv" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."daily_nutrition_summary" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."daily_nutrition_summary" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."daily_nutrition_summary" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."daily_nutrition_summary" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."daily_water_summary" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."daily_water_summary" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."daily_water_summary" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."daily_water_summary" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."food_items" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."food_items" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."food_items" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."food_items" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."food_logs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."food_logs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."food_logs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."food_logs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."water_logs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."water_logs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."water_logs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."water_logs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weight_logs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."weight_logs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weight_logs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weight_logs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."popular_food_items" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."popular_food_items" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."popular_food_items" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."popular_food_items" TO "service_role";

