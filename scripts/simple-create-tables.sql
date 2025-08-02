-- 간단한 survey 테이블 생성 스크립트
-- Supabase SQL Editor에서 실행

-- 1. survey_results 테이블 생성
CREATE TABLE survey_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_time INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. survey_responses 테이블 생성
CREATE TABLE survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS 비활성화 (테스트용 - 나중에 활성화 필요)
ALTER TABLE survey_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses DISABLE ROW LEVEL SECURITY;

-- 4. 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('survey_results', 'survey_responses');