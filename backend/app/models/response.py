"""
설문 응답 모델
"""

import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class SurveyResponse(Base, TimestampMixin):
    """설문 응답 데이터"""

    __tablename__ = "survey_responses"
    __table_args__ = {"schema": "grid3"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    leader_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.leaders.id"), nullable=False
    )

    # 원본 응답 데이터
    raw_answers = Column(JSON, nullable=False)  # [1-7] 범위의 응답 배열
    survey_version = Column(String, default="1.0.0")

    # 계산된 점수 (캐시)
    people_score = Column(Float, nullable=False)  # X축: 사람 관심 (1-7)
    production_score = Column(Float, nullable=False)  # Y축: 성과 관심 (1-7)
    candor_score = Column(Float, nullable=False)  # Z축: 직면 강도 (1-7)
    lmx_score = Column(Float, nullable=False)  # 크기: LMX 품질 (1-7)

    # 벡터 임베딩 (AI 코칭용)
    embedding = Column(Vector(512))  # 512차원 벡터

    # 리더 유형 분류
    leadership_type = Column(String)  # 예: "A1_transformational", "B2_authoritarian"

    # 관계
    leader = relationship("Leader", backref="responses")

    def __repr__(self):
        return f"<SurveyResponse(id={self.id}, leader_id={self.leader_id}, type={self.leadership_type})>"


class VectorMovement(Base, TimestampMixin):
    """4D 벡터 이동 추적"""

    __tablename__ = "vector_movements"
    __table_args__ = {"schema": "grid3"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    leader_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.leaders.id"), nullable=False
    )

    # 이전 응답 참조
    from_response_id = Column(
        UUID(as_uuid=True), ForeignKey("grid3.survey_responses.id")
    )
    to_response_id = Column(UUID(as_uuid=True), ForeignKey("grid3.survey_responses.id"))

    # 변화량
    delta_people = Column(Float)
    delta_production = Column(Float)
    delta_candor = Column(Float)
    delta_lmx = Column(Float)

    # 총 이동 거리 (4D 유클리드 거리)
    total_distance = Column(Float)

    # 변화 기간 (일)
    days_between = Column(Integer)

    # 관계
    leader = relationship("Leader", backref="movements")
    from_response = relationship("SurveyResponse", foreign_keys=[from_response_id])
    to_response = relationship("SurveyResponse", foreign_keys=[to_response_id])
