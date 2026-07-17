/*
# DocBit Core Schema — Auth-linked tables for SaaS platform

## Purpose
Establishes the complete Postgres backbone for DocBit, a privacy-first file
conversion platform. All tables are owner-scoped to auth.users via RLS so each
user only ever sees their own rows. No actual file bytes are stored — only
metadata. This migration is safe to re-run (idempotent).

## New Tables
1. profiles — app-specific user data linked 1:1 to auth.users
2. conversion_history — metadata of every conversion a user performs
3. favorites — tools a user has bookmarked
4. recent_tools — tools a user has recently used (capped, lightweight)
5. settings — per-user preferences (theme, notifications, etc.)
6. analytics — aggregated/individual usage events for dashboard stats
7. feedback — user-submitted product feedback messages
8. reports — bug/abuse reports filed by users
9. feature_requests — user-submitted ideas + upvote count
10. saved_files_metadata — metadata about files users have kept references to
11. subscriptions — placeholder plan/subscription state for future Razorpay integration

## Security
- RLS enabled on every table.
- 4 policies per table (select/insert/update/delete), scoped TO authenticated
  with auth.uid() ownership checks.
- Owner columns default to auth.uid() so client inserts omitting user_id succeed.

## Indexes
- Foreign keys and frequently-filtered columns (user_id, tool_id, created_at).
- Unique constraints to prevent duplicate favorites/recents per (user, tool).
*/

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- 2. conversion_history
-- ============================================================
CREATE TABLE IF NOT EXISTS conversion_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  tool_name text,
  filename text,
  output_type text,
  file_size bigint,
  duration_ms integer,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  device text,
  browser text,
  processing_method text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE conversion_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON conversion_history;
CREATE POLICY "select_own_history" ON conversion_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_history" ON conversion_history;
CREATE POLICY "insert_own_history" ON conversion_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_history" ON conversion_history;
CREATE POLICY "update_own_history" ON conversion_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_history" ON conversion_history;
CREATE POLICY "delete_own_history" ON conversion_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversion_history_user_created
  ON conversion_history (user_id, created_at DESC);

-- ============================================================
-- 3. favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_favorites" ON favorites;
CREATE POLICY "update_own_favorites" ON favorites FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id);

-- ============================================================
-- 4. recent_tools
-- ============================================================
CREATE TABLE IF NOT EXISTS recent_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  used_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_id)
);
ALTER TABLE recent_tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recent" ON recent_tools;
CREATE POLICY "select_own_recent" ON recent_tools FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_recent" ON recent_tools;
CREATE POLICY "insert_own_recent" ON recent_tools FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_recent" ON recent_tools;
CREATE POLICY "update_own_recent" ON recent_tools FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_recent" ON recent_tools;
CREATE POLICY "delete_own_recent" ON recent_tools FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recent_tools_user_used ON recent_tools (user_id, used_at DESC);

-- ============================================================
-- 5. settings
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'system',
  email_notifications boolean NOT NULL DEFAULT true,
  privacy_consent boolean NOT NULL DEFAULT true,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON settings;
CREATE POLICY "select_own_settings" ON settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_settings" ON settings;
CREATE POLICY "insert_own_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_settings" ON settings;
CREATE POLICY "update_own_settings" ON settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_settings" ON settings;
CREATE POLICY "delete_own_settings" ON settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 6. analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  tool_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analytics" ON analytics;
CREATE POLICY "select_own_analytics" ON analytics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_analytics" ON analytics;
CREATE POLICY "insert_own_analytics" ON analytics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_analytics" ON analytics;
CREATE POLICY "update_own_analytics" ON analytics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_analytics" ON analytics;
CREATE POLICY "delete_own_analytics" ON analytics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_user_created ON analytics (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics (event);

-- ============================================================
-- 7. feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  rating integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_feedback" ON feedback;
CREATE POLICY "select_own_feedback" ON feedback FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_feedback" ON feedback;
CREATE POLICY "insert_own_feedback" ON feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_feedback" ON feedback;
CREATE POLICY "update_own_feedback" ON feedback FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_feedback" ON feedback;
CREATE POLICY "delete_own_feedback" ON feedback FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback (user_id, created_at DESC);

-- ============================================================
-- 8. reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  target text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON reports;
CREATE POLICY "select_own_reports" ON reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_reports" ON reports;
CREATE POLICY "insert_own_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reports" ON reports;
CREATE POLICY "update_own_reports" ON reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reports" ON reports;
CREATE POLICY "delete_own_reports" ON reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reports_user ON reports (user_id, created_at DESC);

-- ============================================================
-- 9. feature_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_feature_requests" ON feature_requests;
CREATE POLICY "select_own_feature_requests" ON feature_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_feature_requests" ON feature_requests;
CREATE POLICY "insert_own_feature_requests" ON feature_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_feature_requests" ON feature_requests;
CREATE POLICY "update_own_feature_requests" ON feature_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_feature_requests" ON feature_requests;
CREATE POLICY "delete_own_feature_requests" ON feature_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feature_requests_user ON feature_requests (user_id, created_at DESC);

-- ============================================================
-- 10. saved_files_metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_files_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  tool_id text,
  output_type text,
  file_size bigint,
  storage_path text,
  is_cloud boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE saved_files_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_files" ON saved_files_metadata;
CREATE POLICY "select_own_saved_files" ON saved_files_metadata FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_saved_files" ON saved_files_metadata;
CREATE POLICY "insert_own_saved_files" ON saved_files_metadata FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_saved_files" ON saved_files_metadata;
CREATE POLICY "update_own_saved_files" ON saved_files_metadata FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_saved_files" ON saved_files_metadata;
CREATE POLICY "delete_own_saved_files" ON saved_files_metadata FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_files_user ON saved_files_metadata (user_id, created_at DESC);

-- ============================================================
-- 11. subscriptions (placeholder for future Razorpay integration)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_subscriptions" ON subscriptions;
CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);

-- ============================================================
-- Auto-create profile + free subscription on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- updated_at auto-maintenance
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON profiles;
CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS settings_touch_updated_at ON settings;
CREATE TRIGGER settings_touch_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS subscriptions_touch_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_touch_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
