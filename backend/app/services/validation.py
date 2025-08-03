"""
데이터 검증 서비스
헤파이스토스가 벼려낸 무결성 보장 도구
"""

import hashlib
from datetime import datetime, timedelta
from typing import Any

import numpy as np

from app.core.supabase import SURVEY_RESPONSES_TABLE, supabase_service
from app.schemas.survey import DataValidationResult, DimensionType, SurveyResponseCreate


class DataValidationService:
    """설문 데이터 검증 서비스"""

    def __init__(self):
        # 차원별 예상 질문 수
        self.expected_counts = {
            DimensionType.PEOPLE: 8,  # Blake-Mouton People
            DimensionType.PRODUCTION: 8,  # Blake-Mouton Production
            DimensionType.CANDOR: 8,  # Radical Candor (4 care + 4 challenge)
            DimensionType.LMX: 7,  # LMX-7
        }

        # 이상치 탐지 임계값
        self.outlier_threshold = 2.5  # 표준편차

    async def validate_survey_response(
        self, response: SurveyResponseCreate, check_duplicates: bool = True
    ) -> DataValidationResult:
        """설문 응답 전체 검증"""
        result = DataValidationResult(
            is_valid=True, completeness_score=1.0, consistency_score=1.0
        )

        # 1. 기본 검증
        self._validate_basic_fields(response, result)

        # 2. 응답 완전성 검증
        self._validate_response_completeness(response, result)

        # 3. 응답 일관성 검증
        self._validate_response_consistency(response, result)

        # 4. 이상치 탐지
        self._detect_outliers(response, result)

        # 5. 시간 기반 검증
        self._validate_completion_time(response, result)

        # 6. 중복 응답 검증
        if check_duplicates:
            await self._check_duplicate_response(response, result)

        return result

    def _validate_basic_fields(
        self, response: SurveyResponseCreate, result: DataValidationResult
    ):
        """기본 필드 검증"""
        # 이메일 형식
        if "@" not in response.leader_email:
            result.add_error("올바른 이메일 형식이 아니오!")

        # 이름 길이
        if len(response.leader_name) < 2:
            result.add_error("이름이 너무 짧소!")
        elif len(response.leader_name) > 100:
            result.add_error("이름이 너무 길소!")

    def _validate_response_completeness(
        self, response: SurveyResponseCreate, result: DataValidationResult
    ):
        """응답 완전성 검증"""
        # 차원별 응답 수 계산
        dimension_counts = {}
        for resp in response.responses:
            dim = resp.dimension
            dimension_counts[dim] = dimension_counts.get(dim, 0) + 1

        # 예상 개수와 비교
        missing_dimensions = []
        for dim, expected in self.expected_counts.items():
            actual = dimension_counts.get(dim, 0)
            if actual != expected:
                missing_dimensions.append(
                    f"{dim.value}: 예상 {expected}개, 실제 {actual}개"
                )

        if missing_dimensions:
            result.add_error(f"응답 개수 불일치: {', '.join(missing_dimensions)}")
            result.completeness_score = len(dimension_counts) / len(
                self.expected_counts
            )

    def _validate_response_consistency(
        self, response: SurveyResponseCreate, result: DataValidationResult
    ):
        """응답 일관성 검증"""
        # 차원별 응답 수집
        dimension_values = {}
        for resp in response.responses:
            dim = resp.dimension
            if dim not in dimension_values:
                dimension_values[dim] = []
            dimension_values[dim].append(resp.value)

        # 각 차원의 표준편차 확인
        high_variance_dims = []
        for dim, values in dimension_values.items():
            if len(values) > 1:
                std_dev = np.std(values)
                if std_dev > 2.5:  # 높은 변동성
                    high_variance_dims.append(f"{dim.value} (표준편차: {std_dev:.2f})")

        if high_variance_dims:
            result.add_warning(f"높은 응답 변동성: {', '.join(high_variance_dims)}")
            result.consistency_score = max(0.5, 1 - len(high_variance_dims) * 0.1)

        # 모든 응답이 같은 값인지 확인 (성의없는 응답)
        all_values = [resp.value for resp in response.responses]
        if len(set(all_values)) == 1:
            result.add_error("모든 응답이 동일한 값이오! 성의있는 응답이 아닌 것 같소.")
            result.consistency_score = 0.1

    def _detect_outliers(
        self, response: SurveyResponseCreate, result: DataValidationResult
    ):
        """이상치 탐지"""
        # 차원별 점수 계산
        dimension_scores = {}
        for resp in response.responses:
            dim = resp.dimension
            if dim not in dimension_scores:
                dimension_scores[dim] = []
            dimension_scores[dim].append(resp.value)

        # 각 차원의 평균 계산
        avg_scores = {}
        for dim, scores in dimension_scores.items():
            avg_scores[dim] = np.mean(scores)

        # 극단적인 점수 조합 탐지
        people_avg = avg_scores.get(DimensionType.PEOPLE, 4)
        production_avg = avg_scores.get(DimensionType.PRODUCTION, 4)
        candor_avg = avg_scores.get(DimensionType.CANDOR, 4)
        lmx_avg = avg_scores.get(DimensionType.LMX, 4)

        # 이상 패턴 탐지
        outlier_patterns = []

        # 패턴 1: 극단적으로 높거나 낮은 모든 점수
        if all(score > 6.5 for score in avg_scores.values()):
            outlier_patterns.append(
                {"pattern": "모든 점수가 매우 높음", "scores": avg_scores}
            )
        elif all(score < 1.5 for score in avg_scores.values()):
            outlier_patterns.append(
                {"pattern": "모든 점수가 매우 낮음", "scores": avg_scores}
            )

        # 패턴 2: 상반된 차원 점수
        if abs(people_avg - production_avg) > 5:
            outlier_patterns.append(
                {
                    "pattern": "People vs Production 극단적 차이",
                    "people": people_avg,
                    "production": production_avg,
                }
            )

        if outlier_patterns:
            result.outliers = outlier_patterns
            result.add_warning("이상 패턴이 감지되었소. 검토가 필요하오.")

    def _validate_completion_time(
        self, response: SurveyResponseCreate, result: DataValidationResult
    ):
        """완료 시간 검증"""
        if response.completion_time_seconds:
            # 너무 빠른 완료 (1분 미만)
            if response.completion_time_seconds < 60:
                result.add_warning(
                    f"매우 빠른 완료 시간: {response.completion_time_seconds}초"
                )

            # 너무 느린 완료 (30분 초과)
            elif response.completion_time_seconds > 1800:
                result.add_warning(
                    f"매우 느린 완료 시간: {response.completion_time_seconds//60}분"
                )

    async def _check_duplicate_response(
        self, response: SurveyResponseCreate, result: DataValidationResult
    ):
        """중복 응답 검증"""
        # 응답 해시 생성 (이메일 + 응답 내용)
        response_data = f"{response.leader_email}:{','.join(str(r.value) for r in response.responses)}"
        response_hash = hashlib.sha256(response_data.encode()).hexdigest()

        # 최근 24시간 내 동일 이메일의 응답 확인
        try:
            # Supabase에서 중복 확인
            existing = (
                supabase_service.table(SURVEY_RESPONSES_TABLE)
                .select("id, created_at, raw_responses")
                .eq(
                    "leader_id",
                    response.leader_email,  # 실제로는 leader_id로 조회해야 함
                )
                .gte("created_at", (datetime.now() - timedelta(hours=24)).isoformat())
                .execute()
            )

            if existing.data:
                # 동일한 응답 패턴 확인
                for record in existing.data:
                    if record.get("raw_responses"):
                        # 해시 비교로 완전히 동일한 응답인지 확인
                        existing_hash = record["raw_responses"].get("response_hash")
                        if existing_hash == response_hash:
                            result.add_error(
                                f"24시간 내 동일한 응답이 이미 제출되었소! "
                                f"(제출 시간: {record['created_at']})"
                            )
                            return

                # 너무 빈번한 응답 경고
                if len(existing.data) >= 3:
                    result.add_warning(
                        f"24시간 내 {len(existing.data)}번의 응답이 제출되었소. "
                        "너무 빈번한 응답이오."
                    )
        except Exception as e:
            # DB 연결 실패 시 경고만
            result.add_warning(f"중복 응답 확인 실패: {str(e)}")

    async def validate_batch_responses(
        self, responses: list[SurveyResponseCreate]
    ) -> dict[str, Any]:
        """배치 응답 검증"""
        results = []
        for response in responses:
            validation_result = await self.validate_survey_response(response)
            results.append(
                {"email": response.leader_email, "validation": validation_result}
            )

        # 전체 통계
        total = len(results)
        valid = sum(1 for r in results if r["validation"].is_valid)

        return {
            "total_responses": total,
            "valid_responses": valid,
            "invalid_responses": total - valid,
            "success_rate": valid / total if total > 0 else 0,
            "details": results,
        }


# 싱글톤 인스턴스
validation_service = DataValidationService()
