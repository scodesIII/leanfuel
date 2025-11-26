-- ============================================================================
-- ROLLBACK 006: Drop Complete Onboarding Function
-- Description: Removes complete_onboarding function
-- ============================================================================

DROP FUNCTION IF EXISTS complete_onboarding(UUID, TEXT, TEXT, JSONB, INTEGER, TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT);
