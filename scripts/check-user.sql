-- 사용자 확인 쿼리
-- Supabase SQL Editor에서 실행

-- 1. auth.users 테이블에서 사용자 확인
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
WHERE email = 'taejun@biocom.kr';

-- 2. public.users 테이블 확인
SELECT * FROM public.users
WHERE email = 'taejun@biocom.kr';

-- 3. 이메일 인증 상태 확인
SELECT 
    email,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '미인증'
        ELSE '인증완료'
    END as status
FROM auth.users
WHERE email = 'taejun@biocom.kr';