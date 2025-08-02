-- 이메일 수동 인증 처리
-- Supabase SQL Editor에서 실행
-- 주의: 개발 환경에서만 사용!

UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'taejun@biocom.kr'
AND email_confirmed_at IS NULL;

-- 결과 확인
SELECT 
    email,
    email_confirmed_at,
    confirmed_at
FROM auth.users
WHERE email = 'taejun@biocom.kr';