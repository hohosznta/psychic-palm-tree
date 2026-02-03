import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build conversation context
    const historyContext = conversationHistory
      .map((msg: { role: string; content: string }) =>
        `${msg.role === "user" ? "사용자" : "코치"}: ${msg.content}`
      )
      .join("\n");

    const prompt = `다음 대화 내용을 분석하여 OKR을 정형화된 형식으로 추출해주세요.

### 대화 내용:
${historyContext}

### 추출 규칙:
1. Objective는 1개만 추출하세요. 영감을 주고 야심찬 문장으로 작성하세요.
2. Key Results는 정확히 3개를 추출하세요. 각각 측정 가능한 지표를 포함해야 합니다.
3. 대화에서 명확히 언급되지 않은 부분은 맥락에 맞게 구체화하세요.

### 반드시 다음 JSON 형식으로만 응답해주세요:
{
  "objective": "목표 문장",
  "keyResults": [
    "핵심 결과 1 (측정 가능한 지표 포함)",
    "핵심 결과 2 (측정 가능한 지표 포함)",
    "핵심 결과 3 (측정 가능한 지표 포함)"
  ],
  "summary": "이 OKR에 대한 간단한 설명 (1-2문장)"
}

다른 설명 없이 JSON만 반환하세요.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let parsedResult;
    try {
      let jsonText = responseText;
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.split("```")[1];
        if (jsonText.startsWith("json")) {
          jsonText = jsonText.slice(4);
        }
      }
      parsedResult = JSON.parse(jsonText.trim());
    } catch {
      // Fallback
      parsedResult = {
        objective: "목표를 다시 정리해주세요",
        keyResults: [
          "핵심 결과 1을 구체화해주세요",
          "핵심 결과 2를 구체화해주세요",
          "핵심 결과 3을 구체화해주세요"
        ],
        summary: "대화 내용에서 OKR을 추출하지 못했습니다."
      };
    }

    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    console.error("Extract OKR API Error:", error);

    // Check for 429 rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate")) {
      return NextResponse.json(
        { error: "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.", isRateLimit: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to extract OKR" },
      { status: 500 }
    );
  }
}
