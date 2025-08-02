"""
AI Leadership 4Dx - Reports API
"""

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import FileResponse
from typing import Optional, List
from datetime import datetime, timedelta
import os
import tempfile
from ..schemas.analysis import LeadershipAnalysis
from ..core.database import get_service_supabase
from ..services.report_generator import ReportGenerator
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/pdf/{user_id}")
async def generate_pdf_report(
    user_id: str,
    analysis_id: Optional[str] = None
):
    """PDF 보고서 생성"""
    try:
        db = get_service_supabase()
        
        # 분석 결과 조회
        query = db.table("leadership_analysis").select("*").eq("user_id", user_id)
        
        if analysis_id:
            query = query.eq("id", analysis_id)
        else:
            query = query.order("created_at", desc=True).limit(1)
        
        result = query.execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No analysis found"
            )
        
        analysis_data = result.data[0]
        
        # 사용자 정보 조회
        user_result = db.table("users").select("*").eq("id", user_id).single().execute()
        user_data = user_result.data
        
        # PDF 생성
        generator = ReportGenerator()
        pdf_path = generator.generate_pdf(user_data, analysis_data)
        
        # 파일 응답
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"leadership_report_{user_data['name']}_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate PDF report"
        )


@router.get("/summary/{user_id}")
async def get_report_summary(user_id: str):
    """보고서 요약 조회"""
    try:
        db = get_service_supabase()
        
        # 최신 분석 결과
        analysis_result = db.table("leadership_analysis") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not analysis_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No analysis found"
            )
        
        analysis = analysis_result.data[0]
        
        # 과거 분석과 비교
        past_date = datetime.now() - timedelta(days=90)
        history_result = db.table("leadership_analysis") \
            .select("blake_mouton_people,blake_mouton_production,lmx_score,created_at") \
            .eq("user_id", user_id) \
            .gte("created_at", past_date.isoformat()) \
            .order("created_at") \
            .execute()
        
        # 트렌드 계산
        trend = {
            "people": _calculate_trend([h["blake_mouton_people"] for h in history_result.data]),
            "production": _calculate_trend([h["blake_mouton_production"] for h in history_result.data]),
            "lmx": _calculate_trend([h["lmx_score"] for h in history_result.data])
        }
        
        # 동료 비교 (익명화)
        peer_result = db.table("leadership_analysis") \
            .select("leadership_style") \
            .neq("user_id", user_id) \
            .execute()
        
        style_distribution = {}
        for peer in peer_result.data:
            style = peer["leadership_style"]
            style_distribution[style] = style_distribution.get(style, 0) + 1
        
        total_peers = len(peer_result.data)
        style_percentile = {}
        for style, count in style_distribution.items():
            style_percentile[style] = (count / total_peers * 100) if total_peers > 0 else 0
        
        return {
            "current_analysis": {
                "leadership_style": analysis["leadership_style"],
                "risk_level": analysis["overall_risk_level"],
                "scores": {
                    "people": analysis["blake_mouton_people"],
                    "production": analysis["blake_mouton_production"],
                    "lmx": analysis["lmx_score"]
                }
            },
            "trends": trend,
            "peer_comparison": {
                "your_style": analysis["leadership_style"],
                "style_distribution": style_percentile,
                "total_peers": total_peers
            },
            "key_insights": analysis["ai_insights"].get("strengths", [])[:3],
            "development_focus": analysis["ai_insights"].get("improvements", [])[:3]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Report summary error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate report summary"
        )


@router.get("/team/{organization}")
async def get_team_report(
    organization: str,
    department: Optional[str] = None
):
    """팀/조직 보고서"""
    try:
        db = get_service_supabase()
        
        # 팀원 조회
        user_query = db.table("users").select("id").eq("organization", organization)
        if department:
            user_query = user_query.eq("department", department)
        
        users_result = user_query.execute()
        user_ids = [u["id"] for u in users_result.data]
        
        if not user_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found in this organization"
            )
        
        # 팀 분석 데이터 조회
        analyses_result = db.table("leadership_analysis") \
            .select("*") \
            .in_("user_id", user_ids) \
            .execute()
        
        # 통계 계산
        styles = {}
        risks = {"low": 0, "medium": 0, "high": 0}
        avg_scores = {"people": 0, "production": 0, "lmx": 0}
        
        for analysis in analyses_result.data:
            # 스타일 분포
            style = analysis["leadership_style"]
            styles[style] = styles.get(style, 0) + 1
            
            # 위험도 분포
            risk = analysis["overall_risk_level"]
            risks[risk] += 1
            
            # 평균 점수
            avg_scores["people"] += analysis["blake_mouton_people"]
            avg_scores["production"] += analysis["blake_mouton_production"]
            avg_scores["lmx"] += analysis["lmx_score"]
        
        total_analyses = len(analyses_result.data)
        if total_analyses > 0:
            avg_scores = {k: v / total_analyses for k, v in avg_scores.items()}
        
        return {
            "organization": organization,
            "department": department,
            "total_members": len(user_ids),
            "analyzed_members": total_analyses,
            "style_distribution": styles,
            "risk_distribution": risks,
            "average_scores": avg_scores,
            "team_health": _assess_team_health(avg_scores, risks),
            "recommendations": _generate_team_recommendations(styles, risks, avg_scores)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Team report error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate team report"
        )


def _calculate_trend(values: List[float]) -> str:
    """트렌드 계산"""
    if len(values) < 2:
        return "stable"
    
    # 선형 회귀로 트렌드 계산
    import numpy as np
    x = np.arange(len(values))
    if len(values) > 0:
        slope = np.polyfit(x, values, 1)[0]
        
        if slope > 0.1:
            return "improving"
        elif slope < -0.1:
            return "declining"
    
    return "stable"


def _assess_team_health(avg_scores: dict, risks: dict) -> str:
    """팀 건강도 평가"""
    # 평균 점수가 5 이상이고 고위험이 20% 미만이면 건강
    avg = sum(avg_scores.values()) / len(avg_scores)
    total_risks = sum(risks.values())
    high_risk_ratio = risks["high"] / total_risks if total_risks > 0 else 0
    
    if avg >= 5.0 and high_risk_ratio < 0.2:
        return "excellent"
    elif avg >= 4.0 and high_risk_ratio < 0.3:
        return "good"
    elif avg >= 3.0 and high_risk_ratio < 0.5:
        return "moderate"
    else:
        return "needs_attention"


def _generate_team_recommendations(styles: dict, risks: dict, avg_scores: dict) -> List[str]:
    """팀 개선 제안 생성"""
    recommendations = []
    
    # 스타일 다양성 부족
    if len(styles) < 3:
        recommendations.append("리더십 스타일 다양성을 높이기 위한 교육 프로그램 도입")
    
    # 고위험 비율이 높음
    total_risks = sum(risks.values())
    if total_risks > 0 and risks["high"] / total_risks > 0.3:
        recommendations.append("고위험군 구성원을 위한 집중 코칭 프로그램 실시")
    
    # 낮은 평균 점수
    if avg_scores["people"] < 4.0:
        recommendations.append("팀 빌딩 활동을 통한 관계 개선")
    if avg_scores["production"] < 4.0:
        recommendations.append("목표 설정 및 성과 관리 체계 강화")
    if avg_scores["lmx"] < 4.0:
        recommendations.append("리더-구성원 간 신뢰 구축 워크샵")
    
    return recommendations[:5]  # 최대 5개