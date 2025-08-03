"""
AI Leadership 4Dx - Survey Schemas
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class QuestionCategory(str, Enum):
    """설문 질문 카테고리"""

    BLAKE_MOUTON = "blake_mouton"
    RADICAL_CANDOR = "radical_candor"
    LMX = "lmx"
    INFLUENCE_GAUGE = "influence_gauge"


class ResponseValue(BaseModel):
    """개별 응답 값"""

    question_id: str
    value: int = Field(..., ge=1, le=7)  # 1-7 척도


class SurveySubmission(BaseModel):
    """설문 제출 데이터"""

    user_id: str | None = None
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    organization: str | None = Field(None, max_length=100)
    department: str | None = Field(None, max_length=100)
    position: str | None = Field(None, max_length=100)
    responses: list[ResponseValue]
    completion_time_seconds: int | None = None
    device_info: dict[str, Any] | None = None


class SurveyResponse(BaseModel):
    """설문 응답 결과"""

    id: str
    user_id: str
    responses: dict[str, int]
    completion_time_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True


class SurveyStats(BaseModel):
    """설문 통계"""

    total_responses: int
    average_completion_time: float
    response_rate: float
    last_response_at: datetime | None = None
