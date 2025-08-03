"""
AI Leadership 4Dx - AI Schemas
"""

from enum import Enum

from pydantic import BaseModel, Field


class AIProviderEnum(str, Enum):
    """AI Provider 선택"""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class AIProviderInfo(BaseModel):
    """AI Provider 정보"""

    provider: AIProviderEnum
    model: str
    name: str
    description: str


class AIAnalysisRequest(BaseModel):
    """AI 분석 요청"""

    user_id: str
    ai_provider: AIProviderEnum | None = None
    force_refresh: bool = False
    context: str | None = Field(None, description="조직 맥락 정보")


class AIInsightResponse(BaseModel):
    """AI 인사이트 응답"""

    strengths: list[str]
    improvements: list[str]
    action_plans: list[str]
    expected_outcomes: str
    ai_provider: str
    ai_model: str
    confidence_score: float | None = Field(None, ge=0.0, le=1.0)
