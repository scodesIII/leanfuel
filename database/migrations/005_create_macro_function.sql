-- ============================================================================
-- MIGRATION 005: Create Macro Goals Calculation Function (Evidence-Based)
-- Description: Calculates protein/fat/carbs using industry-standard formulas
-- Based on: Carbon Diet Coach, MacroFactor, RP Diet, StrongerByScience
-- Rollback: See 005_rollback.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_macro_goals(
  p_tdee INTEGER,
  p_goal TEXT,
  p_current_weight NUMERIC,
  p_target_weight NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
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
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_macro_goals TO authenticated;

-- Add comment
COMMENT ON FUNCTION calculate_macro_goals IS 'Calculates macros using evidence-based formulas (protein: 1.6-2.2g/kg, fat: 0.9g/kg or 25%, carbs: remainder)';
