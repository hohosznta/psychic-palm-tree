import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { PERSONAS } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { okrData, visionData } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const personaDescriptions = Object.entries(PERSONAS)
      .map(([code, info]) => `${code}: ${info.name} - ${info.description}`)
      .join("\n");

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

    const prompt = `사용자의 OKR과 Life Checklist 응답을 분석하여 가장 적합한 페르소나를 분류해주세요.

**OKR 정보:**
- Objective: ${okrData.objective}
- Key Results: ${okrData.keyResults.join(", ")}

**Life Checklist 응답:**
${visionSummary}

**페르소나 타입:**
${personaDescriptions}

**반드시 다음 JSON 형식으로만 응답해주세요:**
{
    "persona_code": "A/B/C/D/E/F 중 하나",
    "confidence": 0.0-1.0 사이의 숫자,
    "reasoning": "선택한 이유를 2-3문장으로"
}

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
      parsedResult = { persona_code: "F", confidence: 0.7, reasoning: "기본 분류" };
    }

    const personaCode = parsedResult.persona_code || "F";
    const persona = PERSONAS[personaCode] || PERSONAS["F"];

    return NextResponse.json({
      persona: {
        ...persona,
        confidence: parsedResult.confidence,
        reasoning: parsedResult.reasoning,
      },
    });
  } catch (error: unknown) {
    console.error("Classify Persona API Error:", error);

    // Check for 429 rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate")) {
      return NextResponse.json(
        { error: "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.", isRateLimit: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to classify persona" },
      { status: 500 }
    );
  }
}
