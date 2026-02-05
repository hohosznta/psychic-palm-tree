import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { calendarEvents, okrData, persona, visionData } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Format calendar events summary
    const calendarSummary = calendarEvents?.events
      ? formatCalendarSummary(calendarEvents)
      : "캘린더 데이터 없음";

    // Format vision data
    const visionSummary = visionData
      ? formatVisionData(visionData)
      : "비전 데이터 없음";

    const prompt = `당신은 생산성 전문가이자 OKR 코치입니다. 사용자의 데이터를 분석하여 이번 주 월요일부터 금요일까지의 일일 업무 계획을 추천해주세요.

## 사용자 OKR
- **Objective:** ${okrData?.objective || "목표 미설정"}
- **Key Results:**
${okrData?.keyResults?.map((kr: string, i: number) => `  ${i + 1}. ${kr}`).join("\n") || "  - 핵심 결과 미설정"}

## 사용자 프로필
${persona?.personaSummary || "목표를 향해 꾸준히 성장하는 사람입니다."}

## 사용자 Life Checklist 요약
${visionSummary}

## 최근 2주간 캘린더 활동 분석
${calendarSummary}

## 요청사항
위 정보를 바탕으로 이번 주 월~금 일일 업무 계획을 작성해주세요.

**반드시 다음 JSON 형식으로만 응답해주세요:**
{
  "weeklyTheme": "이번 주의 전체 테마/목표 (1문장)",
  "monday": {
    "focus": "오늘의 핵심 포커스 (1문장)",
    "tasks": [
      {"time": "09:00", "task": "업무 내용", "category": "OKR/회의/개인개발/루틴"},
      {"time": "10:00", "task": "업무 내용", "category": "카테고리"},
      {"time": "14:00", "task": "업무 내용", "category": "카테고리"}
    ],
    "tip": "오늘의 팁 (1문장)"
  },
  "tuesday": {
    "focus": "오늘의 핵심 포커스",
    "tasks": [
      {"time": "09:00", "task": "업무 내용", "category": "카테고리"}
    ],
    "tip": "오늘의 팁"
  },
  "wednesday": {
    "focus": "오늘의 핵심 포커스",
    "tasks": [
      {"time": "09:00", "task": "업무 내용", "category": "카테고리"}
    ],
    "tip": "오늘의 팁"
  },
  "thursday": {
    "focus": "오늘의 핵심 포커스",
    "tasks": [
      {"time": "09:00", "task": "업무 내용", "category": "카테고리"}
    ],
    "tip": "오늘의 팁"
  },
  "friday": {
    "focus": "오늘의 핵심 포커스",
    "tasks": [
      {"time": "09:00", "task": "업무 내용", "category": "카테고리"}
    ],
    "tip": "오늘의 팁"
  },
  "weeklyInsight": "이번 주 실행 전략에 대한 AI 인사이트 (2-3문장)"
}

각 요일별로 3-5개의 구체적인 업무를 시간대별로 배치해주세요.
사용자의 OKR 달성에 기여하는 업무를 우선 배치하고, 페르소나 특성에 맞는 업무 스타일을 반영해주세요.
캘린더 패턴을 분석하여 사용자의 일정 스타일에 맞게 조정해주세요.

다른 설명 없이 JSON만 반환하세요.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let parsedResult;
    try {
      let jsonText = responseText;
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.split("```")[1];
        if (jsonText.startsWith("json")) {
          jsonText = jsonText.slice(4);
        }
      }
      parsedResult = JSON.parse(jsonText.trim());
    } catch {
      parsedResult = getDefaultWeeklyPlan();
    }

    return NextResponse.json({
      weeklyPlan: parsedResult,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Generate Weekly Plan API Error:", error);

    // Check for 429 rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate")) {
      return NextResponse.json(
        { error: "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.", isRateLimit: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate weekly plan", weeklyPlan: getDefaultWeeklyPlan() },
      { status: 500 }
    );
  }
}

function formatCalendarSummary(calendarData: any): string {
  const { events, categorized, totalEvents } = calendarData;

  if (!events || events.length === 0) {
    return "최근 캘린더 이벤트가 없습니다.";
  }

  const meetingCount = categorized?.meetings?.length || 0;
  const taskCount = categorized?.tasks?.length || 0;
  const personalCount = categorized?.personal?.length || 0;

  let summary = `- 총 ${totalEvents}개의 이벤트
- 회의: ${meetingCount}건
- 업무: ${taskCount}건
- 개인: ${personalCount}건

주요 이벤트:
`;

  // Add top 5 events
  events.slice(0, 5).forEach((event: any) => {
    const date = new Date(event.start).toLocaleDateString("ko-KR");
    summary += `- ${date}: ${event.title}\n`;
  });

  return summary;
}

function formatVisionData(visionData: any): string {
  const parts = [];

  if (visionData.career?.achievement) {
    parts.push(`- 커리어 목표: ${visionData.career.achievement}`);
  }
  if (visionData.learning?.expertise) {
    parts.push(`- 학습 목표: ${visionData.learning.expertise}`);
  }
  if (visionData.personal?.lifestyle) {
    parts.push(`- 라이프스타일: ${visionData.personal.lifestyle}`);
  }
  if (visionData.values?.important) {
    parts.push(`- 핵심 가치: ${visionData.values.important}`);
  }

  return parts.length > 0 ? parts.join("\n") : "비전 데이터 없음";
}

function getDefaultWeeklyPlan() {
  return {
    weeklyTheme: "OKR 달성을 위한 집중 주간",
    monday: {
      focus: "주간 계획 수립 및 우선순위 정리",
      tasks: [
        { time: "09:00", task: "주간 목표 검토 및 우선순위 설정", category: "OKR" },
        { time: "10:00", task: "핵심 업무 착수", category: "OKR" },
        { time: "14:00", task: "팀 미팅 및 협업", category: "회의" },
      ],
      tip: "월요일은 큰 그림을 보며 주간 방향을 설정하세요.",
    },
    tuesday: {
      focus: "핵심 결과 달성을 위한 집중 작업",
      tasks: [
        { time: "09:00", task: "딥워크 - 핵심 프로젝트 집중", category: "OKR" },
        { time: "14:00", task: "진행 상황 점검", category: "OKR" },
      ],
      tip: "오전 시간을 가장 중요한 업무에 투자하세요.",
    },
    wednesday: {
      focus: "중간 점검 및 조정",
      tasks: [
        { time: "09:00", task: "주간 중간 리뷰", category: "OKR" },
        { time: "11:00", task: "학습 및 역량 개발", category: "개인개발" },
      ],
      tip: "수요일은 점검의 날, 필요시 계획을 조정하세요.",
    },
    thursday: {
      focus: "마무리를 위한 가속",
      tasks: [
        { time: "09:00", task: "핵심 결과 달성 작업", category: "OKR" },
        { time: "15:00", task: "협업 및 피드백", category: "회의" },
      ],
      tip: "목요일에 80%를 완료하는 것을 목표로 하세요.",
    },
    friday: {
      focus: "주간 마무리 및 회고",
      tasks: [
        { time: "09:00", task: "미완료 업무 마무리", category: "OKR" },
        { time: "15:00", task: "주간 회고 및 다음 주 준비", category: "루틴" },
      ],
      tip: "금요일 오후는 회고와 다음 주 준비에 투자하세요.",
    },
    weeklyInsight: "OKR 달성을 위해 매일 가장 중요한 업무에 집중하세요.",
  };
}
