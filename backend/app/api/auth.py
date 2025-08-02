"""
AI Leadership 4Dx - Authentication API
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..core.database import get_supabase
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()


class LoginRequest(BaseModel):
    """로그인 요청"""
    email: EmailStr
    password: str


class SignUpRequest(BaseModel):
    """회원가입 요청"""
    email: EmailStr
    password: str
    name: str
    organization: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None


class AuthResponse(BaseModel):
    """인증 응답"""
    access_token: str
    refresh_token: str
    user_id: str
    email: str
    name: str
    role: str


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """로그인"""
    try:
        client = get_supabase()
        
        # Supabase 인증
        response = client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # 사용자 정보 조회
        user_result = client.table("users") \
            .select("*") \
            .eq("id", response.user.id) \
            .single() \
            .execute()
        
        user_data = user_result.data
        
        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=user_data["id"],
            email=user_data["email"],
            name=user_data["name"],
            role=user_data["role"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest):
    """회원가입"""
    try:
        client = get_supabase()
        
        # Supabase 회원가입
        response = client.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signup failed"
            )
        
        # 사용자 프로필 생성
        user_data = {
            "id": response.user.id,
            "email": request.email,
            "name": request.name,
            "organization": request.organization,
            "department": request.department,
            "position": request.position,
            "role": "user"
        }
        
        client.table("users").insert(user_data).execute()
        
        # 세션이 있으면 반환
        if response.session:
            return AuthResponse(
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
                user_id=response.user.id,
                email=request.email,
                name=request.name,
                role="user"
            )
        else:
            # 이메일 확인이 필요한 경우
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail="Please check your email to confirm signup"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Signup failed"
        )


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """로그아웃"""
    try:
        client = get_supabase()
        
        # Supabase 로그아웃
        client.auth.sign_out()
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """현재 사용자 정보 조회"""
    try:
        client = get_supabase()
        
        # 토큰으로 사용자 조회
        user = client.auth.get_user(credentials.credentials)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # 사용자 상세 정보 조회
        user_result = client.table("users") \
            .select("*") \
            .eq("id", user.user.id) \
            .single() \
            .execute()
        
        return user_result.data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user info"
        )


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """토큰 갱신"""
    try:
        client = get_supabase()
        
        # 토큰 갱신
        response = client.auth.refresh_session(refresh_token)
        
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )