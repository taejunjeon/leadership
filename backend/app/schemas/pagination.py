"""
페이지네이션 및 필터링 스키마
대용량 3D 시각화를 위한 효율적인 데이터 전송
"""

from typing import List, Optional, Generic, TypeVar, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

T = TypeVar('T')

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

class PaginationParams(BaseModel):
    """페이지네이션 파라미터"""
    page: int = Field(1, ge=1, description="페이지 번호 (1부터 시작)")
    page_size: int = Field(50, ge=1, le=500, description="페이지당 항목 수")
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size
    
    @property
    def limit(self) -> int:
        return self.page_size

class FilterParams(BaseModel):
    """3D 시각화 필터 파라미터"""
    # 조직 필터
    organization: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None
    
    # 점수 범위 필터
    people_min: Optional[float] = Field(None, ge=1, le=7)
    people_max: Optional[float] = Field(None, ge=1, le=7)
    production_min: Optional[float] = Field(None, ge=1, le=7)
    production_max: Optional[float] = Field(None, ge=1, le=7)
    candor_min: Optional[float] = Field(None, ge=1, le=7)
    candor_max: Optional[float] = Field(None, ge=1, le=7)
    lmx_min: Optional[float] = Field(None, ge=1, le=7)
    lmx_max: Optional[float] = Field(None, ge=1, le=7)
    
    # 리더십 스타일 필터
    leadership_style: Optional[List[str]] = None
    
    # 시간 필터
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    
    # 검색
    search: Optional[str] = Field(None, max_length=100)

class SortParams(BaseModel):
    """정렬 파라미터"""
    sort_by: str = Field("created_at", description="정렬 기준 필드")
    sort_order: SortOrder = Field(SortOrder.DESC, description="정렬 순서")

class PaginatedResponse(BaseModel, Generic[T]):
    """페이지네이션 응답"""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        pagination: PaginationParams
    ) -> "PaginatedResponse[T]":
        """페이지네이션 응답 생성"""
        total_pages = (total + pagination.page_size - 1) // pagination.page_size
        
        return cls(
            items=items,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=total_pages,
            has_next=pagination.page < total_pages,
            has_prev=pagination.page > 1
        )

class Leader3DPoint(BaseModel):
    """3D 시각화용 리더 포인트"""
    id: str
    name: str
    email: str
    organization: Optional[str]
    
    # 4D 좌표
    x: float  # people_score
    y: float  # production_score
    z: float  # candor_score
    size: float  # lmx_score
    
    # 색상 정보
    color: str  # 리더십 스타일에 따른 색상
    leadership_style: str
    
    # 호버 정보
    hover_data: Dict[str, Any]
    
    # 최적화를 위한 LOD (Level of Detail)
    lod: int = Field(0, description="0: full, 1: medium, 2: simple")

class ClusterInfo(BaseModel):
    """클러스터 정보 (많은 포인트를 그룹화)"""
    center_x: float
    center_y: float
    center_z: float
    count: int
    radius: float
    dominant_style: str
    
class Visualization3DResponse(BaseModel):
    """3D 시각화 응답"""
    points: List[Leader3DPoint]
    clusters: Optional[List[ClusterInfo]] = None
    
    # 통계 정보
    total_points: int
    filtered_points: int
    
    # 성능 최적화 정보
    use_clustering: bool = Field(False, description="500개 이상일 때 클러스터링 사용")
    lod_level: int = Field(0, description="전체 LOD 레벨")
    
    # 범위 정보 (카메라 설정용)
    bounds: Dict[str, Dict[str, float]] = Field(
        default={
            "x": {"min": 1, "max": 7},
            "y": {"min": 1, "max": 7},
            "z": {"min": 1, "max": 7}
        }
    )