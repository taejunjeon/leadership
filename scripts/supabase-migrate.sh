#!/bin/bash
# Supabase 마이그레이션 스크립트
# 사용법: SUPABASE_ACCESS_TOKEN=your_token ./scripts/supabase-migrate.sh

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 프로젝트 정보
PROJECT_REF="eokkqmqpxqwmlmshhewn"

echo -e "${YELLOW}🚀 Supabase 마이그레이션 시작${NC}"

# 1. 토큰 확인
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ 에러: SUPABASE_ACCESS_TOKEN 환경 변수가 설정되지 않았습니다.${NC}"
    echo "사용법: SUPABASE_ACCESS_TOKEN=your_token $0"
    echo ""
    echo "토큰 얻는 방법:"
    echo "1. https://supabase.com/dashboard/account/tokens 접속"
    echo "2. 'Generate new token' 클릭"
    echo "3. 토큰 복사 후 위 명령어로 실행"
    exit 1
fi

# 2. 프로젝트 링크
echo -e "${GREEN}📎 프로젝트 연결 중...${NC}"
npx supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 프로젝트 연결 실패${NC}"
    exit 1
fi

# 3. 마이그레이션 실행
echo -e "${GREEN}🔄 데이터베이스 마이그레이션 실행 중...${NC}"
npx supabase db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 마이그레이션 완료!${NC}"
    echo ""
    echo "다음 테이블들이 생성되었습니다:"
    echo "  - users (사용자 정보)"
    echo "  - survey_responses (설문 응답)"
    echo "  - leadership_analysis (리더십 분석)"
    echo "  - reports (보고서 메타데이터)"
else
    echo -e "${RED}❌ 마이그레이션 실패${NC}"
    echo "대안: Supabase SQL Editor에서 /database/complete_migration.sql 직접 실행"
    exit 1
fi