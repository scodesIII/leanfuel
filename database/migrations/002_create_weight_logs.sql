-- ============================================================================
-- MIGRATION 002: Create Weight Logs Table
-- Description: Creates table for tracking weight progress over time
-- Rollback: See 002_rollback.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight NUMERIC(5,1) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, date DESC);

-- Add comments
COMMENT ON TABLE weight_logs IS 'Tracks user weight over time for progress monitoring';
COMMENT ON COLUMN weight_logs.weight IS 'Weight in kilograms';
COMMENT ON COLUMN weight_logs.date IS 'Date of weight measurement';
COMMENT ON COLUMN weight_logs.notes IS 'Optional notes about the measurement';
