#!/bin/bash

# Grid 3.0 프론트엔드 폴더 구조 정리 스크립트
# 작성자: 헤파이스토스
# 날짜: 2025-08-02

set -e  # 에러 발생 시 중단

echo "🔧 Grid 3.0 폴더 구조 정리 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
if [ ! -d "/Users/vibetj/coding/leadership" ]; then
    echo -e "${RED}❌ /Users/vibetj/coding/leadership 디렉토리를 찾을 수 없습니다.${NC}"
    exit 1
fi

cd /Users/vibetj/coding/leadership

# 1. 백업 생성
echo -e "${YELLOW}📦 백업 생성 중...${NC}"
BACKUP_DIR="/Users/vibetj/coding/leadership_backup_$(date +%Y%m%d_%H%M%S)"
cp -r . "$BACKUP_DIR" 2>/dev/null || true
echo -e "${GREEN}✅ 백업 완료: $BACKUP_DIR${NC}"

# 2. 현재 구조 확인
echo -e "${YELLOW}🔍 현재 폴더 구조 확인...${NC}"
if [ -d "backend/frontend/frontend" ]; then
    echo -e "${RED}⚠️  중첩된 frontend 폴더 발견${NC}"
    
    # 3. 프론트엔드 파일 이동
    echo -e "${YELLOW}📂 프론트엔드 파일 이동 중...${NC}"
    
    # frontend 폴더가 비어있는지 확인
    if [ -z "$(ls -A frontend 2>/dev/null)" ]; then
        echo "frontend 폴더가 비어있음. 파일 이동 시작..."
        
        # 파일 이동
        mv backend/frontend/frontend/* frontend/ 2>/dev/null || true
        mv backend/frontend/frontend/.* frontend/ 2>/dev/null || true
        mv backend/frontend/lib frontend/ 2>/dev/null || true
        mv backend/frontend/middleware.ts frontend/ 2>/dev/null || true
        mv backend/frontend/.env.local.example frontend/ 2>/dev/null || true
        
        echo -e "${GREEN}✅ 파일 이동 완료${NC}"
    else
        echo -e "${RED}❌ frontend 폴더가 비어있지 않습니다. 수동 확인 필요${NC}"
        exit 1
    fi
    
    # 4. 중복/불필요 파일 제거
    echo -e "${YELLOW}🗑️  불필요한 파일 제거 중...${NC}"
    rm -rf backend/frontend 2>/dev/null || true
    rm -f backend/lib 2>/dev/null || true  # 빈 폴더라면
    
    # frontend 루트의 중복 package.json 확인
    if [ -f "frontend/package.json" ] && [ -f "backend/frontend/package.json" ]; then
        # 실제 내용이 있는 package.json 확인
        if [ $(wc -l < "frontend/package.json") -lt 10 ]; then
            rm -f frontend/package.json
            echo "루트의 빈 package.json 제거"
        fi
    fi
    
    echo -e "${GREEN}✅ 정리 완료${NC}"
else
    echo -e "${GREEN}✅ 폴더 구조가 이미 정상입니다.${NC}"
fi

# 5. 최종 구조 확인
echo -e "${YELLOW}📊 최종 폴더 구조:${NC}"
tree -L 2 . -I 'node_modules|venv|__pycache__|.git' || ls -la

echo -e "${GREEN}🎉 폴더 구조 정리 완료!${NC}"

# 6. 권한 설정
chmod -R 755 frontend 2>/dev/null || true
chmod -R 755 backend 2>/dev/null || true

echo -e "${YELLOW}💡 다음 단계:${NC}"
echo "1. cd frontend && npm install"
echo "2. cd ../backend && source venv/bin/activate && pip install -r requirements.txt"
echo "3. Supabase 설정 진행"