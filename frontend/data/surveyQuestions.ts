/**
 * AI Leadership 4Dx - 설문 문항 데이터
 * survey1.0.0.md 기반
 */

export interface SurveyQuestion {
  id: string;
  text: string;
  dimension: string;
  category: string;
  scale: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
  isReverse?: boolean; // 역방향 채점
}

export interface SurveySection {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

// 1. 블레이크·마우턴 관리 그리드 (16문항)
const blakeMousetonQuestions: SurveyQuestion[] = [
  // 사람 관심 (1-8)
  {
    id: 'bm_people_1',
    text: '나는 팀원의 개인적 고민도 업무만큼 진지하게 듣는다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_people_2',
    text: '프로젝트 후 반드시 팀원에게 피로도를 점검하고 휴식 계획을 잡는다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_people_3',
    text: '팀원이 성장 목표를 세우면 필요한 교육 예산을 먼저 확보한다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_people_4',
    text: '회의에서 말이 적은 구성원에게 먼저 발언 기회를 준다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_people_5',
    text: '실수한 팀원을 질책하기보다 학습 기회로 삼도록 돕는다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_people_6',
    text: '팀원의 생일·기념일을 조직 자원으로 챙긴다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_people_7',
    text: '갈등이 생기면 중립적으로 경청한 뒤 모두가 납득할 해법을 찾는다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_people_8',
    text: '팀원의 심리적 안전감이 떨어지면 즉시 해결 방안을 논의한다.',
    dimension: 'people',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  // 성과 관심 (9-16)
  {
    id: 'bm_production_1',
    text: '명확한 수치 목표를 설정하고 주기적으로 달성도를 검토한다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_production_2',
    text: '일정 지연 가능성을 발견하면 즉시 자원·우선순위를 재조정한다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_production_3',
    text: '반복 업무는 표준 절차화해 효율을 높인다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_production_4',
    text: '성과가 기대에 못 미치면 원인 분석과 구체적 개선안을 요구한다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_production_5',
    text: '고객·투자자 보고를 위해 핵심 지표를 일관되게 추적한다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_production_6',
    text: '업무 시간을 줄이더라도 품질 기준은 결코 낮추지 않는다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_production_7',
    text: '우수 사례를 찾아 벤치마킹하고 팀 프로세스에 반영한다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'bm_production_8',
    text: '목표 달성을 위해 필요하면 비인기 결정을 주저 없이 내린다.',
    dimension: 'production',
    category: 'blake_mouton',
    scale: { min: 1, max: 7 }
  }
];

// 2. 피드백 강도 (8문항)
const feedbackQuestions: SurveyQuestion[] = [
  // 관심(배려) (1-4)
  {
    id: 'fb_care_1',
    text: '나는 구성원의 생활·가치관을 이해하려 노력한다.',
    dimension: 'care',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'fb_care_2',
    text: '팀원이 번아웃 조짐을 보이면 업무 재조정부터 검토한다.',
    dimension: 'care',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'fb_care_3',
    text: '힘든 시기를 겪는 구성원에게 업무 외 지원책도 안내한다.',
    dimension: 'care',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'fb_care_4',
    text: '실수해도 인격을 존중하며 피드백한다.',
    dimension: 'care',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  },
  // 직면(도전) (5-8)
  {
    id: 'fb_challenge_1',
    text: '성과 기준에 못 미치면 즉시 구체적 수치를 들어 지적한다.',
    dimension: 'challenge',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'fb_challenge_2',
    text: '불편한 사실이라도 회의에서 직접 말해 갈등을 피하지 않는다.',
    dimension: 'challenge',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'fb_challenge_3',
    text: '내 결정이 잘못되면 팀 앞에서 먼저 인정하고 수정한다.',
    dimension: 'challenge',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'fb_challenge_4',
    text: '"좋다"·"괜찮다" 대신 구체 행동 계획을 제시해 피드백을 끝낸다.',
    dimension: 'challenge',
    category: 'feedback',
    scale: { min: 1, max: 7 }
  }
];

// 3. LMX (7문항)
const lmxQuestions: SurveyQuestion[] = [
  {
    id: 'lmx_1',
    text: '나는 리더(또는 부하)에게 업무상 거의 완전한 신뢰를 받는다.',
    dimension: 'lmx',
    category: 'lmx',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'lmx_2',
    text: '중요한 결정을 앞두고 서로 솔직히 의견을 교환한다.',
    dimension: 'lmx',
    category: 'lmx',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'lmx_3',
    text: '위기 상황에서 서로를 전적으로 지원할 것이라고 확신한다.',
    dimension: 'lmx',
    category: 'lmx',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'lmx_4',
    text: '추가 노력이 필요할 때 자발적으로 돕거나 도움을 요청한다.',
    dimension: 'lmx',
    category: 'lmx',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'lmx_5',
    text: '상대방은 내가 하는 일을 높은 전문성으로 인정한다.',
    dimension: 'lmx',
    category: 'lmx',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'lmx_6',
    text: '성과 공로가 있을 때 서로 공정하게 인정한다.',
    dimension: 'lmx',
    category: 'lmx',
    scale: { min: 1, max: 7 }
  },
  {
    id: 'lmx_7',
    text: '직무 외적인 문제도 상의할 정도로 관계가 탄탄하다.',
    dimension: 'lmx',
    category: 'lmx',
    scale: { min: 1, max: 7 }
  }
];

// 4. Influence Gauge (Dirty Dozen 대체 - 12문항)
const influenceGaugeQuestions: SurveyQuestion[] = [
  {
    id: 'ig_1',
    text: '새로운 제안을 통과시키기 위해 정보를 선택적으로 공유한 적이 있다.',
    dimension: 'hidden_m', // 마키아벨리즘 (숨김)
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_2',
    text: '상대가 눈치채지 못하게 말을 돌려 목적을 이룬 경험이 있다.',
    dimension: 'hidden_m',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_3',
    text: '팀 목표 달성을 위해 상대방 욕구를 활용한 적이 있다.',
    dimension: 'hidden_m',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_4',
    text: '중요 이익이 걸려도, 거짓 정보는 절대 쓰지 않는다.',
    dimension: 'hidden_m',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 },
    isReverse: true
  },
  {
    id: 'ig_5',
    text: '성과가 좋으면 특별 인센티브를 받는 것이 당연하다.',
    dimension: 'hidden_n', // 나르시시즘 (숨김)
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_6',
    text: '팀보다 내 공로 인정이 우선일 때가 있다.',
    dimension: 'hidden_n',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_7',
    text: '조용히 일하고 인정받지 못해도 개의치 않는다.',
    dimension: 'hidden_n',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 },
    isReverse: true
  },
  {
    id: 'ig_8',
    text: '내 의견이 무시되면 불합리하게 느껴 바로 표시한다.',
    dimension: 'hidden_n',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_9',
    text: '업무 결과만 좋으면 상대 기분은 덜 중요할 때가 있다.',
    dimension: 'hidden_p', // 사이코패시 (숨김)
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_10',
    text: '급박한 상황에서 과감히 위험을 선택하는 편이다.',
    dimension: 'hidden_p',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_11',
    text: '다른 사람 실수로 생긴 손해에 크게 연민을 느끼지 않는다.',
    dimension: 'hidden_p',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 }
  },
  {
    id: 'ig_12',
    text: '결정을 내리기 전 항상 결과를 깊이 검토한다.',
    dimension: 'hidden_p',
    category: 'influence_gauge',
    scale: { min: 1, max: 5 },
    isReverse: true
  }
];

// 설문 섹션 정의
export const surveySections: SurveySection[] = [
  {
    id: 'blake_mouton',
    title: '리더십 스타일 진단',
    description: '귀하의 리더십 스타일을 파악하기 위한 질문입니다.',
    questions: blakeMousetonQuestions
  },
  {
    id: 'feedback',
    title: '피드백 스타일 진단',
    description: '피드백을 주고받는 방식에 대한 질문입니다.',
    questions: feedbackQuestions
  },
  {
    id: 'lmx',
    title: '리더-구성원 관계 진단',
    description: '리더와 구성원 간의 관계 품질을 평가하는 질문입니다.',
    questions: lmxQuestions
  },
  {
    id: 'influence_gauge',
    title: 'Influence Gauge',
    description: '영향력 패턴을 분석하기 위한 질문입니다.',
    questions: influenceGaugeQuestions
  }
];

// 전체 질문 개수
export const TOTAL_QUESTIONS = surveySections.reduce(
  (sum, section) => sum + section.questions.length,
  0
); // 43문항

// 척도 레이블
export const scaleLabels = {
  sevenPoint: {
    1: '전혀 그렇지 않다',
    2: '낮음',
    3: '낮음',
    4: '보통',
    5: '보통',
    6: '높음',
    7: '매우 그렇다'
  },
  fivePoint: {
    1: '전혀 아니다',
    2: '아니다',
    3: '보통이다',
    4: '그렇다',
    5: '매우 그렇다'
  }
};