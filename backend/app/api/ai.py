"""
AI Leadership 4Dx - AI Provider API
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from ..schemas.ai import AIProviderInfo, AIAnalysisRequest, AIInsightResponse
from ..services.ai_client import AIClientFactory, get_ai_client
from ..services.analysis import trigger_analysis
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/providers", response_model=List[AIProviderInfo])
async def get_available_providers():
    """사용 가능한 AI Provider 목록 조회"""
    try:
        providers = AIClientFactory.get_available_providers()
        
        if not providers:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No AI providers available. Please check API key configuration."
            )
        
        return providers
        
    except Exception as e:
        logger.error(f"Error getting AI providers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get AI providers"
        )


@router.post("/analyze", response_model=AIInsightResponse)
async def analyze_with_ai(request: AIAnalysisRequest):
    """선택한 AI Provider로 리더십 분석 실행"""
    try:
        # 사용자의 최신 설문 응답 가져오기
        from ..core.database import get_service_supabase
        db = get_service_supabase()
        
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
        
        # AI 분석 실행
        await trigger_analysis(
            request.user_id, 
            responses,
            ai_provider=request.ai_provider
        )
        
        # 분석 결과 조회
        analysis_result = db.table("leadership_analysis") \
            .select("*") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not analysis_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Analysis failed"
            )
        
        ai_insights = analysis_result.data[0]["ai_insights"]
        
        return AIInsightResponse(
            strengths=ai_insights.get("strengths", []),
            improvements=ai_insights.get("improvements", []),
            action_plans=ai_insights.get("development_plan", []),
            expected_outcomes=ai_insights.get("ai_insights", {}).get("expected_outcomes", ""),
            ai_provider=ai_insights.get("ai_provider", "unknown"),
            ai_model=ai_insights.get("ai_model", "unknown")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI analysis error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.post("/compare")
async def compare_ai_providers(request: AIAnalysisRequest):
    """두 AI Provider의 분석 결과 비교"""
    try:
        providers = AIClientFactory.get_available_providers()
        
        if len(providers) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Need at least 2 AI providers for comparison"
            )
        
        # 각 Provider로 분석 실행
        results = {}
        
        for provider_info in providers:
            provider = provider_info["provider"]
            try:
                # AI 클라이언트 생성
                ai_client = await get_ai_client(provider)
                
                # 사용자 데이터 준비 (실제로는 DB에서 가져와야 함)
                from ..core.database import get_service_supabase
                db = get_service_supabase()
                
                # 최신 분석 결과 가져오기
                analysis_result = db.table("leadership_analysis") \
                    .select("*") \
                    .eq("user_id", request.user_id) \
                    .order("created_at", desc=True) \
                    .limit(1) \
                    .execute()
                
                if analysis_result.data:
                    data = {
                        'people': analysis_result.data[0]["blake_mouton_people"],
                        'production': analysis_result.data[0]["blake_mouton_production"],
                        'care': analysis_result.data[0]["feedback_care"],
                        'challenge': analysis_result.data[0]["feedback_challenge"],
                        'lmx': analysis_result.data[0]["lmx_score"],
                        'style': analysis_result.data[0]["leadership_style"],
                        'context': request.context or "일반 기업 환경"
                    }
                    
                    # AI 분석 실행
                    result = await ai_client.analyze_leadership(data)
                    results[provider] = result
                
            except Exception as e:
                logger.error(f"Error with {provider}: {str(e)}")
                results[provider] = {"error": str(e)}
        
        return {
            "comparison": results,
            "recommendation": "각 AI의 분석 결과를 비교하여 가장 적합한 인사이트를 선택하세요."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Comparison error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare AI providers"
        )