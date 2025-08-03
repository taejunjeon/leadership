#!/usr/bin/env python3
"""
AI Leadership 4Dx - Backend Test Script
"""

import asyncio
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent))


async def test_imports():
    """모듈 임포트 테스트"""
    print("🔍 Testing module imports...")

    try:
        from app.core.config import settings

        print("✅ Config module imported")

        from app.core.database import get_supabase

        print("✅ Database module imported")

        from app.main import app

        print("✅ Main app imported")

        from app.api import analysis, auth, health, reports, survey

        print("✅ All API modules imported")

        from app.schemas.survey import SurveySubmission

        print("✅ Schema modules imported")

        from app.services.analysis import LeadershipAnalyzer

        print("✅ Service modules imported")

        return True

    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False


async def test_config():
    """설정 테스트"""
    print("\n🔧 Testing configuration...")

    try:
        from app.core.config import settings

        # 필수 환경 변수 확인
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_KEY",
            "SECRET_KEY",
        ]

        missing_vars = []
        for var in required_vars:
            if not hasattr(settings, var) or not getattr(settings, var):
                missing_vars.append(var)

        if missing_vars:
            print(f"⚠️  Missing environment variables: {', '.join(missing_vars)}")
            print("   Please create a .env file based on .env.example")
            return False
        else:
            print("✅ All required environment variables are set")
            return True

    except Exception as e:
        print(f"❌ Config error: {e}")
        return False


async def test_api_structure():
    """API 구조 테스트"""
    print("\n🏗️  Testing API structure...")

    try:
        from app.main import app

        # 라우터 확인
        routes = []
        for route in app.routes:
            if hasattr(route, "path"):
                routes.append(route.path)

        expected_routes = [
            "/",
            "/health",
            "/readiness",
            "/api/auth/login",
            "/api/auth/signup",
            "/api/survey/submit",
            "/api/analysis/user/{user_id}",
            "/api/reports/pdf/{user_id}",
        ]

        for expected in expected_routes:
            if any(expected in route for route in routes):
                print(f"✅ Route found: {expected}")
            else:
                print(f"❌ Route missing: {expected}")

        return True

    except Exception as e:
        print(f"❌ API structure error: {e}")
        return False


async def test_analysis_engine():
    """분석 엔진 테스트"""
    print("\n🧠 Testing analysis engine...")

    try:
        from app.services.analysis import LeadershipAnalyzer

        # 샘플 응답 데이터
        sample_responses = {
            "bm_1": 5,
            "bm_2": 6,
            "bm_3": 4,
            "bm_4": 7,
            "bm_5": 5,
            "bm_6": 6,
            "bm_7": 4,
            "bm_8": 7,
            "bm_9": 5,
            "bm_10": 6,
            "bm_11": 4,
            "bm_12": 7,
            "bm_13": 5,
            "bm_14": 6,
            "rc_1": 6,
            "rc_2": 5,
            "rc_3": 6,
            "rc_4": 5,
            "rc_5": 6,
            "rc_6": 5,
            "rc_7": 6,
            "rc_8": 5,
            "rc_9": 6,
            "rc_10": 5,
            "lmx_1": 5,
            "lmx_2": 5,
            "lmx_3": 5,
            "lmx_4": 5,
            "lmx_5": 5,
            "lmx_6": 5,
            "lmx_7": 5,
            "lmx_8": 5,
            "lmx_9": 5,
            "lmx_10": 5,
            "ig_1": 3,
            "ig_2": 3,
            "ig_3": 3,
            "ig_4": 3,
            "ig_5": 3,
            "ig_6": 3,
            "ig_7": 3,
            "ig_8": 3,
            "ig_9": 3,
        }

        analyzer = LeadershipAnalyzer()

        # 차원 계산
        dimensions = analyzer.calculate_dimensions(sample_responses)
        print(
            f"✅ Dimensions calculated: People={dimensions.people}, Production={dimensions.production}"
        )

        # 스타일 분류
        style = analyzer.classify_leadership_style(
            dimensions.people, dimensions.production
        )
        print(f"✅ Leadership style: {style.value}")

        # 위험도 평가
        risk = analyzer.assess_risk_level(dimensions)
        print(f"✅ Risk level: {risk.value}")

        return True

    except Exception as e:
        print(f"❌ Analysis engine error: {e}")
        return False


async def main():
    """메인 테스트 함수"""
    print("🚀 AI Leadership 4Dx Backend Test\n")

    tests = [
        ("Module Imports", test_imports),
        ("Configuration", test_config),
        ("API Structure", test_api_structure),
        ("Analysis Engine", test_analysis_engine),
    ]

    results = []
    for name, test_func in tests:
        result = await test_func()
        results.append((name, result))

    # 결과 요약
    print("\n📊 Test Summary:")
    print("-" * 40)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name:<20} {status}")

    print("-" * 40)
    print(f"Total: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Backend is ready.")
        print("\n📝 Next steps:")
        print("1. Create .env file with your credentials")
        print("2. Install dependencies: pip install -r requirements.txt")
        print("3. Run the server: uvicorn app.main:app --reload --port 8000")
        print("4. Visit API docs: http://localhost:8000/docs")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")


if __name__ == "__main__":
    asyncio.run(main())
