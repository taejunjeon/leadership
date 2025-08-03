"""
AI Leadership 4Dx - AI Client Service
GPT-4.1과 Claude 4 Sonnet 중 선택 가능한 AI 클라이언트
"""

import logging
from abc import ABC, abstractmethod
from typing import Literal

from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from ..core.config import settings

logger = logging.getLogger(__name__)

AIProvider = Literal["openai", "anthropic"]


class AIClient(ABC):
    """AI 클라이언트 추상 클래스"""

    @abstractmethod
    async def generate_insight(
        self, prompt: str, system_prompt: str | None = None
    ) -> str:
        """AI 인사이트 생성"""
        pass

    @abstractmethod
    async def analyze_leadership(self, data: dict) -> dict:
        """리더십 분석"""
        pass


class OpenAIClient(AIClient):
    """OpenAI GPT-4.1 클라이언트"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        logger.info(f"OpenAI client initialized with model: {self.model}")

    async def generate_insight(
        self, prompt: str, system_prompt: str | None = None
    ) -> str:
        """GPT-4.1을 사용한 인사이트 생성"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = await self.client.chat.completions.create(
                model=self.model, messages=messages, temperature=0.7, max_tokens=1000
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise

    async def analyze_leadership(self, data: dict) -> dict:
        """GPT-4.1을 사용한 리더십 분석"""
        system_prompt = """You are an expert leadership analyst specializing in the 4D Leadership Assessment model.
        Analyze the provided leadership data and generate insights based on:
        1. Blake & Mouton Grid (People vs Production)
        2. Radical Candor (Care vs Challenge)
        3. Leader-Member Exchange (LMX)
        4. Influence patterns

        Provide actionable insights in Korean."""

        prompt = f"""다음 리더십 데이터를 분석해주세요:

People 점수: {data.get('people', 0)}/7
Production 점수: {data.get('production', 0)}/7
Care 점수: {data.get('care', 0)}/7
Challenge 점수: {data.get('challenge', 0)}/7
LMX 점수: {data.get('lmx', 0)}/7
리더십 스타일: {data.get('style', '')}

다음 형식으로 분석을 제공해주세요:
1. 주요 강점 (3개)
2. 개선 영역 (3개)
3. 구체적인 실행 계획 (5개)
4. 6개월 후 예상 성과"""

        response = await self.generate_insight(prompt, system_prompt)

        # 응답 파싱
        lines = response.strip().split("\n")
        strengths = []
        improvements = []
        action_plans = []
        expected_outcomes = ""

        current_section = None
        for line in lines:
            line = line.strip()
            if "주요 강점" in line:
                current_section = "strengths"
            elif "개선 영역" in line:
                current_section = "improvements"
            elif "실행 계획" in line:
                current_section = "actions"
            elif "예상 성과" in line:
                current_section = "outcomes"
            elif line and line[0].isdigit() and "." in line:
                content = line.split(".", 1)[1].strip()
                if current_section == "strengths":
                    strengths.append(content)
                elif current_section == "improvements":
                    improvements.append(content)
                elif current_section == "actions":
                    action_plans.append(content)
            elif current_section == "outcomes" and line:
                expected_outcomes += line + " "

        return {
            "strengths": strengths[:3],
            "improvements": improvements[:3],
            "action_plans": action_plans[:5],
            "expected_outcomes": expected_outcomes.strip(),
            "ai_model": "GPT-4.1",
            "provider": "openai",
        }


class AnthropicClient(AIClient):
    """Anthropic Claude 4 Sonnet 클라이언트"""

    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL
        logger.info(f"Anthropic client initialized with model: {self.model}")

    async def generate_insight(
        self, prompt: str, system_prompt: str | None = None
    ) -> str:
        """Claude 4 Sonnet을 사용한 인사이트 생성"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = await self.client.messages.create(
                model=self.model, messages=messages, max_tokens=1000, temperature=0.7
            )

            return response.content[0].text

        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise

    async def analyze_leadership(self, data: dict) -> dict:
        """Claude 4 Sonnet을 사용한 리더십 분석"""
        system_prompt = """You are an expert leadership analyst specializing in the 4D Leadership Assessment model.
        Analyze the provided leadership data with deep psychological insights based on:
        1. Blake & Mouton Grid (People vs Production balance)
        2. Radical Candor (Care vs Challenge dynamics)
        3. Leader-Member Exchange (Relationship quality)
        4. Hidden influence patterns (strategic thinking, confidence, risk management)

        Provide nuanced, culturally-aware insights in Korean that go beyond surface-level observations."""

        prompt = f"""다음 리더십 데이터를 심층 분석해주세요:

기본 차원:
- People (사람 중심): {data.get('people', 0)}/7
- Production (성과 중심): {data.get('production', 0)}/7
- Care (배려): {data.get('care', 0)}/7
- Challenge (도전): {data.get('challenge', 0)}/7
- LMX (관계 품질): {data.get('lmx', 0)}/7

리더십 스타일: {data.get('style', '')}
조직 맥락: {data.get('context', '일반 기업 환경')}

다음 관점에서 깊이 있는 분석을 제공해주세요:

1. **핵심 강점** (3개)
   - 현재 발휘되고 있는 독특한 리더십 자산
   - 조직에 미치는 긍정적 영향

2. **잠재적 사각지대** (3개)
   - 인식하지 못하고 있을 수 있는 개선 영역
   - 장기적 성장을 위한 도전 과제

3. **맞춤형 개발 전략** (5개)
   - 구체적이고 실행 가능한 행동 계획
   - 한국 조직 문화 맥락을 고려한 접근

4. **변혁적 성장 시나리오**
   - 6개월 후 달성 가능한 구체적 변화
   - 조직과 개인에게 미칠 영향"""

        response = await self.generate_insight(prompt, system_prompt)

        # Claude의 응답은 더 구조화되어 있을 가능성이 높음
        sections = response.split("\n\n")
        strengths = []
        improvements = []
        action_plans = []
        expected_outcomes = ""

        for section in sections:
            if "핵심 강점" in section or "**핵심 강점**" in section:
                lines = section.split("\n")[1:]
                strengths = [
                    line.strip("- •*").strip()
                    for line in lines
                    if line.strip() and not line.startswith("#")
                ][:3]
            elif "사각지대" in section or "**잠재적 사각지대**" in section:
                lines = section.split("\n")[1:]
                improvements = [
                    line.strip("- •*").strip()
                    for line in lines
                    if line.strip() and not line.startswith("#")
                ][:3]
            elif "개발 전략" in section or "**맞춤형 개발 전략**" in section:
                lines = section.split("\n")[1:]
                action_plans = [
                    line.strip("- •*").strip()
                    for line in lines
                    if line.strip() and not line.startswith("#")
                ][:5]
            elif "성장 시나리오" in section or "**변혁적 성장 시나리오**" in section:
                lines = section.split("\n")[1:]
                expected_outcomes = " ".join(
                    [
                        line.strip()
                        for line in lines
                        if line.strip() and not line.startswith("#")
                    ]
                )

        return {
            "strengths": strengths,
            "improvements": improvements,
            "action_plans": action_plans,
            "expected_outcomes": expected_outcomes,
            "ai_model": "Claude 4 Sonnet",
            "provider": "anthropic",
        }


class AIClientFactory:
    """AI 클라이언트 팩토리"""

    @staticmethod
    def create_client(provider: AIProvider | None = None) -> AIClient:
        """지정된 provider의 AI 클라이언트 생성"""
        if provider is None:
            provider = settings.DEFAULT_AI_PROVIDER

        if provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API key not configured")
            return OpenAIClient()
        elif provider == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError("Anthropic API key not configured")
            return AnthropicClient()
        else:
            raise ValueError(f"Unknown AI provider: {provider}")

    @staticmethod
    def get_available_providers() -> list[dict[str, str]]:
        """사용 가능한 AI provider 목록 반환"""
        providers = []

        if settings.OPENAI_API_KEY:
            providers.append(
                {
                    "provider": "openai",
                    "model": settings.OPENAI_MODEL,
                    "name": "GPT-4.1 Mini",
                    "description": "OpenAI의 최신 경량화 모델. 빠른 응답과 효율적인 분석 제공",
                }
            )

        if settings.ANTHROPIC_API_KEY:
            providers.append(
                {
                    "provider": "anthropic",
                    "model": settings.ANTHROPIC_MODEL,
                    "name": "Claude 4 Sonnet",
                    "description": "Anthropic의 균형잡힌 모델. 깊이 있는 통찰과 맥락 이해력",
                }
            )

        return providers


# 싱글톤 인스턴스를 위한 캐시
_ai_clients: dict[str, AIClient] = {}


async def get_ai_client(provider: AIProvider | None = None) -> AIClient:
    """AI 클라이언트 인스턴스 반환 (캐싱)"""
    if provider is None:
        provider = settings.DEFAULT_AI_PROVIDER

    if provider not in _ai_clients:
        _ai_clients[provider] = AIClientFactory.create_client(provider)

    return _ai_clients[provider]
