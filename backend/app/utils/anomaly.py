"""
이상치 탐지 유틸리티
데이터의 이상 패턴을 감지하는 정교한 도구
"""

from dataclasses import dataclass
from typing import Any

import numpy as np
from scipy import stats


@dataclass
class AnomalyScore:
    """이상치 점수"""

    dimension: str
    score: float
    reason: str
    severity: str  # 'low', 'medium', 'high'


class AnomalyDetector:
    """다차원 이상치 탐지기"""

    def __init__(self):
        # Z-score 임계값
        self.z_score_threshold = 2.5

        # IQR 배수
        self.iqr_multiplier = 1.5

        # 리더십 스타일별 예상 패턴
        self.leadership_patterns = {
            "Team Leadership": {
                "people": (5.5, 7),
                "production": (5.5, 7),
                "candor": (5, 7),
                "lmx": (5, 7),
            },
            "Country Club": {
                "people": (5.5, 7),
                "production": (1, 3),
                "candor": (3, 5),
                "lmx": (4, 6),
            },
            "Authority-Compliance": {
                "people": (1, 3),
                "production": (5.5, 7),
                "candor": (4, 6),
                "lmx": (2, 4),
            },
            "Impoverished": {
                "people": (1, 3),
                "production": (1, 3),
                "candor": (2, 4),
                "lmx": (2, 4),
            },
            "Middle of the Road": {
                "people": (4, 5),
                "production": (4, 5),
                "candor": (3.5, 5.5),
                "lmx": (3.5, 5.5),
            },
        }

    def detect_statistical_anomalies(
        self, values: list[float], method: str = "z_score"
    ) -> list[int]:
        """통계적 이상치 탐지"""
        if len(values) < 3:
            return []

        values_array = np.array(values)

        if method == "z_score":
            # Z-score 방법
            z_scores = np.abs(stats.zscore(values_array))
            return list(np.where(z_scores > self.z_score_threshold)[0])

        elif method == "iqr":
            # IQR 방법
            Q1 = np.percentile(values_array, 25)
            Q3 = np.percentile(values_array, 75)
            IQR = Q3 - Q1

            lower_bound = Q1 - self.iqr_multiplier * IQR
            upper_bound = Q3 + self.iqr_multiplier * IQR

            return list(
                np.where((values_array < lower_bound) | (values_array > upper_bound))[0]
            )

        elif method == "isolation_forest":
            # 간단한 고립 기반 이상치 탐지
            mean = np.mean(values_array)
            std = np.std(values_array)

            anomalies = []
            for i, value in enumerate(values_array):
                isolation_score = abs(value - mean) / (std + 0.001)
                if isolation_score > 2.5:
                    anomalies.append(i)

            return anomalies

        return []

    def detect_pattern_anomalies(
        self,
        people_score: float,
        production_score: float,
        candor_score: float,
        lmx_score: float,
    ) -> list[AnomalyScore]:
        """패턴 기반 이상치 탐지"""
        anomalies = []

        # 1. 극단적 점수 차이
        score_pairs = [
            ("people", people_score, "production", production_score),
            ("candor", candor_score, "lmx", lmx_score),
        ]

        for dim1, score1, dim2, score2 in score_pairs:
            diff = abs(score1 - score2)
            if diff > 5:
                anomalies.append(
                    AnomalyScore(
                        dimension=f"{dim1}_vs_{dim2}",
                        score=diff,
                        reason=f"{dim1}와 {dim2}의 극단적 차이 ({diff:.1f})",
                        severity="high",
                    )
                )

        # 2. 비현실적인 조합
        # 높은 Production + 낮은 LMX (비현실적)
        if production_score > 6 and lmx_score < 2:
            anomalies.append(
                AnomalyScore(
                    dimension="production_lmx_mismatch",
                    score=production_score - lmx_score,
                    reason="높은 성과 중심 + 매우 낮은 관계 품질",
                    severity="high",
                )
            )

        # 3. 모든 점수가 극단값
        all_scores = [people_score, production_score, candor_score, lmx_score]
        if all(s > 6.5 for s in all_scores):
            anomalies.append(
                AnomalyScore(
                    dimension="all_high",
                    score=np.mean(all_scores),
                    reason="모든 차원이 비현실적으로 높음",
                    severity="medium",
                )
            )
        elif all(s < 1.5 for s in all_scores):
            anomalies.append(
                AnomalyScore(
                    dimension="all_low",
                    score=np.mean(all_scores),
                    reason="모든 차원이 비현실적으로 낮음",
                    severity="medium",
                )
            )

        # 4. Candor-LMX 불일치
        if candor_score > 6 and lmx_score < 3:
            anomalies.append(
                AnomalyScore(
                    dimension="candor_lmx_conflict",
                    score=candor_score - lmx_score,
                    reason="높은 솔직함 + 낮은 관계 품질 (모순)",
                    severity="medium",
                )
            )

        return anomalies

    def detect_temporal_anomalies(
        self, movements: list[dict[str, Any]]
    ) -> list[AnomalyScore]:
        """시간적 이상치 탐지"""
        anomalies = []

        if not movements:
            return anomalies

        # 1. 급격한 변화 탐지
        for movement in movements:
            magnitude = movement.get("magnitude", 0)
            days = movement.get("days_between", 1)

            # 일일 변화율
            daily_change = magnitude / days if days > 0 else magnitude

            if daily_change > 0.5:  # 하루에 0.5 이상 변화
                anomalies.append(
                    AnomalyScore(
                        dimension="rapid_change",
                        score=daily_change,
                        reason=f"{days}일 동안 {magnitude:.2f} 변화 (일일 {daily_change:.2f})",
                        severity="high" if daily_change > 1.0 else "medium",
                    )
                )

        # 2. 요요 패턴 탐지 (오르락내리락)
        if len(movements) >= 3:
            directions = []
            for m in movements:
                # 주요 차원의 변화 방향
                people_delta = m.get("people_delta", 0)
                production_delta = m.get("production_delta", 0)

                direction = 1 if (people_delta + production_delta) > 0 else -1
                directions.append(direction)

            # 방향 변화 횟수
            direction_changes = sum(
                1
                for i in range(1, len(directions))
                if directions[i] != directions[i - 1]
            )

            if direction_changes >= len(directions) - 1:
                anomalies.append(
                    AnomalyScore(
                        dimension="yoyo_pattern",
                        score=direction_changes / len(directions),
                        reason="일관성 없는 요요 패턴",
                        severity="medium",
                    )
                )

        return anomalies

    def calculate_anomaly_score(
        self, anomalies: list[AnomalyScore]
    ) -> tuple[float, str]:
        """종합 이상치 점수 계산"""
        if not anomalies:
            return 0.0, "정상"

        # 심각도별 가중치
        severity_weights = {"low": 0.3, "medium": 0.6, "high": 1.0}

        total_score = sum(
            severity_weights.get(a.severity, 0.5) * a.score for a in anomalies
        )

        # 정규화 (0-100)
        normalized_score = min(100, total_score * 10)

        # 등급 결정
        if normalized_score < 20:
            grade = "정상"
        elif normalized_score < 40:
            grade = "주의"
        elif normalized_score < 60:
            grade = "경고"
        else:
            grade = "위험"

        return normalized_score, grade


# 싱글톤 인스턴스
anomaly_detector = AnomalyDetector()
