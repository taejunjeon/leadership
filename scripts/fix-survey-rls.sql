-- survey_results 및 survey_responses 테이블의 RLS 정책 수정
-- Supabase SQL Editor에서 실행

-- 1. 기존 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('survey_results', 'survey_responses');

-- 2. survey_results 테이블 RLS 정책 재설정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own results" ON survey_results;
DROP POLICY IF EXISTS "Users can insert own results" ON survey_results;
DROP POLICY IF EXISTS "Users can update own results" ON survey_results;
DROP POLICY IF EXISTS "Admins can view all results" ON survey_results;

-- RLS 활성화
ALTER TABLE survey_results ENABLE ROW LEVEL SECURITY;

-- 새 정책 생성
-- 사용자가 자신의 결과를 조회할 수 있음
CREATE POLICY "Users can view own results" ON survey_results
    FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자가 자신의 결과를 삽입할 수 있음
CREATE POLICY "Users can insert own results" ON survey_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 결과를 업데이트할 수 있음
CREATE POLICY "Users can update own results" ON survey_results
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 결과를 볼 수 있음
CREATE POLICY "Admins can view all results" ON survey_results
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 3. survey_responses 테이블 RLS 정책 재설정
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON survey_responses;
DROP POLICY IF EXISTS "Admins can view all responses" ON survey_responses;

-- RLS 활성화
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 새 정책 생성
-- 사용자가 자신의 응답을 조회할 수 있음
CREATE POLICY "Users can view own responses" ON survey_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );

-- 사용자가 자신의 응답을 삽입할 수 있음
CREATE POLICY "Users can insert own responses" ON survey_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );

-- 관리자는 모든 응답을 볼 수 있음
CREATE POLICY "Admins can view all responses" ON survey_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 4. 정책 확인
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN ('survey_results', 'survey_responses')
ORDER BY tablename, policyname;

-- 5. 테스트 쿼리 (현재 사용자의 권한 확인)
SELECT 
    auth.uid() as current_user_id,
    (SELECT role FROM users WHERE id = auth.uid()) as user_role,
    (SELECT COUNT(*) FROM survey_results WHERE user_id = auth.uid()) as my_survey_count;