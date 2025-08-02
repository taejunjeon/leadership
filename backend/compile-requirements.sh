#!/bin/bash
# pip-tools를 사용한 의존성 컴파일 스크립트

set -e

echo "🔧 의존성 컴파일 시작..."

# pip-tools 설치 확인
if ! command -v pip-compile &> /dev/null; then
    echo "📦 pip-tools 설치 중..."
    pip install pip-tools
fi

# 프로덕션 의존성 컴파일
echo "📋 프로덕션 의존성 컴파일 중..."
pip-compile requirements.in \
    --resolver=backtracking \
    --output-file=requirements.txt \
    --verbose

# 개발 의존성 컴파일
echo "📋 개발 의존성 컴파일 중..."
pip-compile requirements-dev.in \
    --resolver=backtracking \
    --output-file=requirements-dev.txt \
    --verbose

echo "✅ 의존성 컴파일 완료!"
echo ""
echo "다음 명령으로 설치하세요:"
echo "  pip-sync requirements.txt        # 프로덕션 환경"
echo "  pip-sync requirements-dev.txt    # 개발 환경"