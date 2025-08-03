"""
선택적 슬랙 알림 시스템 - Grid 3.0용
중요한 마일스톤과 사용자 결정이 필요한 시점에만 알림
"""

import sys

sys.path.insert(0, "/Users/vibetj/coding")

import logging

# slackalarm 모듈 임포트
try:
    from slackalarm import (
        SelectiveNotificationManager as BaseSelectiveManager,
    )
    from slackalarm import (
        notify_major_milestone as slack_notify_milestone,
    )
    from slackalarm import (
        notify_user_input_needed as slack_notify_input_needed,
    )
    from slackalarm import (
        notify_work_complete as slack_notify_work_complete,
    )
    from slackalarm import (
        send_simple_message,
    )

    SLACKALARM_AVAILABLE = True
except ImportError:
    SLACKALARM_AVAILABLE = False
    logging.warning("slackalarm 모듈을 찾을 수 없소. 슬랙 알림이 비활성화됩니다.")

logger = logging.getLogger(__name__)


# 헬퍼 함수들
async def notify_work_complete(
    completed_tasks: list[str], next_steps: list[str], reason: str = "작업 구간 완료"
):
    """작업 완료 및 대기 상태 전환 알림"""
    if SLACKALARM_AVAILABLE:
        try:
            await slack_notify_work_complete(
                completed_work=completed_tasks,
                next_steps=next_steps,
                waiting_reason=reason,
            )
            logger.info(f"슬랙 알림 전송 완료: {reason}")
        except Exception as e:
            logger.error(f"슬랙 알림 전송 실패: {e}")
    else:
        logger.info(f"[슬랙 알림 비활성화] {reason}")
        logger.info(f"완료: {completed_tasks}")
        logger.info(f"다음: {next_steps}")


async def notify_user_input_needed(context: str, question: str, options: list[str]):
    """사용자 입력 필요 알림"""
    if SLACKALARM_AVAILABLE:
        try:
            await slack_notify_input_needed(
                context=context, question=question, options=options
            )
            logger.info(f"사용자 입력 요청 알림 전송: {context}")
        except Exception as e:
            logger.error(f"슬랙 알림 전송 실패: {e}")
    else:
        logger.info(f"[사용자 입력 필요] {context}")
        logger.info(f"질문: {question}")
        logger.info(f"옵션: {options}")


async def notify_major_milestone(milestone: str, description: str, **metrics):
    """주요 마일스톤 달성 알림"""
    if SLACKALARM_AVAILABLE:
        try:
            await slack_notify_milestone(
                milestone=milestone, description=description, **metrics
            )
            logger.info(f"마일스톤 알림 전송: {milestone}")
        except Exception as e:
            logger.error(f"슬랙 알림 전송 실패: {e}")
    else:
        logger.info(f"[마일스톤 달성] {milestone}")
        logger.info(f"설명: {description}")
        if metrics:
            logger.info(f"지표: {metrics}")


async def send_development_complete_alert():
    """개발 완료 시 슬랙 알림"""
    if SLACKALARM_AVAILABLE:
        try:
            await send_simple_message(
                title="🔨 Grid 3.0 개발 대기 상태",
                message="헤파이스토스가 작업을 완료하고 TJ님의 지시를 기다리고 있소!",
            )
        except Exception as e:
            logger.error(f"슬랙 알림 전송 실패: {e}")
    else:
        logger.info("개발 완료 - 사용자 대기 상태")


# Grid 3.0 프로젝트 전용 알림 함수
async def notify_grid3_milestone(
    week: int, day: str, completed_items: list[str], progress_percent: float
):
    """Grid 3.0 주간 마일스톤 알림"""
    milestone = f"Grid 3.0 - Week {week} {day} 완료"
    description = "\n".join([f"✅ {item}" for item in completed_items])

    await notify_major_milestone(
        milestone=milestone,
        description=description,
        진행률=f"{progress_percent}%",
        주차=f"Week {week}/12",
    )


async def notify_api_ready(api_endpoints: list[str], docs_url: str):
    """API 준비 완료 알림"""
    completed = [f"API 엔드포인트: {endpoint}" for endpoint in api_endpoints]
    completed.append(f"API 문서: {docs_url}")

    next_steps = ["API 테스트 실행", "Frontend 통합", "성능 측정"]

    await notify_work_complete(
        completed_tasks=completed,
        next_steps=next_steps,
        reason="API 구현 완료 - 테스트 준비",
    )


async def notify_test_results(
    total_tests: int, passed: int, failed: int, coverage: float
):
    """테스트 결과 알림"""
    if failed > 0:
        await notify_user_input_needed(
            context=f"테스트 실패: {failed}/{total_tests}개",
            question="테스트 실패를 수정하시겠습니까?",
            options=["실패한 테스트 수정", "테스트 건너뛰고 진행", "상세 로그 확인"],
        )
    else:
        await send_simple_message(
            title="✅ 모든 테스트 통과",
            message=f"테스트: {passed}/{total_tests} 통과\n커버리지: {coverage}%",
        )
