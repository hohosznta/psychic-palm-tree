export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  action?: "vision";
}

export interface OKRData {
  objective: string;
  keyResults: string[];
}

export interface VisionData {
  career: {
    achievement: string;
    position: string;
    skills: string;
  };
  personal: {
    goals: string;
    hobbies: string;
    lifestyle: string;
  };
  relationships: {
    team: string;
    networking: string;
    family: string;
  };
  learning: {
    newThings: string;
    expertise: string;
    certification: string;
  };
  values: {
    important: string;
    workStyle: string;
    purpose: string;
  };
}

export const LIFE_CHECKLIST = {
  career: {
    label: "Career",
    icon: "Briefcase",
    questions: [
      { key: "achievement", question: "현재 직무에서 어떤 성과를 달성하고 싶으신가요?", placeholder: "예: 팀 생산성 30% 향상" },
      { key: "position", question: "3년 후 어떤 포지션에 있고 싶으신가요?", placeholder: "예: 팀 리더 또는 매니저" },
      { key: "skills", question: "어떤 스킬을 개발하고 싶으신가요?", placeholder: "예: AI/ML, 리더십, 프로젝트 관리" },
    ],
  },
  personal: {
    label: "Personal",
    icon: "User",
    questions: [
      { key: "goals", question: "개인적으로 이루고 싶은 목표가 있나요?", placeholder: "예: 책 출간, 부동산 투자" },
      { key: "hobbies", question: "어떤 취미나 관심사를 발전시키고 싶으신가요?", placeholder: "예: 골프, 음악, 요리" },
      { key: "lifestyle", question: "건강이나 라이프스타일 개선 계획이 있나요?", placeholder: "예: 주 3회 운동, 식단 관리" },
    ],
  },
  relationships: {
    label: "Relationships",
    icon: "Users",
    questions: [
      { key: "team", question: "팀이나 동료와의 관계에서 어떤 변화를 원하시나요?", placeholder: "예: 더 나은 협업 문화 구축" },
      { key: "networking", question: "네트워킹이나 멘토링 계획이 있나요?", placeholder: "예: 업계 전문가 네트워크 확장" },
      { key: "family", question: "가족이나 친구와의 시간을 어떻게 관리하고 싶으신가요?", placeholder: "예: 주말은 가족과 함께" },
    ],
  },
  learning: {
    label: "Learning",
    icon: "BookOpen",
    questions: [
      { key: "newThings", question: "배우고 싶은 새로운 것이 있나요?", placeholder: "예: 새로운 프로그래밍 언어, 악기" },
      { key: "expertise", question: "어떤 분야의 전문성을 키우고 싶으신가요?", placeholder: "예: 데이터 분석, UX 디자인" },
      { key: "certification", question: "자격증이나 학위 취득 계획이 있나요?", placeholder: "예: PMP, MBA, AWS 자격증" },
    ],
  },
  values: {
    label: "Values",
    icon: "Heart",
    questions: [
      { key: "important", question: "당신에게 가장 중요한 가치는 무엇인가요?", placeholder: "예: 성장, 균형, 영향력" },
      { key: "workStyle", question: "어떤 방식으로 일하고 싶으신가요?", placeholder: "예: 자율적, 협업 중심, 창의적" },
      { key: "purpose", question: "이루고 싶은 더 큰 의미나 목적이 있나요?", placeholder: "예: 사회에 긍정적 영향" },
    ],
  },
} as const;

export interface Persona {
  code: string;
  name: string;
  description: string;
  traits: string[];
  visionFocus: string;
  confidence?: number;
  reasoning?: string;
}

export interface ParsedVision {
  sixMonths: { work: string; growth: string; relationships: string };
  oneYear: { career: string; expertise: string; lifestyle: string };
  threeYears: { achievement: string; influence: string; life: string };
  exchange: { giveUp: string; invest: string; habits: string };
}

export interface FutureVision {
  persona: Persona;
  vision: string;
  parsedVision?: ParsedVision;
  generatedAt: string;
  okrReference: string;
  actionPlan?: string;
  actionTasks?: string[];
}

export interface AppState {
  currentStep: 1 | 2 | 3 | 4;
  messages: Message[];
  okrData: OKRData;
  visionData: VisionData;
  turnCount: number;
  persona: Persona | null;
  futureVision: FutureVision | null;
  isLoading: boolean;
}

export const PERSONAS: Record<string, Persona> = {
  A: {
    code: "A",
    name: "빠른 실행가 (Fast Executor)",
    description: "목표를 빠르게 설정하고 즉시 실행에 옮기는 타입",
    traits: ["행동 지향적", "빠른 의사결정", "결과 중심"],
    visionFocus: "단기 성과와 빠른 성장",
  },
  B: {
    code: "B",
    name: "전략적 계획가 (Strategic Planner)",
    description: "체계적으로 계획하고 단계적으로 실행하는 타입",
    traits: ["분석적", "체계적", "장기 계획"],
    visionFocus: "지속가능한 발전과 안정적 성장",
  },
  C: {
    code: "C",
    name: "창의적 혁신가 (Creative Innovator)",
    description: "새로운 방법을 찾고 혁신을 추구하는 타입",
    traits: ["창의적", "유연한", "실험적"],
    visionFocus: "혁신적 변화와 새로운 가능성",
  },
  D: {
    code: "D",
    name: "관계 중심형 (Relationship Builder)",
    description: "팀워크와 협업을 중요시하는 타입",
    traits: ["협력적", "소통 중심", "팀 지향적"],
    visionFocus: "팀과 함께하는 성장과 영향력",
  },
  E: {
    code: "E",
    name: "균형 추구형 (Balance Seeker)",
    description: "일과 삶의 균형을 중요시하는 타입",
    traits: ["균형 지향", "지속가능성", "웰빙 중심"],
    visionFocus: "건강한 성장과 삶의 질",
  },
  F: {
    code: "F",
    name: "학습 성장형 (Learning Grower)",
    description: "지속적인 학습과 자기계발을 추구하는 타입",
    traits: ["학습 지향적", "성장 마인드셋", "호기심"],
    visionFocus: "전문성 향상과 지식 확장",
  },
};
