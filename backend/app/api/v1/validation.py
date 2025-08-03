"""
검증 API 엔드포인트
헤파이스토스가 벼려낸 데이터 무결성 보장 API
"""

import asyncio
import hashlib
import json
from datetime import datetime
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.core.i18n import get_message
from app.core.redis_client import get_redis_client
from app.middleware.auth import auth_middleware
from app.schemas.survey import (
    DataValidationResult,
    SurveyResponseCreate,
)
from app.services.validation import validation_service
from app.utils.anomaly import AnomalyScore, anomaly_detector

router = APIRouter(
    prefix="/validation",
    tags=["validation"],
    responses={404: {"description": "Not found"}},
)

# 캐시 TTL (초)
CACHE_TTL = 300  # 5분


@router.post("/survey", response_model=DataValidationResult)
async def validate_survey_response(
    response: SurveyResponseCreate,
    background_tasks: BackgroundTasks,
    current_user: dict[str, Any] = Depends(auth_middleware.get_current_user),
    lang: str = "ko",
) -> DataValidationResult:
    """
    단일 설문 응답 검증

    - 실시간 검증 결과 반환
    - 비동기 심층 분석은 백그라운드 실행
    - 결과는 5분간 캐싱
    """
    try:
        # 캐시 키 생성
        cache_key = f"validation:{response.leader_email}:{hashlib.md5(
            json.dumps(response.dict(), sort_keys=True).encode()
        ).hexdigest()}"

        # Redis에서 캐시 확인
        redis_client = await get_redis_client()
        if redis_client:
            cached_result = await redis_client.get(cache_key)
            if cached_result:
                return DataValidationResult.parse_raw(cached_result)

        # 검증 실행
        result = await validation_service.validate_survey_response(response)

        # 이상치 탐지
        anomalies = anomaly_detector.detect_pattern_anomalies(
            people_score=response.people_score,
            production_score=response.production_score,
            candor_score=response.candor_score,
            lmx_score=response.lmx_score,
        )

        if anomalies:
            for anomaly in anomalies:
                result.outliers.append(
                    {
                        "dimension": anomaly.dimension,
                        "score": anomaly.score,
                        "reason": get_message(anomaly.reason, lang),
                        "severity": anomaly.severity,
                    }
                )

        # 캐싱
        if redis_client and result.is_valid:
            await redis_client.setex(cache_key, CACHE_TTL, result.json())

        # 백그라운드 심층 분석
        if not result.is_valid or result.outliers:
            background_tasks.add_task(
                deep_analysis, response, result, current_user["user_id"]
            )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"검증 중 오류 발생: {str(e)}",
        )


@router.post("/batch", response_model=dict[str, Any])
async def validate_batch_responses(
    responses: list[SurveyResponseCreate],
    background_tasks: BackgroundTasks,
    current_user: dict[str, Any] = Depends(auth_middleware.get_current_user),
    lang: str = "ko",
) -> dict[str, Any]:
    """
    배치 검증 (최대 100개)

    - 병렬 처리로 성능 최적화
    - 전체 통계 제공
    """
    if len(responses) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=get_message("배치 크기는 최대 100개입니다", lang),
        )

    # 병렬 검증 실행
    validation_tasks = [
        validation_service.validate_survey_response(response, check_duplicates=False)
        for response in responses
    ]

    results = await asyncio.gather(*validation_tasks, return_exceptions=True)

    # 결과 집계
    valid_count = 0
    invalid_count = 0
    error_count = 0
    validation_results = []

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            error_count += 1
            validation_results.append(
                {
                    "index": i,
                    "email": responses[i].leader_email,
                    "status": "error",
                    "error": str(result),
                }
            )
        else:
            if result.is_valid:
                valid_count += 1
                status_text = "valid"
            else:
                invalid_count += 1
                status_text = "invalid"

            validation_results.append(
                {
                    "index": i,
                    "email": responses[i].leader_email,
                    "status": status_text,
                    "validation": result.dict(),
                }
            )

    # 백그라운드에서 배치 리포트 생성
    report_id = str(uuid4())
    background_tasks.add_task(
        generate_batch_report, report_id, validation_results, current_user["user_id"]
    )

    return {
        "report_id": report_id,
        "total": len(responses),
        "valid": valid_count,
        "invalid": invalid_count,
        "errors": error_count,
        "success_rate": valid_count / len(responses) if len(responses) > 0 else 0,
        "results": validation_results,
    }


@router.get("/report/{report_id}")
async def get_validation_report(
    report_id: str,
    current_user: dict[str, Any] = Depends(auth_middleware.get_current_user),
) -> dict[str, Any]:
    """
    검증 리포트 조회

    - 배치 검증 결과 상세 조회
    - 시각화용 데이터 포함
    """
    redis_client = await get_redis_client()
    if not redis_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="캐시 서비스를 사용할 수 없습니다",
        )

    report_key = f"report:{report_id}"
    report_data = await redis_client.get(report_key)

    if not report_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="리포트를 찾을 수 없습니다"
        )

    report = json.loads(report_data)

    # 사용자 권한 확인
    if (
        report.get("user_id") != current_user["user_id"]
        and current_user.get("role") != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="리포트 접근 권한이 없습니다"
        )

    return report


@router.get("/anomalies/detect")
async def detect_anomalies(
    people_score: float,
    production_score: float,
    candor_score: float,
    lmx_score: float,
    current_user: dict[str, Any] = Depends(auth_middleware.get_current_user),
    lang: str = "ko",
) -> dict[str, Any]:
    """
    실시간 이상치 탐지

    - 입력값에 대한 즉시 분석
    - 패턴 기반 이상치 탐지
    """
    # 점수 범위 검증
    scores = [people_score, production_score, candor_score, lmx_score]
    if any(s < 1 or s > 7 for s in scores):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=get_message("모든 점수는 1-7 범위여야 합니다", lang),
        )

    # 패턴 이상치 탐지
    anomalies = anomaly_detector.detect_pattern_anomalies(
        people_score=people_score,
        production_score=production_score,
        candor_score=candor_score,
        lmx_score=lmx_score,
    )

    # 종합 점수 계산
    anomaly_score, grade = anomaly_detector.calculate_anomaly_score(anomalies)

    # 리더십 스타일 판별
    from app.core.supabase import supabase_service

    leadership_style = await supabase_service.rpc(
        "get_leadership_style",
        {"people_score": people_score, "production_score": production_score},
    ).execute()

    return {
        "anomaly_score": anomaly_score,
        "grade": get_message(grade, lang),
        "leadership_style": leadership_style.data if leadership_style else "Unknown",
        "anomalies": [
            {
                "dimension": a.dimension,
                "score": a.score,
                "reason": get_message(a.reason, lang),
                "severity": a.severity,
            }
            for a in anomalies
        ],
        "recommendations": generate_recommendations(anomalies, lang),
    }


# 백그라운드 태스크 함수들
async def deep_analysis(
    response: SurveyResponseCreate, initial_result: DataValidationResult, user_id: str
):
    """백그라운드 심층 분석"""
    # TODO: AI 기반 심층 분석 구현
    # - 응답 패턴 분석
    # - 조직 내 비교
    # - 개선 제안 생성
    pass


async def generate_batch_report(
    report_id: str, results: list[dict[str, Any]], user_id: str
):
    """배치 검증 리포트 생성"""
    redis_client = await get_redis_client()
    if not redis_client:
        return

    # 통계 계산
    total_valid = sum(1 for r in results if r["status"] == "valid")
    total_invalid = sum(1 for r in results if r["status"] == "invalid")

    # 차원별 평균 점수
    dimension_stats = {"people": [], "production": [], "candor": [], "lmx": []}

    for result in results:
        if result["status"] == "valid" and "validation" in result:
            validation = result["validation"]
            # 점수 수집 (실제 구현에서는 response 데이터에서 가져옴)

    report = {
        "report_id": report_id,
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "summary": {
            "total": len(results),
            "valid": total_valid,
            "invalid": total_invalid,
            "success_rate": total_valid / len(results) if results else 0,
        },
        "results": results,
        "dimension_stats": dimension_stats,
    }

    # 24시간 동안 캐싱
    await redis_client.setex(f"report:{report_id}", 86400, json.dumps(report))


def generate_recommendations(anomalies: list[AnomalyScore], lang: str) -> list[str]:
    """이상치 기반 권장사항 생성"""
    recommendations = []

    for anomaly in anomalies:
        if anomaly.dimension == "people_vs_production" and anomaly.severity == "high":
            recommendations.append(
                get_message(
                    "People과 Production 점수의 균형을 맞추는 것이 중요합니다", lang
                )
            )
        elif anomaly.dimension == "all_high":
            recommendations.append(
                get_message(
                    "모든 영역에서 높은 점수는 현실적이지 않을 수 있습니다. 솔직한 자기평가가 필요합니다",
                    lang,
                )
            )
        elif anomaly.dimension == "candor_lmx_conflict":
            recommendations.append(
                get_message(
                    "높은 솔직함과 낮은 관계 품질의 조합은 개선이 필요합니다", lang
                )
            )

    return recommendations[:3]  # 최대 3개 권장사항
