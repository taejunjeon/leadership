"""
검증 API 테스트
헤파이스토스가 벼려낸 견고한 테스트 스위트
"""

from datetime import datetime
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import status
from httpx import AsyncClient

from app.main import app


# 테스트 데이터
def create_valid_survey_response():
    """유효한 설문 응답 생성"""
    responses = []
    dimensions = ["people", "production", "candor", "lmx"]
    questions_per_dimension = [8, 8, 8, 7]  # 총 31개

    question_id = 0
    for dim_idx, (dimension, count) in enumerate(
        zip(dimensions, questions_per_dimension, strict=False)
    ):
        for i in range(count):
            responses.append(
                {
                    "question_id": f"q{question_id}",
                    "value": ((question_id % 7) + 1),
                    "dimension": dimension,
                }
            )
            question_id += 1

    return {
        "leader_email": "test@example.com",
        "leader_name": "김테스트",
        "organization": "Test Corp",
        "department": "Engineering",
        "role": "Team Lead",
        "responses": responses,
        "completion_time_seconds": 300,
        "device_info": {"browser": "Chrome", "os": "MacOS"},
    }


@pytest.mark.asyncio
class TestValidationAPI:
    """검증 API 테스트"""

    async def test_validate_survey_success(self, async_client: AsyncClient):
        """정상적인 설문 검증 성공"""
        # Mock 인증
        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            response = await async_client.post(
                "/api/v1/validation/survey",
                json=create_valid_survey_response(),
                headers={"Authorization": "Bearer fake-token"},
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["is_valid"] == True
            assert data["completeness_score"] == 1.0
            assert "errors" in data
            assert "warnings" in data

    async def test_validate_survey_invalid_responses(self, async_client: AsyncClient):
        """잘못된 응답 개수로 검증 실패"""
        survey_data = create_valid_survey_response()
        # 응답 개수 줄이기
        survey_data["responses"] = survey_data["responses"][:20]

        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            response = await async_client.post(
                "/api/v1/validation/survey",
                json=survey_data,
                headers={"Authorization": "Bearer fake-token"},
            )

            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_validate_survey_outlier_detection(self, async_client: AsyncClient):
        """이상치 탐지 테스트"""
        survey_data = create_valid_survey_response()
        # 모든 응답을 7로 설정 (극단값)
        for resp in survey_data["responses"]:
            resp["value"] = 7

        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            response = await async_client.post(
                "/api/v1/validation/survey",
                json=survey_data,
                headers={"Authorization": "Bearer fake-token"},
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert len(data["outliers"]) > 0
            assert data["consistency_score"] < 1.0

    async def test_batch_validation_success(self, async_client: AsyncClient):
        """배치 검증 성공"""
        batch_data = [create_valid_survey_response() for _ in range(5)]

        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            response = await async_client.post(
                "/api/v1/validation/batch",
                json=batch_data,
                headers={"Authorization": "Bearer fake-token"},
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["total"] == 5
            assert "report_id" in data
            assert "results" in data

    async def test_batch_validation_size_limit(self, async_client: AsyncClient):
        """배치 크기 제한 테스트"""
        batch_data = [create_valid_survey_response() for _ in range(101)]

        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            response = await async_client.post(
                "/api/v1/validation/batch",
                json=batch_data,
                headers={"Authorization": "Bearer fake-token"},
            )

            assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_anomaly_detection_api(self, async_client: AsyncClient):
        """실시간 이상치 탐지 API"""
        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            # Mock Supabase RPC
            with patch("app.core.supabase.supabase_service.rpc") as mock_rpc:
                mock_rpc.return_value.execute.return_value.data = "Team Leadership"

                response = await async_client.get(
                    "/api/v1/validation/anomalies/detect",
                    params={
                        "people_score": 6.5,
                        "production_score": 6.0,
                        "candor_score": 5.5,
                        "lmx_score": 6.0,
                    },
                    headers={"Authorization": "Bearer fake-token"},
                )

                assert response.status_code == status.HTTP_200_OK
                data = response.json()
                assert "anomaly_score" in data
                assert "grade" in data
                assert "leadership_style" in data

    async def test_duplicate_response_detection(self, async_client: AsyncClient):
        """중복 응답 감지 테스트"""
        survey_data = create_valid_survey_response()

        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            # Mock Supabase 중복 확인
            with patch("app.core.supabase.supabase_service.table") as mock_table:
                # 기존 응답이 있는 것으로 설정
                mock_table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value.data = [
                    {
                        "id": "existing-id",
                        "created_at": datetime.now().isoformat(),
                        "raw_responses": {"response_hash": "same-hash"},
                    }
                ]

                # 동일한 해시를 생성하도록 설정
                with patch("hashlib.sha256") as mock_hash:
                    mock_hash.return_value.hexdigest.return_value = "same-hash"

                    response = await async_client.post(
                        "/api/v1/validation/survey",
                        json=survey_data,
                        headers={"Authorization": "Bearer fake-token"},
                    )

                    assert response.status_code == status.HTTP_200_OK
                    data = response.json()
                    assert data["is_valid"] == False
                    assert any(
                        "24시간 내 동일한 응답" in error for error in data["errors"]
                    )

    async def test_validation_caching(self, async_client: AsyncClient):
        """검증 결과 캐싱 테스트"""
        survey_data = create_valid_survey_response()

        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            # Mock Redis
            with patch("app.core.redis_client.get_redis_client") as mock_redis:
                mock_client = AsyncMock()
                mock_client.get.return_value = None  # 캐시 미스
                mock_client.setex.return_value = True
                mock_redis.return_value = mock_client

                response = await async_client.post(
                    "/api/v1/validation/survey",
                    json=survey_data,
                    headers={"Authorization": "Bearer fake-token"},
                )

                assert response.status_code == status.HTTP_200_OK
                # setex가 호출되었는지 확인
                mock_client.setex.assert_called_once()

    async def test_multilingual_messages(self, async_client: AsyncClient):
        """다국어 메시지 테스트"""
        with patch("app.middleware.auth.auth_middleware.get_current_user") as mock_auth:
            mock_auth.return_value = {
                "user_id": "test-user",
                "email": "test@example.com",
            }

            # 영어 요청
            response = await async_client.get(
                "/api/v1/validation/anomalies/detect",
                params={
                    "people_score": 0.5,  # 잘못된 범위
                    "production_score": 6.0,
                    "candor_score": 5.5,
                    "lmx_score": 6.0,
                    "lang": "en",
                },
                headers={"Authorization": "Bearer fake-token"},
            )

            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert "All scores must be between 1 and 7" in response.json()["detail"]


@pytest.fixture
async def async_client():
    """비동기 테스트 클라이언트"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
