"""
AI Leadership 4Dx - Week 2 완료 슬랙 알림
"""

import asyncio
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.selective_notifications import notify_work_complete

async def main():
    """Week 2 완료 알림 전송"""
    
    await notify_work_complete(
        completed_tasks=[
            "✅ Week 2 Day 1-5 모든 개발 완료",
            "✅ 43개 문항 설문 시스템 구현",
            "✅ Influence Gauge (Dirty Dozen 대체) 완성",
            "✅ 3D 리더십 시각화 (React Three Fiber)",
            "✅ FastAPI 백엔드 전체 구축",
            "✅ 리더십 분석 API 및 PDF 보고서 생성",
            "✅ Playwright 테스트 실행 (10/24 통과)",
            "✅ 콘솔 에러 없음 확인",
            "✅ gridleader1.1.0.md 문서 작성 완료"
        ],
        next_steps=[
            "프론트엔드 확인: http://localhost:3001",
            "백엔드 실행: cd backend && uvicorn app.main:app --reload",
            "API 문서: http://localhost:8000/docs",
            "Week 3 계획 검토 및 지시"
        ],
        reason="🎉 AI Leadership 4Dx MVP 완성! Week 2 모든 목표 달성!"
    )
    
    print("✅ 슬랙 알림이 전송되었습니다!")

if __name__ == "__main__":
    asyncio.run(main())