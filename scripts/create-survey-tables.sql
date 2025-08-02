-- survey_results 및 survey_responses 테이블 생성
-- Supabase SQL Editor에서 실행

-- 1. 테이블 존재 여부 확인
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tables.table_name) as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('survey_results', 'survey_responses');

-- 2. survey_results 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS survey_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_time INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_survey_results_user_id ON survey_results(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_results_created_at ON survey_results(created_at DESC);

-- 3. survey_responses 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL CHECK (value >= 1 AND value <= 7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON survey_responses(question_id);

-- 복합 유니크 제약 (한 설문에서 같은 질문에 대한 중복 응답 방지)
ALTER TABLE survey_responses 
ADD CONSTRAINT unique_survey_question 
UNIQUE (survey_id, question_id);

-- 4. RLS 정책 설정
-- survey_results 테이블
ALTER TABLE survey_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results" ON survey_results
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON survey_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON survey_results
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all results" ON survey_results
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- survey_responses 테이블
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own responses" ON survey_responses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all responses" ON survey_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 5. 테이블 확인
SELECT 
    'survey_results' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'survey_results') as column_count
FROM survey_results
UNION ALL
SELECT 
    'survey_responses' as table_name,
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'survey_responses') as column_count
FROM survey_responses;

-- 6. 현재 사용자 권한 테스트
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    (SELECT role FROM users WHERE id = auth.uid()) as user_role,
    current_setting('request.jwt.claims', true)::json->>'role' as jwt_role;