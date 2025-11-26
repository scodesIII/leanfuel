-- ============================================================================
-- ROLLBACK 005: Drop Macro Goals Calculation Function
-- Description: Removes calculate_macro_goals function
-- ============================================================================

DROP FUNCTION IF EXISTS calculate_macro_goals(INTEGER, TEXT, NUMERIC, NUMERIC);
