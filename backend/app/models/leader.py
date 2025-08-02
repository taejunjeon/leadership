"""
리더 모델
"""
from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base, TimestampMixin


class Leader(Base, TimestampMixin):
    """리더 정보"""
    __tablename__ = "leaders"
    __table_args__ = {"schema": "grid3"}
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    department = Column(String)
    position = Column(String)
    team_size = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # 추가 메타데이터
    organization = Column(String)
    years_of_experience = Column(Integer)
    
    def __repr__(self):
        return f"<Leader(id={self.id}, name={self.name}, email={self.email})>"