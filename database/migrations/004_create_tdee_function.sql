-- ============================================================================
-- MIGRATION 004: Create TDEE Calculation Function
-- Description: Function to calculate Total Daily Energy Expenditure
-- Rollback: See 004_rollback.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_tdee(
  p_age INTEGER,
  p_weight NUMERIC,
  p_height NUMERIC,
  p_gender TEXT,
  p_activity_level TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
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
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_tdee TO authenticated;

-- Add comment
COMMENT ON FUNCTION calculate_tdee IS 'Calculates BMR and TDEE using Mifflin-St Jeor equation';
