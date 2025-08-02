"""
AI Leadership 4Dx - Survey API
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Dict, Optional
import json
from uuid import uuid4
from datetime import datetime
from ..schemas.survey import SurveySubmission, SurveyResponse, SurveyStats
from ..core.database import get_service_supabase
from ..services.analysis import trigger_analysis

router = APIRouter()


@router.post("/submit", response_model=SurveyResponse)
async def submit_survey(
    submission: SurveySubmission,
    ai_provider: Optional[str] = Query(None, description="AI provider to use for analysis (openai or anthropic)")
):
    """설문 응답 제출"""
    try:
        db = get_service_supabase()
        
        # 사용자 확인 또는 생성
        user_id = submission.user_id
        if not user_id:
            # 이메일로 사용자 검색
            user_result = db.table("users").select("*").eq("email", submission.email).execute()
            
            if user_result.data:
                user_id = user_result.data[0]["id"]
            else:
                # 새 사용자 생성
                new_user = {
                    "id": str(uuid4()),
                    "email": submission.email,
                    "name": submission.name,
                    "organization": submission.organization,
                    "department": submission.department,
                    "position": submission.position,
                    "role": "user",
                }
                user_result = db.table("users").insert(new_user).execute()
                user_id = user_result.data[0]["id"]
        
        # 응답 데이터 변환
        responses_dict = {r.question_id: r.value for r in submission.responses}
        
        # 설문 응답 저장
        survey_data = {
            "id": str(uuid4()),
            "user_id": user_id,
            "responses": responses_dict,
            "completion_time_seconds": submission.completion_time_seconds or 0,
            "device_info": submission.device_info,
        }
        
        result = db.table("survey_responses").insert(survey_data).execute()
        
        if result.data:
            response_data = result.data[0]
            
            # 비동기 분석 트리거 (AI provider 지정 가능)
            await trigger_analysis(user_id, responses_dict, ai_provider)
            
            return SurveyResponse(
                id=response_data["id"],
                user_id=response_data["user_id"],
                responses=response_data["responses"],
                completion_time_seconds=response_data["completion_time_seconds"],
                created_at=datetime.fromisoformat(response_data["created_at"])
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save survey response"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting survey: {str(e)}"
        )


@router.get("/responses/{user_id}", response_model=List[SurveyResponse])
async def get_user_responses(user_id: str):
    """사용자의 설문 응답 목록 조회"""
    try:
        db = get_service_supabase()
        result = db.table("survey_responses").select("*").eq("user_id", user_id).execute()
        
        return [
            SurveyResponse(
                id=r["id"],
                user_id=r["user_id"],
                responses=r["responses"],
                completion_time_seconds=r["completion_time_seconds"],
                created_at=datetime.fromisoformat(r["created_at"])
            )
            for r in result.data
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching responses: {str(e)}"
        )


@router.get("/stats", response_model=SurveyStats)
async def get_survey_stats():
    """설문 통계 조회"""
    try:
        db = get_service_supabase()
        
        # 전체 응답 수
        total_result = db.table("survey_responses").select("id", count="exact").execute()
        total_responses = total_result.count or 0
        
        # 평균 완료 시간
        time_result = db.table("survey_responses").select("completion_time_seconds").execute()
        if time_result.data:
            times = [r["completion_time_seconds"] for r in time_result.data if r["completion_time_seconds"]]
            avg_time = sum(times) / len(times) if times else 0
        else:
            avg_time = 0
        
        # 마지막 응답 시간
        last_result = db.table("survey_responses").select("created_at").order("created_at", desc=True).limit(1).execute()
        last_response_at = None
        if last_result.data:
            last_response_at = datetime.fromisoformat(last_result.data[0]["created_at"])
        
        # 응답률 계산 (전체 사용자 대비)
        users_result = db.table("users").select("id", count="exact").execute()
        total_users = users_result.count or 1
        response_rate = (total_responses / total_users) * 100 if total_users > 0 else 0
        
        return SurveyStats(
            total_responses=total_responses,
            average_completion_time=avg_time,
            response_rate=response_rate,
            last_response_at=last_response_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching stats: {str(e)}"
        )


@router.get("/questions")
async def get_survey_questions():
    """설문 질문 목록 조회"""
    # 실제로는 DB나 설정 파일에서 읽어와야 하지만, 
    # 현재는 프론트엔드의 surveyQuestions.ts와 동일한 데이터를 반환
    return {
        "total": 43,
        "categories": {
            "blake_mouton": 14,
            "radical_candor": 10,
            "lmx": 10,
            "influence_gauge": 9
        },
        "message": "Questions are defined in frontend/data/surveyQuestions.ts"
    }