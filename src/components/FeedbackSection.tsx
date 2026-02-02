"use client";

import { useState } from "react";
import {
  Star,
  Send,
  CheckCircle2,
  MessageSquare,
  Heart,
  Sparkles,
} from "lucide-react";
import { OKRData, Persona } from "@/types";

interface FeedbackSectionProps {
  okrData: OKRData | null;
  persona: Persona | null;
  onComplete: () => void;
}

export default function FeedbackSection({
  okrData,
  persona,
  onComplete,
}: FeedbackSectionProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          okrData,
          persona,
        }),
      });

      if (!response.ok) {
        throw new Error("피드백 저장에 실패했습니다.");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="space-y-8 animate-fade-in animate-slide-up pb-20">
        {/* Header */}
        <div className="flex items-end justify-between border-b-2 border-slate-900 pb-8">
          <div>
            <span className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.4em]">
              Thank You
            </span>
            <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none mt-2">
              피드백 완료
            </h2>
          </div>
        </div>

        {/* Success Message */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3">
            감사합니다!
          </h3>
          <p className="text-slate-600 text-center max-w-md mb-8">
            소중한 피드백이 성공적으로 저장되었습니다.
            <br />
            여러분의 의견은 서비스 개선에 큰 도움이 됩니다.
          </p>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${
                  star <= rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={onComplete}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              처음으로 돌아가기
            </div>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in animate-slide-up pb-20">
      {/* Header */}
      <div className="flex items-end justify-between border-b-2 border-slate-900 pb-8">
        <div>
          <span className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.4em]">
            Your Opinion Matters
          </span>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none mt-2">
            서비스 피드백
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            INTERX OKR 코칭 서비스를 이용해주셔서 감사합니다
          </p>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Rating */}
        <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                서비스 만족도
              </h3>
              <p className="text-sm text-slate-500">
                전체적인 경험은 어떠셨나요?
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-2 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="text-center mt-4">
            <span className="text-sm font-bold text-slate-500">
              {rating === 0
                ? "별점을 선택해주세요"
                : rating === 1
                ? "아쉬워요"
                : rating === 2
                ? "보통이에요"
                : rating === 3
                ? "괜찮아요"
                : rating === 4
                ? "좋아요!"
                : "최고예요!"}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                추가 의견 (선택)
              </h3>
              <p className="text-sm text-slate-500">
                개선 사항이나 좋았던 점을 알려주세요
              </p>
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="서비스를 이용하시면서 느낀 점을 자유롭게 작성해주세요..."
            className="w-full h-40 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 resize-none font-medium"
          />
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-bold text-orange-600">
              오늘의 여정 요약
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 p-4 rounded-xl">
              <p className="text-xs text-orange-500 font-bold mb-1">목표</p>
              <p className="text-sm text-slate-700 font-medium truncate">
                {okrData?.objective || "목표 미설정"}
              </p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <p className="text-xs text-orange-500 font-bold mb-1">페르소나</p>
              <p className="text-sm text-slate-700 font-medium truncate">
                {persona?.name || "미분류"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                피드백 제출하기
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
