"""
Redis 클라이언트 설정
캐싱과 세션 관리를 위한 Redis 연결
"""

import os
from typing import Optional
import redis.asyncio as redis
from redis.asyncio import Redis
import logging

logger = logging.getLogger(__name__)

# Redis 연결 인스턴스
redis_client: Optional[Redis] = None

async def init_redis() -> Optional[Redis]:
    """Redis 연결 초기화"""
    global redis_client
    
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    try:
        redis_client = await redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=10
        )
        
        # 연결 테스트
        await redis_client.ping()
        logger.info("Redis 연결 성공")
        return redis_client
        
    except Exception as e:
        logger.warning(f"Redis 연결 실패: {str(e)}. 캐싱 없이 진행합니다.")
        redis_client = None
        return None

async def close_redis():
    """Redis 연결 종료"""
    global redis_client
    
    if redis_client:
        await redis_client.close()
        redis_client = None
        logger.info("Redis 연결 종료")

async def get_redis_client() -> Optional[Redis]:
    """Redis 클라이언트 반환"""
    global redis_client
    
    if redis_client is None:
        await init_redis()
    
    return redis_client

# 캐시 헬퍼 함수들
async def cache_get(key: str) -> Optional[str]:
    """캐시에서 값 조회"""
    client = await get_redis_client()
    if client:
        try:
            return await client.get(key)
        except Exception as e:
            logger.error(f"캐시 조회 실패: {str(e)}")
    return None

async def cache_set(
    key: str, 
    value: str, 
    ttl: Optional[int] = None
) -> bool:
    """캐시에 값 저장"""
    client = await get_redis_client()
    if client:
        try:
            if ttl:
                await client.setex(key, ttl, value)
            else:
                await client.set(key, value)
            return True
        except Exception as e:
            logger.error(f"캐시 저장 실패: {str(e)}")
    return False

async def cache_delete(key: str) -> bool:
    """캐시에서 값 삭제"""
    client = await get_redis_client()
    if client:
        try:
            await client.delete(key)
            return True
        except Exception as e:
            logger.error(f"캐시 삭제 실패: {str(e)}")
    return False

async def cache_exists(key: str) -> bool:
    """캐시 키 존재 확인"""
    client = await get_redis_client()
    if client:
        try:
            return await client.exists(key) > 0
        except Exception as e:
            logger.error(f"캐시 존재 확인 실패: {str(e)}")
    return False