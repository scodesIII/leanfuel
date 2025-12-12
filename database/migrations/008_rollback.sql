-- ============================================================================
-- ROLLBACK 008: Remove Water Tracking System
-- Description: Removes all water tracking tables, functions, and columns
-- ============================================================================

-- Drop functions
DROP FUNCTION IF EXISTS log_water(INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS add_water_glass();
DROP FUNCTION IF EXISTS add_water_bottle();
DROP FUNCTION IF EXISTS add_water_liter();
DROP FUNCTION IF EXISTS get_todays_water();
DROP FUNCTION IF EXISTS delete_water_log(UUID);
DROP FUNCTION IF EXISTS get_water_history(INTEGER);
DROP FUNCTION IF EXISTS update_timestamp();

-- Drop triggers
DROP TRIGGER IF EXISTS water_logs_updated_at ON water_logs;
DROP TRIGGER IF EXISTS daily_water_summary_updated_at ON daily_water_summary;

-- Drop tables (CASCADE removes all dependent objects)
DROP TABLE IF EXISTS water_logs CASCADE;
DROP TABLE IF EXISTS daily_water_summary CASCADE;

-- Remove column from profiles
ALTER TABLE profiles
DROP COLUMN IF EXISTS daily_water_goal_ml;

-- Verify cleanup
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('water_logs', 'daily_water_summary');
-- Should return 0 rows
