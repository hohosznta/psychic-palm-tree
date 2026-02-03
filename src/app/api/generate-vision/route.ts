import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { okrData, visionData, persona } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Format vision data from all categories
    const visionSummary = `
**Career (커리어):**
- 달성하고 싶은 성과: ${visionData.career?.achievement || "미입력"}
- 3년 후 포지션: ${visionData.career?.position || "미입력"}
- 개발하고 싶은 스킬: ${visionData.career?.skills || "미입력"}

**Personal (개인):**
- 개인 목표: ${visionData.personal?.goals || "미입력"}
- 취미/관심사: ${visionData.personal?.hobbies || "미입력"}
- 라이프스타일: ${visionData.personal?.lifestyle || "미입력"}

**Relationships (관계):**
- 팀/동료 관계: ${visionData.relationships?.team || "미입력"}
- 네트워킹/멘토링: ${visionData.relationships?.networking || "미입력"}
- 가족/친구: ${visionData.relationships?.family || "미입력"}

**Learning (학습):**
- 배우고 싶은 것: ${visionData.learning?.newThings || "미입력"}
- 전문성 분야: ${visionData.learning?.expertise || "미입력"}
- 자격증/학위: ${visionData.learning?.certification || "미입력"}

**Values (가치):**
- 중요한 가치: ${visionData.values?.important || "미입력"}
- 원하는 업무 방식: ${visionData.values?.workStyle || "미입력"}
- 더 큰 목적: ${visionData.values?.purpose || "미입력"}`;

    const prompt = `사용자의 OKR 달성 후 미래 모습을 구체적으로 그려주세요.

**OKR 정보:**
- Objective: ${okrData.objective}
- Key Results: ${okrData.keyResults.join(", ")}

**페르소나:** ${persona.name}
- 특성: ${persona.traits.join(", ")}
- 비전 포커스: ${persona.visionFocus}

**Life Checklist 응답:**
${visionSummary}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트나 마크다운 없이 순수 JSON만 출력하세요.

{
  "sixMonths": {
    "work": "6개월 후 업무 성과 (1-2문장)",
    "growth": "6개월 후 개인 성장 (1-2문장)",
    "relationships": "6개월 후 주변 관계 변화 (1-2문장)"
  },
  "oneYear": {
    "career": "1년 후 커리어 발전 (1-2문장)",
    "expertise": "1년 후 전문성 향상 (1-2문장)",
    "lifestyle": "1년 후 라이프스타일 변화 (1-2문장)"
  },
  "threeYears": {
    "achievement": "3년 후 장기적 성취 (1-2문장)",
    "influence": "3년 후 영향력과 위치 (1-2문장)",
    "life": "3년 후 삶의 변화 (1-2문장)"
  },
  "exchange": {
    "giveUp": "무엇을 포기하거나 줄여야 하는가 (1-2문장)",
    "invest": "무엇에 더 투자해야 하는가 (1-2문장)",
    "habits": "어떤 새로운 습관이 필요한가 (1-2문장)"
  }
}

각 항목은 구체적이고 현실적이면서도 영감을 주는 방식으로 작성하세요.
사용자의 Life Checklist 응답을 바탕으로 개인화된 내용을 작성하세요.`;

    const result = await model.generateContent(prompt);
    const visionText = result.response.text();

    // Parse JSON from vision response
    let parsedVision;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = visionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedVision = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse vision JSON:", parseError);
      // Fallback to default structure
      parsedVision = {
        sixMonths: { work: "목표 달성을 위한 기반 구축", growth: "핵심 역량 개발 시작", relationships: "협업 네트워크 확장" },
        oneYear: { career: "전문가로서의 입지 확립", expertise: "심화 전문성 확보", lifestyle: "균형 잡힌 일상 실현" },
        threeYears: { achievement: "업계 리더로 성장", influence: "조직 내 핵심 인재로 인정", life: "이상적인 삶의 실현" },
        exchange: { giveUp: "비효율적인 습관과 시간 낭비", invest: "학습과 네트워킹에 시간 투자", habits: "꾸준한 자기 개발 루틴" },
      };
    }

    // Generate action plan
    const actionPrompt = `미래 비전을 달성하기 위한 즉시 실행 가능한 3가지 태스크를 만들어주세요.

**페르소나 특성:** ${persona.name}
- ${persona.traits.join(", ")}

**사용자 목표:**
- 커리어: ${visionData.career?.achievement || visionData.career?.position || "성장"}
- 학습: ${visionData.learning?.expertise || visionData.learning?.newThings || "전문성 향상"}
- 가치: ${visionData.values?.important || "균형 있는 삶"}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON만 출력하세요.

{
  "tasks": [
    "첫 번째 구체적 실행 항목 (1-2문장)",
    "두 번째 구체적 실행 항목 (1-2문장)",
    "세 번째 구체적 실행 항목 (1-2문장)"
  ]
}`;

    const actionResult = await model.generateContent(actionPrompt);
    const actionPlanText = actionResult.response.text();

    // Parse action plan JSON
    let actionTasks: string[] = [];
    try {
      const actionJsonMatch = actionPlanText.match(/\{[\s\S]*\}/);
      if (actionJsonMatch) {
        const actionParsed = JSON.parse(actionJsonMatch[0]);
        actionTasks = actionParsed.tasks || [];
      }
    } catch (parseError) {
      console.error("Failed to parse action plan JSON:", parseError);
      actionTasks = [
        "핵심 데이터 수집 포인트 식별 및 정제 프로세스 수립",
        "주요 병목 구간 시뮬레이션 모델링 및 가설 검증",
        "전문가 그룹 거버넌스 및 기술 스택 최종 확정",
      ];
    }

    return NextResponse.json({
      vision: visionText,
      parsedVision: parsedVision,
      actionPlan: actionPlanText,
      actionTasks: actionTasks,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Generate Vision API Error:", error);

    // Check for 429 rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate")) {
      return NextResponse.json(
        { error: "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.", isRateLimit: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate vision" },
      { status: 500 }
    );
  }
}
