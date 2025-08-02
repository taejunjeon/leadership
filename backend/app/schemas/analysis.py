"""
AI Leadership 4Dx - Analysis Schemas
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """위험도 수준"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class LeadershipStyle(str, Enum):
    """리더십 스타일 분류"""
    IMPOVERISHED = "Impoverished"  # 1,1
    COUNTRY_CLUB = "Country Club"  # 1,9
    AUTHORITY_COMPLIANCE = "Authority-Compliance"  # 9,1
    MIDDLE_OF_THE_ROAD = "Middle-of-the-Road"  # 5,5
    TEAM_LEADER = "Team Leader"  # 9,9
    TASK_MANAGER = "Task Manager"  # Custom
    CUSTOM = "Custom"


class LeadershipDimensions(BaseModel):
    """리더십 차원 점수"""
    # Blake & Mouton Grid
    people: float = Field(..., ge=1.0, le=7.0)
    production: float = Field(..., ge=1.0, le=7.0)
    
    # Radical Candor
    care: float = Field(..., ge=1.0, le=7.0)
    challenge: float = Field(..., ge=1.0, le=7.0)
    
    # LMX
    lmx_score: float = Field(..., ge=1.0, le=7.0)
    
    # Influence (Hidden)
    machiavellianism: float = Field(..., ge=1.0, le=5.0)
    narcissism: float = Field(..., ge=1.0, le=5.0)
    psychopathy: float = Field(..., ge=1.0, le=5.0)


class LeadershipAnalysis(BaseModel):
    """리더십 분석 결과"""
    id: str
    user_id: str
    dimensions: LeadershipDimensions
    leadership_style: LeadershipStyle
    overall_risk_level: RiskLevel
    strengths: List[str]
    weaknesses: List[str]
    improvement_areas: List[str]
    ai_insights: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnalysisRequest(BaseModel):
    """분석 요청"""
    user_id: str
    force_refresh: bool = False


class QuickAnalysis(BaseModel):
    """빠른 분석 결과 (프론트엔드 표시용)"""
    leadership_style: str
    risk_level: RiskLevel
    key_strengths: List[str]
    action_items: List[str]
    visualization_data: Dict[str, float]  # 3D 시각화용 데이터


class AIInsight(BaseModel):
    """AI 생성 인사이트"""
    category: str
    title: str
    description: str
    recommendation: str
    priority: int = Field(..., ge=1, le=5)
    confidence: float = Field(..., ge=0.0, le=1.0)