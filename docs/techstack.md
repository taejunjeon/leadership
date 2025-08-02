# Grid 3.0 기술 스택 문서

> 최종 업데이트: 2025-08-02
> 작성자: 헤파이스토스

## 기술 스택 개요

Grid 3.0 리더십 매핑 플랫폼의 기술 스택은 **생산성**, **확장성**, **유지보수성**을 핵심 기준으로 선정했소. 특히 3D 시각화와 실시간 데이터 처리가 중요한 프로젝트 특성을 고려하여 구성했소.

## 런타임 환경

### Node.js 20 LTS ✅
- **선택 이유**: 
  - 2026년까지 장기 지원(LTS) 보장
  - Next.js 14+와 최적 호환성
  - 성능 개선 및 보안 패치 지속
- **대안 검토**: Node.js 22는 아직 LTS가 아니므로 프로덕션에 부적합

### Python 3.12 ✅
- **선택 이유**:
  - FastAPI의 최신 비동기 기능 완벽 지원
  - 타입 힌트 성능 개선
  - AI/ML 라이브러리 생태계 우수
- **대안 검토**: Python 3.11도 가능하나, 3.12의 성능 개선 활용 권장

## 프론트엔드

### Next.js 14+ (App Router) ✅
- **선택 이유**:
  - Server Components로 초기 로딩 속도 개선
  - 내장 최적화 기능 (이미지, 폰트, 번들)
  - Vercel 배포 시 최적 성능
  - SEO 최적화 용이
- **대안 검토**: 
  - Vite + React: 더 가볍지만 SSR 구현 복잡
  - Remix: 훌륭하나 생태계가 Next.js보다 작음

### TypeScript 5.4+ ✅
- **선택 이유**:
  - 대규모 프로젝트 타입 안정성
  - IDE 자동완성 및 리팩토링 지원
  - 런타임 에러 사전 방지
- **권장사항**: strict 모드 활성화 필수

### React 18.3 ✅
- **선택 이유**:
  - Concurrent Features로 사용자 경험 개선
  - Suspense로 비동기 처리 단순화
  - 최대 생태계 및 커뮤니티 지원

### Tailwind CSS 3.4 ✅
- **선택 이유**:
  - 유틸리티 우선으로 빠른 개발
  - 번들 크기 최적화 (사용한 클래스만 포함)
  - 일관된 디자인 시스템 구축 용이
- **대안 검토**: CSS-in-JS는 런타임 오버헤드 존재

### Zustand ✅
- **선택 이유**:
  - Redux보다 간단한 API
  - TypeScript 지원 우수
  - 번들 크기 작음 (8KB)
  - React 외부에서도 상태 접근 가능
- **대안 검토**: 
  - Redux Toolkit: 더 강력하나 복잡도 높음
  - Jotai: 원자적 상태 관리가 필요한 경우 고려

### TanStack Query v5 ✅
- **선택 이유**:
  - 서버 상태 관리 최적화
  - 자동 캐싱 및 동기화
  - 옵티미스틱 업데이트 지원
  - Suspense 모드 지원

### 시각화 라이브러리

#### Recharts ✅
- **선택 이유**:
  - React 친화적 API
  - 반응형 차트 기본 지원
  - 2D 차트에 최적화
- **사용처**: 대시보드 기본 차트 (선, 막대, 파이)

#### D3.js ⚠️ (조건부 권장)
- **선택 이유**:
  - 3D 시각화 커스터마이징 필요 시
  - Three.js와 통합 가능
- **주의사항**: 
  - 학습 곡선 가파름
  - React와 직접 통합 시 주의 필요
- **대안 제안**: **Three.js + React Three Fiber** 🔥
  - 3D WebGL 렌더링에 특화
  - React 컴포넌트로 3D 구현
  - Grid 3.0의 4D 좌표 시각화에 최적

### React Hook Form + Zod ✅
- **선택 이유**:
  - 비제어 컴포넌트로 성능 최적화
  - Zod로 런타임 타입 검증
  - 폼 검증 로직 단순화

## 백엔드

### FastAPI ✅
- **선택 이유**:
  - 자동 API 문서 생성 (OpenAPI)
  - 비동기 처리 기본 지원
  - Pydantic과 완벽 통합
  - 높은 성능 (Starlette 기반)
- **대안 검토**: 
  - Django: 너무 무거움
  - Flask: 비동기 지원 미흡

### Pydantic v2 ✅
- **선택 이유**:
  - Rust 기반 코어로 5-50배 성능 향상
  - FastAPI와 네이티브 통합
  - 런타임 타입 검증

### asyncio ✅
- **선택 이유**:
  - Python 표준 비동기 라이브러리
  - FastAPI와 자연스러운 통합
  - 동시 요청 처리 최적화

## 데이터베이스 & 인프라

### Supabase ✅
- **선택 이유**:
  - PostgreSQL 기반 오픈소스
  - 실시간 구독 내장
  - 인증 시스템 포함
  - 무료 티어 관대함
  - Edge Functions로 서버리스 확장
- **주의사항**: PostgreSQL 15 (PRD는 17 명시, Supabase는 15 제공)

### pgvector ✅
- **선택 이유**:
  - PostgreSQL 네이티브 벡터 연산
  - AI 코칭 카드 유사도 검색
  - 리더십 패턴 임베딩 저장
- **활용처**: 유사 리더 찾기, 코칭 추천

### Redis ⚠️ (선택적)
- **선택 이유**:
  - 세션 관리
  - 실시간 리더보드
  - API 응답 캐싱
- **권장사항**: 초기에는 제외, 성능 이슈 시 도입

## 배포 전략

### 권장 배포 구성 🚀

#### 옵션 1: Vercel + Supabase (추천) ⭐
- **Vercel**: Next.js 프론트엔드
  - 장점: Next.js 최적화, 자동 CI/CD, 엣지 네트워크
  - 단점: 서버리스 한계 (장시간 작업 불가)
- **Supabase**: 백엔드 API + DB
  - Edge Functions로 FastAPI 대체 가능
  - 실시간 기능 내장

#### 옵션 2: Railway + Supabase
- **Railway**: FastAPI 백엔드
  - 장점: 컨테이너 기반, 유연한 설정
  - 단점: 무료 티어 제한적
- **Supabase**: DB + 인증

#### 옵션 3: Vercel + Railway + Supabase (풀스택)
- **Vercel**: 프론트엔드 전용
- **Railway**: FastAPI 백엔드 전용
- **Supabase**: DB + 실시간 + 스토리지
- 장점: 각 서비스 최적 활용
- 단점: 관리 복잡도 증가

### 최종 권장안
**옵션 1 (Vercel + Supabase)** 로 시작하되, FastAPI가 꼭 필요한 복잡한 로직이 있다면 **옵션 3**으로 확장하는 것을 권장하오.

## 기술 스택 요약

```yaml
# 런타임
runtime:
  - Node.js 20 LTS
  - Python 3.12

# 프론트엔드
frontend:
  framework: Next.js 14+ (App Router)
  language: TypeScript 5.4+
  ui:
    - React 18.3
    - Tailwind CSS 3.4
  state: Zustand
  data-fetching: TanStack Query v5
  visualization:
    - Recharts (2D 차트)
    - React Three Fiber (3D 시각화) # D3.js 대신 권장
  forms: React Hook Form + Zod

# 백엔드
backend:
  framework: FastAPI
  validation: Pydantic v2
  async: asyncio

# 인프라
infrastructure:
  platform: Supabase
    - PostgreSQL 15
    - Realtime subscriptions
    - Auth system
    - File storage
    - Edge Functions
  vector-db: pgvector
  cache: Redis (optional)

# 배포
deployment:
  frontend: Vercel
  backend: Supabase Edge Functions (또는 Railway)
  database: Supabase
```

## 개발 환경 설정

```bash
# 프론트엔드
cd frontend
npm install
npm run dev

# 백엔드 (FastAPI 사용 시)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Supabase
npx supabase init
npx supabase start  # 로컬 개발
```

## 주요 의사결정 근거

1. **Next.js over Vite**: SSR/SSG 필요, SEO 중요
2. **Zustand over Redux**: 단순성과 성능 균형
3. **Supabase over 자체 구축**: 개발 속도와 비용 효율
4. **React Three Fiber over D3.js**: 3D 시각화 전문성
5. **TypeScript strict mode**: 장기적 유지보수성

## 리스크 및 대응

| 리스크 | 대응 방안 |
|--------|----------|
| Supabase 벤더 종속 | PostgreSQL 표준 준수, 마이그레이션 계획 수립 |
| 3D 렌더링 성능 | WebGL 최적화, LOD(Level of Detail) 적용 |
| 실시간 동시 접속 | Redis 캐싱, 데이터 배치 처리 |
| TypeScript 학습 곡선 | 점진적 마이그레이션, 타입 생성 도구 활용 |

---

이 기술 스택으로 Grid 3.0 리더십 매핑 플랫폼을 안정적이고 확장 가능하게 구축할 수 있을 것이오, TJ님!