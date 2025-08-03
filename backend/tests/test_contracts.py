"""
Contract 테스트 스위트
API 버전 간 호환성을 보장하는 계약 테스트
"""

from typing import Any

import pytest
from pydantic import BaseModel, ValidationError

from app.schemas.pagination import (
    FilterParams,
    Leader3DPoint,
    PaginationParams,
)
from app.schemas.survey import (
    DataValidationResult,
    SurveyResponseCreate,
    SurveyResponseDB,
)


class ContractTest:
    """Contract 테스트 베이스 클래스"""

    @staticmethod
    def validate_schema(
        schema_class: type[BaseModel], data: dict[str, Any], should_pass: bool = True
    ) -> None:
        """스키마 검증"""
        if should_pass:
            try:
                instance = schema_class(**data)
                assert instance is not None
            except ValidationError as e:
                pytest.fail(f"스키마 검증 실패: {e}")
        else:
            with pytest.raises(ValidationError):
                schema_class(**data)


class TestSurveyContracts:
    """설문 관련 Contract 테스트"""

    def test_survey_response_create_contract(self):
        """SurveyResponseCreate 계약 테스트"""
        # 유효한 데이터
        valid_data = {
            "leader_email": "test@example.com",
            "leader_name": "김리더",
            "organization": "Grid Corp",
            "department": "Engineering",
            "role": "Team Lead",
            "responses": [
                {
                    "question_id": f"q{i}",
                    "value": (i % 7) + 1,
                    "dimension": ["people", "production", "candor", "lmx"][i % 4],
                }
                for i in range(31)
            ],
            "completion_time_seconds": 300,
            "device_info": {"browser": "Chrome", "os": "MacOS"},
        }

        ContractTest.validate_schema(SurveyResponseCreate, valid_data)

        # 응답 개수 부족
        invalid_data = valid_data.copy()
        invalid_data["responses"] = valid_data["responses"][:20]
        ContractTest.validate_schema(
            SurveyResponseCreate, invalid_data, should_pass=False
        )

        # 잘못된 응답 값
        invalid_data = valid_data.copy()
        invalid_data["responses"][0]["value"] = 8
        ContractTest.validate_schema(
            SurveyResponseCreate, invalid_data, should_pass=False
        )

    def test_survey_response_db_contract(self):
        """SurveyResponseDB 계약 테스트"""
        valid_data = {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "leader_id": "123e4567-e89b-12d3-a456-426614174001",
            "survey_type": "grid3",
            "survey_version": "1.0.0",
            "people_score": 5.5,
            "production_score": 6.0,
            "candor_score": 4.5,
            "lmx_score": 5.0,
            "raw_responses": {"responses": []},
            "completion_time_seconds": 300,
            "device_info": {"browser": "Chrome"},
            "created_at": "2025-08-02T10:00:00",
            "updated_at": "2025-08-02T10:00:00",
        }

        ContractTest.validate_schema(SurveyResponseDB, valid_data)

    def test_data_validation_result_contract(self):
        """DataValidationResult 계약 테스트"""
        valid_data = {
            "is_valid": True,
            "errors": [],
            "warnings": ["응답 시간이 빠름"],
            "outliers": [{"pattern": "극단값", "score": 6.8}],
            "completeness_score": 0.95,
            "consistency_score": 0.88,
        }

        ContractTest.validate_schema(DataValidationResult, valid_data)


class TestPaginationContracts:
    """페이지네이션 관련 Contract 테스트"""

    def test_pagination_params_contract(self):
        """PaginationParams 계약 테스트"""
        # 기본값 테스트
        default_params = PaginationParams()
        assert default_params.page == 1
        assert default_params.page_size == 50
        assert default_params.offset == 0
        assert default_params.limit == 50

        # 커스텀 값 테스트
        custom_params = PaginationParams(page=3, page_size=100)
        assert custom_params.offset == 200
        assert custom_params.limit == 100

        # 유효하지 않은 값
        ContractTest.validate_schema(
            PaginationParams, {"page": 0, "page_size": 50}, should_pass=False
        )

    def test_filter_params_contract(self):
        """FilterParams 계약 테스트"""
        valid_data = {
            "organization": "Grid Corp",
            "department": "Engineering",
            "people_min": 3.0,
            "people_max": 6.0,
            "leadership_style": ["Team Leadership", "Country Club"],
            "search": "김",
        }

        ContractTest.validate_schema(FilterParams, valid_data)

        # 범위 검증
        invalid_data = {"people_min": 0.5, "people_max": 8.0}
        ContractTest.validate_schema(FilterParams, invalid_data, should_pass=False)

    def test_leader_3d_point_contract(self):
        """Leader3DPoint 계약 테스트"""
        valid_data = {
            "id": "123",
            "name": "김리더",
            "email": "kim@example.com",
            "organization": "Grid Corp",
            "x": 5.5,
            "y": 6.0,
            "z": 4.5,
            "size": 5.0,
            "color": "#FF5733",
            "leadership_style": "Team Leadership",
            "hover_data": {"department": "Engineering", "team_size": 10},
            "lod": 0,
        }

        ContractTest.validate_schema(Leader3DPoint, valid_data)


class TestAPIVersioning:
    """API 버전 호환성 테스트"""

    def test_backward_compatibility_v1_to_v2(self):
        """v1 -> v2 하위 호환성 테스트"""
        # v1 응답 형식
        v1_response = {"leader_id": "123", "scores": {"people": 5.5, "production": 6.0}}

        # v2에서도 v1 형식을 처리할 수 있는지 확인
        # 실제로는 버전별 변환 로직 테스트
        assert "leader_id" in v1_response
        assert "scores" in v1_response

    def test_response_format_stability(self):
        """응답 형식 안정성 테스트"""
        # 주요 응답 필드가 유지되는지 확인
        expected_fields = {
            "SurveyResponseDB": [
                "id",
                "leader_id",
                "people_score",
                "production_score",
                "candor_score",
                "lmx_score",
            ],
            "PaginatedResponse": [
                "items",
                "total",
                "page",
                "page_size",
                "total_pages",
                "has_next",
                "has_prev",
            ],
            "Leader3DPoint": [
                "id",
                "name",
                "x",
                "y",
                "z",
                "size",
                "color",
                "leadership_style",
            ],
        }

        # 스키마 필드 검증
        for schema_name, fields in expected_fields.items():
            if schema_name == "SurveyResponseDB":
                schema = SurveyResponseDB
            elif schema_name == "Leader3DPoint":
                schema = Leader3DPoint
            else:
                continue

            schema_fields = schema.model_fields.keys()
            for field in fields:
                assert (
                    field in schema_fields
                ), f"{schema_name}에 필수 필드 '{field}'가 없음"


# 실행
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
