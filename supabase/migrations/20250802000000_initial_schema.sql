-- AI Leadership 4Dx 전체 데이터베이스 마이그레이션
-- 이 파일을 Supabase SQL Editor에 복사하여 실행하세요
-- 작성일: 2025-08-02

-- =====================================================
-- 0. Extensions 활성화
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- 1. Custom Types 생성
-- =====================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. Users Table (확장된 사용자 정보)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  organization TEXT,
  department TEXT,
  position TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Auto-insert user profile" ON users;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Auto-insert user profile" ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. Survey Responses Table
-- =====================================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  survey_version TEXT NOT NULL DEFAULT '1.0',
  responses JSONB NOT NULL,
  completion_time_seconds INTEGER,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own survey responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can insert own survey responses" ON survey_responses;
DROP POLICY IF EXISTS "Admins can view all survey responses" ON survey_responses;

-- RLS Policies for survey_responses
CREATE POLICY "Users can view own survey responses" ON survey_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey responses" ON survey_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all survey responses" ON survey_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 4. Leadership Analysis Table (심리 분석 결과)
-- =====================================================
CREATE TABLE IF NOT EXISTS leadership_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  survey_response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE NOT NULL,
  
  -- Blake-Mouton Grid 점수
  blake_mouton_people DECIMAL(3,2) NOT NULL CHECK (blake_mouton_people >= 1 AND blake_mouton_people <= 7),
  blake_mouton_production DECIMAL(3,2) NOT NULL CHECK (blake_mouton_production >= 1 AND blake_mouton_production <= 7),
  
  -- Radical Candor 점수
  feedback_care DECIMAL(3,2) NOT NULL CHECK (feedback_care >= 1 AND feedback_care <= 7),
  feedback_challenge DECIMAL(3,2) NOT NULL CHECK (feedback_challenge >= 1 AND feedback_challenge <= 7),
  
  -- LMX 점수
  lmx_score DECIMAL(3,2) NOT NULL CHECK (lmx_score >= 1 AND lmx_score <= 7),
  
  -- Influence Gauge (숨겨진 차원)
  influence_machiavellianism DECIMAL(3,2) NOT NULL CHECK (influence_machiavellianism >= 1 AND influence_machiavellianism <= 5),
  influence_narcissism DECIMAL(3,2) NOT NULL CHECK (influence_narcissism >= 1 AND influence_narcissism <= 5),
  influence_psychopathy DECIMAL(3,2) NOT NULL CHECK (influence_psychopathy >= 1 AND influence_psychopathy <= 5),
  
  -- 전체 위험도
  overall_risk_level risk_level NOT NULL,
  
  -- AI 분석 결과
  recommendations JSONB NOT NULL DEFAULT '[]',
  ai_insights JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leadership_analysis ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own analysis (sanitized)" ON leadership_analysis;
DROP POLICY IF EXISTS "Admins can view all analysis (full access)" ON leadership_analysis;
DROP POLICY IF EXISTS "System can insert analysis" ON leadership_analysis;

-- RLS Policies for leadership_analysis
CREATE POLICY "Users can view own analysis (sanitized)" ON leadership_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analysis (full access)" ON leadership_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert analysis" ON leadership_analysis FOR INSERT
  WITH CHECK (true); -- API 서버에서 삽입

-- =====================================================
-- 5. Reports Table (PDF 보고서 메타데이터)
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  analysis_id UUID REFERENCES leadership_analysis(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'comprehensive',
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can view own reports" ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 6. Indexes for Performance
-- =====================================================
-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization);

-- Survey responses indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);

-- Leadership analysis indexes
CREATE INDEX IF NOT EXISTS idx_leadership_analysis_user_id ON leadership_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_leadership_analysis_survey_response_id ON leadership_analysis(survey_response_id);
CREATE INDEX IF NOT EXISTS idx_leadership_analysis_risk_level ON leadership_analysis(overall_risk_level);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- =====================================================
-- 7. Functions and Triggers
-- =====================================================
-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_survey_responses_updated_at ON survey_responses;
DROP TRIGGER IF EXISTS update_leadership_analysis_updated_at ON leadership_analysis;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leadership_analysis_updated_at
  BEFORE UPDATE ON leadership_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. Helper Functions
-- =====================================================
-- Function to calculate leadership style
CREATE OR REPLACE FUNCTION get_leadership_style(
  people_score DECIMAL,
  production_score DECIMAL
) RETURNS TEXT AS $$
BEGIN
  IF people_score <= 3 AND production_score <= 3 THEN
    RETURN 'Impoverished';
  ELSIF people_score <= 3 AND production_score > 5 THEN
    RETURN 'Authority-Compliance';
  ELSIF people_score > 5 AND production_score <= 3 THEN
    RETURN 'Country Club';
  ELSIF people_score >= 4 AND production_score >= 4 AND people_score <= 5 AND production_score <= 5 THEN
    RETURN 'Middle of the Road';
  ELSIF people_score > 5 AND production_score > 5 THEN
    RETURN 'Team Leadership';
  ELSE
    RETURN 'Transitional';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate risk level
CREATE OR REPLACE FUNCTION calculate_risk_level(
  machiavellianism DECIMAL,
  narcissism DECIMAL,
  psychopathy DECIMAL
) RETURNS risk_level AS $$
DECLARE
  avg_score DECIMAL;
BEGIN
  avg_score := (machiavellianism + narcissism + psychopathy) / 3;
  
  IF avg_score < 2.5 THEN
    RETURN 'low'::risk_level;
  ELSIF avg_score < 3.5 THEN
    RETURN 'medium'::risk_level;
  ELSE
    RETURN 'high'::risk_level;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 9. Grant Permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- 10. 완료 메시지
-- =====================================================
-- 마이그레이션이 성공적으로 완료되었습니다!
-- 다음 테이블들이 생성되었습니다:
-- - users (사용자 정보)
-- - survey_responses (설문 응답)
-- - leadership_analysis (리더십 분석 결과)
-- - reports (보고서 메타데이터)
--
-- 첫 번째로 가입하는 사용자는 자동으로 admin 권한을 받을 수 있도록
-- 애플리케이션에서 처리해주세요.