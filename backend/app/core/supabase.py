"""
Supabase 클라이언트 설정
헤파이스토스가 벼려낸 데이터베이스 연결 도구
"""

import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase 설정
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Supabase URL과 Service Key가 필요하오!")

# 서비스 클라이언트 (백엔드 전용, RLS 우회)
supabase_service: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def get_supabase_client(access_token: Optional[str] = None) -> Client:
    """
    Supabase 클라이언트 반환
    
    Args:
        access_token: 사용자 JWT 토큰 (RLS 적용을 위해 필요)
    
    Returns:
        Supabase Client 인스턴스
    """
    if access_token:
        # 사용자별 클라이언트 (RLS 적용)
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        client.auth.set_session(access_token, "")
        return client
    else:
        # 서비스 클라이언트 반환
        return supabase_service

# 데이터베이스 스키마 상수
GRID3_SCHEMA = "grid3"

# 테이블 이름
LEADERS_TABLE = f"{GRID3_SCHEMA}.leaders"
SURVEY_RESPONSES_TABLE = f"{GRID3_SCHEMA}.survey_responses"
VECTOR_MOVEMENTS_TABLE = f"{GRID3_SCHEMA}.vector_movements"
COACHING_CARDS_TABLE = f"{GRID3_SCHEMA}.coaching_cards"
LLM_FEEDBACKS_TABLE = f"{GRID3_SCHEMA}.llm_feedbacks"
QUICK_PULSES_TABLE = f"{GRID3_SCHEMA}.quick_pulses"