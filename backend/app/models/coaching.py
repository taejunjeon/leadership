"""
코칭 모델
"""

import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class CoachingCard(Base, TimestampMixin):
    """AI 코칭 카드"""

    __tablename__ = "coaching_cards"
    __table_args__ = {"schema": "grid3"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    response_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.survey_responses.id"), nullable=False
    )
    leader_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.leaders.id"), nullable=False
    )

    # 코칭 내용
    card_type = Column(
        String
    )  # "listening_challenge", "confrontation_script", "trust_routine"
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    action_items = Column(JSON)  # 행동 과제 리스트
    resources = Column(JSON)  # 참고 자료 링크

    # 우선순위 및 추천도
    priority = Column(Integer, default=0)  # 1-3 (높을수록 우선)
    confidence_score = Column(Float)  # AI 추천 신뢰도 (0-1)

    # 상태 추적
    is_viewed = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))

    # 관계
    response = relationship("SurveyResponse", backref="coaching_cards")
    leader = relationship("Leader", backref="coaching_cards")


class LLMFeedback(Base, TimestampMixin):
    """LLM 심층 의견"""

    __tablename__ = "llm_feedbacks"
    __table_args__ = {"schema": "grid3"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    response_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.survey_responses.id"), nullable=False
    )
    leader_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.leaders.id"), nullable=False
    )

    # LLM 생성 내용
    feedback_text = Column(Text, nullable=False)
    model_name = Column(String, default="gpt-4o-mini")
    prompt_version = Column(String, default="1.0.0")

    # 성능 메트릭
    generation_time_ms = Column(Integer)  # 생성 시간 (밀리초)
    token_count = Column(Integer)  # 사용된 토큰 수

    # 사용자 평가
    rating = Column(Integer)  # 1-5 별점
    is_helpful = Column(Boolean)

    # 관계
    response = relationship("SurveyResponse", backref="llm_feedbacks")
    leader = relationship("Leader", backref="llm_feedbacks")


class QuickPulse(Base, TimestampMixin):
    """Quick Pulse 응답"""

    __tablename__ = "quick_pulses"
    __table_args__ = {"schema": "grid3"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    leader_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.leaders.id"), nullable=False
    )
    coaching_card_id = Column(UUID(as_uuid=True), ForeignKey("grid3.coaching_cards.id"))

    # Pulse 유형
    pulse_type = Column(String)  # "candor_pulse", "lmx_pulse"

    # 간단한 응답 (3문항)
    answers = Column(JSON, nullable=False)  # [1-7] 범위의 3개 응답
    average_score = Column(Float)

    # 전송 채널
    sent_via = Column(String)  # "slack", "email", "web"

    # 관계
    leader = relationship("Leader", backref="quick_pulses")
    coaching_card = relationship("CoachingCard", backref="quick_pulses")
