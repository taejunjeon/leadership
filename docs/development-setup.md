# AI Leadership 4Dx - 개발 환경 설정 가이드

## 🚀 빠른 시작 (Mock Auth 모드)

Supabase 없이 로컬에서 바로 개발을 시작할 수 있습니다.

### 1. 백엔드 실행
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 2. 프론트엔드 실행
```bash
cd frontend
npm run dev
```

### 3. 테스트 계정
Mock Auth 모드에서 사용 가능한 테스트 계정:

- **관리자**: admin@test.com / admin123
- **일반 사용자**: user@test.com / user123

### 4. 접속 주소
- **프론트엔드**: http://localhost:3001
- **백엔드 API 문서**: http://localhost:8000/docs
- **AI 테스트 페이지**: http://localhost:3001/ai-test

## 🔧 환경 변수 설정

### Frontend (.env.development)
```env
# Mock Auth 모드 활성화
NEXT_PUBLIC_USE_MOCK_AUTH=true

# API 주소
NEXT_PUBLIC_API_URL=http://localhost:8000

# Mock Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_mock_key
```

### Backend (.env)
```env
# 기본 설정
DEBUG=true
ENVIRONMENT=development

# AI API 키 (실제 키 필요)
OPENAI_API_KEY=your_actual_openai_key
ANTHROPIC_API_KEY=your_actual_anthropic_key

# Supabase (Mock 모드에서는 더미 값 사용 가능)
SUPABASE_URL=https://example.supabase.co
SUPABASE_ANON_KEY=dummy_anon_key
SUPABASE_SERVICE_KEY=dummy_service_key
```

## 🎯 주요 기능 테스트

### 1. AI Provider 테스트
1. http://localhost:3001/ai-test 접속
2. GPT-4.1 또는 Claude 4 Sonnet 선택
3. "분석 실행" 클릭으로 테스트

### 2. 설문 테스트
1. 로그인 후 http://localhost:3001/survey 접속
2. 43개 문항 완성
3. 결과 확인

### 3. 3D 시각화
- http://localhost:3001/visualization
- WebGL 지원 브라우저 필요

## ⚠️ 주의사항

1. **Mock Auth 모드**는 개발 전용입니다
2. 실제 데이터는 저장되지 않습니다 (메모리에만 존재)
3. 서버 재시작 시 모든 데이터가 초기화됩니다
4. 프로덕션에서는 반드시 실제 Supabase 설정을 사용하세요

## 🐛 문제 해결

### CORS 에러
- 백엔드의 CORS_ORIGINS 설정 확인
- 프론트엔드 포트가 3001인지 확인

### API 404 에러
- 백엔드가 포트 8000에서 실행 중인지 확인
- API 경로가 올바른지 확인 (/api/ai/providers 등)

### Mock Auth 로그인 실패
- 테스트 계정 정보가 정확한지 확인
- 브라우저 로컬 스토리지 초기화 시도

## 📝 다음 단계

1. **실제 Supabase 프로젝트 생성**
   - https://supabase.com 에서 무료 프로젝트 생성
   - 환경 변수에 실제 값 설정

2. **데이터베이스 마이그레이션**
   ```bash
   cd supabase
   supabase db push
   ```

3. **프로덕션 배포 준비**
   - 환경 변수 분리
   - 보안 설정 강화
   - 성능 최적화