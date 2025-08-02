-- AI Leadership 4Dx 초기 데이터베이스 스키마
-- 작성일: 2025-08-02
-- 목적: Supabase 데이터베이스 초기 설정

-- Enable Row Level Security
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'manager');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- =====================================================
-- 1. Users Table (확장된 사용자 정보)
-- =====================================================
CREATE TABLE users (
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
-- 2. Organizations Table
-- =====================================================
CREATE TABLE organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. Survey Responses Table
-- =====================================================
CREATE TABLE survey_responses (
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
CREATE TABLE leadership_analysis (
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
-- 5. Validation Reports Table
-- =====================================================
CREATE TABLE validation_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  survey_response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE NOT NULL,
  is_valid BOOLEAN NOT NULL,
  errors JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  outliers JSONB DEFAULT '[]',
  completeness_score DECIMAL(3,2) NOT NULL CHECK (completeness_score >= 0 AND completeness_score <= 1),
  consistency_score DECIMAL(3,2) NOT NULL CHECK (consistency_score >= 0 AND consistency_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE validation_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for validation_reports
CREATE POLICY "Users can view own validation reports" ON validation_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all validation reports" ON validation_reports FOR SELECT
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_organization ON users(organization);

-- Survey responses indexes
CREATE INDEX idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);

-- Leadership analysis indexes
CREATE INDEX idx_leadership_analysis_user_id ON leadership_analysis(user_id);
CREATE INDEX idx_leadership_analysis_survey_response_id ON leadership_analysis(survey_response_id);
CREATE INDEX idx_leadership_analysis_risk_level ON leadership_analysis(overall_risk_level);

-- Validation reports indexes
CREATE INDEX idx_validation_reports_user_id ON validation_reports(user_id);
CREATE INDEX idx_validation_reports_is_valid ON validation_reports(is_valid);

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

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leadership_analysis_updated_at
  BEFORE UPDATE ON leadership_analysis
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. Sample Data (Development Only)
-- =====================================================
-- Insert sample admin user (will be created when first user signs up)
-- The first user to sign up will be automatically granted admin role

-- =====================================================
-- 9. Security Notes
-- =====================================================
-- 1. Influence Gauge 차원들 (machiavellianism, narcissism, psychopathy)은
--    사용자에게 직접 노출되지 않도록 애플리케이션 레벨에서 제어
-- 2. 관리자만 전체 심리 분석 결과에 접근 가능
-- 3. 모든 테이블에 RLS 적용으로 데이터 보안 강화
-- 4. API 서버는 service_role 키를 사용하여 RLS 우회 가능