# 에센스 테스트 상세 설계서

> Version: 1.0.0
> 작성일: 2025-08-02
> 프로젝트: AI Leadership 4Dx - 에센스 테스트 모듈

## 1. 개요

### 1.1 배경
기존 4차원 리더십 평가(People/Production Concern, Candor, LMX)는 리더의 '행동적 측면'을 잘 포착하지만, 리더의 '내면적 자질'과 '잠재력'을 충분히 측정하지 못합니다. 에센스 테스트는 이러한 갭을 메우기 위한 보완적 진단 도구입니다.

### 1.2 목적
- 리더의 본질적 자질 측정
- 장기적 리더십 잠재력 예측
- 개인별 맞춤형 성장 경로 제시
- 팀 구성 최적화를 위한 데이터 제공

## 2. 에센스 5차원 상세 정의

### 2.1 Authenticity (진정성) - "나다움의 힘"
**정의**: 자신의 가치관과 행동이 일치하며, 진실된 모습을 드러낼 수 있는 능력

**하위 요소**:
- Self-Awareness (자기 인식): 자신의 강점, 약점, 가치관 이해
- Consistency (일관성): 말과 행동의 일치
- Vulnerability (취약성 수용): 실수와 한계 인정

**측정 지표**:
```typescript
interface AuthenticityMetrics {
  selfAwarenessScore: number; // 0-10
  consistencyScore: number; // 0-10
  vulnerabilityScore: number; // 0-10
  overallAuthenticity: number; // 가중평균
}
```

### 2.2 Resilience (회복탄력성) - "다시 일어서는 힘"
**정의**: 역경과 스트레스 상황에서 빠르게 회복하고 성장하는 능력

**하위 요소**:
- Emotional Regulation (정서 조절): 감정 관리 능력
- Adaptability (적응력): 변화 대응 능력
- Optimism (긍정성): 희망적 관점 유지

**측정 지표**:
```typescript
interface ResilienceMetrics {
  emotionalRegulationScore: number;
  adaptabilityScore: number;
  optimismScore: number;
  stressRecoveryTime: number; // 일 단위
}
```

### 2.3 Empathy (공감력) - "연결의 힘"
**정의**: 타인의 감정과 관점을 이해하고 적절히 반응하는 능력

**하위 요소**:
- Perspective Taking (관점 채택): 타인 입장 이해
- Emotional Intelligence (감정 지능): 감정 인식과 반응
- Inclusive Behavior (포용적 행동): 다양성 수용

### 2.4 Vision (비전력) - "미래를 그리는 힘"
**정의**: 명확한 미래상을 제시하고 타인을 동기부여하는 능력

**하위 요소**:
- Strategic Thinking (전략적 사고): 장기적 관점
- Inspiration (영감 전달): 비전 공유 능력
- Innovation (혁신성): 새로운 가능성 탐색

### 2.5 Growth Mindset (성장 마인드셋) - "진화하는 힘"
**정의**: 지속적인 학습과 개선을 추구하는 태도

**하위 요소**:
- Learning Orientation (학습 지향): 새로운 지식 추구
- Feedback Receptivity (피드백 수용): 건설적 비판 활용
- Experimentation (실험 정신): 시도와 실패 수용

## 3. 설문 설계

### 3.1 문항 구성
- 총 50문항 (각 차원당 10문항)
- 소요 시간: 15-20분
- 문항 유형 믹스:
  - 시나리오 기반 (40%)
  - 자기 평가 (30%)
  - 행동 빈도 (30%)

### 3.2 샘플 문항

#### Authenticity 시나리오 문항
```json
{
  "id": "AUTH_001",
  "dimension": "authenticity",
  "subdimension": "vulnerability",
  "type": "scenario",
  "content": "팀 회의에서 당신이 잘 모르는 기술적 내용이 논의되고 있습니다. 팀원들은 당신이 전문가라고 생각하고 있습니다.",
  "options": [
    {
      "id": "a",
      "text": "아는 척하며 일반적인 의견을 제시한다",
      "score": 1,
      "trait": "facade"
    },
    {
      "id": "b",
      "text": "조용히 듣고 있다가 나중에 따로 알아본다",
      "score": 2,
      "trait": "avoidance"
    },
    {
      "id": "c",
      "text": "솔직히 잘 모른다고 말하고 설명을 요청한다",
      "score": 5,
      "trait": "vulnerability"
    },
    {
      "id": "d",
      "text": "관련된 다른 주제로 대화를 전환한다",
      "score": 1,
      "trait": "deflection"
    }
  ]
}
```

#### Resilience 자기평가 문항
```json
{
  "id": "RES_005",
  "dimension": "resilience",
  "subdimension": "emotional_regulation",
  "type": "self_assessment",
  "content": "극도로 스트레스받는 상황에서 나는:",
  "scale": "frequency",
  "options": [
    {
      "id": "1",
      "text": "감정에 압도되어 제대로 일하기 어렵다",
      "score": 1
    },
    {
      "id": "2",
      "text": "잠시 힘들어하지만 곧 집중력을 회복한다",
      "score": 3
    },
    {
      "id": "3",
      "text": "감정을 인식하고 적절한 대처 방법을 찾는다",
      "score": 4
    },
    {
      "id": "4",
      "text": "평정심을 유지하며 오히려 더 명확하게 사고한다",
      "score": 5
    }
  ]
}
```

#### Growth Mindset 행동빈도 문항
```json
{
  "id": "GRO_008",
  "dimension": "growth_mindset",
  "subdimension": "experimentation",
  "type": "behavior_frequency",
  "content": "지난 한 달 동안, 실패 위험이 있지만 배울 수 있는 새로운 시도를 몇 번이나 했습니까?",
  "options": [
    {"text": "0번", "score": 1},
    {"text": "1-2번", "score": 2},
    {"text": "3-4번", "score": 3},
    {"text": "5-6번", "score": 4},
    {"text": "7번 이상", "score": 5}
  ]
}
```

## 4. 채점 및 분석 알고리즘

### 4.1 기본 채점 방식
```python
def calculate_essence_score(responses: List[Response]) -> EssenceScore:
    # 차원별 점수 계산
    dimension_scores = {}
    for dimension in DIMENSIONS:
        dimension_responses = [r for r in responses if r.dimension == dimension]
        raw_score = sum(r.score for r in dimension_responses)
        normalized_score = (raw_score / (len(dimension_responses) * 5)) * 10
        dimension_scores[dimension] = normalized_score

    # 전체 에센스 점수 (가중평균)
    weights = {
        'authenticity': 0.25,
        'resilience': 0.20,
        'empathy': 0.20,
        'vision': 0.20,
        'growth_mindset': 0.15
    }

    overall_score = sum(
        dimension_scores[d] * weights[d]
        for d in DIMENSIONS
    )

    return EssenceScore(
        dimensions=dimension_scores,
        overall=overall_score,
        timestamp=datetime.now()
    )
```

### 4.2 고급 분석
1. **일관성 검증**: 유사 문항 간 응답 일관성 체크
2. **사회적 바람직성 보정**: 극단적으로 긍정적인 응답 패턴 감지
3. **발달 단계 매핑**: Kegan의 성인 발달 이론 기반 수준 분류

## 5. 결과 리포트

### 5.1 개인 리포트 구성
1. **에센스 프로필 요약** (1페이지)
   - 5각형 레이더 차트
   - 전체 에센스 점수
   - 핵심 강점과 개발 영역

2. **차원별 상세 분석** (5페이지)
   - 각 차원 점수와 백분위
   - 하위 요소별 분석
   - 구체적 행동 예시

3. **성장 로드맵** (2페이지)
   - 3개월 단기 개발 계획
   - 1년 장기 성장 목표
   - 추천 학습 리소스

4. **팀 시너지 분석** (1페이지)
   - 팀 내 에센스 분포
   - 보완 관계 매트릭스
   - 협업 최적화 제안

### 5.2 시각화 예시
```typescript
interface EssenceVisualization {
  // 개인 에센스 휠
  personalWheel: {
    type: 'radar';
    dimensions: string[];
    scores: number[];
    benchmarks: {
      industry: number[];
      role: number[];
      team: number[];
    };
  };

  // 성장 궤적
  growthTrajectory: {
    type: 'line';
    timePoints: Date[];
    dimensionScores: Record<string, number[]>;
  };

  // 팀 에센스 맵
  teamEssenceMap: {
    type: 'scatter3d';
    members: {
      id: string;
      name: string;
      position: [number, number, number]; // auth, resil, empathy
      size: number; // vision
      color: number; // growth mindset
    }[];
  };
}
```

## 6. 구현 로드맵

### Phase 1: MVP (2주)
- [ ] 핵심 5차원 설문 개발 (각 5문항)
- [ ] 기본 채점 알고리즘
- [ ] 간단한 결과 화면
- [ ] API 엔드포인트

### Phase 2: 고도화 (3주)
- [ ] 전체 50문항 개발
- [ ] 고급 분석 알고리즘
- [ ] 3D 시각화
- [ ] PDF 리포트 생성

### Phase 3: 통합 (2주)
- [ ] 기존 4D 시스템과 통합
- [ ] 통합 대시보드
- [ ] 팀 분석 기능
- [ ] AI 코칭 연동

## 7. 기술 사양

### 7.1 데이터 모델
```sql
-- 에센스 테스트 세션
CREATE TABLE essence_test_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    version VARCHAR(10),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20)
);

-- 에센스 테스트 응답
CREATE TABLE essence_responses (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES essence_test_sessions(id),
    question_id VARCHAR(20),
    response_value TEXT,
    score INTEGER,
    responded_at TIMESTAMP
);

-- 에센스 점수
CREATE TABLE essence_scores (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES essence_test_sessions(id),
    authenticity_score DECIMAL(3,1),
    resilience_score DECIMAL(3,1),
    empathy_score DECIMAL(3,1),
    vision_score DECIMAL(3,1),
    growth_mindset_score DECIMAL(3,1),
    overall_score DECIMAL(3,1),
    calculated_at TIMESTAMP
);
```

### 7.2 API 엔드포인트
```typescript
// 테스트 시작
POST /api/essence-test/start
Response: { sessionId, questions[] }

// 응답 제출
POST /api/essence-test/respond
Body: { sessionId, questionId, response }

// 결과 조회
GET /api/essence-test/results/{sessionId}
Response: { scores, analysis, recommendations }

// 팀 분석
GET /api/essence-test/team-analysis/{teamId}
Response: { teamProfile, synergyMatrix, gaps }
```

## 8. 성공 지표

### 8.1 사용자 지표
- 테스트 완료율 > 85%
- 재테스트율 > 60% (3개월 후)
- 사용자 만족도 > 4.2/5

### 8.2 비즈니스 지표
- 에센스 점수와 성과 상관관계 > 0.6
- 코칭 권고 실행률 > 70%
- 팀 성과 개선율 > 15%

---

*이 문서는 AI Leadership 4Dx의 에센스 테스트 모듈 설계서입니다.*
*다음 단계: 프로토타입 개발 및 파일럿 테스트*
