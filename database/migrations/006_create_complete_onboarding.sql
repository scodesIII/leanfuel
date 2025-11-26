-- ============================================================================
-- MIGRATION 006: Create Complete Onboarding Function (ATOMIC)
-- Description: Atomic function to save all onboarding data and calculate goals
-- Rollback: See 006_rollback.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION complete_onboarding(
  p_user_id UUID,
  p_goal TEXT,
  p_activity_level TEXT,
  p_dietary_preferences JSONB,
  p_age INTEGER,
  p_gender TEXT,
  p_current_weight NUMERIC,
  p_target_weight NUMERIC,
  p_height NUMERIC,
  p_timeframe TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION complete_onboarding TO authenticated;

-- Add comment
COMMENT ON FUNCTION complete_onboarding IS 'Atomically saves all onboarding data and calculates nutrition goals';
