# AI Leadership 4Dx - Backend API

FastAPI 기반의 AI Leadership 4Dx 백엔드 API 서버입니다.

## 🚀 주요 기능

- **인증 시스템**: Supabase Auth 기반 로그인/회원가입
- **설문 관리**: 43개 문항의 리더십 설문 수집 및 저장
- **AI 분석**: 4차원 리더십 모델 기반 자동 분석
- **보고서 생성**: PDF 형식의 상세 분석 보고서
- **실시간 동기화**: Supabase Realtime 연동 준비

## 📋 시작하기

### 1. 환경 설정

```bash
# Python 3.9+ 필요
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고 실제 값을 입력:

```bash
cp .env.example .env
```

필수 환경 변수:
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase 익명 키
- `SUPABASE_SERVICE_KEY`: Supabase 서비스 키
- `SECRET_KEY`: JWT 시크릿 키 (openssl rand -hex 32)

### 3. 서버 실행

```bash
# 개발 서버 실행
uvicorn app.main:app --reload --port 8000

# 또는 직접 실행
python -m app.main
```

### 4. API 문서 확인

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🏗️ 프로젝트 구조

```
backend/
├── app/
│   ├── api/              # API 라우터
│   │   ├── auth.py       # 인증 관련 엔드포인트
│   │   ├── survey.py     # 설문 관련 엔드포인트
│   │   ├── analysis.py   # 분석 관련 엔드포인트
│   │   └── reports.py    # 보고서 관련 엔드포인트
│   ├── core/             # 핵심 설정
│   │   ├── config.py     # 환경 설정
│   │   └── database.py   # Supabase 연결
│   ├── schemas/          # Pydantic 모델
│   │   ├── survey.py     # 설문 스키마
│   │   └── analysis.py   # 분석 스키마
│   ├── services/         # 비즈니스 로직
│   │   ├── analysis.py   # 리더십 분석 엔진
│   │   └── report_generator.py  # PDF 보고서 생성
│   └── main.py           # FastAPI 앱 진입점
├── tests/                # 테스트 코드
├── requirements.txt      # Python 의존성
└── .env.example          # 환경 변수 예시
```

## 🔌 API 엔드포인트

### 인증 (Auth)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 설문 (Survey)
- `POST /api/survey/submit` - 설문 제출
- `GET /api/survey/responses/{user_id}` - 사용자 응답 조회
- `GET /api/survey/stats` - 설문 통계
- `GET /api/survey/questions` - 설문 문항 정보

### 분석 (Analysis)
- `GET /api/analysis/user/{user_id}` - 사용자 분석 결과
- `GET /api/analysis/history/{user_id}` - 분석 이력
- `POST /api/analysis/trigger` - 분석 실행
- `GET /api/analysis/quick/{user_id}` - 빠른 분석 결과
- `GET /api/analysis/insights/{user_id}` - AI 인사이트

### 보고서 (Reports)
- `GET /api/reports/pdf/{user_id}` - PDF 보고서 다운로드
- `GET /api/reports/summary/{user_id}` - 보고서 요약
- `GET /api/reports/team/{organization}` - 팀 보고서

## 🧪 테스트

```bash
# 백엔드 구조 테스트
python test_backend.py

# 단위 테스트 실행
pytest tests/

# 커버리지 확인
pytest --cov=app tests/
```

## 🔐 보안 주의사항

1. **환경 변수**: 절대 `.env` 파일을 커밋하지 마세요
2. **Service Key**: `SUPABASE_SERVICE_KEY`는 서버에서만 사용하세요
3. **CORS**: 프로덕션에서는 `CORS_ORIGINS`를 제한하세요
4. **Rate Limiting**: 프로덕션에서는 rate limiting을 추가하세요

## 🚀 배포

### Docker 사용
```bash
# 이미지 빌드
docker build -t ai-leadership-4dx-api .

# 컨테이너 실행
docker run -p 8000:8000 --env-file .env ai-leadership-4dx-api
```

### 프로덕션 설정
```python
# .env 파일에서
ENVIRONMENT=production
DEBUG=false
WORKERS=4
```

## 📝 개발 노트

- **분석 엔진**: 현재는 규칙 기반이지만, 향후 ML 모델로 업그레이드 예정
- **PDF 생성**: ReportLab 사용, 한글 폰트 설정 필요할 수 있음
- **실시간 기능**: Supabase Realtime 이벤트 처리 준비됨

## 🤝 기여하기

1. 이슈를 먼저 생성해주세요
2. 피처 브랜치를 생성하세요 (`feature/amazing-feature`)
3. 변경사항을 커밋하세요
4. 브랜치에 푸시하세요
5. Pull Request를 생성하세요

---

*AI Leadership 4Dx - 4차원 리더십 평가 플랫폼*