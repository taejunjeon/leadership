"""
AI 기반 응답 패턴 분석 서비스
LLM을 활용한 심층 리더십 스타일 분석
"""

import asyncio
import json
from datetime import datetime
from typing import Any

import numpy as np
from openai import AsyncOpenAI

from app.core.config import settings
from app.middleware.rate_limit import rate_limiter, usage_monitor
from app.schemas.survey import SurveyResponseDB


class AIAnalysisService:
    """AI 기반 분석 서비스"""

    def __init__(self):
        self.client = (
            AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            if settings.OPENAI_API_KEY
            else None
        )
        self.model = settings.LLM_MODEL
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.timeout = settings.LLM_TIMEOUT

        # 분석 프롬프트 템플릿
        self.analysis_prompt = """
You are an expert leadership coach analyzing Grid 3.0 assessment results.

Leadership Assessment Data:
- People Score: {people_score}/7 (관계 중심)
- Production Score: {production_score}/7 (성과 중심)
- Candor Score: {candor_score}/7 (솔직함)
- LMX Score: {lmx_score}/7 (리더-구성원 관계 품질)

Leadership Style: {leadership_style}
Organization: {organization}
Department: {department}

Please provide:
1. Leadership style analysis (2-3 sentences)
2. Key strengths (2-3 points)
3. Growth areas (2-3 points)
4. Specific action recommendations (3-4 concrete steps)

Focus on practical, actionable insights. Be constructive and encouraging.
Response in {language}.
"""

        # 패턴 분석 프롬프트
        self.pattern_prompt = """
Analyze the following survey response pattern for potential issues:

Response Pattern:
{response_pattern}

Identified Anomalies:
{anomalies}

Please identify:
1. Response authenticity (genuine vs. gaming)
2. Consistency patterns
3. Potential biases
4. Reliability score (0-100)

Be objective and data-driven in your analysis.
"""

    async def analyze_leadership_style(
        self, response: SurveyResponseDB, language: str = "Korean"
    ) -> dict[str, Any]:
        """리더십 스타일 심층 분석"""
        if not self.client:
            return self._get_rule_based_analysis(response, language)

        # Rate limit 확인
        user_id = str(response.leader_id)
        allowed, usage_info = await rate_limiter.check_llm_usage(
            user_id=user_id, model=self.model, tokens=self.max_tokens
        )

        if not allowed:
            return {
                "error": "LLM 사용량 한도 초과",
                "usage_info": usage_info,
                "fallback": self._get_rule_based_analysis(response, language),
            }

        try:
            # 리더십 스타일 판별
            leadership_style = self._determine_leadership_style(
                response.people_score, response.production_score
            )

            # LLM 분석 요청
            prompt = self.analysis_prompt.format(
                people_score=response.people_score,
                production_score=response.production_score,
                candor_score=response.candor_score,
                lmx_score=response.lmx_score,
                leadership_style=leadership_style,
                organization=response.organization or "N/A",
                department=response.department or "N/A",
                language=language,
            )

            start_time = datetime.now()

            completion = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert leadership coach.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=self.max_tokens,
                    temperature=0.7,
                ),
                timeout=self.timeout,
            )

            response_time = (datetime.now() - start_time).total_seconds()

            # 사용량 로깅
            await usage_monitor.log_usage(
                user_id=user_id,
                model=self.model,
                tokens=completion.usage.total_tokens,
                cost=self._calculate_cost(completion.usage),
                request_type="leadership_analysis",
                response_time=response_time,
            )

            # 응답 파싱
            content = completion.choices[0].message.content
            analysis = self._parse_llm_response(content)

            return {
                "leadership_style": leadership_style,
                "analysis": analysis,
                "confidence_score": self._calculate_confidence(response),
                "generated_at": datetime.now().isoformat(),
                "model": self.model,
                "response_time": response_time,
            }

        except TimeoutError:
            return {
                "error": "분석 시간 초과",
                "fallback": self._get_rule_based_analysis(response, language),
            }
        except Exception as e:
            return {
                "error": f"분석 중 오류: {str(e)}",
                "fallback": self._get_rule_based_analysis(response, language),
            }

    async def analyze_response_pattern(
        self, responses: list[dict[str, Any]], anomalies: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """응답 패턴 신뢰성 분석"""
        if not self.client:
            return self._get_pattern_analysis_fallback(responses, anomalies)

        try:
            # 응답 패턴 요약
            pattern_summary = self._summarize_response_pattern(responses)

            prompt = self.pattern_prompt.format(
                response_pattern=json.dumps(pattern_summary, indent=2),
                anomalies=json.dumps(anomalies, indent=2),
            )

            completion = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a data analyst expert."},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=300,
                    temperature=0.3,
                ),
                timeout=self.timeout,
            )

            content = completion.choices[0].message.content

            # 신뢰성 점수 추출
            reliability_score = self._extract_reliability_score(content)

            return {
                "pattern_analysis": content,
                "reliability_score": reliability_score,
                "anomaly_count": len(anomalies),
                "recommendation": self._get_reliability_recommendation(
                    reliability_score
                ),
            }

        except Exception:
            return self._get_pattern_analysis_fallback(responses, anomalies)

    def _determine_leadership_style(self, people: float, production: float) -> str:
        """리더십 스타일 판별"""
        if people <= 3 and production <= 3:
            return "Impoverished Management"
        elif people <= 3 and production > 5:
            return "Authority-Compliance"
        elif people > 5 and production <= 3:
            return "Country Club Management"
        elif 4 <= people <= 5 and 4 <= production <= 5:
            return "Middle of the Road"
        elif people > 5 and production > 5:
            return "Team Leadership"
        else:
            return "Transitional"

    def _get_rule_based_analysis(
        self, response: SurveyResponseDB, language: str
    ) -> dict[str, Any]:
        """규칙 기반 분석 (LLM 없을 때)"""
        leadership_style = self._determine_leadership_style(
            response.people_score, response.production_score
        )

        # 점수 기반 분석
        strengths = []
        growth_areas = []
        recommendations = []

        # People 차원 분석
        if response.people_score > 5.5:
            strengths.append("높은 관계 중심 리더십")
        elif response.people_score < 3.5:
            growth_areas.append("팀원과의 관계 구축 필요")
            recommendations.append("일대일 미팅 정기적 실시")

        # Production 차원 분석
        if response.production_score > 5.5:
            strengths.append("강한 성과 지향성")
        elif response.production_score < 3.5:
            growth_areas.append("목표 설정 및 성과 관리 강화 필요")
            recommendations.append("SMART 목표 설정 워크샵 진행")

        # Candor 차원 분석
        if response.candor_score > 5.5:
            strengths.append("투명하고 솔직한 커뮤니케이션")
        elif response.candor_score < 3.5:
            growth_areas.append("더 직접적인 피드백 제공 필요")
            recommendations.append("Radical Candor 프레임워크 학습")

        # LMX 차원 분석
        if response.lmx_score > 5.5:
            strengths.append("팀원들과 높은 신뢰 관계")
        elif response.lmx_score < 3.5:
            growth_areas.append("리더-구성원 관계 품질 개선 필요")
            recommendations.append("팀 빌딩 활동 강화")

        return {
            "leadership_style": leadership_style,
            "strengths": strengths[:3],
            "growth_areas": growth_areas[:3],
            "recommendations": recommendations[:4],
            "analysis_type": "rule_based",
            "confidence_score": self._calculate_confidence(response),
        }

    def _calculate_confidence(self, response: SurveyResponseDB) -> float:
        """응답 신뢰도 계산"""
        scores = [
            response.people_score,
            response.production_score,
            response.candor_score,
            response.lmx_score,
        ]

        # 표준편차가 낮으면 신뢰도 감소 (모든 응답이 비슷)
        std_dev = np.std(scores)
        variance_score = min(std_dev / 2.0, 1.0)

        # 극단값이 많으면 신뢰도 감소
        extreme_count = sum(1 for s in scores if s < 2 or s > 6)
        extreme_penalty = extreme_count * 0.1

        # 중간값이 많으면 신뢰도 증가
        moderate_count = sum(1 for s in scores if 3 <= s <= 5)
        moderate_bonus = moderate_count * 0.05

        confidence = 0.5 + variance_score * 0.3 + moderate_bonus - extreme_penalty
        return max(0.0, min(1.0, confidence))

    def _parse_llm_response(self, content: str) -> dict[str, Any]:
        """LLM 응답 파싱"""
        # 간단한 파싱 로직
        lines = content.strip().split("\n")

        analysis = {
            "style_analysis": "",
            "strengths": [],
            "growth_areas": [],
            "recommendations": [],
        }

        current_section = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if "analysis" in line.lower() or line.startswith("1."):
                current_section = "style_analysis"
            elif "strength" in line.lower() or line.startswith("2."):
                current_section = "strengths"
            elif "growth" in line.lower() or line.startswith("3."):
                current_section = "growth_areas"
            elif "recommendation" in line.lower() or line.startswith("4."):
                current_section = "recommendations"
            elif current_section:
                # 번호나 불릿 제거
                clean_line = line.lstrip("- •123456789.")
                if current_section == "style_analysis":
                    analysis["style_analysis"] += clean_line + " "
                elif current_section in [
                    "strengths",
                    "growth_areas",
                    "recommendations",
                ]:
                    if clean_line:
                        analysis[current_section].append(clean_line)

        return analysis

    def _calculate_cost(self, usage) -> float:
        """LLM 사용 비용 계산"""
        # 모델별 가격 (1K 토큰당)
        pricing = {
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
            "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        }

        model_pricing = pricing.get(self.model, pricing["gpt-4o-mini"])

        input_cost = (usage.prompt_tokens / 1000) * model_pricing["input"]
        output_cost = (usage.completion_tokens / 1000) * model_pricing["output"]

        return round(input_cost + output_cost, 6)

    def _summarize_response_pattern(
        self, responses: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """응답 패턴 요약"""
        values = [r["value"] for r in responses]
        dimensions = {}

        for response in responses:
            dim = response["dimension"]
            if dim not in dimensions:
                dimensions[dim] = []
            dimensions[dim].append(response["value"])

        return {
            "total_responses": len(responses),
            "value_distribution": {f"value_{i}": values.count(i) for i in range(1, 8)},
            "dimension_averages": {
                dim: round(np.mean(vals), 2) for dim, vals in dimensions.items()
            },
            "dimension_std": {
                dim: round(np.std(vals), 2) for dim, vals in dimensions.items()
            },
        }

    def _extract_reliability_score(self, content: str) -> float:
        """신뢰성 점수 추출"""
        import re

        # 숫자 패턴 찾기
        pattern = r"reliability.*?(\d+)"
        match = re.search(pattern, content.lower())

        if match:
            score = int(match.group(1))
            return min(100, max(0, score)) / 100.0

        # 못 찾으면 기본값
        return 0.7

    def _get_reliability_recommendation(self, score: float) -> str:
        """신뢰성 기반 권장사항"""
        if score >= 0.8:
            return "높은 신뢰성. 결과를 신뢰할 수 있습니다."
        elif score >= 0.6:
            return "보통 신뢰성. 추가 검증을 권장합니다."
        else:
            return "낮은 신뢰성. 재평가를 고려하세요."

    def _get_pattern_analysis_fallback(
        self, responses: list[dict[str, Any]], anomalies: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """패턴 분석 폴백"""
        pattern_summary = self._summarize_response_pattern(responses)

        # 규칙 기반 신뢰성 계산
        reliability = 0.8

        # 모든 응답이 같으면 신뢰성 감소
        value_dist = pattern_summary["value_distribution"]
        max_count = max(value_dist.values())
        if max_count > len(responses) * 0.5:
            reliability -= 0.3

        # 이상치가 많으면 신뢰성 감소
        if len(anomalies) > 3:
            reliability -= 0.2

        return {
            "pattern_analysis": "규칙 기반 분석",
            "reliability_score": max(0.2, reliability),
            "anomaly_count": len(anomalies),
            "recommendation": self._get_reliability_recommendation(reliability),
        }


# 싱글톤 인스턴스
ai_analysis_service = AIAnalysisService()
