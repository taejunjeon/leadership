"""
슬랙 알림 테스트
"""
import sys
sys.path.insert(0, '/Users/vibetj/coding')

import asyncio
from slackalarm import send_simple_message, notify_work_complete

async def test_notification():
    print("슬랙 알림 테스트 시작...")
    
    # 간단한 메시지 테스트
    await send_simple_message(
        title="🔨 Grid 3.0 개발 대기 상태", 
        message="헤파이스토스가 화요일 작업을 완료하고 TJ님의 지시를 기다리고 있소!"
    )
    
    print("알림 전송 완료!")
    
    # 작업 완료 알림
    await notify_work_complete(
        completed_work=[
            "✅ 검증 API 4개 엔드포인트 구현",
            "✅ AI 기반 리더십 분석 시스템",
            "✅ Redis 캐싱 + Rate Limiting",
            "✅ 중복 응답 차단 기능",
            "✅ 테스트 스위트 작성"
        ],
        next_steps=[
            "서버 실행: uvicorn app.main:app --reload",
            "API 문서: http://localhost:8000/api/docs",
            "수요일: Frontend 검증 UI 구현"
        ],
        waiting_reason="Week 2 화요일 100% 완료!"
    )

if __name__ == "__main__":
    asyncio.run(test_notification())