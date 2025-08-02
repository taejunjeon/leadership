"""
AI Leadership 4Dx - Analysis API
"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from ..schemas.analysis import (
    LeadershipAnalysis, 
    AnalysisRequest,
    QuickAnalysis,
    AIInsight
)
from ..core.database import get_service_supabase
from ..services.analysis import trigger_analysis
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/user/{user_id}", response_model=LeadershipAnalysis)
async def get_user_analysis(user_id: str):
    """사용자의 최신 분석 결과 조회"""
    try:
        db = get_service_supabase()
        
        # 최신 분석 결과 조회
        result = db.table("leadership_analysis") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No analysis found for this user"
            )
        
        data = result.data[0]
        
        return LeadershipAnalysis(
            id=data["id"],
            user_id=data["user_id"],
            dimensions={
                "people": data["blake_mouton_people"],
                "production": data["blake_mouton_production"],
                "care": data["feedback_care"],
                "challenge": data["feedback_challenge"],
                "lmx_score": data["lmx_score"],
                "machiavellianism": data["influence_machiavellianism"],
                "narcissism": data["influence_narcissism"],
                "psychopathy": data["influence_psychopathy"],
            },
            leadership_style=data["leadership_style"],
            overall_risk_level=data["overall_risk_level"],
            strengths=data["ai_insights"].get("strengths", []),
            weaknesses=data["ai_insights"].get("weaknesses", []),
            improvement_areas=data["ai_insights"].get("improvements", []),
            ai_insights=data["ai_insights"],
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching analysis"
        )


@router.get("/history/{user_id}", response_model=List[LeadershipAnalysis])
async def get_analysis_history(
    user_id: str,
    limit: int = Query(10, ge=1, le=100)
):
    """사용자의 분석 이력 조회"""
    try:
        db = get_service_supabase()
        
        result = db.table("leadership_analysis") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        
        analyses = []
        for data in result.data:
            analyses.append(LeadershipAnalysis(
                id=data["id"],
                user_id=data["user_id"],
                dimensions={
                    "people": data["blake_mouton_people"],
                    "production": data["blake_mouton_production"],
                    "care": data["feedback_care"],
                    "challenge": data["feedback_challenge"],
                    "lmx_score": data["lmx_score"],
                    "machiavellianism": data["influence_machiavellianism"],
                    "narcissism": data["influence_narcissism"],
                    "psychopathy": data["influence_psychopathy"],
                },
                leadership_style=data["leadership_style"],
                overall_risk_level=data["overall_risk_level"],
                strengths=data["ai_insights"].get("strengths", []),
                weaknesses=data["ai_insights"].get("weaknesses", []),
                improvement_areas=data["ai_insights"].get("improvements", []),
                ai_insights=data["ai_insights"],
                created_at=datetime.fromisoformat(data["created_at"]),
                updated_at=datetime.fromisoformat(data["updated_at"])
            ))
        
        return analyses
        
    except Exception as e:
        logger.error(f"Error fetching analysis history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching analysis history"
        )


@router.post("/trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_user_analysis(request: AnalysisRequest):
    """분석 실행 트리거"""
    try:
        db = get_service_supabase()
        
        # 최신 설문 응답 가져오기
        response_result = db.table("survey_responses") \
            .select("responses") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not response_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No survey response found for this user"
            )
        
        responses = response_result.data[0]["responses"]
        
        # 분석 실행
        await trigger_analysis(request.user_id, responses)
        
        return {
            "status": "accepted",
            "message": "Analysis triggered successfully",
            "user_id": request.user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error triggering analysis"
        )


@router.get("/quick/{user_id}", response_model=QuickAnalysis)
async def get_quick_analysis(user_id: str):
    """빠른 분석 결과 (프론트엔드 표시용)"""
    try:
        # 전체 분석 결과 가져오기
        full_analysis = await get_user_analysis(user_id)
        
        # 핵심 강점 3개
        key_strengths = full_analysis.strengths[:3] if full_analysis.strengths else []
        
        # 실행 항목 3개
        action_items = full_analysis.improvement_areas[:3] if full_analysis.improvement_areas else []
        
        # 시각화 데이터
        viz_data = {
            "people": full_analysis.dimensions.people,
            "production": full_analysis.dimensions.production,
            "candor": (full_analysis.dimensions.care + full_analysis.dimensions.challenge) / 2,
            "lmx": full_analysis.dimensions.lmx_score,
            "influence": (
                full_analysis.dimensions.machiavellianism + 
                full_analysis.dimensions.narcissism + 
                full_analysis.dimensions.psychopathy
            ) / 3
        }
        
        return QuickAnalysis(
            leadership_style=full_analysis.leadership_style,
            risk_level=full_analysis.overall_risk_level,
            key_strengths=key_strengths,
            action_items=action_items,
            visualization_data=viz_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting quick analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting quick analysis"
        )


@router.get("/insights/{user_id}", response_model=List[AIInsight])
async def get_ai_insights(user_id: str):
    """AI 생성 인사이트 조회"""
    try:
        # 전체 분석 결과 가져오기
        full_analysis = await get_user_analysis(user_id)
        
        insights = []
        
        # 강점 기반 인사이트
        if full_analysis.strengths:
            insights.append(AIInsight(
                category="strengths",
                title="핵심 강점 활용",
                description=f"당신의 주요 강점: {', '.join(full_analysis.strengths[:2])}",
                recommendation="이러한 강점을 팀 전체에 확산시킬 방법을 고민해보세요.",
                priority=1,
                confidence=0.85
            ))
        
        # 개선 영역 인사이트
        if full_analysis.improvement_areas:
            insights.append(AIInsight(
                category="development",
                title="우선 개발 영역",
                description=f"집중할 영역: {full_analysis.improvement_areas[0]}",
                recommendation="이 영역의 개선을 위해 구체적인 실행 계획을 수립하세요.",
                priority=2,
                confidence=0.90
            ))
        
        # 리더십 스타일 인사이트
        style_desc = full_analysis.ai_insights.get("style_description", "")
        if style_desc:
            insights.append(AIInsight(
                category="style",
                title="리더십 스타일 최적화",
                description=style_desc,
                recommendation="현재 스타일의 장점은 유지하되, 상황에 따라 유연하게 조정하세요.",
                priority=3,
                confidence=0.80
            ))
        
        return insights
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting AI insights"
        )