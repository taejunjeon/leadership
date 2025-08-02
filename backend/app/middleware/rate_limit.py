"""
Rate Limiting 미들웨어
LLM API 호출 비용 관리 및 사용량 제한
"""

import time
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
import redis
from collections import defaultdict
import json

class RateLimiter:
    """Rate Limiting 구현"""
    
    def __init__(
        self,
        redis_client: Optional[redis.Redis] = None,
        default_limit: int = 100,
        window_seconds: int = 3600
    ):
        self.redis_client = redis_client
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        
        # Redis 없을 때 메모리 기반 제한
        self.memory_store: Dict[str, list] = defaultdict(list)
        
        # LLM 특별 제한
        self.llm_limits = {
            "gpt-4": {"requests": 10, "tokens": 10000, "window": 3600},
            "gpt-4o-mini": {"requests": 50, "tokens": 50000, "window": 3600},
            "claude-3": {"requests": 20, "tokens": 20000, "window": 3600}
        }
    
    async def check_rate_limit(
        self,
        key: str,
        limit: Optional[int] = None,
        window: Optional[int] = None
    ) -> Tuple[bool, Dict[str, int]]:
        """Rate limit 확인"""
        limit = limit or self.default_limit
        window = window or self.window_seconds
        
        if self.redis_client:
            return await self._check_redis(key, limit, window)
        else:
            return self._check_memory(key, limit, window)
    
    async def _check_redis(
        self,
        key: str,
        limit: int,
        window: int
    ) -> Tuple[bool, Dict[str, int]]:
        """Redis 기반 rate limit 확인"""
        try:
            pipe = self.redis_client.pipeline()
            now = time.time()
            
            # Sliding window 구현
            pipe.zremrangebyscore(key, 0, now - window)
            pipe.zadd(key, {str(now): now})
            pipe.zcount(key, now - window, now)
            pipe.expire(key, window)
            
            results = pipe.execute()
            count = results[2]
            
            remaining = max(0, limit - count)
            reset_time = int(now + window)
            
            return count <= limit, {
                "limit": limit,
                "remaining": remaining,
                "reset": reset_time,
                "retry_after": 0 if count <= limit else window
            }
        except Exception:
            # Redis 실패 시 통과
            return True, {"limit": limit, "remaining": limit}
    
    def _check_memory(
        self,
        key: str,
        limit: int,
        window: int
    ) -> Tuple[bool, Dict[str, int]]:
        """메모리 기반 rate limit 확인"""
        now = time.time()
        
        # 오래된 요청 제거
        self.memory_store[key] = [
            ts for ts in self.memory_store[key]
            if ts > now - window
        ]
        
        # 현재 요청 추가
        self.memory_store[key].append(now)
        count = len(self.memory_store[key])
        
        remaining = max(0, limit - count)
        reset_time = int(now + window)
        
        return count <= limit, {
            "limit": limit,
            "remaining": remaining,
            "reset": reset_time,
            "retry_after": 0 if count <= limit else window
        }
    
    async def check_llm_usage(
        self,
        user_id: str,
        model: str,
        tokens: int
    ) -> Tuple[bool, Dict[str, Any]]:
        """LLM 사용량 확인"""
        if model not in self.llm_limits:
            model = "gpt-4o-mini"  # 기본값
        
        limits = self.llm_limits[model]
        
        # 요청 수 확인
        request_key = f"llm:{user_id}:{model}:requests"
        req_allowed, req_info = await self.check_rate_limit(
            request_key,
            limits["requests"],
            limits["window"]
        )
        
        # 토큰 사용량 확인
        token_key = f"llm:{user_id}:{model}:tokens"
        token_usage = await self._get_token_usage(token_key, limits["window"])
        token_allowed = token_usage + tokens <= limits["tokens"]
        
        if req_allowed and token_allowed:
            # 토큰 사용량 업데이트
            await self._update_token_usage(token_key, tokens, limits["window"])
        
        return req_allowed and token_allowed, {
            "requests": req_info,
            "tokens": {
                "limit": limits["tokens"],
                "used": token_usage,
                "remaining": max(0, limits["tokens"] - token_usage - tokens),
                "requested": tokens
            },
            "model": model,
            "allowed": req_allowed and token_allowed
        }
    
    async def _get_token_usage(self, key: str, window: int) -> int:
        """토큰 사용량 조회"""
        if self.redis_client:
            try:
                usage = self.redis_client.get(f"{key}:total")
                return int(usage) if usage else 0
            except:
                return 0
        else:
            # 메모리 기반은 단순화
            return len(self.memory_store.get(key, [])) * 100
    
    async def _update_token_usage(
        self,
        key: str,
        tokens: int,
        window: int
    ):
        """토큰 사용량 업데이트"""
        if self.redis_client:
            try:
                pipe = self.redis_client.pipeline()
                pipe.incrby(f"{key}:total", tokens)
                pipe.expire(f"{key}:total", window)
                pipe.execute()
            except:
                pass

class LLMUsageMonitor:
    """LLM 사용량 모니터링"""
    
    def __init__(self):
        self.usage_log = []
    
    async def log_usage(
        self,
        user_id: str,
        model: str,
        tokens: int,
        cost: float,
        request_type: str,
        response_time: float
    ):
        """사용량 로깅"""
        usage_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "model": model,
            "tokens": tokens,
            "cost": cost,
            "request_type": request_type,
            "response_time": response_time
        }
        
        self.usage_log.append(usage_entry)
        
        # 로그 파일에 저장 (비동기)
        # 실제 구현에서는 데이터베이스나 로깅 서비스 사용
        
    async def get_usage_stats(
        self,
        user_id: Optional[str] = None,
        period: str = "day"
    ) -> Dict[str, Any]:
        """사용량 통계 조회"""
        # 기간 설정
        if period == "day":
            since = datetime.now() - timedelta(days=1)
        elif period == "week":
            since = datetime.now() - timedelta(weeks=1)
        elif period == "month":
            since = datetime.now() - timedelta(days=30)
        else:
            since = datetime.min
        
        # 필터링
        filtered_logs = [
            log for log in self.usage_log
            if datetime.fromisoformat(log["timestamp"]) >= since
        ]
        
        if user_id:
            filtered_logs = [
                log for log in filtered_logs
                if log["user_id"] == user_id
            ]
        
        # 통계 계산
        total_tokens = sum(log["tokens"] for log in filtered_logs)
        total_cost = sum(log["cost"] for log in filtered_logs)
        request_count = len(filtered_logs)
        
        # 모델별 통계
        model_stats = defaultdict(lambda: {"tokens": 0, "cost": 0, "count": 0})
        for log in filtered_logs:
            model = log["model"]
            model_stats[model]["tokens"] += log["tokens"]
            model_stats[model]["cost"] += log["cost"]
            model_stats[model]["count"] += 1
        
        return {
            "period": period,
            "user_id": user_id,
            "total_tokens": total_tokens,
            "total_cost": total_cost,
            "request_count": request_count,
            "model_stats": dict(model_stats),
            "average_tokens_per_request": total_tokens / request_count if request_count > 0 else 0,
            "average_cost_per_request": total_cost / request_count if request_count > 0 else 0
        }

# 싱글톤 인스턴스
rate_limiter = RateLimiter()
usage_monitor = LLMUsageMonitor()