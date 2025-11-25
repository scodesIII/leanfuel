-- ============================================================================
-- ROLLBACK 002: Drop Weight Logs Table
-- Description: Removes weight_logs table created in 002_create_weight_logs.sql
-- ============================================================================

DROP INDEX IF EXISTS idx_weight_logs_user_date;
DROP TABLE IF EXISTS weight_logs;
