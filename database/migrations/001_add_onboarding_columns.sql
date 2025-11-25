-- ============================================================================
-- MIGRATION 001: Add Onboarding Columns to Profiles
-- Description: Adds all onboarding-related fields to profiles table
-- Rollback: See 001_rollback.sql
-- ============================================================================

-- Add onboarding-specific columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS goal TEXT CHECK (goal IN ('lose', 'maintain', 'gain')),
ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very', 'extra')),
ADD COLUMN IF NOT EXISTS dietary_preferences JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS current_weight NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS target_weight NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS height NUMERIC(5,1),
ADD COLUMN IF NOT EXISTS timeframe TEXT CHECK (timeframe IN ('3months', '6months', '12months', 'flexible')),
ADD COLUMN IF NOT EXISTS tdee INTEGER,
ADD COLUMN IF NOT EXISTS bmr INTEGER,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN profiles.goal IS 'Fitness goal: lose, maintain, or gain weight';
COMMENT ON COLUMN profiles.activity_level IS 'Daily activity level for TDEE calculation';
COMMENT ON COLUMN profiles.dietary_preferences IS 'Array of dietary preferences (vegetarian, vegan, etc.)';
COMMENT ON COLUMN profiles.age IS 'User age in years';
COMMENT ON COLUMN profiles.gender IS 'User gender for BMR calculation';
COMMENT ON COLUMN profiles.current_weight IS 'Current weight in kilograms';
COMMENT ON COLUMN profiles.target_weight IS 'Target weight in kilograms';
COMMENT ON COLUMN profiles.height IS 'Height in centimeters';
COMMENT ON COLUMN profiles.timeframe IS 'Timeframe to reach target weight';
COMMENT ON COLUMN profiles.tdee IS 'Total Daily Energy Expenditure in calories';
COMMENT ON COLUMN profiles.bmr IS 'Basal Metabolic Rate in calories';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';
