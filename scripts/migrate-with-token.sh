#!/bin/bash
# Supabase 마이그레이션 실행 스크립트

export SUPABASE_ACCESS_TOKEN=sbp_b69cf331a6ac30caa9838a8edf7979276d0dbd54

echo "🚀 Supabase 마이그레이션 시작..."

# 먼저 프로젝트 초기화
npx supabase init

# 마이그레이션 파일 복사
echo "📂 마이그레이션 파일 준비 중..."
mkdir -p supabase/migrations
cp database/complete_migration.sql supabase/migrations/20250802_initial_schema.sql

# 프로젝트 링크 (비밀번호는 대시보드에서 확인 필요)
echo "📎 프로젝트 연결 중..."
echo "⚠️  데이터베이스 비밀번호가 필요합니다."
echo "👉 https://supabase.com/dashboard/project/eokkqmqpxqwmlmshhewn/settings/database"
echo "위 링크에서 'Database Password' 확인 후 입력하세요."

npx supabase link --project-ref eokkqmqpxqwmlmshhewn

# 마이그레이션 실행
echo "🔄 마이그레이션 실행 중..."
npx supabase db push

echo "✅ 완료!"