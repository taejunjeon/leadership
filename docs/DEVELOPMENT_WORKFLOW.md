# 개발 워크플로우 가이드

## 📋 목차
1. [브랜치 전략](#브랜치-전략)
2. [의존성 관리](#의존성-관리)
3. [CI/CD 파이프라인](#cicd-파이프라인)
4. [개발 프로세스](#개발-프로세스)

## 브랜치 전략

### 브랜치 구조
```
main        → 프로덕션 배포용 (보호됨)
└── develop → 개발 통합 브랜치
    ├── feat/*  → 기능 개발
    ├── fix/*   → 버그 수정
    └── chore/* → 기타 작업
```

### 브랜치 규칙
- `main`: 직접 푸시 금지, PR만 허용
- `develop`: 기능 브랜치들의 통합 테스트
- `feat/*`: 새로운 기능 개발
- `fix/*`: 버그 수정
- 릴리즈는 태그로 관리 (`v1.0.0` 형식)

## 의존성 관리

### Backend (Python)
```bash
# requirements.in 수정 후
cd backend
./compile-requirements.sh

# 개발 환경 설치
pip-sync requirements-dev.txt

# 프로덕션 환경 설치
pip-sync requirements.txt
```

### Frontend (Node.js)
```bash
cd frontend
npm install  # package-lock.json 자동 업데이트
```

## CI/CD 파이프라인

### 4-Gate 시스템

#### Gate 1: Pre-commit (로컬)
```bash
# 설치
pre-commit install

# 수동 실행
pre-commit run --all-files
```

자동 검사 항목:
- 보안 스캔 (gitleaks)
- 코드 포맷팅 (Ruff, ESLint)
- 타입 체크 (mypy)
- 일반 검사 (trailing spaces, large files)

#### Gate 2: Dev CI (PR)
- 의존성 검증
- 린트 & 포맷
- 유닛 테스트
- **목적**: 빠른 피드백, 개발 차단 최소화

#### Gate 3: Main CI (main 브랜치)
- 프로덕션 빌드 테스트
- Docker 이미지 빌드
- 통합 테스트 준비
- **목적**: 배포 가능성 검증

#### Gate 4: Release (태그)
- E2E 테스트
- 성능 테스트
- 실제 배포 트리거
- **목적**: 프로덕션 품질 보장

## 개발 프로세스

### 1. 기능 개발 시작
```bash
# develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 기능 브랜치 생성
git checkout -b feat/기능명
```

### 2. 개발 중
```bash
# 의존성 추가 시
cd backend
echo "새패키지>=1.0.0" >> requirements.in
./compile-requirements.sh
pip-sync requirements-dev.txt

# 커밋 (pre-commit 자동 실행)
git add .
git commit -m "feat: 기능 설명"
```

### 3. PR 생성
```bash
# 푸시
git push origin feat/기능명

# GitHub에서 PR 생성
# develop ← feat/기능명
```

### 4. 머지 후
```bash
# develop 업데이트
git checkout develop
git pull origin develop

# 불필요한 브랜치 삭제
git branch -d feat/기능명
```

### 5. 릴리즈
```bash
# main으로 PR
# develop → main

# 태그 생성 (CI/CD 트리거)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 문제 해결

### 의존성 충돌
```bash
# Backend
cd backend
pip-compile --upgrade requirements.in
pip-sync requirements-dev.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CI 실패
1. 로컬에서 pre-commit 실행: `pre-commit run --all-files`
2. 의존성 검증: `pip-compile --dry-run`
3. 빌드 테스트: `npm run build`

### 포맷팅 이슈
```bash
# Backend
cd backend
ruff format .

# Frontend
cd frontend
npm run lint -- --fix
```