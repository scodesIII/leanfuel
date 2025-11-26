-- ============================================================================
-- MIGRATION 007: Create Helper Functions
-- Description: Utility functions for getting nutrition goals
-- Rollback: See 007_rollback.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION get_nutrition_goals(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate user is authenticated
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only view own goals';
  END IF;

  RETURN (
    SELECT json_build_object(
      'daily_calorie_goal', daily_calorie_goal,
      'protein_goal_g', protein_goal_g,
      'carbs_goal_g', carbs_goal_g,
      'fat_goal_g', fat_goal_g,
      'tdee', tdee,
      'bmr', bmr,
      'goal', goal,
      'current_weight', current_weight,
      'target_weight', target_weight,
      'activity_level', activity_level,
      'age', age,
      'gender', gender,
      'height', height
    )
    FROM profiles
    WHERE id = p_user_id
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_nutrition_goals TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_nutrition_goals IS 'Returns user nutrition goals and profile data';
