# Grid 3.0 리더십 매핑 플랫폼

![Grid 3.0 Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=Grid+3.0)

> **4차원 리더십 지표를 실시간으로 시각화하고 AI 기반 코칭을 제공하는 웹 플랫폼**

Grid 3.0은 빠르게 성장하는 스타트업이 리더십 갭을 실시간으로 파악하고 코칭할 수 있도록 설계된 혁신적인 플랫폼입니다. **Managerial Grid**, **Radical Candor**, **LMX(리더-구성원 교환)** 세 축을 단일 대시보드에 통합하여 행동 개선 과제를 제안합니다.

## ✨ 핵심 기능

### 🎯 4차원 리더십 측정
- **People Concern** (사람에 대한 관심): X축
- **Production Concern** (성과에 대한 관심): Y축
- **Candor Level** (진실한 직면 수준): Z축
- **LMX Quality** (리더-구성원 교환 품질): 점 크기

### 🎮 3D 인터랙티브 시각화
- **WebGL 기반** 실시간 3D 그리드
- **리더 좌표** 실시간 업데이트 (≤30초)
- **클릭 인터랙션**으로 상세 정보 확인

### 🤖 AI 기반 개인화 코칭
- **규칙 기반 추천 엔진**: 점수별 맞춤 코칭 카드
- **행동 개선 과제**: 구체적인 액션 아이템 제공
- **Quick Pulse 설문**: 코칭 효과 추적

### 📊 실시간 대시보드
- **팀별 분석**: 리더십 스타일 분포
- **트렌드 추적**: 분기별 변화 모니터링
- **KPI 메트릭**: 설문 완료율, OKR 달성률 등

## 🚀 기술 스택

### 프론트엔드
```yaml
Framework: Next.js 14+ (App Router)
Language: TypeScript 5.4+ (Strict Mode)
UI Library: React 18.3
Styling: Tailwind CSS 3.4
3D Graphics: React Three Fiber + Three.js
State Management: Zustand
Data Fetching: TanStack Query v5
Forms: React Hook Form + Zod
```

### 백엔드
```yaml
Framework: FastAPI (Python 3.12)
Validation: Pydantic v2
Database: PostgreSQL 15 (Supabase)
Vector Search: pgvector
ORM: SQLAlchemy 2.0 (Async)
Authentication: JWT + Supabase Auth
Cache: Redis (Optional)
```

### 배포 및 인프라
```yaml
Frontend: Vercel (권장)
Backend: Supabase Edge Functions / Railway
Database: Supabase (PostgreSQL + Realtime)
CI/CD: GitHub Actions
Monitoring: Built-in metrics + Logging
```

## 📈 성능 지표

| 메트릭 | 목표 | 현재 상태 |
|--------|------|-----------|
| 리더 설문 완료율 | ≥95% | 🎯 개발 중 |
| 4D 이동거리 평균 | +2p↑ | 🎯 개발 중 |
| 팀 OKR 달성률 | +10%↑ | 🎯 개발 중 |
| 응답→그래프 반영 | ≤30초 | 🎯 개발 중 |
| 동시 사용자 지원 | 200명 | 🎯 개발 중 |

## 프로젝트 구조
```
leadership/
├── README.md              # 프로젝트 개요
├── CLAUDE.md              # AI 에이전트 가이드
├── docs/                  # 프로젝트 문서
│   ├── git-workflow.md    # Git 사용 규칙
│   ├── system-overview.md # 시스템 아키텍처
│   ├── API.md             # API 명세
│   ├── database-schema.md # DB 구조
│   ├── development-rules.md # 개발 규칙
│   └── test-strategy.md   # 테스트 전략
├── backend/               # FastAPI 백엔드
├── frontend/              # React 프론트엔드
└── scripts/               # 유틸리티 스크립트
```

## 🚀 빠른 시작

### 사전 요구사항
- **Node.js** 20 LTS (필수)
- **Python** 3.12 (백엔드 개발 시)
- **Git** (버전 관리)

### 개발 환경 설정

#### 브랜치 전략
- `main`: 프로덕션 배포용 (보호됨)
- `develop`: 개발 통합 브랜치 (기본)
- `feat/*`: 기능 개발
- `fix/*`: 버그 수정

#### 초기 설정
```bash
# 1. 저장소 클론
git clone https://github.com/taejunjeon/leadership.git
cd leadership

# 2. develop 브랜치로 전환
git checkout develop

# 3. pre-commit 설치
pip install pre-commit
pre-commit install

# 4. 백엔드 의존성 설치 (pip-tools 사용)
cd backend
pip install pip-tools
pip-sync requirements-dev.txt

# 5. 프론트엔드 의존성 설치
cd ../frontend
npm install
```

### 1분 내 데모 실행

```bash
# 프론트엔드 실행 (데모 모드)
cd frontend
npm run dev

# 🎉 http://localhost:3000 에서 확인!
```

### 풀스택 개발 환경

#### Option 1: Supabase 연동 (권장)

```bash
# 1. Supabase 프로젝트 설정
npx supabase init
npx supabase start

# 2. 환경 변수 설정
cp .env.example .env
# SUPABASE_URL과 SUPABASE_ANON_KEY 설정

# 3. 프론트엔드 실행
npm run dev
```

#### Option 2: 로컬 백엔드

```bash
# 1. 백엔드 설정
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. 데이터베이스 설정
createdb grid3_dev
alembic upgrade head

# 3. 백엔드 서버 실행
uvicorn app.main:app --reload --port 8000

# 4. 프론트엔드 실행 (별도 터미널)
cd ../frontend
npm run dev
```

### 환경 변수 설정

```env
# .env.local (프론트엔드)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# .env (백엔드)
DATABASE_URL=postgresql://user:pass@localhost:5432/grid3_dev
JWT_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key  # AI 코칭용
```

## 📚 개발 가이드

| 문서 | 설명 | 중요도 |
|------|------|--------|
| [개발 워크플로우](./docs/DEVELOPMENT_WORKFLOW.md) | 브랜치 전략 및 CI/CD | 🔥 필수 |
| [시스템 개요](./docs/system-overview.md) | 전체 아키텍처 이해 | 🔥 필수 |
| [개발 규칙](./docs/development-rules.md) | 코딩 컨벤션 및 품질 기준 | 🔥 필수 |
| [API 문서](./docs/API.md) | REST API 명세서 | ⭐ 중요 |
| [DB 스키마](./docs/database-schema.md) | 데이터베이스 구조 | ⭐ 중요 |
| [테스트 전략](./docs/test-strategy.md) | 테스트 가이드라인 | ⭐ 중요 |
| [Git 워크플로우](./docs/git-workflow.md) | Git 사용 규칙 | 💡 참고 |

## 🤝 기여하기

Grid 3.0에 기여해주셔서 감사합니다!

### 기여 절차
1. **Fork** 후 브랜치 생성: `git checkout -b feature/amazing-feature`
2. **개발 규칙** 준수: [development-rules.md](./docs/development-rules.md) 참고
3. **테스트** 작성 및 실행: `npm run test`
4. **커밋** 메시지 규칙 준수: `feat(dashboard): add 3D grid visualization`
5. **Pull Request** 생성

### 기여 가능 영역
- 🎯 **코어 기능**: 4D 점수 계산 로직 개선
- 🎨 **UI/UX**: 3D 시각화 인터랙션 개선
- 🤖 **AI 코칭**: 추천 알고리즘 고도화
- 📱 **모바일**: 반응형 디자인 최적화
- 🔧 **인프라**: 성능 최적화 및 배포 자동화

## 🗺️ 로드맵

### 🎯 Phase 1 (Q3 2025) - MVP
- [x] 4D 리더십 점수 계산 엔진
- [x] 3D WebGL 시각화 대시보드
- [x] 기본 AI 코칭 카드 시스템
- [ ] Google Forms 웹훅 연동
- [ ] Supabase 실시간 업데이트

### 🚀 Phase 2 (Q4 2025) - 확장
- [ ] Slack Bot 통합
- [ ] 모바일 최적화
- [ ] 다국어 지원 (i18n)
- [ ] 고급 분석 대시보드
- [ ] 팀 단위 벤치마킹

### 🌟 Phase 3 (Q1 2026) - 고도화
- [ ] AI 코칭 챗봇
- [ ] 머신러닝 기반 예측
- [ ] API 마켓플레이스
- [ ] 엔터프라이즈 기능

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

## 💬 커뮤니티 & 지원

- 📧 **이메일**: ai4dx@leadership.com
- 💬 **Discord**: [AI Leadership 4Dx 커뮤니티](https://discord.gg/ai4dx)
- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/username/grid3-leadership/issues)
- 💡 **기능 제안**: [GitHub Discussions](https://github.com/username/grid3-leadership/discussions)

---

<div align="center">

**Grid 3.0으로 리더십의 새로운 차원을 경험하세요** 🚀

[![GitHub stars](https://img.shields.io/github/stars/username/grid3-leadership?style=social)](https://github.com/username/grid3-leadership)
[![GitHub forks](https://img.shields.io/github/forks/username/grid3-leadership?style=social)](https://github.com/username/grid3-leadership)
[![Twitter Follow](https://img.shields.io/twitter/follow/Grid3Leadership?style=social)](https://twitter.com/Grid3Leadership)

</div>
