"""
AI Leadership 4Dx - Database Connection
"""

import logging
from typing import Optional

from supabase import Client, create_client

from .config import settings

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Supabase 클라이언트 싱글톤"""

    _instance: Optional["SupabaseClient"] = None
    _client: Client | None = None
    _service_client: Client | None = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._initialize_clients()

    def _initialize_clients(self):
        """Supabase 클라이언트 초기화"""
        try:
            # 일반 클라이언트 (anon key 사용)
            self._client = create_client(
                settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY
            )
            logger.info("Supabase anon client initialized")

            # 서비스 클라이언트 (service key 사용 - RLS 우회)
            self._service_client = create_client(
                settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY
            )
            logger.info("Supabase service client initialized")

        except Exception as e:
            logger.error(f"Failed to initialize Supabase clients: {e}")
            raise

    @property
    def client(self) -> Client:
        """일반 Supabase 클라이언트 (RLS 적용)"""
        if self._client is None:
            self._initialize_clients()
        return self._client

    @property
    def service_client(self) -> Client:
        """서비스 Supabase 클라이언트 (RLS 우회)"""
        if self._service_client is None:
            self._initialize_clients()
        return self._service_client

    def get_user_client(self, access_token: str) -> Client:
        """사용자 인증 토큰으로 클라이언트 생성"""
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY,
            options={"headers": {"Authorization": f"Bearer {access_token}"}},
        )
        return client


# 싱글톤 인스턴스
supabase_client = SupabaseClient()


# 헬퍼 함수들
def get_supabase() -> Client:
    """일반 Supabase 클라이언트 반환"""
    return supabase_client.client


def get_service_supabase() -> Client:
    """서비스 Supabase 클라이언트 반환 (RLS 우회)"""
    return supabase_client.service_client


def get_user_supabase(access_token: str) -> Client:
    """사용자별 Supabase 클라이언트 반환"""
    return supabase_client.get_user_client(access_token)
