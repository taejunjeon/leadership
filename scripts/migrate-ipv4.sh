#!/bin/bash
# IPv4 호스트를 사용한 Supabase 마이그레이션

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Supabase IPv4 마이그레이션 시작...${NC}"

# 환경 변수 설정
export SUPABASE_PROJECT_REF="eokkqmqpxqwmlmshhewn"
export SUPABASE_DB_PASSWORD="ACA2972"

# IPv4 호스트 사용 (aws-0- 프리픽스)
export DATABASE_URL="postgres://postgres:${SUPABASE_DB_PASSWORD}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"

echo -e "${GREEN}IPv4 호스트로 연결 시도중...${NC}"
echo "Host: aws-0-ap-northeast-2.pooler.supabase.com"

# SQL 실행
echo -e "${YELLOW}테이블 생성 중...${NC}"

psql "$DATABASE_URL" << EOF
-- 1. survey_results 테이블 생성
CREATE TABLE IF NOT EXISTS survey_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_time INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. survey_responses 테이블 생성
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS 정책 설정
ALTER TABLE survey_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- survey_results 정책
CREATE POLICY "Users can view own results" ON survey_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON survey_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON survey_results
    FOR UPDATE USING (auth.uid() = user_id);

-- survey_responses 정책
CREATE POLICY "Users can manage own responses" ON survey_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );

-- 관리자 권한 정책 추가
CREATE POLICY "Admins can view all results" ON survey_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all responses" ON survey_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 확인
SELECT 'Tables created successfully!' as status;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 마이그레이션 성공!${NC}"
else
    echo -e "${RED}❌ 마이그레이션 실패. aws-0- 프리픽스 호스트도 접속 불가.${NC}"
    echo -e "${YELLOW}대안: Supabase 대시보드 SQL Editor를 사용하세요.${NC}"
fi