# AI Leadership 4Dx - Supabase 설정 가이드

> 📅 **작성일**: 2025-08-02  
> 🎯 **목적**: Supabase 프로젝트 생성 및 설정 완전 가이드

## 📋 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 마이그레이션](#3-데이터베이스-마이그레이션)
4. [RLS 정책 확인](#4-rls-정책-확인)
5. [테스트 및 검증](#5-테스트-및-검증)

## 1. Supabase 프로젝트 생성

### 1.1 웹 콘솔에서 프로젝트 생성
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. "New project" 클릭
3. 프로젝트 설정:
   - **Name**: `ai-leadership-4dx`
   - **Organization**: 개인/회사 조직 선택
   - **Database Password**: 강력한 비밀번호 설정 (저장 필요!)
   - **Region**: `Asia Pacific (Seoul)` 선택
4. "Create new project" 클릭 (약 2분 소요)

### 1.2 프로젝트 URL 및 API 키 확인
프로젝트 생성 완료 후:
1. Settings > API 페이지로 이동
2. 다음 정보 복사:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon/public key**: `eyJ...` (공개 키)
   - **service_role key**: `eyJ...` (서비스 키, 보안 주의!)

## 2. 환경 변수 설정

### 2.1 .env.local 파일 업데이트
```bash
# 프로젝트 루트의 frontend/.env.local 파일 수정
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-anon-key]

# 백엔드용 (향후 FastAPI 연동 시 사용)
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-service-role-key]
```

### 2.2 환경 변수 보안
⚠️ **중요**: `service_role` 키는 모든 RLS를 우회할 수 있으므로:
- `.env.local`에만 저장 (Git 추적 안됨)
- 프로덕션에서는 안전한 환경 변수 관리 도구 사용
- 절대 클라이언트 코드에 포함하지 말 것

## 3. 데이터베이스 마이그레이션

### 3.1 SQL Editor에서 스키마 생성
1. Supabase 대시보드 > SQL Editor 페이지로 이동
2. "New query" 클릭
3. `/database/migrations/001_initial_schema.sql` 파일 내용 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행

### 3.2 테이블 생성 확인
Table Editor에서 다음 테이블들이 생성되었는지 확인:
- ✅ `users` - 사용자 프로필 정보
- ✅ `organizations` - 조직 정보
- ✅ `survey_responses` - 설문 응답 데이터
- ✅ `leadership_analysis` - 리더십 분석 결과 (기밀)
- ✅ `validation_reports` - 검증 리포트

### 3.3 커스텀 타입 확인
Database > Types에서 확인:
- ✅ `user_role` - user, admin, manager
- ✅ `risk_level` - low, medium, high

## 4. RLS 정책 확인

### 4.1 Authentication 설정
1. Authentication > Settings에서:
   - **Enable email confirmations**: OFF (개발용)
   - **Enable phone confirmations**: OFF
   - **Double confirm email changes**: OFF (개발용)

### 4.2 RLS 정책 검증
Table Editor에서 각 테이블의 "..." > "View policies"에서 정책 확인:

**users 테이블**:
- ✅ Users can view own profile
- ✅ Users can update own profile  
- ✅ Admins can view all users
- ✅ Auto-insert user profile

**survey_responses 테이블**:
- ✅ Users can view own survey responses
- ✅ Users can insert own survey responses
- ✅ Admins can view all survey responses

**leadership_analysis 테이블**:
- ✅ Users can view own analysis (sanitized)
- ✅ Admins can view all analysis (full access)
- ✅ System can insert analysis

## 5. 테스트 및 검증

### 5.1 첫 번째 사용자 생성 테스트
```bash
# 프론트엔드 서버 시작
npm run dev -- --port 3001

# 브라우저에서 접속
http://localhost:3001/auth
```

1. 회원가입 페이지에서 테스트 계정 생성
2. 이메일 확인 없이 바로 로그인 가능한지 확인
3. 네비게이션에 사용자 이름 표시되는지 확인

### 5.2 데이터베이스 확인
Supabase 대시보드 > Table Editor > users:
1. 새로 가입한 사용자 정보가 자동으로 삽입되었는지 확인
2. `id`가 `auth.users`의 `id`와 일치하는지 확인
3. 기본 `role`이 'user'로 설정되었는지 확인

### 5.3 관리자 권한 설정
첫 번째 사용자를 관리자로 승격:
1. Table Editor > users 테이블 열기
2. 생성된 사용자의 `role` 컬럼을 'admin'으로 변경
3. 프론트엔드에서 로그아웃 후 재로그인
4. 네비게이션에 "관리자" 메뉴가 나타나는지 확인

## 📋 설정 완료 체크리스트

### 필수 체크리스트
- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경 변수 설정 (URL, anon key)
- [ ] 데이터베이스 스키마 마이그레이션 완료
- [ ] RLS 정책 활성화 확인
- [ ] 첫 번째 사용자 회원가입 테스트
- [ ] 관리자 권한 설정 및 테스트

### 고급 체크리스트  
- [ ] 이메일 템플릿 커스터마이징
- [ ] 소셜 로그인 설정 (Google, GitHub)
- [ ] 프로덕션 환경 변수 설정
- [ ] 백업 정책 설정
- [ ] 모니터링 알림 설정

## 🚨 문제 해결

### 일반적인 문제들

**1. RLS 정책 오류**
```sql
-- 문제: 사용자가 자신의 데이터에 접근할 수 없음
-- 해결: auth.uid() 함수 확인
SELECT auth.uid(); -- NULL이면 로그인 상태 확인
```

**2. 환경 변수 인식 안됨**
```bash
# 문제: 환경 변수가 로드되지 않음
# 해결: 서버 재시작 필요
npm run dev -- --port 3001
```

**3. 자동 사용자 생성 안됨**
```sql
-- 문제: handle_new_user 함수 오류
-- 해결: 트리거 함수 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- 그 후 마이그레이션 스크립트 재실행
```

## 🔄 다음 단계

설정 완료 후:
1. **실시간 기능**: Realtime 구독 구현
2. **Storage**: 프로필 이미지 업로드 기능
3. **API 통합**: FastAPI 백엔드와 연동
4. **배포**: Vercel 배포 시 환경 변수 설정

---

## 💡 개발 팁

### Supabase CLI 활용 (선택사항)
```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 개발 환경 초기화
supabase init

# 로컬 Supabase 실행 (Docker 필요)
supabase start

# 마이그레이션 생성
supabase migration new initial_schema

# 원격 변경사항 동기화
supabase db pull
```

### 유용한 SQL 쿼리
```sql
-- 모든 사용자와 역할 확인
SELECT id, email, name, role, created_at FROM users;

-- 설문 응답 현황 확인
SELECT 
  u.name, 
  COUNT(sr.id) as survey_count,
  MAX(sr.created_at) as last_survey
FROM users u
LEFT JOIN survey_responses sr ON u.id = sr.user_id
GROUP BY u.id, u.name;

-- 위험도별 분석 결과 통계
SELECT 
  overall_risk_level,
  COUNT(*) as count,
  AVG(influence_machiavellianism) as avg_mach,
  AVG(influence_narcissism) as avg_narc,
  AVG(influence_psychopathy) as avg_psyc
FROM leadership_analysis
GROUP BY overall_risk_level;
```

---

**📞 지원**: 설정 중 문제 발생 시 Supabase 공식 문서 또는 Discord 커뮤니티 활용