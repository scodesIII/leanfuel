-- ============================================================================
-- ROLLBACK 003: Remove RLS Policies for Weight Logs
-- Description: Removes RLS policies added in 003_add_weight_logs_rls.sql
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own weight logs" ON weight_logs;
DROP POLICY IF EXISTS "Users can insert own weight logs" ON weight_logs;
DROP POLICY IF EXISTS "Users can update own weight logs" ON weight_logs;
DROP POLICY IF EXISTS "Users can delete own weight logs" ON weight_logs;

ALTER TABLE weight_logs DISABLE ROW LEVEL SECURITY;
