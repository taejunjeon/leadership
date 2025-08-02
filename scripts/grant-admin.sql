-- taejun@biocom.kr 계정에 마스터 관리자 권한 부여
-- Supabase SQL Editor에서 실행

-- 1. users 테이블에서 role을 admin으로 업데이트
UPDATE public.users
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'taejun@biocom.kr';

-- 2. 권한 확인
SELECT 
    id,
    email,
    name,
    role,
    created_at,
    updated_at
FROM public.users
WHERE email = 'taejun@biocom.kr';

-- 3. 관리자 권한 메타데이터 추가 (옵션)
UPDATE public.users
SET 
    metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{permissions}',
        '{"view_all_surveys": true, "manage_users": true, "export_data": true, "system_admin": true}'::jsonb
    )
WHERE email = 'taejun@biocom.kr';