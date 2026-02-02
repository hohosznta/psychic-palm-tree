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

다음 내용으로 미래 비전을 작성해주세요:

## 6개월 후 모습
- 업무 성과
- 개인 성장
- 주변 관계

## 1년 후 모습
- 커리어 발전
- 전문성 향상
- 라이프스타일 변화

## 3년 후 모습
- 장기적 성취
- 영향력과 위치
- 삶의 변화

## 달성을 위한 핵심 교환 (Exchange)
- 무엇을 포기하거나 줄여야 하는가
- 무엇에 더 투자해야 하는가
- 어떤 새로운 습관이 필요한가

구체적이고 현실적이면서도 영감을 주는 방식으로 작성해주세요.
사용자의 Life Checklist 응답을 바탕으로 개인화된 내용을 작성해주세요.`;

    const result = await model.generateContent(prompt);
    const visionText = result.response.text();

    // Generate action plan
    const actionPrompt = `앞서 그린 미래 비전을 달성하기 위한 구체적인 실행 계획을 만들어주세요.

**미래 비전:**
${visionText}

**페르소나 특성:** ${persona.name}
- ${persona.traits.join(", ")}

**사용자 목표:**
- 커리어: ${visionData.career?.achievement || visionData.career?.position || "성장"}
- 학습: ${visionData.learning?.expertise || visionData.learning?.newThings || "전문성 향상"}
- 가치: ${visionData.values?.important || "균형 있는 삶"}

다음 형식으로 즉시 실행 가능한 3가지 태스크만 간결하게 제시하세요:

**Task 01:** [구체적 실행 항목]
**Task 02:** [구체적 실행 항목]
**Task 03:** [구체적 실행 항목]

각 태스크는 1-2문장으로 간결하게 작성하세요.`;

    const actionResult = await model.generateContent(actionPrompt);
    const actionPlan = actionResult.response.text();

    return NextResponse.json({
      vision: visionText,
      actionPlan: actionPlan,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generate Vision API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate vision" },
      { status: 500 }
    );
  }
}
