# Git 워크플로우 가이드

> Leadership 프로젝트의 Git 사용 규칙과 협업 가이드

## 브랜치 전략

### 1. 주요 브랜치
- **main**: 프로덕션 배포 브랜치
- **develop**: 개발 통합 브랜치
- **staging**: 스테이징 환경 브랜치

### 2. 작업 브랜치
```bash
feature/기능명     # 새 기능 개발
fix/이슈번호       # 버그 수정
hotfix/긴급수정    # 프로덕션 긴급 수정
refactor/개선내용  # 코드 개선
docs/문서명        # 문서 작업
```

## 워크플로우

### 1. 새 기능 개발
```bash
# 1. develop 브랜치에서 새 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. 작업 진행
# ... 코드 작성 ...

# 3. 변경사항 커밋
git add .
git commit -m "feat: 사용자 인증 기능 구현"

# 4. 원격 저장소에 푸시
git push origin feature/user-authentication

# 5. Pull Request 생성
# GitHub에서 develop 브랜치로 PR 생성
```

### 2. 버그 수정
```bash
# 1. 이슈 확인 후 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b fix/42-login-error

# 2. 버그 수정
# ... 코드 수정 ...

# 3. 테스트 확인
npm test
# 또는
pytest

# 4. 커밋 및 푸시
git add .
git commit -m "fix: 로그인 시 발생하는 에러 수정 (#42)"
git push origin fix/42-login-error
```

### 3. 긴급 수정 (Hotfix)
```bash
# 1. main 브랜치에서 시작
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-patch

# 2. 수정 작업
# ... 긴급 수정 ...

# 3. 커밋
git add .
git commit -m "hotfix: 보안 취약점 긴급 패치"

# 4. main과 develop에 모두 머지
# PR을 통해 main에 먼저 머지
# 이후 develop에도 머지
```

## 커밋 메시지 규칙

### 1. 형식
```
<type>: <subject>

[optional body]

[optional footer]
```

### 2. Type 종류
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅, 세미콜론 누락 등
- **refactor**: 코드 리팩토링
- **test**: 테스트 코드 추가/수정
- **chore**: 빌드 업무, 패키지 관리자 설정 등
- **perf**: 성능 개선
- **ci**: CI 설정 변경

### 3. 예시
```bash
# 좋은 예
git commit -m "feat: 사용자 프로필 편집 기능 추가"
git commit -m "fix: 로그아웃 시 토큰이 삭제되지 않는 문제 해결"
git commit -m "docs: API 엔드포인트 문서 업데이트"
git commit -m "refactor: 인증 로직 모듈화"

# 나쁜 예
git commit -m "수정"
git commit -m "버그 고침"
git commit -m "update"
```

### 4. 상세 커밋 메시지
```bash
git commit -m "feat: 다국어 지원 기능 추가

- i18n 라이브러리 통합
- 한국어, 영어 번역 파일 추가
- 언어 전환 UI 구현
- 사용자 언어 설정 저장 기능

Closes #123"
```

## Pull Request 규칙

### 1. PR 템플릿
```markdown
## 개요
이 PR이 해결하는 문제나 추가하는 기능을 간단히 설명

## 변경사항
- 변경사항 1
- 변경사항 2
- 변경사항 3

## 테스트
- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료

## 스크린샷 (UI 변경 시)
변경 전/후 스크린샷 첨부

## 관련 이슈
Closes #이슈번호
```

### 2. PR 체크리스트
- [ ] 코드가 프로젝트 스타일 가이드를 따름
- [ ] 셀프 리뷰 완료
- [ ] 코드에 필요한 주석 추가
- [ ] 문서 업데이트 (필요 시)
- [ ] 테스트 추가/수정
- [ ] 모든 테스트 통과
- [ ] 관련 이슈 연결

### 3. 리뷰 프로세스
1. 최소 2명의 리뷰어 승인 필요
2. CI 모든 체크 통과
3. 충돌 해결
4. 리뷰 코멘트 반영

## 충돌 해결

### 1. Rebase 사용
```bash
# develop의 최신 변경사항을 현재 브랜치에 반영
git checkout feature/my-feature
git fetch origin
git rebase origin/develop

# 충돌 발생 시
# 1. 충돌 파일 수정
# 2. 수정 완료 후
git add .
git rebase --continue

# rebase 취소
git rebase --abort
```

### 2. Merge 사용
```bash
# develop을 현재 브랜치에 머지
git checkout feature/my-feature
git merge origin/develop

# 충돌 해결 후
git add .
git commit
```

## Git 명령어 모음

### 1. 기본 명령어
```bash
# 상태 확인
git status

# 변경사항 확인
git diff
git diff --staged

# 로그 확인
git log --oneline --graph
git log -p -2  # 최근 2개 커밋의 상세 내용

# 특정 파일 히스토리
git log --follow -- path/to/file
```

### 2. 되돌리기
```bash
# 작업 디렉토리 변경사항 되돌리기
git checkout -- file.txt

# 스테이징 취소
git reset HEAD file.txt

# 커밋 수정
git commit --amend

# 이전 커밋으로 되돌리기 (히스토리 유지)
git revert <commit-hash>

# 이전 커밋으로 되돌리기 (히스토리 제거)
git reset --hard <commit-hash>
```

### 3. 브랜치 관리
```bash
# 브랜치 목록
git branch -a  # 모든 브랜치
git branch -r  # 원격 브랜치

# 브랜치 삭제
git branch -d feature/old-feature  # 로컬
git push origin --delete feature/old-feature  # 원격

# 브랜치 이름 변경
git branch -m old-name new-name
```

### 4. Stash 활용
```bash
# 현재 작업 임시 저장
git stash
git stash save "작업 설명"

# stash 목록 확인
git stash list

# stash 적용
git stash apply  # 가장 최근 stash
git stash apply stash@{2}  # 특정 stash

# stash 삭제
git stash drop stash@{1}
git stash clear  # 모든 stash 삭제
```

## 보안 주의사항

### 1. 민감 정보 관리
- 절대 커밋하면 안 되는 파일:
  - `.env` (환경 변수)
  - `*.key`, `*.pem` (인증서/키 파일)
  - `secrets.json`
  - API 키, 비밀번호

### 2. .gitignore 활용
```gitignore
# 환경 변수
.env
.env.local
.env.*.local

# 인증서
*.pem
*.key
*.p12

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 로그
*.log
logs/

# 의존성
node_modules/
venv/
__pycache__/
```

### 3. 실수로 커밋한 경우
```bash
# 파일을 히스토리에서 완전히 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/sensitive-file" \
  --prune-empty --tag-name-filter cat -- --all

# 또는 BFG Repo-Cleaner 사용 (더 빠르고 쉬움)
bfg --delete-files sensitive-file.txt
```

## 팀 협업 규칙

### 1. 일일 워크플로우
1. 작업 시작 전 최신 코드 pull
2. 기능별로 작은 단위 커밋
3. 하루 마지막에 원격 저장소 푸시
4. PR은 작업 완료 후 즉시 생성

### 2. 코드 리뷰 에티켓
- 건설적이고 구체적인 피드백
- 칭찬할 점도 함께 언급
- 질문 형태로 제안
- 빠른 리뷰 (24시간 이내)

### 3. 이슈 관리
- 버그/기능 요청은 이슈로 등록
- 이슈 템플릿 활용
- 라벨로 분류
- 마일스톤으로 일정 관리

## 문제 해결

### 1. 자주 발생하는 문제
```bash
# 원격 저장소와 로컬이 달라진 경우
git fetch origin
git reset --hard origin/branch-name

# 잘못된 브랜치에서 작업한 경우
git stash
git checkout correct-branch
git stash pop

# 커밋 메시지 수정
git commit --amend  # 마지막 커밋
git rebase -i HEAD~3  # 최근 3개 커밋 중 선택
```

### 2. 도움말
```bash
# Git 도움말
git help <command>
git <command> --help

# 예시
git help rebase
git commit --help
```

---

**참고**: 이 문서는 Leadership 프로젝트의 Git 사용 가이드입니다. 팀원 모두가 일관된 방식으로 협업할 수 있도록 이 규칙을 준수해주세요.