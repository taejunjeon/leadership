# Grid 3.0 리더십 매핑 플랫폼 개발 규칙

> 최종 업데이트: 2025-08-02  
> 작성자: 헤파이스토스  
> 프로젝트: Grid 3.0 Leadership Mapping Platform  
> 적용 범위: 모든 개발팀원

## 목차

1. [개발 철학](#1-개발-철학)
2. [기술 스택 규칙](#2-기술-스택-규칙)
3. [코드 품질 기준](#3-코드-품질-기준)
4. [Git 워크플로우](#4-git-워크플로우)
5. [테스트 규칙](#5-테스트-규칙)
6. [API 개발 규칙](#6-api-개발-규칙)
7. [데이터베이스 규칙](#7-데이터베이스-규칙)
8. [성능 및 보안](#8-성능-및-보안)
9. [문서화 규칙](#9-문서화-규칙)
10. [배포 및 운영](#10-배포-및-운영)

## 1. 개발 철학

### 1.1 핵심 원칙

#### 탐색 우선 (Exploration First) 🔍
- **코드 변경 전 충분한 이해**: 기존 코드베이스 분석 후 작업 시작
- **의존성과 영향 범위 파악**: 변경이 미치는 영향을 사전에 분석
- **불확실한 부분은 먼저 조사**: 가정하지 말고 확인 후 진행

#### 점진적 개발 (Incremental Development) 📈
- **작은 단위로 분할**: 큰 변경을 작은 단위로 나누어 진행
- **각 단계마다 커밋**: 체크포인트 생성으로 롤백 가능한 상태 유지
- **하나씩 완성**: 한 번에 하나의 기능만 집중해서 완료

#### 검증 기반 (Verification Based) ✅
- **변경 후 즉시 테스트**: 모든 변경사항은 테스트로 검증
- **실제 동작 확인**: API 변경 시 실제 호출하여 테스트
- **예상과 실제 비교**: 기대 동작과 실제 동작 일치 여부 확인

#### 컨텍스트 유지 (Context Preservation) 📝
- **작업 목록 관리**: TodoWrite 도구로 진행 상황 추적
- **중요 결정사항 문서화**: 아키텍처 결정과 근거 기록
- **세션 간 연속성**: 작업 컨텍스트를 다음 세션에 전달

### 1.2 품질 우선순위

작업 시 다음 우선순위를 따릅니다:

1. **코드 동작의 정확성** - 기능이 정확히 작동하는가?
2. **테스트 커버리지** - 변경사항이 충분히 테스트되었는가?
3. **코드 단순성** - 복잡하지 않고 이해하기 쉬운가?
4. **성능 최적화** - 필요한 성능 요구사항을 만족하는가?

## 2. 기술 스택 규칙

### 2.1 승인된 기술 스택

#### 프론트엔드 ✅
```yaml
framework: Next.js 14+ (App Router 필수)
language: TypeScript 5.4+ (strict mode 필수)
ui_library: React 18.3
styling: Tailwind CSS 3.4
state_management: Zustand
data_fetching: TanStack Query v5
3d_visualization: React Three Fiber
forms: React Hook Form + Zod
```

#### 백엔드 ✅
```yaml
framework: FastAPI (Python 3.12)
validation: Pydantic v2
async: asyncio (표준 라이브러리)
orm: SQLAlchemy 2.0+ (async)
migration: Alembic
```

#### 데이터베이스 ✅
```yaml
primary_db: PostgreSQL 15 (Supabase)
vector_search: pgvector
cache: Redis (선택적)
```

### 2.2 금지된 기술

#### ❌ 절대 사용 금지
- **jQuery**: React와 충돌 위험
- **moment.js**: 번들 크기 문제 (date-fns 사용)
- **lodash**: 네이티브 JS 메서드 우선 사용
- **CSS-in-JS 런타임**: 성능 이슈 (Tailwind 사용)
- **Class 컴포넌트**: 함수형 컴포넌트만 사용

#### ⚠️ 사전 승인 필요
- 새로운 UI 라이브러리 추가
- 번들 크기 1MB 이상 라이브러리
- 실험적(alpha/beta) 버전 패키지

### 2.3 버전 관리

```json
// package.json 버전 고정 원칙
{
  "dependencies": {
    "next": "14.2.5",          // ✅ 정확한 버전 고정
    "react": "^18.3.0",        // ✅ 마이너 업데이트 허용
    "typescript": "~5.4.0"     // ⚠️ 패치만 허용
  }
}
```

## 3. 코드 품질 기준

### 3.1 TypeScript 규칙

#### 필수 설정
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                    // ✅ 필수
    "noUncheckedIndexedAccess": true, // ✅ 필수
    "exactOptionalPropertyTypes": true, // ✅ 필수
    "noImplicitReturns": true,        // ✅ 필수
    "noUnusedLocals": true,           // ✅ 필수
    "noUnusedParameters": true        // ✅ 필수
  }
}
```

#### 타입 정의 규칙
```typescript
// ✅ 올바른 타입 정의
interface Leader {
  readonly id: string;              // ID는 변경 불가
  name: string;
  email: string;
  team?: string;                    // 선택적 속성 명시
  scores: LeadershipScores;         // 중첩 타입 사용
}

interface LeadershipScores {
  peopleConcern: number;
  productionConcern: number;
  candorLevel: number;
  lmxQuality: number;
}

// ❌ 금지사항
type BadType = any;                 // any 사용 금지
interface BadInterface {
  [key: string]: unknown;          // 인덱스 시그니처 최소화
}
```

### 3.2 네이밍 컨벤션

#### 파일 및 폴더명
```
✅ 올바른 예시:
- components/LeaderCard.tsx        (PascalCase for components)
- lib/api-client.ts               (kebab-case for utilities)
- types/leadership.ts             (lowercase for type files)
- hooks/useLeaderData.ts          (camelCase for hooks)

❌ 잘못된 예시:
- Components/leader-card.tsx      (혼재 사용)
- lib/apiClient.ts               (camelCase in lib)
- types/Leadership.ts            (PascalCase for types)
```

#### 변수 및 함수명
```typescript
// ✅ 의미 명확한 네이밍
const leaderSurveyResponses = data;
const calculateLeadershipScores = (answers: number[]) => { ... };
const isValidEmail = (email: string): boolean => { ... };

// ❌ 모호한 네이밍
const data = survey;
const calc = (arr: number[]) => { ... };
const check = (str: string) => { ... };
```

### 3.3 함수 작성 규칙

#### 함수 크기 제한
```typescript
// ✅ 적절한 함수 크기 (20줄 이하)
function calculatePeopleConcern(answers: number[]): number {
  const peopleAnswers = answers.slice(0, 8);
  const sum = peopleAnswers.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / peopleAnswers.length).toFixed(3));
}

// ❌ 너무 긴 함수 (50줄 이상)
function processEntireSurvey(data: unknown): unknown {
  // 50+ lines of mixed logic
  // 여러 책임을 가진 함수
}
```

#### 순수 함수 우선
```typescript
// ✅ 순수 함수 (side effect 없음)
function determineLeadershipStyle(
  peopleConcern: number, 
  productionConcern: number
): string {
  if (peopleConcern >= 7 && productionConcern >= 7) {
    return `팀형(${peopleConcern}, ${productionConcern})`;
  }
  // ... 기타 로직
  return `중도형(${peopleConcern}, ${productionConcern})`;
}

// ❌ 사이드 이펙트가 있는 함수
function calculateAndSaveScores(data: SurveyData): void {
  const scores = calculate(data);
  localStorage.setItem('scores', JSON.stringify(scores)); // ❌ 사이드 이펙트
  updateDatabase(scores);                                  // ❌ 사이드 이펙트
}
```

### 3.4 에러 처리

```typescript
// ✅ 명시적 에러 처리
async function fetchLeaderData(id: string): Promise<Leader | null> {
  try {
    const response = await api.get(`/leaders/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leader: ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching leader:', error);
    return null; // 명시적으로 null 반환
  }
}

// ❌ 에러 무시
async function badFetchLeaderData(id: string): Promise<Leader> {
  const response = await api.get(`/leaders/${id}`); // 에러 처리 없음
  return response.data; // 실패 시 undefined 반환 가능
}
```

## 4. Git 워크플로우

### 4.1 브랜치 전략

```bash
# 브랜치 네이밍 규칙
main                    # 프로덕션 브랜치
develop                 # 개발 통합 브랜치
feature/leader-dashboard    # 기능 개발
hotfix/survey-validation   # 긴급 수정
release/v1.0.0         # 릴리즈 준비
```

### 4.2 커밋 메시지 규칙

#### 커밋 메시지 형식
```bash
# 형식: <type>(<scope>): <description>
# 
# <body>
# 
# <footer>

# ✅ 올바른 예시
feat(dashboard): add 3D leadership grid visualization
fix(api): resolve survey response validation error
docs(readme): update installation instructions
test(leaders): add unit tests for score calculation

# 본문과 푸터는 선택사항
feat(coaching): implement AI coaching card generation

- Add OpenAI integration for personalized coaching
- Implement rule-based recommendation engine
- Add caching for generated coaching cards

Closes #123
```

#### 커밋 타입
| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 | `feat(api): add leader CRUD endpoints` |
| `fix` | 버그 수정 | `fix(ui): resolve responsive layout issue` |
| `docs` | 문서 변경 | `docs(api): update endpoint documentation` |
| `style` | 스타일 변경 | `style(components): fix eslint warnings` |
| `refactor` | 리팩토링 | `refactor(utils): simplify score calculation` |
| `test` | 테스트 추가 | `test(api): add integration tests` |
| `chore` | 빌드/도구 변경 | `chore(deps): update dependencies` |

### 4.3 PR 규칙

#### PR 제목
```bash
# ✅ 올바른 PR 제목
feat: Add 3D leadership grid visualization dashboard
fix: Resolve survey response validation errors
docs: Update API documentation for v1.0

# ❌ 잘못된 PR 제목
Update dashboard                    # 너무 모호함
Fix bugs                          # 구체적이지 않음
WIP: Working on features          # WIP는 draft로 표시
```

#### PR 설명 템플릿
```markdown
## 변경 사항
- [ ] 3D WebGL 그리드 컴포넌트 구현
- [ ] React Three Fiber 통합
- [ ] 리더십 좌표 실시간 업데이트

## 테스트
- [ ] 단위 테스트 추가됨
- [ ] 브라우저별 호환성 확인
- [ ] 성능 테스트 완료

## 스크린샷
![Dashboard Screenshot](./screenshots/dashboard.png)

## 체크리스트
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고 없음
- [ ] 모든 테스트 통과
- [ ] 문서 업데이트됨

## 관련 이슈
Closes #45
Related to #67
```

### 4.4 브랜치 보호 규칙

```yaml
# GitHub branch protection settings
main:
  required_status_checks:
    - "TypeScript 컴파일"
    - "ESLint 검사"
    - "Jest 단위 테스트"
    - "Playwright E2E 테스트"
  require_pull_request_reviews: true
  required_approving_review_count: 1
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
```

## 5. 테스트 규칙

### 5.1 테스트 피라미드

```
        /\
       /  \
      / E2E \     (10%) - Playwright
     /______\
    /        \
   / 통합 테스트 \   (20%) - API 테스트
  /____________\
 /              \
/   단위 테스트   \  (70%) - Jest + RTL
/________________\
```

### 5.2 단위 테스트 규칙

#### 테스트 파일 구조
```typescript
// src/lib/__tests__/leadership-calculator.test.ts
import { describe, it, expect } from '@jest/globals';
import { calculateLeadershipScores } from '../leadership-calculator';

describe('LeadershipCalculator', () => {
  describe('calculateLeadershipScores', () => {
    it('should calculate correct scores for valid answers', () => {
      // Given
      const answers = [7, 6, 8, 5, 9, 4, 7, 6, /* ... 31개 */];
      
      // When
      const scores = calculateLeadershipScores(answers);
      
      // Then
      expect(scores.peopleConcern).toBe(7.125);
      expect(scores.productionConcern).toBe(7.375);
      expect(scores.candorLevel).toBe(6.75);
      expect(scores.lmxQuality).toBe(7.0);
    });
    
    it('should throw error for invalid answer count', () => {
      // Given
      const invalidAnswers = [1, 2, 3]; // 31개가 아님
      
      // When & Then
      expect(() => calculateLeadershipScores(invalidAnswers))
        .toThrow('설문 응답은 정확히 31개여야 합니다');
    });
  });
});
```

#### 커버리지 목표
```json
// jest.config.js
{
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "src/lib/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

### 5.3 컴포넌트 테스트

```typescript
// src/components/__tests__/LeaderCard.test.tsx
import { render, screen } from '@testing-library/react';
import { LeaderCard } from '../LeaderCard';

describe('LeaderCard', () => {
  const mockLeader = {
    id: '1',
    name: '김리더',
    email: 'leader@test.com',
    scores: {
      peopleConcern: 7.1,
      productionConcern: 7.4,
      candorLevel: 6.8,
      lmxQuality: 7.0
    }
  };

  it('should display leader information correctly', () => {
    render(<LeaderCard leader={mockLeader} />);
    
    expect(screen.getByText('김리더')).toBeInTheDocument();
    expect(screen.getByText('leader@test.com')).toBeInTheDocument();
    expect(screen.getByText('7.1')).toBeInTheDocument(); // People Concern
  });

  it('should show leadership style badge', () => {
    render(<LeaderCard leader={mockLeader} />);
    
    expect(screen.getByText(/팀형/)).toBeInTheDocument();
  });
});
```

### 5.4 API 테스트

```python
# tests/test_api/test_leaders.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestLeadersAPI:
    def test_get_leaders_success(self):
        # Given
        # 테스트 DB에 리더 데이터 생성
        
        # When
        response = client.get("/api/v1/leaders")
        
        # Then
        assert response.status_code == 200
        data = response.json()
        assert "leaders" in data
        assert len(data["leaders"]) > 0
    
    def test_create_leader_success(self):
        # Given
        new_leader = {
            "name": "박신입",
            "email": "new@test.com",
            "team": "engineering"
        }
        
        # When
        response = client.post("/api/v1/leaders", json=new_leader)
        
        # Then
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "박신입"
        assert "id" in data
```

## 6. API 개발 규칙

### 6.1 RESTful 원칙

```python
# ✅ 올바른 API 설계
GET    /api/v1/leaders              # 리더 목록
GET    /api/v1/leaders/{id}         # 특정 리더 조회
POST   /api/v1/leaders              # 리더 생성
PUT    /api/v1/leaders/{id}         # 리더 전체 업데이트
PATCH  /api/v1/leaders/{id}         # 리더 부분 업데이트
DELETE /api/v1/leaders/{id}         # 리더 삭제

GET    /api/v1/leaders/{id}/responses    # 리더의 설문 응답들
POST   /api/v1/leaders/{id}/coaching     # 코칭 카드 생성

# ❌ 잘못된 API 설계
POST   /api/v1/getLeaders           # GET 메서드 사용해야 함
GET    /api/v1/leader-create        # POST 메서드 사용해야 함
PUT    /api/v1/updateLeader/{id}    # 동사 사용 금지
```

### 6.2 응답 형식 표준화

```python
# responses/base.py
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    errors: Optional[list[str]] = None

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int

# ✅ 성공 응답
{
  "success": true,
  "data": {
    "id": "123",
    "name": "김리더"
  },
  "message": "리더 정보를 성공적으로 조회했습니다"
}

# ✅ 에러 응답
{
  "success": false,
  "data": null,
  "message": "리더를 찾을 수 없습니다",
  "errors": ["LEADER_NOT_FOUND"]
}
```

### 6.3 Pydantic 스키마 규칙

```python
# schemas/leader.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class LeaderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    team: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)

class LeaderCreate(LeaderBase):
    """리더 생성 시 사용하는 스키마"""
    pass

class LeaderUpdate(BaseModel):
    """리더 업데이트 시 사용하는 스키마 (모든 필드 선택적)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    team: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)

class LeaderResponse(LeaderBase):
    """API 응답에서 사용하는 스키마"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # SQLAlchemy 모델과 호환
```

### 6.4 에러 처리

```python
# exceptions/handlers.py
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

async def integrity_error_handler(request: Request, exc: IntegrityError):
    """데이터베이스 무결성 에러 처리"""
    if "duplicate key" in str(exc.orig):
        return JSONResponse(
            status_code=409,
            content={
                "success": false,
                "message": "이미 존재하는 데이터입니다",
                "errors": ["DUPLICATE_ENTRY"]
            }
        )
    
    return JSONResponse(
        status_code=500,
        content={
            "success": false,
            "message": "데이터베이스 오류가 발생했습니다",
            "errors": ["DATABASE_ERROR"]
        }
    )

# main.py에서 등록
app.add_exception_handler(IntegrityError, integrity_error_handler)
```

## 7. 데이터베이스 규칙

### 7.1 마이그레이션 규칙

#### 마이그레이션 파일 네이밍
```bash
# alembic/versions/
001_2025_08_02_1000_initial_schema.py
002_2025_08_02_1130_add_coaching_cards.py
003_2025_08_03_0900_add_pulse_surveys.py
```

#### 위험한 마이그레이션 금지
```python
# ❌ 절대 금지
def upgrade():
    op.drop_table('survey_responses')           # 데이터 손실
    op.execute("TRUNCATE TABLE leaders")       # 데이터 삭제
    op.execute("DROP DATABASE production")     # 데이터베이스 삭제

# ✅ 안전한 마이그레이션
def upgrade():
    # 새 컬럼 추가 (NOT NULL이면 기본값 설정)
    op.add_column('leaders', 
        sa.Column('phone', sa.String(20), nullable=True))
    
    # 인덱스 추가
    op.create_index('idx_leaders_team', 'leaders', ['team'])
    
    # 데이터 변환 (안전한 업데이트)
    op.execute("""
        UPDATE leaders 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL
    """)
```

### 7.2 쿼리 성능 규칙

```python
# ✅ 올바른 쿼리 (N+1 문제 해결)
from sqlalchemy.orm import selectinload

async def get_leaders_with_responses(db: AsyncSession):
    result = await db.execute(
        select(Leader)
        .options(selectinload(Leader.survey_responses))
        .where(Leader.is_active == True)
    )
    return result.scalars().all()

# ❌ N+1 쿼리 문제
async def bad_get_leaders_with_responses(db: AsyncSession):
    leaders = await db.execute(select(Leader))
    for leader in leaders.scalars():
        # 각 리더마다 별도 쿼리 실행 (N+1 문제)
        responses = await db.execute(
            select(SurveyResponse)
            .where(SurveyResponse.leader_id == leader.id)
        )
```

### 7.3 데이터 검증

```python
# models/leader.py
from sqlalchemy import Column, String, DateTime, Boolean, CheckConstraint
from sqlalchemy.ext.hybrid import hybrid_property

class Leader(Base):
    __tablename__ = "leaders"
    
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    
    # 데이터베이스 레벨 제약조건
    __table_args__ = (
        CheckConstraint(
            "email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$'",
            name='valid_email'
        ),
        CheckConstraint(
            "LENGTH(TRIM(name)) > 0",
            name='name_not_empty'
        ),
    )
    
    @hybrid_property
    def full_info(self) -> str:
        """리더 전체 정보 문자열"""
        return f"{self.name} ({self.email})"
```

## 8. 성능 및 보안

### 8.1 성능 최적화

#### 프론트엔드 성능
```typescript
// ✅ 메모이제이션 활용
import { memo, useMemo, useCallback } from 'react';

const LeaderCard = memo(({ leader, onSelect }: LeaderCardProps) => {
  const leadershipStyle = useMemo(() => 
    determineLeadershipStyle(leader.scores), [leader.scores]
  );
  
  const handleClick = useCallback(() => 
    onSelect(leader.id), [leader.id, onSelect]
  );
  
  return (
    <div onClick={handleClick}>
      {/* 컴포넌트 내용 */}
    </div>
  );
});

// ✅ 지연 로딩
const CoachingDashboard = lazy(() => import('./CoachingDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CoachingDashboard />
    </Suspense>
  );
}
```

#### 백엔드 성능
```python
# ✅ 캐싱 활용
from functools import lru_cache
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

@lru_cache(maxsize=128)
def calculate_leadership_style(people: float, production: float) -> str:
    """리더십 스타일 계산 (메모리 캐시)"""
    if people >= 7 and production >= 7:
        return f"팀형({people}, {production})"
    # ... 기타 로직

async def get_dashboard_data(team: Optional[str] = None):
    """대시보드 데이터 (Redis 캐시)"""
    cache_key = f"dashboard:{team or 'all'}"
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # 데이터베이스에서 조회
    data = await fetch_dashboard_data(team)
    
    # 5분 캐시
    redis_client.setex(cache_key, 300, json.dumps(data))
    return data
```

### 8.2 보안 규칙

#### 인증 및 권한
```python
# security/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)) -> User:
    """JWT 토큰에서 현재 사용자 추출"""
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await get_user_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(required_role: str):
    """특정 역할 권한 필요"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# 사용 예시
@app.get("/admin/users")
async def get_all_users(admin: User = Depends(require_role("admin"))):
    return await fetch_all_users()
```

#### 입력 검증
```python
# ✅ 입력 데이터 검증
from pydantic import validator, Field

class SurveyResponseCreate(BaseModel):
    answers: List[int] = Field(..., min_items=31, max_items=31)
    
    @validator('answers')
    def validate_answer_range(cls, v):
        for answer in v:
            if not (1 <= answer <= 7):
                raise ValueError('모든 응답은 1-7 범위여야 합니다')
        return v

# ✅ SQL 인젝션 방지 (Parameterized Query)
async def get_leaders_by_team(db: AsyncSession, team: str):
    result = await db.execute(
        select(Leader).where(Leader.team == team)  # ✅ SQLAlchemy ORM 사용
    )
    return result.scalars().all()

# ❌ SQL 인젝션 위험
async def bad_get_leaders_by_team(db: AsyncSession, team: str):
    query = f"SELECT * FROM leaders WHERE team = '{team}'"  # ❌ 위험!
    result = await db.execute(text(query))
    return result.fetchall()
```

## 9. 문서화 규칙

### 9.1 코드 주석

```typescript
/**
 * 4차원 리더십 점수를 계산합니다.
 * 
 * @param answers - 31개의 설문 응답 (1-7 점)
 * @returns 4차원 리더십 점수 객체
 * 
 * @example
 * ```typescript
 * const answers = [7, 6, 8, 5, ...]; // 31개
 * const scores = calculateLeadershipScores(answers);
 * console.log(scores.peopleConcern); // 7.125
 * ```
 * 
 * @throws {Error} 응답이 31개가 아닌 경우
 * @throws {Error} 응답 값이 1-7 범위를 벗어난 경우
 */
function calculateLeadershipScores(answers: number[]): LeadershipScores {
  if (answers.length !== 31) {
    throw new Error('설문 응답은 정확히 31개여야 합니다');
  }
  
  // 입력 값 검증
  answers.forEach((answer, index) => {
    if (answer < 1 || answer > 7) {
      throw new Error(`${index + 1}번 응답(${answer})이 유효 범위(1-7)를 벗어났습니다`);
    }
  });
  
  // People Concern 계산 (문항 1-8)
  const peopleConcern = answers.slice(0, 8)
    .reduce((sum, answer) => sum + answer, 0) / 8;
  
  // ... 기타 계산 로직
  
  return {
    peopleConcern: Number(peopleConcern.toFixed(3)),
    productionConcern: Number(productionConcern.toFixed(3)),
    candorLevel: Number(candorLevel.toFixed(3)),
    lmxQuality: Number(lmxQuality.toFixed(3))
  };
}
```

### 9.2 README 작성

```markdown
# Grid 3.0 Leadership Mapping Platform

## 빠른 시작

### 전제 조건
- Node.js 20 LTS
- Python 3.12
- PostgreSQL 15

### 설치 및 실행
\`\`\`bash
# 프론트엔드
cd frontend
npm install
npm run dev

# 백엔드
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`

### 환경 변수
\`\`\`bash
# .env.example 복사
cp .env.example .env

# 필수 환경 변수
DATABASE_URL=postgresql://user:pass@localhost:5432/grid3
JWT_SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
\`\`\`

## 아키텍처

- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS
- **백엔드**: FastAPI + PostgreSQL + pgvector
- **배포**: Vercel + Supabase
```

## 10. 배포 및 운영

### 10.1 환경별 설정

```yaml
# .github/workflows/deploy.yml
name: Deploy Grid 3.0

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run TypeScript check
        run: npm run type-check
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run tests
        run: npm run test:ci
        
      - name: Run E2E tests
        run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 10.2 모니터링

```typescript
// lib/monitoring.ts
export class PerformanceMonitor {
  static measureApiCall<T>(
    apiName: string, 
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return apiCall()
      .then(result => {
        const duration = performance.now() - startTime;
        this.logMetric('api_call_duration', duration, { api: apiName });
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        this.logError('api_call_error', error, { api: apiName, duration });
        throw error;
      });
  }
  
  private static logMetric(name: string, value: number, tags: Record<string, string>) {
    // 메트릭 수집 (DataDog, CloudWatch 등)
    console.log(`METRIC ${name}:${value}`, tags);
  }
  
  private static logError(name: string, error: Error, context: Record<string, any>) {
    // 에러 로깅 (Sentry 등)
    console.error(`ERROR ${name}:`, error.message, context);
  }
}

// 사용 예시
const leaderData = await PerformanceMonitor.measureApiCall(
  'get_leader_data',
  () => api.getLeader(leaderId)
);
```

---

## 규칙 준수 체크리스트

개발 완료 전 다음 항목들을 확인하세요:

### 코드 품질 ✅
- [ ] TypeScript strict 모드 에러 없음
- [ ] ESLint 경고 없음
- [ ] 함수 크기 20줄 이하
- [ ] 의미 있는 변수/함수명 사용
- [ ] 주석으로 복잡한 로직 설명

### 테스트 ✅
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] 통합 테스트 추가
- [ ] E2E 테스트 시나리오 확인
- [ ] 에러 케이스 테스트

### 성능 ✅
- [ ] 불필요한 리렌더링 방지
- [ ] API 호출 최적화
- [ ] 번들 크기 확인
- [ ] 로딩 상태 처리

### 보안 ✅
- [ ] 입력 데이터 검증
- [ ] SQL 인젝션 방지
- [ ] 인증/권한 확인
- [ ] 민감 정보 로깅 금지

### 문서화 ✅
- [ ] API 문서 업데이트
- [ ] 주요 함수 JSDoc 작성
- [ ] README 업데이트
- [ ] 변경사항 CHANGELOG 기록

이 개발 규칙을 철저히 준수하여 Grid 3.0 리더십 매핑 플랫폼을 안정적이고 확장 가능하게 구축하겠소, TJ님!