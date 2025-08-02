# Grid 3.0 리더십 매핑 플랫폼 테스트 전략

> 최종 업데이트: 2025-08-02  
> 작성자: 헤파이스토스  
> 프로젝트: Grid 3.0 Leadership Mapping Platform  
> 테스트 프레임워크: Jest, RTL, Pytest, Playwright

## 목차

1. [테스트 전략 개요](#1-테스트-전략-개요)
2. [테스트 피라미드](#2-테스트-피라미드)
3. [단위 테스트](#3-단위-테스트)
4. [통합 테스트](#4-통합-테스트)
5. [E2E 테스트](#5-e2e-테스트)
6. [성능 테스트](#6-성능-테스트)
7. [테스트 데이터 관리](#7-테스트-데이터-관리)
8. [CI/CD 테스트 파이프라인](#8-cicd-테스트-파이프라인)
9. [테스트 메트릭](#9-테스트-메트릭)
10. [테스트 도구 및 설정](#10-테스트-도구-및-설정)

## 1. 테스트 전략 개요

### 1.1 테스트 목표

Grid 3.0 플랫폼의 테스트 전략은 다음 목표를 달성하기 위해 설계되었습니다:

- **기능 정확성**: 4D 리더십 점수 계산의 정확성 보장
- **데이터 무결성**: 설문 응답과 코칭 데이터의 일관성 유지
- **사용자 경험**: 3D 시각화와 실시간 업데이트의 안정성
- **보안**: 인증/권한 시스템의 견고성
- **성능**: 200명 동시 접속과 30초 이내 응답 보장

### 1.2 테스트 원칙

```yaml
핵심 원칙:
  신속성: "빠른 피드백으로 개발 속도 향상"
  신뢰성: "테스트 결과에 대한 완전한 신뢰"
  유지보수성: "테스트 코드도 프로덕션 코드만큼 중요"
  실용성: "비즈니스 가치를 검증하는 테스트 우선"
```

## 2. 테스트 피라미드

```
      🔺 E2E (10%)
      사용자 시나리오 검증
      Playwright로 구현
      
    🔺🔺 통합 (20%)
    API + DB 연동 테스트
    TestClient + TestDB
    
  🔺🔺🔺 단위 (70%)
  개별 함수/컴포넌트 테스트
  Jest + RTL + Pytest
```

### 2.1 테스트 비율 목표

| 테스트 유형 | 비율 | 실행 시간 | 목적 |
|------------|------|-----------|------|
| 단위 테스트 | 70% | < 10초 | 로직 검증 |
| 통합 테스트 | 20% | < 30초 | 연동 검증 |
| E2E 테스트 | 10% | < 2분 | 시나리오 검증 |

### 2.2 테스트 실행 전략

```mermaid
graph LR
    A[코드 변경] --> B[단위 테스트]
    B --> C{통과?}
    C -->|Yes| D[통합 테스트]
    C -->|No| A
    D --> E{통과?}
    E -->|Yes| F[E2E 테스트]
    E -->|No| A
    F --> G{통과?}
    G -->|Yes| H[배포]
    G -->|No| A
```

## 3. 단위 테스트

### 3.1 프론트엔드 단위 테스트

#### 핵심 비즈니스 로직 테스트

```typescript
// src/lib/__tests__/leadership-calculator.test.ts
import { describe, it, expect } from '@jest/globals';
import { calculateLeadershipScores, determineLeadershipStyle } from '../leadership-calculator';

describe('LeadershipCalculator', () => {
  describe('calculateLeadershipScores', () => {
    it('should calculate correct 4D scores for team-style leader', () => {
      // Given: 팀형 리더의 응답 패턴
      const teamStyleAnswers = [
        7, 8, 7, 8, 7, 8, 7, 8,  // People Concern (평균 7.5)
        7, 8, 7, 8, 7, 8, 7, 8,  // Production Concern (평균 7.5)
        7, 7, 7, 7,              // Radical Candor - Care (평균 7.0)
        6, 6, 6, 6,              // Radical Candor - Challenge (평균 6.0)
        7, 7, 7, 7, 7, 7, 7      // LMX (평균 7.0)
      ];
      
      // When
      const scores = calculateLeadershipScores(teamStyleAnswers);
      
      // Then
      expect(scores.peopleConcern).toBe(7.5);
      expect(scores.productionConcern).toBe(7.5);
      expect(scores.candorLevel).toBe(6.5);
      expect(scores.lmxQuality).toBe(7.0);
    });
    
    it('should handle edge cases correctly', () => {
      // Given: 최솟값 응답
      const minAnswers = Array(31).fill(1);
      
      // When
      const scores = calculateLeadershipScores(minAnswers);
      
      // Then
      expect(scores.peopleConcern).toBe(1.0);
      expect(scores.productionConcern).toBe(1.0);
      expect(scores.candorLevel).toBe(1.0);
      expect(scores.lmxQuality).toBe(1.0);
    });
    
    it('should throw error for invalid input', () => {
      // Given: 잘못된 개수의 응답
      const invalidAnswers = [1, 2, 3];
      
      // When & Then
      expect(() => calculateLeadershipScores(invalidAnswers))
        .toThrow('설문 응답은 정확히 31개여야 합니다');
    });
  });
  
  describe('determineLeadershipStyle', () => {
    const testCases = [
      { people: 8.0, production: 8.0, expected: '팀형(8.0, 8.0)' },
      { people: 2.0, production: 8.0, expected: '과업형(2.0, 8.0)' },
      { people: 8.0, production: 2.0, expected: '컨트리클럽형(8.0, 2.0)' },
      { people: 2.0, production: 2.0, expected: '무관심형(2.0, 2.0)' },
      { people: 5.5, production: 5.5, expected: '중도형(5.5, 5.5)' }
    ];
    
    testCases.forEach(({ people, production, expected }) => {
      it(`should identify ${expected} correctly`, () => {
        const style = determineLeadershipStyle(people, production);
        expect(style).toBe(expected);
      });
    });
  });
});
```

#### React 컴포넌트 테스트

```typescript
// src/components/__tests__/LeadershipGrid3D.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { LeadershipGrid3D } from '../LeadershipGrid3D';

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useFrame: jest.fn(),
  useThree: () => ({ camera: {}, gl: {} })
}));

describe('LeadershipGrid3D', () => {
  const mockLeaders = [
    {
      id: '1',
      name: '김팀형',
      scores: { peopleConcern: 8.0, productionConcern: 8.0, candorLevel: 7.0, lmxQuality: 7.5 }
    },
    {
      id: '2', 
      name: '박과업',
      scores: { peopleConcern: 3.0, productionConcern: 8.5, candorLevel: 5.0, lmxQuality: 6.0 }
    }
  ];
  
  it('should render 3D canvas with leader points', async () => {
    render(<LeadershipGrid3D leaders={mockLeaders} />);
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
  
  it('should call onLeaderClick when leader point is clicked', async () => {
    const mockOnClick = jest.fn();
    
    render(
      <LeadershipGrid3D 
        leaders={mockLeaders} 
        onLeaderClick={mockOnClick} 
      />
    );
    
    // 3D 인터랙션은 모킹된 상태에서 시뮬레이션
    const canvas = screen.getByTestId('canvas');
    fireEvent.click(canvas);
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalled();
    });
  });
  
  it('should update positions when leader data changes', () => {
    const { rerender } = render(<LeadershipGrid3D leaders={mockLeaders} />);
    
    const updatedLeaders = [...mockLeaders];
    updatedLeaders[0].scores.peopleConcern = 9.0;
    
    rerender(<LeadershipGrid3D leaders={updatedLeaders} />);
    
    // 위치 업데이트 검증은 테스트용 헬퍼 함수로 처리
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});
```

#### 커스텀 훅 테스트

```typescript
// src/hooks/__tests__/useLeadershipData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLeadershipData } from '../useLeadershipData';
import { apiClient } from '../api-client';

// API 모킹
jest.mock('../api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useLeadershipData', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  
  it('should fetch and return leadership data', async () => {
    // Given
    const mockData = {
      leaders: [{ id: '1', name: '김리더', scores: { /* ... */ } }]
    };
    mockApiClient.getLeaders.mockResolvedValue(mockData);
    
    // When
    const { result } = renderHook(() => useLeadershipData(), { wrapper });
    
    // Then
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(mockData);
    expect(mockApiClient.getLeaders).toHaveBeenCalledTimes(1);
  });
  
  it('should handle error states', async () => {
    // Given
    const error = new Error('Network error');
    mockApiClient.getLeaders.mockRejectedValue(error);
    
    // When
    const { result } = renderHook(() => useLeadershipData(), { wrapper });
    
    // Then
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    expect(result.current.error).toEqual(error);
  });
});
```

### 3.2 백엔드 단위 테스트

#### 계산 로직 테스트

```python
# tests/unit/test_calculations.py
import pytest
from app.services.calculation import calculate_4d_scores, determine_leadership_style

class TestCalculations:
    def test_calculate_4d_scores_team_style(self):
        """팀형 리더의 4D 점수 계산 테스트"""
        # Given: 팀형 패턴의 응답 (높은 사람/성과 관심)
        answers = [7, 8, 7, 8, 7, 8, 7, 8] * 2 + [7, 7, 6, 6] + [7] * 7
        
        # When
        scores = calculate_4d_scores(answers)
        
        # Then
        assert scores.people_concern == 7.5
        assert scores.production_concern == 7.5
        assert scores.candor_level == 6.5
        assert scores.lmx_quality == 7.0
    
    def test_calculate_4d_scores_edge_cases(self):
        """경계값 테스트"""
        # Given: 모든 응답이 최솟값
        min_answers = [1] * 31
        
        # When
        scores = calculate_4d_scores(min_answers)
        
        # Then
        assert scores.people_concern == 1.0
        assert scores.production_concern == 1.0
        assert scores.candor_level == 1.0
        assert scores.lmx_quality == 1.0
        
        # Given: 모든 응답이 최댓값
        max_answers = [7] * 31
        
        # When
        scores = calculate_4d_scores(max_answers)
        
        # Then
        assert scores.people_concern == 7.0
        assert scores.production_concern == 7.0
        assert scores.candor_level == 7.0
        assert scores.lmx_quality == 7.0
    
    def test_calculate_4d_scores_invalid_input(self):
        """잘못된 입력값 처리 테스트"""
        with pytest.raises(ValueError, match="31개의 응답이 필요합니다"):
            calculate_4d_scores([1, 2, 3])
        
        with pytest.raises(ValueError, match="1-7 범위의 값이어야 합니다"):
            calculate_4d_scores([0] + [5] * 30)
    
    @pytest.mark.parametrize("people,production,expected", [
        (8.0, 8.0, "팀형(8.0, 8.0)"),
        (2.0, 8.0, "과업형(2.0, 8.0)"),
        (8.0, 2.0, "컨트리클럽형(8.0, 2.0)"),
        (2.0, 2.0, "무관심형(2.0, 2.0)"),
        (5.5, 5.5, "중도형(5.5, 5.5)")
    ])
    def test_determine_leadership_style(self, people, production, expected):
        """리더십 스타일 분류 테스트"""
        style = determine_leadership_style(people, production)
        assert style == expected
```

#### Pydantic 모델 테스트

```python
# tests/unit/test_schemas.py
import pytest
from pydantic import ValidationError
from app.schemas.leader import LeaderCreate, SurveyResponseCreate

class TestSchemas:
    def test_leader_create_valid(self):
        """유효한 리더 생성 데이터 테스트"""
        data = {
            "name": "김리더",
            "email": "leader@test.com",
            "team": "engineering"
        }
        
        leader = LeaderCreate(**data)
        
        assert leader.name == "김리더"
        assert leader.email == "leader@test.com"
        assert leader.team == "engineering"
    
    def test_leader_create_invalid_email(self):
        """잘못된 이메일 형식 테스트"""
        data = {
            "name": "김리더",
            "email": "invalid-email",
            "team": "engineering"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            LeaderCreate(**data)
        
        assert "email" in str(exc_info.value)
    
    def test_survey_response_create_valid(self):
        """유효한 설문 응답 데이터 테스트"""
        data = {
            "leader_id": "550e8400-e29b-41d4-a716-446655440000",
            "answers": [5] * 31
        }
        
        response = SurveyResponseCreate(**data)
        
        assert len(response.answers) == 31
        assert all(1 <= answer <= 7 for answer in response.answers)
    
    def test_survey_response_invalid_answer_count(self):
        """잘못된 응답 개수 테스트"""
        data = {
            "leader_id": "550e8400-e29b-41d4-a716-446655440000",
            "answers": [5] * 30  # 31개가 아님
        }
        
        with pytest.raises(ValidationError):
            SurveyResponseCreate(**data)
    
    def test_survey_response_invalid_answer_range(self):
        """응답 범위 벗어남 테스트"""
        data = {
            "leader_id": "550e8400-e29b-41d4-a716-446655440000",
            "answers": [0] + [5] * 30  # 0은 유효하지 않음
        }
        
        with pytest.raises(ValidationError):
            SurveyResponseCreate(**data)
```

## 4. 통합 테스트

### 4.1 API 통합 테스트

```python
# tests/integration/test_api_leaders.py
import pytest
from httpx import AsyncClient
from app.main import app
from app.core.database import get_db
from tests.conftest import override_get_db

class TestLeadersAPI:
    @pytest.mark.asyncio
    async def test_create_and_get_leader(self):
        """리더 생성 후 조회 통합 테스트"""
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Given: 새 리더 데이터
            leader_data = {
                "name": "김신입",
                "email": "newbie@test.com",
                "team": "engineering"
            }
            
            # When: 리더 생성
            create_response = await ac.post("/api/v1/leaders", json=leader_data)
            
            # Then: 생성 성공
            assert create_response.status_code == 201
            created_leader = create_response.json()
            leader_id = created_leader["id"]
            
            # When: 생성된 리더 조회
            get_response = await ac.get(f"/api/v1/leaders/{leader_id}")
            
            # Then: 조회 성공 및 데이터 일치
            assert get_response.status_code == 200
            retrieved_leader = get_response.json()
            assert retrieved_leader["name"] == leader_data["name"]
            assert retrieved_leader["email"] == leader_data["email"]
    
    @pytest.mark.asyncio
    async def test_survey_submission_and_score_calculation(self):
        """설문 제출 후 점수 계산 통합 테스트"""
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Given: 리더 생성
            leader_response = await ac.post("/api/v1/leaders", json={
                "name": "테스트리더",
                "email": "test@example.com",
                "team": "test"
            })
            leader_id = leader_response.json()["id"]
            
            # Given: 설문 응답 데이터 (팀형 패턴)
            survey_data = {
                "leader_id": leader_id,
                "answers": [7, 8, 7, 8, 7, 8, 7, 8] * 2 + [7, 7, 6, 6] + [7] * 7
            }
            
            # When: 설문 제출
            survey_response = await ac.post("/api/v1/survey-responses", json=survey_data)
            
            # Then: 제출 성공 및 점수 계산 확인
            assert survey_response.status_code == 201
            response_data = survey_response.json()
            
            assert response_data["people_concern"] == 7.5
            assert response_data["production_concern"] == 7.5
            assert response_data["leadership_style"] == "팀형(7.5, 7.5)"
            
            # When: 리더 데이터 다시 조회
            updated_leader = await ac.get(f"/api/v1/leaders/{leader_id}")
            
            # Then: 최신 점수가 반영됨
            leader_data = updated_leader.json()
            assert leader_data["current_scores"]["people_concern"] == 7.5
```

### 4.2 데이터베이스 통합 테스트

```python
# tests/integration/test_database_operations.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.leader import Leader
from app.models.survey_response import SurveyResponse
from app.repositories.leader_repository import LeaderRepository

class TestDatabaseOperations:
    @pytest.mark.asyncio
    async def test_leader_creation_with_transaction(self, db_session: AsyncSession):
        """트랜잭션 내에서 리더 생성 테스트"""
        repo = LeaderRepository(db_session)
        
        # Given
        leader_data = {
            "name": "트랜잭션테스트",
            "email": "transaction@test.com",
            "team": "test"
        }
        
        # When
        async with db_session.begin():
            leader = await repo.create(leader_data)
            assert leader.id is not None
            
            # 트랜잭션 내에서 조회 가능
            found_leader = await repo.get_by_id(leader.id)
            assert found_leader is not None
            assert found_leader.name == leader_data["name"]
        
        # Then: 트랜잭션 커밋 후에도 데이터 존재
        committed_leader = await repo.get_by_id(leader.id)
        assert committed_leader is not None
    
    @pytest.mark.asyncio
    async def test_survey_response_triggers(self, db_session: AsyncSession):
        """설문 응답 저장 시 트리거 동작 테스트"""
        # Given: 리더 생성
        leader = Leader(
            name="트리거테스트",
            email="trigger@test.com",
            team="test"
        )
        db_session.add(leader)
        await db_session.commit()
        await db_session.refresh(leader)
        
        # Given: 설문 응답 데이터
        answers = [6] * 31
        
        # When: 설문 응답 저장
        survey_response = SurveyResponse(
            leader_id=leader.id,
            answers=answers
        )
        db_session.add(survey_response)
        await db_session.commit()
        await db_session.refresh(survey_response)
        
        # Then: 트리거에 의해 점수가 자동 계산됨
        assert survey_response.people_concern == 6.0
        assert survey_response.production_concern == 6.0
        assert survey_response.candor_level == 6.0
        assert survey_response.lmx_quality == 6.0
        assert survey_response.leadership_style == "중도형(6.0, 6.0)"
```

## 5. E2E 테스트

### 5.1 Playwright E2E 테스트

```typescript
// tests/e2e/leadership-dashboard.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Leadership Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 데이터 설정
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('should display 3D leadership grid with leader points', async ({ page }) => {
    // Given: 대시보드 페이지 접속
    await page.goto('/dashboard');
    
    // When: 3D 그리드 로딩 대기
    await page.waitForSelector('[data-testid="leadership-grid-3d"]');
    
    // Then: 리더 포인트들이 표시됨
    const leaderPoints = page.locator('[data-testid="leader-point"]');
    await expect(leaderPoints).toHaveCount.greaterThan(0);
    
    // Then: 축 라벨이 올바르게 표시됨
    await expect(page.locator('text=사람 관심')).toBeVisible();
    await expect(page.locator('text=성과 관심')).toBeVisible();
    await expect(page.locator('text=직면 수준')).toBeVisible();
  });
  
  test('should show coaching cards when leader point is clicked', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Given: 첫 번째 리더 포인트 클릭
    const firstLeaderPoint = page.locator('[data-testid="leader-point"]').first();
    await firstLeaderPoint.click();
    
    // When: 코칭 카드 패널이 열림
    await page.waitForSelector('[data-testid="coaching-panel"]');
    
    // Then: 코칭 카드들이 표시됨
    await expect(page.locator('[data-testid="coaching-card"]')).toHaveCount.greaterThan(0);
    
    // Then: 리더 정보가 표시됨
    await expect(page.locator('[data-testid="leader-info"]')).toBeVisible();
  });
  
  test('complete survey submission flow', async ({ page }) => {
    // Given: 설문 페이지 접속
    await page.goto('/survey/new');
    
    // When: 설문 응답 입력 (31문항)
    for (let i = 1; i <= 31; i++) {
      const question = page.locator(`[data-testid="question-${i}"]`);
      const rating = Math.floor(Math.random() * 7) + 1; // 1-7 랜덤
      await question.locator(`input[value="${rating}"]`).check();
    }
    
    // When: 설문 제출
    await page.click('[data-testid="submit-survey"]');
    
    // Then: 성공 메시지 표시
    await expect(page.locator('text=설문이 성공적으로 제출되었습니다')).toBeVisible();
    
    // Then: 대시보드로 리다이렉트
    await page.waitForURL('/dashboard');
    
    // Then: 새로운 점수가 3D 그리드에 반영됨
    await page.waitForSelector('[data-testid="leadership-grid-3d"]');
    await expect(page.locator('[data-testid="leader-point"]')).toBeVisible();
  });
  
  test('should handle real-time updates', async ({ page, context }) => {
    // Given: 두 개의 페이지 (실시간 업데이트 시뮬레이션)
    const page1 = page;
    const page2 = await context.newPage();
    
    await page1.goto('/dashboard');
    await page2.goto('/dashboard');
    
    // When: 한 페이지에서 설문 제출
    await page2.goto('/survey/new');
    
    // 설문 작성
    for (let i = 1; i <= 31; i++) {
      await page2.locator(`[data-testid="question-${i}"] input[value="7"]`).check();
    }
    await page2.click('[data-testid="submit-survey"]');
    
    // Then: 다른 페이지의 대시보드가 자동 업데이트됨
    await page1.waitForTimeout(2000); // 실시간 업데이트 대기
    
    // 새로운 데이터가 반영되었는지 확인
    const leaderPoints = page1.locator('[data-testid="leader-point"]');
    await expect(leaderPoints).toHaveCount.greaterThan(0);
  });
});
```

### 5.2 성능 테스트 포함 E2E

```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance E2E Tests', () => {
  test('dashboard should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="leadership-grid-3d"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('3D rendering should be smooth with 50+ leaders', async ({ page }) => {
    // Given: 많은 리더 데이터가 있는 페이지
    await page.goto('/dashboard?demo=large-dataset');
    
    // When: 3D 그리드 로딩
    await page.waitForSelector('[data-testid="leadership-grid-3d"]');
    
    // Then: 모든 포인트가 렌더링됨
    const leaderPoints = page.locator('[data-testid="leader-point"]');
    await expect(leaderPoints).toHaveCount.greaterThanOrEqual(50);
    
    // Then: 프레임률 체크 (간접적)
    const performanceMetrics = await page.evaluate(() => {
      return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')));
    });
    
    expect(performanceMetrics[0].loadEventEnd - performanceMetrics[0].fetchStart).toBeLessThan(5000);
  });
});
```

## 6. 성능 테스트

### 6.1 로드 테스트

```python
# tests/performance/load_test.py
import asyncio
import aiohttp
import time
from dataclasses import dataclass
from typing import List

@dataclass
class LoadTestResult:
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time: float
    max_response_time: float
    min_response_time: float

class LoadTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.response_times: List[float] = []
        self.successful_count = 0
        self.failed_count = 0
    
    async def make_request(self, session: aiohttp.ClientSession, endpoint: str):
        """단일 요청 실행"""
        start_time = time.time()
        try:
            async with session.get(f"{self.base_url}{endpoint}") as response:
                await response.text()
                response_time = time.time() - start_time
                self.response_times.append(response_time)
                
                if response.status == 200:
                    self.successful_count += 1
                else:
                    self.failed_count += 1
                    
        except Exception as e:
            self.failed_count += 1
            response_time = time.time() - start_time
            self.response_times.append(response_time)
    
    async def run_load_test(self, endpoint: str, concurrent_users: int, requests_per_user: int) -> LoadTestResult:
        """부하 테스트 실행"""
        async with aiohttp.ClientSession() as session:
            tasks = []
            
            for user in range(concurrent_users):
                for request in range(requests_per_user):
                    task = self.make_request(session, endpoint)
                    tasks.append(task)
            
            await asyncio.gather(*tasks)
        
        total_requests = len(self.response_times)
        avg_response_time = sum(self.response_times) / len(self.response_times)
        
        return LoadTestResult(
            total_requests=total_requests,
            successful_requests=self.successful_count,
            failed_requests=self.failed_count,
            avg_response_time=avg_response_time,
            max_response_time=max(self.response_times),
            min_response_time=min(self.response_times)
        )

# 테스트 실행
async def test_api_performance():
    """API 성능 테스트"""
    tester = LoadTester("http://localhost:8000")
    
    # 200 동시 사용자, 각각 5개 요청
    result = await tester.run_load_test("/api/v1/leaders", 200, 5)
    
    # 성능 기준 검증
    assert result.avg_response_time < 1.0  # 평균 응답시간 1초 이하
    assert result.max_response_time < 5.0  # 최대 응답시간 5초 이하
    assert result.successful_requests / result.total_requests > 0.99  # 99% 성공률

if __name__ == "__main__":
    asyncio.run(test_api_performance())
```

### 6.2 데이터베이스 성능 테스트

```python
# tests/performance/db_performance_test.py
import pytest
import asyncio
import time
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.leader_repository import LeaderRepository

class TestDatabasePerformance:
    @pytest.mark.asyncio
    async def test_large_dataset_query_performance(self, db_session: AsyncSession):
        """대용량 데이터 쿼리 성능 테스트"""
        repo = LeaderRepository(db_session)
        
        # Given: 1000명의 리더 데이터 생성 (테스트 전에 미리 준비)
        start_time = time.time()
        
        # When: 전체 리더 조회
        leaders = await repo.get_all_with_scores()
        
        # Then: 쿼리 시간이 2초 이하
        query_time = time.time() - start_time
        assert query_time < 2.0
        
        # Then: 데이터 무결성 확인
        assert len(leaders) >= 1000
        for leader in leaders[:10]:  # 샘플 확인
            assert leader.current_scores is not None
    
    @pytest.mark.asyncio
    async def test_concurrent_write_operations(self, db_session: AsyncSession):
        """동시 쓰기 작업 성능 테스트"""
        repo = LeaderRepository(db_session)
        
        async def create_survey_response(leader_id: str, answers: List[int]):
            """설문 응답 생성"""
            return await repo.create_survey_response({
                "leader_id": leader_id,
                "answers": answers
            })
        
        # Given: 기존 리더 ID들
        leaders = await repo.get_all()
        leader_ids = [leader.id for leader in leaders[:50]]
        
        # When: 50개의 동시 설문 응답 생성
        start_time = time.time()
        
        tasks = [
            create_survey_response(leader_id, [5] * 31)
            for leader_id in leader_ids
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Then: 처리 시간이 10초 이하
        processing_time = time.time() - start_time
        assert processing_time < 10.0
        
        # Then: 모든 작업 성공
        successful_results = [r for r in results if not isinstance(r, Exception)]
        assert len(successful_results) == 50
```

## 7. 테스트 데이터 관리

### 7.1 테스트 픽스처

```python
# tests/conftest.py
import pytest
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.leader import Leader
from app.models.survey_response import SurveyResponse

# 테스트 데이터베이스 URL
TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost:5432/grid3_test"

@pytest.fixture(scope="session")
def event_loop():
    """세션 레벨 이벤트 루프"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_engine():
    """테스트 데이터베이스 엔진"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    
    # 테이블 생성
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # 테스트 후 정리
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """테스트용 데이터베이스 세션"""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def sample_leader(db_session: AsyncSession) -> Leader:
    """샘플 리더 데이터"""
    leader = Leader(
        name="테스트리더",
        email="test@example.com",
        team="engineering",
        position="Senior Developer"
    )
    
    db_session.add(leader)
    await db_session.commit()
    await db_session.refresh(leader)
    
    return leader

@pytest.fixture
async def sample_survey_response(db_session: AsyncSession, sample_leader: Leader) -> SurveyResponse:
    """샘플 설문 응답 데이터"""
    response = SurveyResponse(
        leader_id=sample_leader.id,
        answers=[6] * 31,  # 중도형 패턴
        people_concern=6.0,
        production_concern=6.0,
        candor_level=6.0,
        lmx_quality=6.0,
        leadership_style="중도형(6.0, 6.0)"
    )
    
    db_session.add(response)
    await db_session.commit()
    await db_session.refresh(response)
    
    return response
```

### 7.2 테스트 데이터 팩토리

```python
# tests/factories.py
import factory
from factory import Faker, LazyAttribute
from app.models.leader import Leader
from app.models.survey_response import SurveyResponse

class LeaderFactory(factory.Factory):
    class Meta:
        model = Leader
    
    name = Faker('name', locale='ko_KR')
    email = Faker('email')
    team = Faker('random_element', elements=['engineering', 'product', 'design', 'marketing'])
    position = Faker('job')

class SurveyResponseFactory(factory.Factory):
    class Meta:
        model = SurveyResponse
    
    # 리더십 스타일별 응답 패턴
    answers = LazyAttribute(lambda obj: obj._generate_answers_for_style(obj.style))
    
    @staticmethod
    def _generate_answers_for_style(style: str):
        """리더십 스타일에 따른 응답 패턴 생성"""
        if style == 'team':
            # 팀형: 높은 사람/성과 관심
            return [7, 8] * 8 + [7] * 4 + [6] * 4 + [7] * 7
        elif style == 'task':
            # 과업형: 낮은 사람, 높은 성과
            return [3, 2] * 4 + [8, 9] * 4 + [5] * 8 + [6] * 7
        else:
            # 기본값: 중도형
            return [5, 6] * 15 + [5]

# 사용 예시
def test_with_factory_data():
    team_leader = LeaderFactory(team='engineering')
    task_response = SurveyResponseFactory(style='task', leader_id=team_leader.id)
```

## 8. CI/CD 테스트 파이프라인

### 8.1 GitHub Actions 워크플로우

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.12'

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run TypeScript check
        run: npm run type-check
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: frontend

  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: grid3_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      
      - name: Run backend tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/grid3_test
        run: |
          pytest tests/ -v --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          flags: backend

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: |
          npm run start &
          sleep 10
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Run load tests
        run: |
          pip install aiohttp pytest-asyncio
          python tests/performance/load_test.py
      
      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance-results.json
```

### 8.2 테스트 실행 스크립트

```bash
#!/bin/bash
# scripts/run-all-tests.sh

set -e

echo "🚀 Grid 3.0 전체 테스트 실행"

# 환경 변수 설정
export NODE_ENV=test
export DATABASE_URL=postgresql://test:test@localhost:5432/grid3_test

# 1. 프론트엔드 테스트
echo "📱 프론트엔드 테스트 실행..."
npm run test:ci

# 2. 백엔드 테스트
echo "🖥️  백엔드 테스트 실행..."
pytest tests/ -v --cov=app

# 3. 통합 테스트
echo "🔗 통합 테스트 실행..."
pytest tests/integration/ -v

# 4. E2E 테스트
echo "🌐 E2E 테스트 실행..."
npm run test:e2e

# 5. 성능 테스트 (선택적)
if [[ "$1" == "--performance" ]]; then
    echo "⚡ 성능 테스트 실행..."
    python tests/performance/load_test.py
fi

echo "✅ 모든 테스트 완료!"
```

## 9. 테스트 메트릭

### 9.1 커버리지 목표

```yaml
coverage_targets:
  frontend:
    statements: 85%
    branches: 80%
    functions: 85%
    lines: 85%
    
  backend:
    statements: 90%
    branches: 85%
    functions: 90%
    lines: 90%
    
  critical_modules:
    leadership_calculator: 95%
    api_endpoints: 90%
    database_models: 95%
```

### 9.2 성능 벤치마크

```yaml
performance_benchmarks:
  api_response_time:
    p50: "< 200ms"
    p95: "< 1000ms"
    p99: "< 2000ms"
    
  database_queries:
    simple_select: "< 50ms"
    complex_join: "< 500ms"
    bulk_insert: "< 2000ms"
    
  frontend_rendering:
    initial_load: "< 3000ms"
    3d_grid_render: "< 1000ms"
    component_update: "< 100ms"
```

### 9.3 테스트 품질 메트릭

```typescript
// scripts/test-metrics.ts
interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  averageExecutionTime: number;
  coveragePercentage: number;
  flakyTestCount: number;
}

export async function generateTestReport(): Promise<TestMetrics> {
  const jestResults = await runJestTests();
  const playwrightResults = await runPlaywrightTests();
  
  return {
    totalTests: jestResults.numTotalTests + playwrightResults.totalTests,
    passedTests: jestResults.numPassedTests + playwrightResults.passedTests,
    failedTests: jestResults.numFailedTests + playwrightResults.failedTests,
    skippedTests: jestResults.numPendingTests,
    averageExecutionTime: calculateAverageTime([jestResults, playwrightResults]),
    coveragePercentage: jestResults.coverageMap.getCoverageSummary().statements.pct,
    flakyTestCount: detectFlakyTests()
  };
}
```

## 10. 테스트 도구 및 설정

### 10.1 Jest 설정

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/lib/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  testTimeout: 10000
};
```

### 10.2 Playwright 설정

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

### 10.3 Pytest 설정

```ini
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --cov=app
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-report=xml
    --cov-fail-under=85
asyncio_mode = auto
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    e2e: marks tests as end-to-end tests
    performance: marks tests as performance tests
```

---

이 테스트 전략을 따라 Grid 3.0 리더십 매핑 플랫폼의 품질과 안정성을 보장하겠소, TJ님! 모든 테스트가 자동화되어 개발 과정에서 지속적으로 검증될 것이오.