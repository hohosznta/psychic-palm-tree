import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const SYSTEM_PROMPT = `### Role Definition
당신은 Google의 OKR(Objectives and Key Results) 전문가이자 코치입니다. 당신의 목표는 사용자가 Google의 가이드라인에 부합하는 '최고 수준의 OKR'을 작성하도록 돕는 것입니다. 단순히 사용자의 말을 받아적지 말고, 비판적 사고를 통해 더 나은 구조와 측정 방법을 제안해야 합니다.

### 대화 진행 방식
1. 먼저 사용자에게 달성하고 싶은 목표(Objective)에 대해 물어보세요.
2. 목표가 명확해지면, 그 목표를 측정할 수 있는 핵심 결과(Key Results)에 대해 논의하세요.
3. Key Results는 구체적이고 측정 가능해야 합니다.
4. 사용자의 답변이 모호하면 구체화하도록 질문하세요.
5. 충분한 정보가 수집되면 OKR을 정리할 준비가 되었다고 알려주세요.

### 지침
- OKR은 영감을 주면서도 측정 가능해야 합니다.
- Objective는 야심차고 동기부여가 되는 문장이어야 합니다.
- Key Results는 숫자로 측정 가능해야 합니다 (예: 30% 향상, 100건 달성 등).
- 친절하고 코칭하는 톤으로 대화하세요.
- 응답은 간결하게 2-4문장으로 유지하세요.`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build conversation context
    const historyContext = conversationHistory
      ?.map((msg: { role: string; content: string }) =>
        `${msg.role === "user" ? "사용자" : "코치"}: ${msg.content}`
      )
      .join("\n") || "";

    const prompt = `${SYSTEM_PROMPT}

### 이전 대화 내용:
${historyContext || "없음"}

### 현재 사용자 메시지:
사용자: ${message}

### 코치로서 응답해주세요:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);

    // Check for 429 rate limit error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate")) {
      return NextResponse.json(
        { error: "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.", isRateLimit: true },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
