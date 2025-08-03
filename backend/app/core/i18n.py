"""
다국어 지원 (i18n)
한국어와 영어 메시지 관리
"""

# 메시지 딕셔너리
messages: dict[str, dict[str, str]] = {
    # 검증 메시지
    "배치 크기는 최대 100개입니다": {
        "ko": "배치 크기는 최대 100개입니다",
        "en": "Batch size cannot exceed 100 items",
    },
    "모든 점수는 1-7 범위여야 합니다": {
        "ko": "모든 점수는 1-7 범위여야 합니다",
        "en": "All scores must be between 1 and 7",
    },
    # 이상치 메시지
    "정상": {"ko": "정상", "en": "Normal"},
    "주의": {"ko": "주의", "en": "Caution"},
    "경고": {"ko": "경고", "en": "Warning"},
    "위험": {"ko": "위험", "en": "Critical"},
    # 권장사항
    "People과 Production 점수의 균형을 맞추는 것이 중요합니다": {
        "ko": "People과 Production 점수의 균형을 맞추는 것이 중요합니다",
        "en": "It's important to balance People and Production scores",
    },
    "모든 영역에서 높은 점수는 현실적이지 않을 수 있습니다. 솔직한 자기평가가 필요합니다": {
        "ko": "모든 영역에서 높은 점수는 현실적이지 않을 수 있습니다. 솔직한 자기평가가 필요합니다",
        "en": "High scores in all areas may not be realistic. Honest self-assessment is needed",
    },
    "높은 솔직함과 낮은 관계 품질의 조합은 개선이 필요합니다": {
        "ko": "높은 솔직함과 낮은 관계 품질의 조합은 개선이 필요합니다",
        "en": "The combination of high candor and low relationship quality needs improvement",
    },
    # 에러 메시지
    "올바른 이메일 형식이 아니오!": {
        "ko": "올바른 이메일 형식이 아니오!",
        "en": "Invalid email format!",
    },
    "31개의 응답이 필요하오!": {
        "ko": "31개의 응답이 필요하오!",
        "en": "31 responses are required!",
    },
    "응답 값은 1-7 범위여야 하오!": {
        "ko": "응답 값은 1-7 범위여야 하오!",
        "en": "Response values must be between 1-7!",
    },
    # 중복 응답
    "24시간 내 동일한 응답이 이미 제출되었소!": {
        "ko": "24시간 내 동일한 응답이 이미 제출되었소!",
        "en": "The same response was already submitted within 24 hours!",
    },
    "너무 빈번한 응답이오.": {
        "ko": "너무 빈번한 응답이오.",
        "en": "Too frequent responses.",
    },
    # 검증 결과
    "응답 개수 불일치": {"ko": "응답 개수 불일치", "en": "Response count mismatch"},
    "높은 응답 변동성": {"ko": "높은 응답 변동성", "en": "High response variance"},
    "모든 응답이 동일한 값이오! 성의있는 응답이 아닌 것 같소.": {
        "ko": "모든 응답이 동일한 값이오! 성의있는 응답이 아닌 것 같소.",
        "en": "All responses have the same value! This doesn't seem like a sincere response.",
    },
    # 완료 시간
    "매우 빠른 완료 시간": {
        "ko": "매우 빠른 완료 시간",
        "en": "Very fast completion time",
    },
    "매우 느린 완료 시간": {
        "ko": "매우 느린 완료 시간",
        "en": "Very slow completion time",
    },
    # 이상 패턴
    "모든 점수가 매우 높음": {
        "ko": "모든 점수가 매우 높음",
        "en": "All scores are very high",
    },
    "모든 점수가 매우 낮음": {
        "ko": "모든 점수가 매우 낮음",
        "en": "All scores are very low",
    },
    "People vs Production 극단적 차이": {
        "ko": "People vs Production 극단적 차이",
        "en": "Extreme difference between People and Production",
    },
    "높은 성과 중심 + 매우 낮은 관계 품질": {
        "ko": "높은 성과 중심 + 매우 낮은 관계 품질",
        "en": "High performance focus + very low relationship quality",
    },
    "높은 솔직함 + 낮은 관계 품질 (모순)": {
        "ko": "높은 솔직함 + 낮은 관계 품질 (모순)",
        "en": "High candor + low relationship quality (contradictory)",
    },
    "일관성 없는 요요 패턴": {
        "ko": "일관성 없는 요요 패턴",
        "en": "Inconsistent yo-yo pattern",
    },
    "이상 패턴이 감지되었소. 검토가 필요하오.": {
        "ko": "이상 패턴이 감지되었소. 검토가 필요하오.",
        "en": "Anomaly patterns detected. Review needed.",
    },
}


def get_message(key: str, lang: str = "ko") -> str:
    """
    메시지 조회

    Args:
        key: 메시지 키
        lang: 언어 코드 (ko, en)

    Returns:
        번역된 메시지 또는 원본 키
    """
    if key in messages:
        return messages[key].get(lang, messages[key].get("ko", key))
    return key


def add_message(key: str, translations: dict[str, str]):
    """
    새 메시지 추가

    Args:
        key: 메시지 키
        translations: 언어별 번역 {"ko": "...", "en": "..."}
    """
    messages[key] = translations


def get_available_languages() -> list:
    """사용 가능한 언어 목록"""
    return ["ko", "en"]
