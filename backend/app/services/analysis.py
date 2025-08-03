"""
AI Leadership 4Dx - Analysis Service
"""

import logging
from uuid import uuid4

import numpy as np

from ..core.database import get_service_supabase
from ..schemas.analysis import (
    LeadershipDimensions,
    LeadershipStyle,
    RiskLevel,
)
from .ai_client import AIProvider, get_ai_client

logger = logging.getLogger(__name__)


class LeadershipAnalyzer:
    """리더십 분석 엔진"""

    @staticmethod
    def calculate_dimensions(responses: dict[str, int]) -> LeadershipDimensions:
        """설문 응답으로부터 리더십 차원 점수 계산"""

        # Blake & Mouton 점수 계산
        people_questions = ["bm_1", "bm_3", "bm_5", "bm_7", "bm_9", "bm_11", "bm_13"]
        production_questions = [
            "bm_2",
            "bm_4",
            "bm_6",
            "bm_8",
            "bm_10",
            "bm_12",
            "bm_14",
        ]

        people_score = np.mean([responses.get(q, 4) for q in people_questions])
        production_score = np.mean([responses.get(q, 4) for q in production_questions])

        # Radical Candor 점수 계산
        care_questions = ["rc_1", "rc_3", "rc_5", "rc_7", "rc_9"]
        challenge_questions = ["rc_2", "rc_4", "rc_6", "rc_8", "rc_10"]

        care_score = np.mean([responses.get(q, 4) for q in care_questions])
        challenge_score = np.mean([responses.get(q, 4) for q in challenge_questions])

        # LMX 점수 계산
        lmx_questions = [f"lmx_{i}" for i in range(1, 11)]
        lmx_score = np.mean([responses.get(q, 4) for q in lmx_questions])

        # Influence Gauge (숨겨진 차원) 계산
        mach_questions = ["ig_1", "ig_4", "ig_7"]  # hidden_m
        narc_questions = ["ig_2", "ig_5", "ig_8"]  # hidden_n
        psyc_questions = ["ig_3", "ig_6", "ig_9"]  # hidden_p

        # 5점 척도로 변환 (1-7 -> 1-5)
        mach_score = np.mean([responses.get(q, 3) for q in mach_questions]) * 5 / 7
        narc_score = np.mean([responses.get(q, 3) for q in narc_questions]) * 5 / 7
        psyc_score = np.mean([responses.get(q, 3) for q in psyc_questions]) * 5 / 7

        return LeadershipDimensions(
            people=round(people_score, 2),
            production=round(production_score, 2),
            care=round(care_score, 2),
            challenge=round(challenge_score, 2),
            lmx_score=round(lmx_score, 2),
            machiavellianism=round(mach_score, 2),
            narcissism=round(narc_score, 2),
            psychopathy=round(psyc_score, 2),
        )

    @staticmethod
    def classify_leadership_style(people: float, production: float) -> LeadershipStyle:
        """Blake & Mouton Grid 기반 리더십 스타일 분류"""

        # 임계값 설정
        LOW = 3.0
        MID_LOW = 4.0
        MID_HIGH = 5.0
        HIGH = 6.0

        if people <= LOW and production <= LOW:
            return LeadershipStyle.IMPOVERISHED
        elif people >= HIGH and production <= LOW:
            return LeadershipStyle.COUNTRY_CLUB
        elif people <= LOW and production >= HIGH:
            return LeadershipStyle.AUTHORITY_COMPLIANCE
        elif MID_LOW <= people <= MID_HIGH and MID_LOW <= production <= MID_HIGH:
            return LeadershipStyle.MIDDLE_OF_THE_ROAD
        elif people >= HIGH and production >= HIGH:
            return LeadershipStyle.TEAM_LEADER
        elif production > people and production >= MID_HIGH:
            return LeadershipStyle.TASK_MANAGER
        else:
            return LeadershipStyle.CUSTOM

    @staticmethod
    def assess_risk_level(dimensions: LeadershipDimensions) -> RiskLevel:
        """Dark Triad 기반 위험도 평가"""

        # 가중 평균 계산
        dark_score = (
            dimensions.machiavellianism * 0.4
            + dimensions.narcissism * 0.3
            + dimensions.psychopathy * 0.3
        )

        # LMX와 candor도 고려
        mitigating_factor = (dimensions.lmx_score + dimensions.care) / 14  # 0-1 범위
        adjusted_score = dark_score * (1 - mitigating_factor * 0.3)

        if adjusted_score <= 2.0:
            return RiskLevel.LOW
        elif adjusted_score <= 3.5:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.HIGH

    @staticmethod
    async def generate_insights(
        dimensions: LeadershipDimensions,
        style: LeadershipStyle,
        ai_provider: AIProvider | None = None,
    ) -> dict:
        """AI 기반 인사이트 생성"""

        # AI 클라이언트로 분석 시도
        try:
            ai_client = await get_ai_client(ai_provider)

            data = {
                "people": dimensions.people,
                "production": dimensions.production,
                "care": dimensions.care,
                "challenge": dimensions.challenge,
                "lmx": dimensions.lmx_score,
                "style": style.value,
            }

            ai_result = await ai_client.analyze_leadership(data)

            return {
                "strengths": ai_result.get("strengths", []),
                "weaknesses": ai_result.get("improvements", []),
                "improvements": ai_result.get("improvements", []),
                "style_description": _get_style_description(style),
                "development_plan": ai_result.get("action_plans", []),
                "ai_insights": ai_result,
                "ai_provider": ai_result.get("provider", "unknown"),
                "ai_model": ai_result.get("ai_model", "unknown"),
            }

        except Exception as e:
            logger.warning(f"AI analysis failed, falling back to rule-based: {str(e)}")

        # Fallback: 규칙 기반 분석
        strengths = []
        weaknesses = []
        improvements = []

        # People vs Production 분석
        if dimensions.people >= 6.0:
            strengths.append("팀원들과의 관계 구축 능력이 뛰어남")
        elif dimensions.people <= 3.0:
            weaknesses.append("팀원들과의 관계 개선이 필요함")
            improvements.append("1:1 미팅을 통한 팀원 이해도 향상")

        if dimensions.production >= 6.0:
            strengths.append("목표 달성과 성과 창출에 탁월함")
        elif dimensions.production <= 3.0:
            weaknesses.append("성과 관리 강화가 필요함")
            improvements.append("명확한 목표 설정과 진행 상황 모니터링")

        # Candor 분석
        if dimensions.care >= 6.0 and dimensions.challenge >= 6.0:
            strengths.append("Radical Candor - 진정성 있는 피드백 제공")
        elif dimensions.care >= 6.0 and dimensions.challenge <= 3.0:
            weaknesses.append("Ruinous Empathy - 필요한 피드백을 주저함")
            improvements.append("건설적인 비판을 제공하는 연습")
        elif dimensions.care <= 3.0 and dimensions.challenge >= 6.0:
            weaknesses.append("Obnoxious Aggression - 공격적인 피드백")
            improvements.append("공감과 배려를 담은 커뮤니케이션")

        # LMX 분석
        if dimensions.lmx_score >= 6.0:
            strengths.append("팀원들과 높은 신뢰 관계 형성")
        elif dimensions.lmx_score <= 3.0:
            weaknesses.append("팀원들과의 신뢰 관계 구축 필요")
            improvements.append("일관성 있는 행동과 약속 이행")

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "improvements": improvements,
            "style_description": _get_style_description(style),
            "development_plan": _generate_development_plan(dimensions, style),
        }


def _get_style_description(style: LeadershipStyle) -> str:
    """리더십 스타일 설명"""
    descriptions = {
        LeadershipStyle.IMPOVERISHED: "낮은 관심도를 보이는 소극적 리더십",
        LeadershipStyle.COUNTRY_CLUB: "사람 중심의 친화적 리더십",
        LeadershipStyle.AUTHORITY_COMPLIANCE: "성과 중심의 권위적 리더십",
        LeadershipStyle.MIDDLE_OF_THE_ROAD: "균형을 추구하는 중도적 리더십",
        LeadershipStyle.TEAM_LEADER: "사람과 성과 모두를 중시하는 이상적 리더십",
        LeadershipStyle.TASK_MANAGER: "과업 중심의 실행 지향적 리더십",
        LeadershipStyle.CUSTOM: "독특한 패턴의 개성적 리더십",
    }
    return descriptions.get(style, "분석 중")


def _generate_development_plan(
    dimensions: LeadershipDimensions, style: LeadershipStyle
) -> list[str]:
    """개발 계획 생성"""
    plan = []

    # 스타일별 개발 계획
    if style == LeadershipStyle.IMPOVERISHED:
        plan.extend(
            [
                "리더십 기본 역량 강화 교육 참여",
                "멘토링 프로그램을 통한 역할 모델 학습",
                "작은 프로젝트부터 책임감 있게 수행",
            ]
        )
    elif style == LeadershipStyle.TEAM_LEADER:
        plan.extend(
            [
                "현재의 강점을 더욱 발전시키기",
                "다른 리더들에게 멘토링 제공",
                "조직 전체의 리더십 문화 개선 주도",
            ]
        )

    # 차원별 보완 계획
    if dimensions.people < 4.0:
        plan.append("감성 지능 향상 워크샵 참여")
    if dimensions.production < 4.0:
        plan.append("목표 관리 및 성과 측정 기법 학습")
    if dimensions.lmx_score < 4.0:
        plan.append("신뢰 구축을 위한 커뮤니케이션 스킬 개발")

    return plan[:5]  # 최대 5개 항목


async def trigger_analysis(
    user_id: str, responses: dict[str, int], ai_provider: AIProvider | None = None
) -> None:
    """비동기 분석 실행"""
    try:
        analyzer = LeadershipAnalyzer()

        # 차원 점수 계산
        dimensions = analyzer.calculate_dimensions(responses)

        # 리더십 스타일 분류
        style = analyzer.classify_leadership_style(
            dimensions.people, dimensions.production
        )

        # 위험도 평가
        risk_level = analyzer.assess_risk_level(dimensions)

        # 인사이트 생성
        insights = await analyzer.generate_insights(dimensions, style, ai_provider)

        # 분석 결과 저장
        db = get_service_supabase()

        analysis_data = {
            "id": str(uuid4()),
            "user_id": user_id,
            "blake_mouton_people": dimensions.people,
            "blake_mouton_production": dimensions.production,
            "feedback_care": dimensions.care,
            "feedback_challenge": dimensions.challenge,
            "lmx_score": dimensions.lmx_score,
            "influence_machiavellianism": dimensions.machiavellianism,
            "influence_narcissism": dimensions.narcissism,
            "influence_psychopathy": dimensions.psychopathy,
            "leadership_style": style.value,
            "overall_risk_level": risk_level.value,
            "ai_insights": insights,
        }

        result = db.table("leadership_analysis").insert(analysis_data).execute()

        logger.info(f"Analysis completed for user {user_id}")

    except Exception as e:
        logger.error(f"Analysis failed for user {user_id}: {str(e)}")
        raise
