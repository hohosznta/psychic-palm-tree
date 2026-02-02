"use client";

import { useRef, useEffect } from "react";
import { ArrowRight, Sparkles, Target, CheckCircle2, FileText } from "lucide-react";
import { Message, OKRData } from "@/types";

interface CoachingSectionProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onVisionStart: () => void;
  onExtractOKR: () => void;
  isLoading: boolean;
  isExtracting: boolean;
  okrData: OKRData | null;
  okrSummary: string;
  showOKRCard: boolean;
}

export default function CoachingSection({
  messages,
  inputValue,
  onInputChange,
  onSend,
  onVisionStart,
  onExtractOKR,
  isLoading,
  isExtracting,
  okrData,
  okrSummary,
  showOKRCard,
}: CoachingSectionProps) {
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, showOKRCard]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Show extract button after at least 3 turns of conversation
  const canExtractOKR = messages.filter(m => m.role === "user").length >= 2;

  return (
    <section className="flex flex-col h-full animate-fade-in">
      <div className="mb-8">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          Goal Coaching
        </h2>
        <p className="text-slate-400 font-bold text-sm mt-2">
          나만의 확실한 목표를 설정하세요.
        </p>
      </div>

      <div
        ref={chatWindowRef}
        className="flex-1 overflow-y-auto space-y-4 pb-10 scrollbar-hide"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } animate-slide-up`}
          >
            <div
              className={`max-w-[80%] p-5 rounded-2xl shadow-sm ${
                message.role === "ai"
                  ? "bg-white border border-slate-200 rounded-tl-none"
                  : "bg-[#0F172A] text-white rounded-tr-none"
              }`}
            >
              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="max-w-[80%] p-5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* OKR Summary Card */}
        {showOKRCard && okrData && (
          <div className="animate-slide-up space-y-4">
            {/* OKR Card */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[6px_6px_0_0_#0F172A]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#F97316]" />
                <h3 className="font-black text-lg italic uppercase tracking-tight">
                  OKR 모델링 완료
                </h3>
              </div>

              {/* Objective */}
              <div className="bg-slate-950 text-white p-4 rounded-xl mb-4">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Objective
                </p>
                <p className="font-bold text-lg">{okrData.objective}</p>
              </div>

              {/* Key Results */}
              <div className="space-y-2 mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Key Results
                </p>
                {okrData.keyResults.map((kr, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-bold text-slate-700">{kr}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {okrSummary && (
                <p className="text-sm text-slate-500 font-medium border-t border-slate-100 pt-4">
                  {okrSummary}
                </p>
              )}
            </div>

            {/* Vision Start Message & Button */}
            <div className="flex justify-start">
              <div className="max-w-[80%] p-5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm">
                <p className="text-sm font-medium leading-relaxed mb-4">
                  OKR 모델링이 완료되었습니다. 이제 이 성과가 가져올 미래 시나리오를 설계해볼까요?
                </p>
                <button
                  onClick={onVisionStart}
                  className="w-full py-3 bg-[#F97316] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#EA580C] transition-all shadow-lg shadow-orange-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  미래 비전 시뮬레이션 시작
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      {!showOKRCard && (
        <div className="mt-4 space-y-3">
          {/* Extract OKR Button */}
          {canExtractOKR && !isExtracting && (
            <button
              onClick={onExtractOKR}
              disabled={isLoading}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
            >
              <FileText className="w-4 h-4" />
              OKR 정리하기
            </button>
          )}

          {isExtracting && (
            <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-200">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              OKR 분석 중...
            </div>
          )}

          {/* Chat Input */}
          <div className="p-1 bg-white border border-slate-200 rounded-2xl flex items-center shadow-xl ring-4 ring-slate-100/50">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-6 py-4 bg-transparent outline-none font-bold text-slate-700"
              disabled={isLoading || isExtracting}
            />
            <button
              onClick={onSend}
              disabled={isLoading || isExtracting || !inputValue.trim()}
              className="m-1 p-4 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
