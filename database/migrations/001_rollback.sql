-- ============================================================================
-- ROLLBACK 001: Remove Onboarding Columns from Profiles
-- Description: Removes all columns added in 001_add_onboarding_columns.sql
-- ============================================================================

ALTER TABLE profiles
DROP COLUMN IF EXISTS goal,
DROP COLUMN IF EXISTS activity_level,
DROP COLUMN IF EXISTS dietary_preferences,
DROP COLUMN IF EXISTS age,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS current_weight,
DROP COLUMN IF EXISTS target_weight,
DROP COLUMN IF EXISTS height,
DROP COLUMN IF EXISTS timeframe,
DROP COLUMN IF EXISTS tdee,
DROP COLUMN IF EXISTS bmr,
DROP COLUMN IF EXISTS onboarding_completed_at;
