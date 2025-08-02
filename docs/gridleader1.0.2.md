# Grid 3.0 핵심 기능 구현 계획 (v1.0.2 - 개정판)

> 작성일: 2025-08-02  
> 작성자: 헤파이스토스  
> 변경사항: CI/CD 최소화, UX/UI 우선, LLM 심층 의견 기능 추가

## 주요 변경사항 요약

1. **CI/CD 단계적 구축**: 최소 파이프라인만 Week 1에 구축
2. **UX/UI 우선 전략**: 디자인 시스템을 Week 3까지 확정
3. **LLM 심층 의견 기능**: Week 6에 MVP 추가
4. **데이터 검증 전진**: Week 2로 이동하여 조기 안정화

## 12주 개정 로드맵

### 🚀 Phase 1: 기반 구축 (1-3주)

#### Week 1: 프로젝트 초기화 및 최소 인프라
```
월요일-화요일: 프로젝트 구조 설정
├── Next.js 14 프로젝트 생성
├── FastAPI 프로젝트 구조화
├── Supabase 프로젝트 연결
└── 개발 환경 설정

수요일-목요일: 데이터베이스 설계
├── Supabase 스키마 생성
├── pgvector 확장 설치
├── 초기 마이그레이션 작성
└── 시드 데이터 준비

금요일: 최소 CI/CD 파이프라인 ⚡
├── ESLint + Prettier 자동화
├── Jest/Pytest 자동 실행
├── Vercel 프리뷰 배포만 설정
└── 프로덕션 배포는 수동 유지
```

**CI/CD 최소 구성 (10-15줄 YAML)**:
```yaml
name: Minimal Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install & Test
        run: |
          npm ci
          npm run lint
          npm test
      - name: Build Check
        run: npm run build
```

#### Week 2: 데이터 검증 시스템 우선 구축 🔄
```
월요일-화요일: 데이터 검증 엔진
├── 응답 값 범위 검증 (1-7)
├── 누락 데이터 처리 로직
├── 이상치 탐지 알고리즘
└── 검증 실패 시 fallback 처리

수요일-목요일: 인증 시스템
├── Supabase Auth 통합
├── JWT 토큰 관리
├── 역할 기반 접근 제어
└── 세션 관리

금요일: 핵심 API 구현
├── POST /api/webhook/google-form
├── GET /api/leaders
├── POST /api/responses/ingest
└── 에러 핸들링 미들웨어
```

#### Week 3: 디자인 시스템 확정 & 4D 계산 🎨
```
월요일-화요일: 디자인 시스템 확정
├── Figma 컴포넌트 라이브러리
├── Tailwind 디자인 토큰
├── Storybook 설정
└── 모바일 반응형 가이드

수요일-목요일: 4D 점수 계산 엔진
├── 블레이크-마우턴 계산 (X, Y축)
├── Radical Candor 점수 (Z축)
├── LMX 점수 (크기)
└── 벡터 변화량 계산

금요일: UI 스켈레톤 구현
├── 기본 레이아웃 컴포넌트
├── 네비게이션 구조
├── 로딩 상태 디자인
└── 에러 상태 디자인
```

### 🎨 Phase 2: 핵심 기능 구현 (4-6주)

#### Week 4: 3D 시각화 with UX 우선
```
월요일-화요일: React Three Fiber 설정
├── 3D 씬 초기화
├── LOD + 인스턴싱 조기 적용 ⚡
├── 카메라 컨트롤 (≤3 클릭)
└── 모바일 터치 지원

수요일-목요일: 4D 데이터 렌더링
├── 리더 포인트 생성 (X, Y, Z)
├── LMX 크기 매핑
├── 색상 코딩 시스템
└── 성능 프로파일링 (60fps 목표)

금요일: UI/UX 통합
├── 3D 캔버스 + UI 레이어
├── 모바일 하단 시트 패턴
├── 접근성 개선
└── 첫 사용성 테스트 준비
```

#### Week 5: 대시보드 고도화 & 디자인 완성
```
월요일-화요일: 대시보드 컴포넌트
├── 2D 차트 통합 (Recharts)
├── 통계 카드 애니메이션
├── 리더 리스트 테이블
└── 필터/검색 UI (SUS ≥80 목표)

수요일-목요일: 마이크로인터랙션
├── 호버 효과 정의
├── 트랜지션 규칙
├── 스켈레톤 로딩
└── 60fps 애니메이션 검증

금요일: 사용성 테스트 (5명)
├── 클릭 히트맵 분석
├── 태스크 완료 시간 측정
├── 문제점 리스트 작성
└── 개선 우선순위 결정
```

#### Week 6: AI 코칭 엔진 + LLM 심층 의견 🤖
```
월요일-화요일: 규칙 기반 코칭 엔진
├── Rule 1: 사람 ≤ 4 → 경청 챌린지
├── Rule 2: Candor ≤ 4 & 성과 ≥ 6 → 직면 스크립트
├── Rule 3: LMX ≤ 4 → 신뢰 구축
└── 코칭 카드 UI 구현

수요일-목요일: LLM 심층 의견 MVP ⭐
├── POST /api/llm-feedback 엔드포인트
├── 프롬프트 엔지니어링
├── 8초 타임아웃 + 폴백 메시지
├── 결과 캐싱 (1시간 TTL)

금요일: A/B 테스트 설정
├── 실험 그룹 분할 로직
├── 메트릭 추적 설정
├── NPS/완료율 측정 준비
└── 비용 모니터링 ($10/주 상한)
```

**LLM 프롬프트 템플릿**:
```python
prompt = f"""
You are a leadership coach analyzing Grid 3.0 assessment results.

Current Assessment:
- People Focus: {people_score}/7
- Production Focus: {production_score}/7
- Radical Candor: {candor_score}/7
- LMX Quality: {lmx_score}/7

Rules:
1. Respect the predefined coaching card: {coaching_card}
2. Cite specific answer patterns from the responses
3. Provide actionable insights in 3-4 sentences
4. Maintain encouraging but honest tone

Analyze the following response patterns and provide personalized feedback:
{response_text}
"""
```

### 🔧 Phase 3: 고급 기능 (7-9주)

#### Week 7: 실시간 협업 & UI 정교화
```
월요일-화요일: Supabase Realtime
├── WebSocket 연결 관리
├── 실시간 점수 업데이트
├── 낙관적 업데이트 UI
└── 연결 상태 표시

수요일-목요일: 협업 기능
├── 코멘트 시스템
├── @멘션 기능
├── 활동 피드
└── 변경 이력 추적

금요일: 모바일 최적화
├── 터치 제스처 개선
├── 반응형 3D 조정
├── PWA 설정
└── 오프라인 지원
```

#### Week 8: Quick Pulse & 고급 CI/CD
```
월요일-화요일: Quick Pulse 시스템
├── Candor/LMX Pulse 설문
├── 스케줄링 엔진
├── Slack 봇 통합
└── 응답 자동 처리

수요일-목요일: 고급 CI/CD 구축 🔄
├── 자동 프로덕션 배포
├── 보안 스캔 통합
├── 성능 모니터링
└── 롤백 자동화

금요일: 통합 테스트
├── E2E 시나리오
├── 부하 테스트
├── 보안 점검
└── 모니터링 대시보드
```

#### Week 9: 분석 기능 & 최적화
```
월요일-화요일: 고급 분석
├── 팀 평균/분포 분석
├── 시계열 트렌드
├── 예측 모델 (선택적)
└── 벤치마크 비교

수요일-목요일: 성능 최적화
├── React 프로파일링
├── 번들 크기 최적화
├── 3D 렌더링 개선
└── API 응답 캐싱

금요일: 리포트 생성
├── PDF 익스포트
├── 대시보드 스냅샷
├── 데이터 다운로드
└── API 문서 완성
```

### 🚀 Phase 4: 안정화 및 출시 (10-12주)

#### Week 10-11: 보안/안정성/확장성
```
Week 10: 보안 강화
├── 침투 테스트
├── OWASP Top 10 점검
├── 데이터 암호화
└── 감사 로그

Week 11: 확장성 준비
├── 마이크로서비스 검토
├── 캐싱 전략 최적화
├── CDN 설정
└── 백업/복구 테스트
```

#### Week 12: 파일럿 및 출시
```
월-화: 파일럿 준비
├── 20명 리더 온보딩
├── 교육 자료 준비
└── 지원 채널 구축

수-목: 파일럿 실행
├── 실시간 모니터링
├── 피드백 수집
└── 긴급 수정

금: KPI 측정 및 출시
├── 설문 완료율 ≥95%
├── 4D 이동거리 +2p
├── NPS > 50
└── 정식 출시 결정
```

## 리스크 관리 (개정)

| 리스크 | 확률 | 영향 | 대응 방안 |
|--------|------|------|----------|
| 디자인 변경 요구 | 높음 | 중간 | Week 3 디자인 동결, 48시간 내 개발 착수 |
| LLM 응답 지연 | 중간 | 낮음 | 8초 타임아웃, 폴백 메시지, 캐싱 |
| 3D 성능 저하 | 높음 | 높음 | Week 4 LOD/인스턴싱 조기 적용 |
| CI/CD 부재로 인한 품질 저하 | 낮음 | 중간 | 최소 파이프라인 유지, 코드 리뷰 강화 |

## 주요 의사결정 포인트 (개정)

### Week 3: 디자인 시스템 동결
- Figma → Storybook 완전 이관
- 모바일 대응 범위 결정

### Week 6: LLM 통합 수준
- Few-shot vs Fine-tune
- 비용 대비 효과 분석
- A/B 테스트 결과 기반 결정

### Week 8: CI/CD 고도화
- 자동 배포 도입 시점
- 모니터링 도구 선택

## 성공 지표 (강화)

### UX/UI 지표
- 클릭 경로 ≤ 3스텝
- SUS 점수 ≥ 80
- 태스크 완료 시간 < 2분
- UI 일관성 95% 이상

### 기술 지표
- 3D 렌더링 60 FPS
- LLM 응답 < 2초 (캐시 히트 시)
- 페이지 로드 < 2초
- Lighthouse 점수 > 90

### 비즈니스 지표
- LLM 기능 사용률 > 60%
- 코칭 카드 완료율 +15%
- 주간 재방문율 > 70%
- 파일럿 NPS > 60

## 최소 실행 가능 제품 (MVP) 정의

### 3주차 MVP
- ✅ 설문 수집 → 4D 계산
- ✅ 기본 3D 시각화
- ✅ 디자인 시스템 적용
- ✅ 최소 CI/CD (린트/테스트)

### 6주차 알파
- ✅ 완성된 3D 대시보드
- ✅ AI 코칭 카드
- ✅ LLM 심층 의견 (MVP)
- ✅ 모바일 반응형

### 9주차 베타
- ✅ 실시간 협업
- ✅ Quick Pulse
- ✅ 고급 분석
- ✅ 완전 CI/CD

## 추가 질문 답변

### Q1: 모바일 대응 범위?
**답변**: Week 3 디자인 시스템에 모바일 우선 접근. 태블릿은 선택적, 스마트폰은 필수.

### Q2: AI 코칭 샘플 데이터?
**답변**: Week 2에 20개 가상 페르소나 생성하여 Few-shot 프롬프트 테스트 진행.

### Q3: Lint & Test 템플릿?
**답변**: 위 최소 CI/CD YAML 참조. 필요시 확장 버전 제공 가능.

---

이 개정안으로 **UX/UI 우선 + 최소 CI/CD + LLM 혁신**의 균형을 달성할 수 있을 것이오, TJ님! 🔥