"""
AI Leadership 4Dx - Health Check API
"""

from datetime import datetime

from fastapi import APIRouter, status

from ..core.config import settings
from ..core.database import get_supabase

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """시스템 헬스 체크"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }

    # Supabase 연결 체크
    try:
        client = get_supabase()
        # 간단한 쿼리로 연결 확인
        client.auth.get_session()
        health_status["database"] = "connected"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["database"] = f"error: {str(e)}"

    return health_status


@router.get("/readiness", status_code=status.HTTP_200_OK)
async def readiness_check():
    """서비스 준비 상태 체크"""
    try:
        # 모든 필수 서비스 체크
        client = get_supabase()
        client.auth.get_session()

        return {
            "ready": True,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {
            "ready": False,
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e),
        }
