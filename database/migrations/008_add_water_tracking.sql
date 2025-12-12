-- ============================================================================
-- MIGRATION 008: Water Tracking System
-- Description: Two-table approach for water logging with auto-aggregation
-- Rollback: See 008_rollback.sql
-- ============================================================================

-- ============================================================================
-- TABLE: water_logs (Individual entries)
-- ============================================================================

CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  amount_ml INTEGER NOT NULL CHECK (amount_ml BETWEEN 50 AND 2000),
  container_type TEXT, -- 'glass', 'bottle', 'liter', 'custom'
  
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_logged DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, date_logged DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_logged_at ON water_logs(logged_at DESC);

COMMENT ON TABLE water_logs IS 'Individual water intake entries';
COMMENT ON COLUMN water_logs.amount_ml IS 'Water amount in milliliters (50-2000ml)';

-- ============================================================================
-- TABLE: daily_water_summary (Aggregated totals)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_water_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  total_ml INTEGER NOT NULL DEFAULT 0,
  total_glasses INTEGER NOT NULL DEFAULT 0,
  entries_count INTEGER NOT NULL DEFAULT 0,
  daily_goal_ml INTEGER,
  
  goal_percentage INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN daily_goal_ml > 0 THEN (total_ml * 100) / daily_goal_ml
      ELSE 0
    END
  ) STORED,
  
  first_log_time TIME,
  last_log_time TIME,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_water_summary_user_date ON daily_water_summary(user_id, date DESC);

COMMENT ON TABLE daily_water_summary IS 'Aggregated daily water totals for fast dashboard';

-- ============================================================================
-- ADD WATER GOAL TO PROFILES
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS daily_water_goal_ml INTEGER DEFAULT 2000 
  CHECK (daily_water_goal_ml BETWEEN 1000 AND 5000);

COMMENT ON COLUMN profiles.daily_water_goal_ml IS 'Daily water goal in ml (default: 2000ml)';

-- ============================================================================
-- FUNCTION: Log Water (Main function)
-- ============================================================================

CREATE OR REPLACE FUNCTION log_water(
  p_amount_ml INTEGER,
  p_container_type TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_water_log_id UUID;
  v_date_logged DATE;
  v_total_ml INTEGER;
  v_goal_ml INTEGER;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate amount
  IF p_amount_ml < 50 OR p_amount_ml > 2000 THEN
    RAISE EXCEPTION 'Amount must be between 50ml and 2000ml';
  END IF;

  v_date_logged := CURRENT_DATE;

  -- Insert water log
  INSERT INTO water_logs (user_id, amount_ml, container_type, notes, date_logged)
  VALUES (v_user_id, p_amount_ml, p_container_type, p_notes, v_date_logged)
  RETURNING id INTO v_water_log_id;

  -- Get user's goal
  SELECT daily_water_goal_ml INTO v_goal_ml
  FROM profiles
  WHERE id = v_user_id;

  -- Update daily summary
  INSERT INTO daily_water_summary (
    user_id, date, total_ml, total_glasses, entries_count, daily_goal_ml,
    first_log_time, last_log_time, updated_at
  )
  SELECT
    v_user_id,
    v_date_logged,
    SUM(amount_ml),
    ROUND(SUM(amount_ml) / 250.0),
    COUNT(*),
    v_goal_ml,
    MIN(logged_at::time),
    MAX(logged_at::time),
    now()
  FROM water_logs
  WHERE user_id = v_user_id AND date_logged = v_date_logged
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_ml = EXCLUDED.total_ml,
    total_glasses = EXCLUDED.total_glasses,
    entries_count = EXCLUDED.entries_count,
    last_log_time = EXCLUDED.last_log_time,
    updated_at = now();

  -- Get updated total
  SELECT total_ml INTO v_total_ml
  FROM daily_water_summary
  WHERE user_id = v_user_id AND date = v_date_logged;

  RETURN json_build_object(
    'success', true,
    'water_log_id', v_water_log_id,
    'amount_ml', p_amount_ml,
    'total_ml', v_total_ml,
    'goal_ml', v_goal_ml,
    'percentage', ROUND((v_total_ml::NUMERIC / NULLIF(v_goal_ml, 0)) * 100, 0)
  );
END;
$$;

-- ============================================================================
-- QUICK ADD FUNCTIONS (One-tap logging)
-- ============================================================================

CREATE OR REPLACE FUNCTION add_water_glass()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN RETURN log_water(250, 'glass'); END; $$;

CREATE OR REPLACE FUNCTION add_water_bottle()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN RETURN log_water(500, 'bottle'); END; $$;

CREATE OR REPLACE FUNCTION add_water_liter()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN RETURN log_water(1000, 'liter'); END; $$;

-- ============================================================================
-- FUNCTION: Get Today's Water Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION get_todays_water()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_summary RECORD;
  v_goal_ml INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's goal
  SELECT daily_water_goal_ml INTO v_goal_ml
  FROM profiles
  WHERE id = v_user_id;

  -- Get today's summary
  SELECT * INTO v_summary
  FROM daily_water_summary
  WHERE user_id = v_user_id AND date = CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'total_ml', 0,
      'total_glasses', 0,
      'entries_count', 0,
      'goal_ml', v_goal_ml,
      'percentage', 0,
      'remaining_ml', v_goal_ml
    );
  END IF;

  RETURN json_build_object(
    'total_ml', v_summary.total_ml,
    'total_glasses', v_summary.total_glasses,
    'entries_count', v_summary.entries_count,
    'goal_ml', v_summary.daily_goal_ml,
    'percentage', v_summary.goal_percentage,
    'remaining_ml', GREATEST(0, v_summary.daily_goal_ml - v_summary.total_ml),
    'first_log_time', v_summary.first_log_time,
    'last_log_time', v_summary.last_log_time
  );
END;
$$;

-- ============================================================================
-- FUNCTION: Delete Water Entry
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_water_log(p_water_log_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_date_logged DATE;
  v_goal_ml INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  -- Verify ownership
  SELECT date_logged INTO v_date_logged
  FROM water_logs
  WHERE id = p_water_log_id AND user_id = v_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Water log not found';
  END IF;

  -- Delete entry
  DELETE FROM water_logs WHERE id = p_water_log_id;

  -- Get goal
  SELECT daily_water_goal_ml INTO v_goal_ml
  FROM profiles
  WHERE id = v_user_id;

  -- Recalculate summary
  UPDATE daily_water_summary SET
    total_ml = (SELECT COALESCE(SUM(amount_ml), 0) FROM water_logs WHERE user_id = v_user_id AND date_logged = v_date_logged),
    total_glasses = (SELECT ROUND(COALESCE(SUM(amount_ml), 0) / 250.0) FROM water_logs WHERE user_id = v_user_id AND date_logged = v_date_logged),
    entries_count = (SELECT COUNT(*) FROM water_logs WHERE user_id = v_user_id AND date_logged = v_date_logged),
    updated_at = now()
  WHERE user_id = v_user_id AND date = v_date_logged;

  RETURN json_build_object('success', true);
END;
$$;

-- ============================================================================
-- FUNCTION: Get Water History
-- ============================================================================

CREATE OR REPLACE FUNCTION get_water_history(p_days INTEGER DEFAULT 7)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  RETURN (
    SELECT COALESCE(json_agg(
      json_build_object(
        'date', date,
        'total_ml', total_ml,
        'total_glasses', total_glasses,
        'goal_ml', daily_goal_ml,
        'percentage', goal_percentage,
        'entries_count', entries_count
      )
      ORDER BY date DESC
    ), '[]'::json)
    FROM daily_water_summary
    WHERE user_id = v_user_id
      AND date >= CURRENT_DATE - p_days
  );
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS water_logs_updated_at ON water_logs;
CREATE TRIGGER water_logs_updated_at
  BEFORE UPDATE ON water_logs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS daily_water_summary_updated_at ON daily_water_summary;
CREATE TRIGGER daily_water_summary_updated_at
  BEFORE UPDATE ON daily_water_summary
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_water_summary ENABLE ROW LEVEL SECURITY;

-- water_logs policies
DROP POLICY IF EXISTS "water_logs_select" ON water_logs;
CREATE POLICY "water_logs_select" ON water_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "water_logs_insert" ON water_logs;
CREATE POLICY "water_logs_insert" ON water_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "water_logs_update" ON water_logs;
CREATE POLICY "water_logs_update" ON water_logs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "water_logs_delete" ON water_logs;
CREATE POLICY "water_logs_delete" ON water_logs
  FOR DELETE USING (auth.uid() = user_id);

-- daily_water_summary policies
DROP POLICY IF EXISTS "water_summary_all" ON daily_water_summary;
CREATE POLICY "water_summary_all" ON daily_water_summary
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON water_logs TO authenticated;
GRANT ALL ON daily_water_summary TO authenticated;
GRANT EXECUTE ON FUNCTION log_water TO authenticated;
GRANT EXECUTE ON FUNCTION add_water_glass TO authenticated;
GRANT EXECUTE ON FUNCTION add_water_bottle TO authenticated;
GRANT EXECUTE ON FUNCTION add_water_liter TO authenticated;
GRANT EXECUTE ON FUNCTION get_todays_water TO authenticated;
GRANT EXECUTE ON FUNCTION delete_water_log TO authenticated;
GRANT EXECUTE ON FUNCTION get_water_history TO authenticated;
