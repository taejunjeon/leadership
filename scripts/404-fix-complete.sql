-- 🚨 404 오류 완전 해결 스크립트
-- Supabase SQL Editor에서 실행: https://supabase.com/dashboard/project/eokkqmqpxqwmlmshhewn/sql/new

-- ============================================
-- STEP 1: 테이블 실체 확인
-- ============================================
SELECT '=== STEP 1: 테이블 존재 확인 ===' as step;
SELECT relname, relnamespace::regnamespace as schema
FROM pg_class 
WHERE relname IN ('survey_results', 'survey_responses');

-- 테이블이 없다면 생성
CREATE TABLE IF NOT EXISTS public.survey_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_time INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: 권한 GRANT (중요!)
-- ============================================
SELECT '=== STEP 2: 권한 부여 ===' as step;

-- public 스키마 사용 권한
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 테이블 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.survey_results TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.survey_responses TO anon, authenticated;

-- 시퀀스 권한 (UUID 생성을 위해)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- STEP 3: RLS + 정책 설정
-- ============================================
SELECT '=== STEP 3: RLS 정책 설정 ===' as step;

-- RLS 활성화
ALTER TABLE public.survey_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "ins_own" ON public.survey_results;
DROP POLICY IF EXISTS "sel_own" ON public.survey_results;
DROP POLICY IF EXISTS "upd_own" ON public.survey_results;
DROP POLICY IF EXISTS "all_own_responses" ON public.survey_responses;

-- survey_results 정책
CREATE POLICY "ins_own" ON public.survey_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sel_own" ON public.survey_results
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "upd_own" ON public.survey_results
    FOR UPDATE
    USING (auth.uid() = user_id);

-- survey_responses 정책
CREATE POLICY "all_own_responses" ON public.survey_responses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );

-- 관리자 정책 추가
CREATE POLICY "admin_all" ON public.survey_results
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "admin_all_responses" ON public.survey_responses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================
-- STEP 4: 확인 및 테스트
-- ============================================
SELECT '=== STEP 4: 최종 확인 ===' as step;

-- 테이블 확인
SELECT 
    c.relname as table_name,
    n.nspname as schema_name,
    CASE WHEN c.relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status,
    COUNT(p.polname) as policy_count
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_policy p ON c.oid = p.polrelid
WHERE c.relname IN ('survey_results', 'survey_responses')
GROUP BY c.relname, n.nspname, c.relrowsecurity
ORDER BY c.relname;

-- 권한 확인
SELECT 
    table_name,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('survey_results', 'survey_responses')
AND grantee IN ('anon', 'authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- 정책 확인
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('survey_results', 'survey_responses')
ORDER BY tablename, policyname;

-- ============================================
-- BONUS: taejun@biocom.kr 관리자 권한
-- ============================================
UPDATE public.users
SET role = 'admin'
WHERE email = 'taejun@biocom.kr';

SELECT '✅ 404 수정 완료! 이제 설문이 저장됩니다.' as result;