import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { okrData, visionData, userName } = await request.json();

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

    const displayName = userName || "사용자";

    const prompt = `사용자의 OKR과 Life Checklist 응답을 분석하여 이 사람을 한 문장으로 설명해주세요.

**OKR 정보:**
- Objective: ${okrData.objective}
- Key Results: ${okrData.keyResults.join(", ")}

**Life Checklist 응답:**
${visionSummary}

**반드시 다음 JSON 형식으로만 응답해주세요:**
{
    "personaSummary": "${displayName}님은 [OKR과 Life Checklist 내용을 바탕으로 이 사람의 특성, 목표, 가치관을 자연스럽게 한 문장으로 설명]하는 사람입니다."
}

personaSummary 작성 가이드:
- OKR의 목표와 Life Checklist의 가치관을 자연스럽게 연결
- 구체적인 목표와 추구하는 가치를 포함
- 1문장으로 간결하게 작성 (50자 이내)

예시:
- "${displayName}님은 AI 기술을 활용해 업무 효율을 높이고, 팀과 함께 성장하며 일과 삶의 균형을 추구하는 사람입니다."
- "${displayName}님은 데이터 분석 역량을 키워 조직에 기여하고, 꾸준한 학습으로 전문가로 성장하고자 하는 사람입니다."
- "${displayName}님은 혁신적인 제품 개발로 고객 가치를 창출하고, 팀원들과 협력하며 지속적으로 배움을 추구하는 사람입니다."

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
      parsedResult = {
        personaSummary: `${displayName}님은 목표를 향해 꾸준히 성장하며, 균형 잡힌 삶을 추구하는 사람입니다.`,
      };
    }

    return NextResponse.json({
      persona: {
        personaSummary: parsedResult.personaSummary || `${displayName}님은 목표를 향해 꾸준히 성장하는 사람입니다.`,
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
