-- 📢 Supabase SQL Editor에서 즉시 실행하세요!
-- https://supabase.com/dashboard/project/eokkqmqpxqwmlmshhewn/sql/new

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS survey_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_time INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 정책 설정
ALTER TABLE survey_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 3. 사용자 권한 정책
CREATE POLICY "Users can view own results" ON survey_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON survey_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON survey_results
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own responses" ON survey_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );

-- 4. 관리자 권한 정책
CREATE POLICY "Admins can view all results" ON survey_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all responses" ON survey_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 5. taejun@biocom.kr 관리자 권한 부여
UPDATE public.users
SET role = 'admin'
WHERE email = 'taejun@biocom.kr';

-- 6. 확인
SELECT 'survey_results' as table_name, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'survey_results'
UNION ALL
SELECT 'survey_responses', COUNT(*) FROM information_schema.tables WHERE table_name = 'survey_responses';