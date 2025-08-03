"""
화요일 작업 완료 슬랙 알림 전송
"""

import asyncio

from app.core.selective_notifications import (
    notify_api_ready,
    notify_grid3_milestone,
    notify_work_complete,
)


async def main():
    """화요일 완료 알림 전송"""

    # 1. API 준비 완료 알림
    await notify_api_ready(
        api_endpoints=[
            "POST /api/v1/validation/survey",
            "POST /api/v1/validation/batch",
            "GET /api/v1/validation/report/{id}",
            "GET /api/v1/validation/anomalies/detect",
        ],
        docs_url="http://localhost:8000/api/docs",
    )

    # 잠시 대기
    await asyncio.sleep(2)

    # 2. Week 2 화요일 마일스톤 알림
    await notify_grid3_milestone(
        week=2,
        day="화요일",
        completed_items=[
            "검증 API 4개 엔드포인트 구현",
            "Redis 캐싱 시스템 구축",
            "다국어 에러 메시지 시스템",
            "AI 기반 리더십 분석 서비스",
            "중복 응답 차단 기능",
            "Rate Limiting 미들웨어",
            "9개 API 테스트 작성",
        ],
        progress_percent=22.0,  # 2.6주/12주
    )

    # 3. 작업 완료 및 대기 상태 알림
    await notify_work_complete(
        completed_tasks=[
            "✅ 검증 API 100% 구현",
            "✅ JWT 인증 통합 완료",
            "✅ AI 분석 시스템 구축",
            "✅ 테스트 스위트 작성",
            "✅ 슬랙 알림 연동",
        ],
        next_steps=[
            "서버 실행: cd backend && uvicorn app.main:app --reload",
            "API 문서 확인: http://localhost:8000/api/docs",
            "다음 작업 지시 대기",
        ],
        reason="🔥 Week 2 화요일 완료 - TJ님의 지시를 기다리고 있소!",
    )


if __name__ == "__main__":
    asyncio.run(main())
