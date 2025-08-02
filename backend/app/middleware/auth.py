"""
Supabase Auth 미들웨어
FastAPI와 Supabase Auth 간의 단일 인증 게이트웨이
"""

from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime
import os
from app.core.supabase import supabase_service

# 보안 스키마
security = HTTPBearer()

# JWT 설정
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

class AuthMiddleware:
    """통합 인증 미들웨어"""
    
    def __init__(self):
        if not JWT_SECRET:
            raise ValueError("JWT_SECRET 환경 변수가 설정되지 않았소!")
    
    async def verify_token(
        self, 
        credentials: HTTPAuthorizationCredentials
    ) -> Dict[str, Any]:
        """JWT 토큰 검증"""
        token = credentials.credentials
        
        try:
            # JWT 디코드
            payload = jwt.decode(
                token, 
                JWT_SECRET, 
                algorithms=[JWT_ALGORITHM],
                options={"verify_aud": False}  # Supabase는 aud 검증 skip
            )
            
            # 만료 시간 확인
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.now():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="토큰이 만료되었소!"
                )
            
            # Supabase 사용자 확인
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="유효하지 않은 토큰이오!"
                )
            
            # 사용자 정보 반환
            return {
                "user_id": user_id,
                "email": payload.get("email"),
                "role": payload.get("role", "user"),
                "exp": exp
            }
            
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"토큰 검증 실패: {str(e)}"
            )
    
    async def get_current_user(
        self,
        request: Request,
        credentials: HTTPAuthorizationCredentials = None
    ) -> Dict[str, Any]:
        """현재 사용자 정보 반환"""
        # Bearer 토큰 확인
        if not credentials:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="인증이 필요하오!",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            
            token = auth_header.split(" ")[1]
            credentials = HTTPAuthorizationCredentials(
                scheme="Bearer",
                credentials=token
            )
        
        # 토큰 검증
        user_info = await self.verify_token(credentials)
        
        # 추가 사용자 정보 조회 (필요시)
        try:
            # Supabase Auth Admin API로 사용자 정보 조회
            user_response = supabase_service.auth.admin.get_user_by_id(
                user_info["user_id"]
            )
            
            if user_response:
                user_info["metadata"] = user_response.user.user_metadata
                user_info["created_at"] = user_response.user.created_at
        except Exception:
            # 실패해도 기본 정보는 반환
            pass
        
        return user_info
    
    async def require_role(
        self,
        required_role: str,
        user_info: Dict[str, Any]
    ) -> None:
        """역할 기반 접근 제어"""
        user_role = user_info.get("role", "user")
        
        # 역할 계층 구조
        role_hierarchy = {
            "user": 0,
            "leader": 1,
            "manager": 2,
            "admin": 3
        }
        
        user_level = role_hierarchy.get(user_role, 0)
        required_level = role_hierarchy.get(required_role, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"{required_role} 권한이 필요하오! 현재 권한: {user_role}"
            )

# 싱글톤 인스턴스
auth_middleware = AuthMiddleware()