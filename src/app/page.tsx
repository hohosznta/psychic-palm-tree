"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AlertCircle, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CoachingSection from "@/components/CoachingSection";
import VisionSection from "@/components/VisionSection";
import AnalysisSection from "@/components/AnalysisSection";
import ReportSection from "@/components/ReportSection";
import WeeklyPlanSection from "@/components/WeeklyPlanSection";
import FeedbackSection from "@/components/FeedbackSection";
import LoginModal from "@/components/LoginModal";
import { Message, OKRData, VisionData, FutureVision, PERSONAS } from "@/types";

export default function Home() {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "ai",
      content:
        "안녕하세요! INTERX OKR 코치입니다. 현재 집중하고 싶은 가장 큰 목표(Objective)가 무엇인가요? 자유롭게 말씀해주시면 함께 구체화해보겠습니다.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [okrData, setOkrData] = useState<OKRData | null>(null);
  const [okrSummary, setOkrSummary] = useState("");
  const [showOKRCard, setShowOKRCard] = useState(false);
  const [visionData, setVisionData] = useState<VisionData>({
    career: { achievement: "", position: "", skills: "" },
    personal: { goals: "", hobbies: "", lifestyle: "" },
    relationships: { team: "", networking: "", family: "" },
    learning: { newThings: "", expertise: "", certification: "" },
    values: { important: "", workStyle: "", purpose: "" },
  });
  const [futureVision, setFutureVision] = useState<FutureVision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-hide error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: updatedMessages,
        }),
      });

      const data = await response.json();

      // Check for rate limit error
      if (response.status === 429 || data.isRateLimit) {
        setErrorMessage(data.error || "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.");
        return;
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: data.message || "죄송합니다, 응답을 생성하지 못했습니다.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  const handleExtractOKR = useCallback(async () => {
    setIsExtracting(true);

    try {
      const response = await fetch("/api/extract-okr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      // Check for rate limit error
      if (response.status === 429 || data.isRateLimit) {
        setErrorMessage(data.error || "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.");
        setIsExtracting(false);
        return;
      }

      setOkrData({
        objective: data.objective,
        keyResults: data.keyResults,
      });
      setOkrSummary(data.summary || "");
      setShowOKRCard(true);
    } catch (error) {
      console.error("OKR extraction error:", error);
      // Fallback
      setOkrData({
        objective: "목표를 다시 정리해주세요",
        keyResults: [
          "핵심 결과 1을 구체화해주세요",
          "핵심 결과 2를 구체화해주세요",
          "핵심 결과 3을 구체화해주세요",
        ],
      });
      setOkrSummary("대화 내용에서 OKR을 추출하지 못했습니다.");
      setShowOKRCard(true);
    } finally {
      setIsExtracting(false);
    }
  }, [messages]);

  const handleVisionStart = () => {
    setCurrentStep(2);
  };

  const handleVisionChange = (
    category: keyof VisionData,
    field: string,
    value: string
  ) => {
    setVisionData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleVisionSubmit = async () => {
    if (!okrData) return;

    setCurrentStep(3);
    setIsLoading(true);

    try {
      // First, classify persona
      const personaResponse = await fetch("/api/classify-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ okrData, visionData }),
      });

      const personaResult = await personaResponse.json();

      // Check for rate limit error
      if (personaResponse.status === 429 || personaResult.isRateLimit) {
        setErrorMessage(personaResult.error || "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.");
        setCurrentStep(2);
        setIsLoading(false);
        return;
      }

      const persona = personaResult.persona || PERSONAS["F"];

      // Then, generate vision
      const visionResponse = await fetch("/api/generate-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ okrData, visionData, persona }),
      });

      const visionResult = await visionResponse.json();

      // Check for rate limit error
      if (visionResponse.status === 429 || visionResult.isRateLimit) {
        setErrorMessage(visionResult.error || "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.");
        setCurrentStep(2);
        setIsLoading(false);
        return;
      }

      setFutureVision({
        persona,
        vision: visionResult.vision,
        parsedVision: visionResult.parsedVision,
        actionPlan: visionResult.actionPlan,
        actionTasks: visionResult.actionTasks,
        generatedAt: visionResult.generatedAt,
        okrReference: okrData.objective,
      });

      // Show report after analysis
      setTimeout(() => {
        setCurrentStep(4);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating vision:", error);
      // Fallback with mock data
      setFutureVision({
        persona: PERSONAS["F"],
        vision: "AI가 생성한 미래 비전이 여기에 표시됩니다.",
        generatedAt: new Date().toISOString(),
        okrReference: okrData.objective,
      });
      setTimeout(() => {
        setCurrentStep(4);
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setMessages([
      {
        id: "initial",
        role: "ai",
        content:
          "안녕하세요! INTERX OKR 코치입니다. 현재 집중하고 싶은 가장 큰 목표(Objective)가 무엇인가요? 자유롭게 말씀해주시면 함께 구체화해보겠습니다.",
      },
    ]);
    setInputValue("");
    setOkrData(null);
    setOkrSummary("");
    setShowOKRCard(false);
    setVisionData({
      career: { achievement: "", position: "", skills: "" },
      personal: { goals: "", hobbies: "", lifestyle: "" },
      relationships: { team: "", networking: "", family: "" },
      learning: { newThings: "", expertise: "", certification: "" },
      values: { important: "", workStyle: "", purpose: "" },
    });
    setFutureVision(null);
    setIsLoading(false);
    setIsExtracting(false);
  };

  const handleNavClick = (step: number) => {
    if (step === 1) {
      handleReset();
    } else if (step === 2 && currentStep >= 2) {
      setCurrentStep(2);
    } else if (step === 4 && currentStep >= 4) {
      setCurrentStep(4);
    } else if (step === 5 && currentStep >= 4) {
      setCurrentStep(5);
    } else if (step === 6 && currentStep >= 5) {
      setCurrentStep(6);
    }
  };

  const handleGoToWeeklyPlan = () => {
    setCurrentStep(5);
  };

  const handleGoToFeedback = () => {
    setCurrentStep(6);
  };

  const handleFeedbackComplete = () => {
    handleReset();
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#F97316] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Show login modal if not authenticated
  if (!session) {
    return <LoginModal />;
  }

  return (
    <div className="flex h-full">
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border border-red-200 rounded-xl shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-bold text-red-700">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      <Sidebar currentStep={currentStep} onNavClick={handleNavClick} userName={session.user?.name || "User"} userImage={session.user?.image} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header currentStep={currentStep} onReset={handleReset} />

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          <div className="max-w-4xl mx-auto h-full">
            {currentStep === 1 && (
              <CoachingSection
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                onVisionStart={handleVisionStart}
                onExtractOKR={handleExtractOKR}
                isLoading={isLoading}
                isExtracting={isExtracting}
                okrData={okrData}
                okrSummary={okrSummary}
                showOKRCard={showOKRCard}
              />
            )}

            {currentStep === 2 && (
              <VisionSection
                visionData={visionData}
                onVisionChange={handleVisionChange}
                onSubmit={handleVisionSubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && <AnalysisSection />}

            {currentStep === 4 && futureVision && okrData && (
              <ReportSection
                futureVision={futureVision}
                okrData={okrData}
                onGoToWeeklyPlan={handleGoToWeeklyPlan}
              />
            )}

            {currentStep === 5 && (
              <WeeklyPlanSection
                okrData={okrData}
                persona={futureVision?.persona || null}
                visionData={visionData}
                onGoToFeedback={handleGoToFeedback}
              />
            )}

            {currentStep === 6 && (
              <FeedbackSection
                okrData={okrData}
                persona={futureVision?.persona || null}
                onComplete={handleFeedbackComplete}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
