# Grid 3.0 리더십 매핑 플랫폼 API 명세서

> 최종 업데이트: 2025-08-02  
> 작성자: 헤파이스토스  
> API 버전: v1.0  
> Base URL: `https://api.grid3.leadership.com/v1`

## 목차

1. [인증](#1-인증)
2. [웹훅 API](#2-웹훅-api)
3. [리더 관리 API](#3-리더-관리-api)
4. [설문 응답 API](#4-설문-응답-api)
5. [코칭 API](#5-코칭-api)
6. [분석 API](#6-분석-api)
7. [알림 API](#7-알림-api)
8. [에러 처리](#8-에러-처리)
9. [속도 제한](#9-속도-제한)

## 1. 인증

### 1.1 JWT 토큰 기반 인증

모든 API 요청은 Authorization 헤더에 Bearer 토큰을 포함해야 합니다.

```http
Authorization: Bearer <jwt_token>
```

### 1.2 토큰 발급

```http
POST /auth/login
Content-Type: application/json

{
  "email": "leader@company.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "leader@company.com",
    "name": "김리더",
    "role": "leader"
  }
}
```

### 1.3 권한 레벨

| 역할 | 권한 | 설명 |
|------|------|------|
| `admin` | 전체 데이터 접근 | 모든 리더와 팀 데이터 조회/수정 |
| `manager` | 팀 데이터 접근 | 담당 팀의 리더 데이터 조회 |
| `leader` | 개인 데이터 접근 | 본인의 데이터만 조회 |

## 2. 웹훅 API

### 2.1 Google Forms 웹훅 수신

Google Forms에서 설문 응답을 받는 엔드포인트입니다.

```http
POST /webhook/survey-response
Content-Type: application/json
X-Webhook-Secret: <webhook_secret>

{
  "leader_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-08-02T10:30:00Z",
  "answers": [7, 6, 8, 5, 9, 4, 7, 6, 8, 7, 9, 5, 6, 8, 7, 9, 8, 6, 7, 5, 9, 8, 6, 7, 5, 8, 6, 7, 9, 5, 8]
}
```

**응답:**
```json
{
  "success": true,
  "response_id": "660e8400-e29b-41d4-a716-446655440001",
  "calculated_scores": {
    "people_concern": 7.125,
    "production_concern": 7.375,
    "candor_level": 6.75,
    "lmx_quality": 7.0
  },
  "leadership_style": "팀형(7.1, 7.4)",
  "processing_time_ms": 45
}
```

### 2.2 웹훅 인증

웹훅 요청은 `X-Webhook-Secret` 헤더로 인증됩니다.

```python
# 웹훅 시크릿 검증 예시
import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

## 3. 리더 관리 API

### 3.1 리더 목록 조회

```http
GET /leaders?page=1&limit=20&team=engineering&sort=name
Authorization: Bearer <token>
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20, 최대: 100)
- `team`: 팀 필터링 (선택사항)
- `sort`: 정렬 기준 (`name`, `created_at`, `last_survey`)

**응답:**
```json
{
  "leaders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "김리더",
      "email": "leader@company.com",
      "team": "engineering",
      "position": "Tech Lead",
      "last_survey_at": "2025-08-01T14:30:00Z",
      "current_scores": {
        "people_concern": 7.125,
        "production_concern": 7.375,
        "candor_level": 6.75,
        "lmx_quality": 7.0
      },
      "leadership_style": "팀형(7.1, 7.4)"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### 3.2 개별 리더 조회

```http
GET /leaders/{leader_id}
Authorization: Bearer <token>
```

**응답:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "김리더",
  "email": "leader@company.com",
  "team": "engineering",
  "position": "Tech Lead",
  "created_at": "2025-01-15T09:00:00Z",
  "last_survey_at": "2025-08-01T14:30:00Z",
  "survey_count": 12,
  "current_scores": {
    "people_concern": 7.125,
    "production_concern": 7.375,
    "candor_level": 6.75,
    "lmx_quality": 7.0
  },
  "leadership_style": "팀형(7.1, 7.4)",
  "trend_data": [
    {
      "date": "2025-07-01",
      "people_concern": 6.8,
      "production_concern": 7.2,
      "candor_level": 6.5,
      "lmx_quality": 6.9
    }
  ],
  "coaching_status": {
    "active_cards": 2,
    "completed_tasks": 5,
    "last_coaching_at": "2025-08-01T15:00:00Z"
  }
}
```

### 3.3 리더 생성

```http
POST /leaders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "박신입",
  "email": "newleader@company.com",
  "team": "product",
  "position": "Product Manager"
}
```

**응답:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "name": "박신입",
  "email": "newleader@company.com",
  "team": "product",
  "position": "Product Manager",
  "created_at": "2025-08-02T10:45:00Z",
  "survey_invite_sent": true
}
```

## 4. 설문 응답 API

### 4.1 설문 응답 내역 조회

```http
GET /leaders/{leader_id}/responses?limit=10&since=2025-07-01
Authorization: Bearer <token>
```

**응답:**
```json
{
  "responses": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "submitted_at": "2025-08-01T14:30:00Z",
      "answers": [7, 6, 8, 5, 9, 4, 7, 6, 8, 7, 9, 5, 6, 8, 7, 9, 8, 6, 7, 5, 9, 8, 6, 7, 5, 8, 6, 7, 9, 5, 8],
      "calculated_scores": {
        "people_concern": 7.125,
        "production_concern": 7.375,
        "candor_level": 6.75,
        "lmx_quality": 7.0
      },
      "leadership_style": "팀형(7.1, 7.4)",
      "completion_time_seconds": 485
    }
  ],
  "pagination": {
    "limit": 10,
    "total": 12,
    "has_more": true
  }
}
```

### 4.2 설문 응답 상세 조회

```http
GET /responses/{response_id}
Authorization: Bearer <token>
```

**응답:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "leader_id": "550e8400-e29b-41d4-a716-446655440000",
  "submitted_at": "2025-08-01T14:30:00Z",
  "answers": [7, 6, 8, 5, 9, 4, 7, 6, 8, 7, 9, 5, 6, 8, 7, 9, 8, 6, 7, 5, 9, 8, 6, 7, 5, 8, 6, 7, 9, 5, 8],
  "answer_breakdown": {
    "managerial_grid": {
      "people_concern": [7, 6, 8, 5, 9, 4, 7, 6],
      "production_concern": [8, 7, 9, 5, 6, 8, 7, 9]
    },
    "radical_candor": {
      "care": [8, 6, 7, 5],
      "challenge": [9, 8, 6, 7]
    },
    "lmx": [5, 8, 6, 7, 9, 5, 8]
  },
  "calculated_scores": {
    "people_concern": 7.125,
    "production_concern": 7.375,
    "candor_level": 6.75,
    "lmx_quality": 7.0
  },
  "leadership_style": "팀형(7.1, 7.4)",
  "completion_time_seconds": 485,
  "quality_indicators": {
    "response_consistency": 0.92,
    "completion_rate": 1.0,
    "time_per_question_avg": 15.6
  }
}
```

## 5. 코칭 API

### 5.1 개인화 코칭 카드 조회

```http
GET /leaders/{leader_id}/coaching
Authorization: Bearer <token>
```

**응답:**
```json
{
  "leader_id": "550e8400-e29b-41d4-a716-446655440000",
  "coaching_cards": [
    {
      "id": "card_001",
      "title": "경청 스킬 향상 챌린지",
      "category": "people_concern",
      "priority": "high",
      "description": "팀원들과의 소통에서 능동적 경청을 실천해보세요.",
      "action_items": [
        {
          "task": "회의에서 3초 정적 유지 후 응답하기",
          "estimated_time": "1주일",
          "difficulty": "쉬움"
        },
        {
          "task": "팀원 의견을 요약해서 되물어보기",
          "estimated_time": "2주일",
          "difficulty": "보통"
        }
      ],
      "resources": [
        {
          "title": "효과적인 경청 기법",
          "type": "article",
          "url": "https://resources.grid3.com/listening-skills"
        }
      ],
      "success_metrics": [
        "팀원 만족도 조사에서 소통 점수 +1점 이상"
      ],
      "status": "active",
      "created_at": "2025-08-01T15:00:00Z"
    },
    {
      "id": "card_002",
      "title": "직면 피드백 스크립트 연습",
      "category": "candor",
      "priority": "medium",
      "description": "어려운 피드백을 건설적으로 전달하는 방법을 연습해보세요.",
      "action_items": [
        {
          "task": "SBI 모델로 피드백 스크립트 작성",
          "estimated_time": "3일",
          "difficulty": "보통"
        }
      ],
      "resources": [
        {
          "title": "SBI 피드백 모델 가이드",
          "type": "video",
          "url": "https://resources.grid3.com/sbi-feedback"
        }
      ],
      "success_metrics": [
        "피드백 후 팀원과의 관계 개선 확인"
      ],
      "status": "pending",
      "created_at": "2025-08-01T15:00:00Z"
    }
  ],
  "recommendation_reason": {
    "people_concern": "현재 점수 7.1로 양호하나, 경청 스킬 향상으로 8점 이상 달성 가능",
    "candor_level": "점수 6.75로 개선 필요. 직면 피드백 연습으로 7점 이상 목표"
  },
  "generated_at": "2025-08-01T15:00:00Z",
  "next_review_date": "2025-08-15T15:00:00Z"
}
```

### 5.2 코칭 카드 완료 처리

```http
POST /coaching/cards/{card_id}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "completion_notes": "SBI 모델을 사용해서 3명의 팀원에게 피드백을 제공했습니다. 모두 긍정적으로 받아들였습니다.",
  "action_items_completed": ["card_002_action_001"],
  "effectiveness_rating": 4,
  "would_recommend": true
}
```

**응답:**
```json
{
  "success": true,
  "card_id": "card_002",
  "completed_at": "2025-08-02T11:00:00Z",
  "next_pulse_scheduled": "2025-08-03T09:00:00Z",
  "follow_up_cards_generated": 1
}
```

### 5.3 Quick Pulse 설문 발송

```http
POST /coaching/pulse/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "leader_id": "550e8400-e29b-41d4-a716-446655440000",
  "trigger_event": "coaching_card_completed",
  "pulse_type": "candor_lmx",
  "target_team_members": ["member1@company.com", "member2@company.com"]
}
```

**응답:**
```json
{
  "success": true,
  "pulse_id": "pulse_001",
  "sent_to": 2,
  "expected_responses": 2,
  "deadline": "2025-08-05T18:00:00Z",
  "tracking_url": "https://forms.google.com/pulse_001"
}
```

## 6. 분석 API

### 6.1 대시보드 데이터 조회

```http
GET /analytics/dashboard?team=engineering&period=quarterly
Authorization: Bearer <token>
```

**응답:**
```json
{
  "overview": {
    "total_leaders": 45,
    "survey_completion_rate": 96.7,
    "avg_leadership_scores": {
      "people_concern": 7.2,
      "production_concern": 7.8,
      "candor_level": 6.9,
      "lmx_quality": 7.1
    },
    "trend_direction": {
      "people_concern": "increasing",
      "production_concern": "stable",
      "candor_level": "increasing",
      "lmx_quality": "stable"
    }
  },
  "grid_data": [
    {
      "leader_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "김리더",
      "position": [7.125, 7.375, 6.75],
      "size": 7.0,
      "style": "팀형",
      "risk_level": "low"
    }
  ],
  "coaching_effectiveness": {
    "active_cards": 89,
    "completed_cards": 234,
    "avg_effectiveness_rating": 4.2,
    "most_popular_categories": ["people_concern", "candor"]
  },
  "kpi_metrics": {
    "survey_completion_rate": 96.7,
    "avg_4d_movement": 2.3,
    "team_okr_achievement": 78.5,
    "burnout_risk_reduction": -12.8
  }
}
```

### 6.2 팀별 비교 분석

```http
GET /analytics/teams/comparison?teams=engineering,product,design
Authorization: Bearer <token>
```

**응답:**
```json
{
  "teams": [
    {
      "name": "engineering",
      "member_count": 15,
      "avg_scores": {
        "people_concern": 7.2,
        "production_concern": 8.1,
        "candor_level": 6.8,
        "lmx_quality": 7.0
      },
      "leadership_styles": {
        "팀형(9,9)": 6,
        "과업형(1,9)": 4,
        "중도형(5,5)": 3,
        "기타": 2
      },
      "coaching_utilization": 0.89
    }
  ],
  "comparison_insights": [
    "Engineering 팀의 production_concern이 다른 팀보다 평균 1.2점 높음",
    "Product 팀의 candor_level 개선이 필요 (평균 6.1점)"
  ]
}
```

### 6.3 리더십 트렌드 분석

```http
GET /analytics/trends?leader_id={leader_id}&period=6months
Authorization: Bearer <token>
```

**응답:**
```json
{
  "leader_id": "550e8400-e29b-41d4-a716-446655440000",
  "period": "6months",
  "trend_data": [
    {
      "month": "2025-02",
      "people_concern": 6.5,
      "production_concern": 7.8,
      "candor_level": 6.2,
      "lmx_quality": 6.8,
      "leadership_style": "과업형(6.5, 7.8)"
    },
    {
      "month": "2025-07",
      "people_concern": 7.125,
      "production_concern": 7.375,
      "candor_level": 6.75,
      "lmx_quality": 7.0,
      "leadership_style": "팀형(7.1, 7.4)"
    }
  ],
  "improvement_metrics": {
    "people_concern_change": +0.625,
    "leadership_style_evolution": "과업형 → 팀형",
    "overall_balance_score": 8.2,
    "coaching_impact_score": 7.8
  },
  "insights": [
    "지난 6개월간 people_concern이 0.6점 향상되어 리더십 스타일이 팀형으로 발전",
    "코칭 카드 완료율이 높아 지속적 개선이 예상됨"
  ]
}
```

## 7. 알림 API

### 7.1 Slack 알림 발송

```http
POST /notifications/slack
Authorization: Bearer <token>
Content-Type: application/json

{
  "channel": "#leadership-updates",
  "message_type": "survey_reminder",
  "leader_ids": ["550e8400-e29b-41d4-a716-446655440000"],
  "custom_message": "분기별 리더십 설문이 오픈되었습니다. 10분 내로 완료해주세요."
}
```

**응답:**
```json
{
  "success": true,
  "message_id": "slack_msg_001",
  "sent_at": "2025-08-02T11:30:00Z",
  "recipients": 1,
  "channel": "#leadership-updates"
}
```

### 7.2 이메일 알림 발송

```http
POST /notifications/email
Authorization: Bearer <token>
Content-Type: application/json

{
  "template": "coaching_card_assigned",
  "recipients": ["leader@company.com"],
  "variables": {
    "leader_name": "김리더",
    "card_title": "경청 스킬 향상 챌린지",
    "due_date": "2025-08-15"
  }
}
```

**응답:**
```json
{
  "success": true,
  "email_id": "email_001",
  "sent_at": "2025-08-02T11:35:00Z",
  "recipients": 1,
  "template": "coaching_card_assigned"
}
```

## 8. 에러 처리

### 8.1 표준 에러 응답

모든 API 에러는 다음 형식으로 반환됩니다:

```json
{
  "error": {
    "code": "LEADER_NOT_FOUND",
    "message": "지정된 리더를 찾을 수 없습니다.",
    "details": {
      "leader_id": "invalid-uuid",
      "resource": "leaders"
    },
    "timestamp": "2025-08-02T11:40:00Z",
    "request_id": "req_abc123"
  }
}
```

### 8.2 HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 잘못된 요청 데이터 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 422 | Unprocessable Entity | 유효성 검증 실패 |
| 429 | Too Many Requests | 속도 제한 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |

### 8.3 에러 코드 목록

| 에러 코드 | HTTP 상태 | 설명 |
|-----------|-----------|------|
| `INVALID_TOKEN` | 401 | 유효하지 않은 JWT 토큰 |
| `TOKEN_EXPIRED` | 401 | 만료된 토큰 |
| `INSUFFICIENT_PERMISSIONS` | 403 | 권한 부족 |
| `LEADER_NOT_FOUND` | 404 | 리더를 찾을 수 없음 |
| `INVALID_SURVEY_DATA` | 422 | 설문 데이터 유효성 오류 |
| `WEBHOOK_VERIFICATION_FAILED` | 400 | 웹훅 인증 실패 |
| `RATE_LIMIT_EXCEEDED` | 429 | API 호출 한도 초과 |

## 9. 속도 제한

### 9.1 기본 제한

- **일반 API**: 100 requests/분
- **웹훅 API**: 1000 requests/분
- **분석 API**: 50 requests/분

### 9.2 제한 헤더

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 89
X-RateLimit-Reset: 1722596400
```

### 9.3 제한 초과 시 응답

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
    "retry_after": 60
  }
}
```

---

## API 사용 예시

### Python 클라이언트 예시

```python
import httpx
from typing import Optional, Dict, Any

class Grid3APIClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {token}"}
        
    async def get_leader(self, leader_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/leaders/{leader_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_coaching_cards(self, leader_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/leaders/{leader_id}/coaching",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()

# 사용 예시
client = Grid3APIClient("https://api.grid3.leadership.com/v1", "your_token")
leader = await client.get_leader("550e8400-e29b-41d4-a716-446655440000")
coaching = await client.get_coaching_cards("550e8400-e29b-41d4-a716-446655440000")
```

### JavaScript 클라이언트 예시

```javascript
class Grid3APIClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  async getLeader(leaderId) {
    const response = await fetch(`${this.baseURL}/leaders/${leaderId}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getDashboardData(team = null, period = 'quarterly') {
    const params = new URLSearchParams({ period });
    if (team) params.append('team', team);
    
    const response = await fetch(`${this.baseURL}/analytics/dashboard?${params}`, {
      headers: this.headers
    });
    
    return response.json();
  }
}

// 사용 예시
const client = new Grid3APIClient('https://api.grid3.leadership.com/v1', 'your_token');
const leader = await client.getLeader('550e8400-e29b-41d4-a716-446655440000');
const dashboard = await client.getDashboardData('engineering');
```

---

이 API 명세서는 Grid 3.0 리더십 매핑 플랫폼의 모든 엔드포인트를 포괄하며, 개발 과정에서 API 계약의 기준이 됩니다.