# Grid 3.0 Makefile

# 색상 정의
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# 기본 타겟
.PHONY: help
help:
	@echo "$(GREEN)Grid 3.0 Leadership Mapping Platform$(NC)"
	@echo "사용 가능한 명령어:"
	@echo "  $(YELLOW)make dev$(NC)        - 개발 서버 실행 (프론트엔드 + 백엔드)"
	@echo "  $(YELLOW)make frontend$(NC)   - 프론트엔드만 실행"
	@echo "  $(YELLOW)make backend$(NC)    - 백엔드만 실행"
	@echo "  $(YELLOW)make db$(NC)         - 데이터베이스 시작"
	@echo "  $(YELLOW)make install$(NC)    - 의존성 설치"
	@echo "  $(YELLOW)make test$(NC)       - 테스트 실행"
	@echo "  $(YELLOW)make lint$(NC)       - 린트 검사"
	@echo "  $(YELLOW)make clean$(NC)      - 빌드 파일 정리"

# 개발 서버
.PHONY: dev
dev:
	@echo "$(GREEN)개발 서버 시작...$(NC)"
	@make -j 2 frontend-dev backend-dev

.PHONY: frontend-dev
frontend-dev:
	@echo "$(GREEN)프론트엔드 시작...$(NC)"
	cd frontend && npm run dev

.PHONY: backend-dev
backend-dev:
	@echo "$(GREEN)백엔드 시작...$(NC)"
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# 개별 실행
.PHONY: frontend
frontend: frontend-dev

.PHONY: backend
backend: backend-dev

# 데이터베이스
.PHONY: db
db:
	@echo "$(GREEN)데이터베이스 시작...$(NC)"
	docker-compose up -d postgres redis

.PHONY: db-stop
db-stop:
	@echo "$(YELLOW)데이터베이스 중지...$(NC)"
	docker-compose down

# 설치
.PHONY: install
install:
	@echo "$(GREEN)의존성 설치...$(NC)"
	cd frontend && npm install
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 테스트
.PHONY: test
test:
	@echo "$(GREEN)테스트 실행...$(NC)"
	cd frontend && npm test
	cd backend && source venv/bin/activate && pytest

# 린트
.PHONY: lint
lint:
	@echo "$(GREEN)린트 검사...$(NC)"
	cd frontend && npm run lint
	cd backend && source venv/bin/activate && black . && mypy .

# 정리
.PHONY: clean
clean:
	@echo "$(YELLOW)빌드 파일 정리...$(NC)"
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	rm -rf backend/__pycache__
	rm -rf backend/venv
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# 도커 빌드
.PHONY: docker-build
docker-build:
	@echo "$(GREEN)도커 이미지 빌드...$(NC)"
	docker-compose build

# 로그 확인
.PHONY: logs
logs:
	docker-compose logs -f