-- ============================================================================
-- ROLLBACK 004: Drop TDEE Calculation Function
-- Description: Removes calculate_tdee function
-- ============================================================================

DROP FUNCTION IF EXISTS calculate_tdee(INTEGER, NUMERIC, NUMERIC, TEXT, TEXT);
