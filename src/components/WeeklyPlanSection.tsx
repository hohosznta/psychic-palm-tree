"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  Target,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { OKRData, Persona, VisionData } from "@/types";

interface WeeklyPlanSectionProps {
  okrData: OKRData | null;
  persona: Persona | null;
  visionData: VisionData | null;
  onGoToFeedback?: () => void;
}

interface Task {
  time: string;
  task: string;
  category: string;
}

interface DayPlan {
  focus: string;
  tasks: Task[];
  tip: string;
}

interface WeeklyPlan {
  weeklyTheme: string;
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  weeklyInsight: string;
}

const dayNames = {
  monday: "월요일",
  tuesday: "화요일",
  wednesday: "수요일",
  thursday: "목요일",
  friday: "금요일",
};

const dayColors = {
  monday: "from-blue-500 to-blue-600",
  tuesday: "from-emerald-500 to-emerald-600",
  wednesday: "from-amber-500 to-amber-600",
  thursday: "from-purple-500 to-purple-600",
  friday: "from-rose-500 to-rose-600",
};

const categoryColors: Record<string, string> = {
  OKR: "bg-orange-100 text-orange-700 border-orange-300",
  회의: "bg-blue-100 text-blue-700 border-blue-300",
  개인개발: "bg-purple-100 text-purple-700 border-purple-300",
  루틴: "bg-emerald-100 text-emerald-700 border-emerald-300",
  default: "bg-slate-100 text-slate-700 border-slate-300",
};

export default function WeeklyPlanSection({
  okrData,
  persona,
  visionData,
  onGoToFeedback,
}: WeeklyPlanSectionProps) {
  const { data: session } = useSession();
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<keyof typeof dayNames>("monday");
  const [calendarStatus, setCalendarStatus] = useState<"loading" | "success" | "error" | "idle">("idle");

  const generateWeeklyPlan = async () => {
    setIsLoading(true);
    setError(null);
    setCalendarStatus("loading");

    try {
      // Fetch calendar events
      let calendarEvents = null;
      try {
        const calendarRes = await fetch("/api/calendar");
        if (calendarRes.ok) {
          calendarEvents = await calendarRes.json();
          setCalendarStatus("success");
        } else {
          setCalendarStatus("error");
        }
      } catch {
        setCalendarStatus("error");
      }

      // Generate weekly plan
      const response = await fetch("/api/generate-weekly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarEvents,
          okrData,
          persona,
          visionData,
        }),
      });

      const data = await response.json();

      // Check for rate limit error
      if (response.status === 429 || data.isRateLimit) {
        throw new Error(data.error || "현재 Gemini API 요청량이 너무 많습니다. 잠시 후에 다시 시도해주세요.");
      }

      if (!response.ok) {
        throw new Error("주간 계획 생성에 실패했습니다.");
      }

      setWeeklyPlan(data.weeklyPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      generateWeeklyPlan();
    }
  }, [session?.accessToken]);

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || categoryColors.default;
  };

  const currentDayPlan = weeklyPlan?.[selectedDay];

  return (
    <section className="space-y-8 animate-fade-in animate-slide-up pb-20">
      {/* Header */}
      <div className="flex items-end justify-between border-b-2 border-slate-900 pb-8">
        <div>
          <span className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.4em]">
            Weekly Schedule
          </span>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none mt-2">
            이번 주 업무 계획
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            AI가 캘린더, OKR, 페르소나를 분석하여 추천하는 주간 업무 계획
          </p>
        </div>
        <button
          onClick={generateWeeklyPlan}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          {calendarStatus === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : calendarStatus === "error" ? (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <Clock className="w-5 h-5 text-slate-400" />
          )}
          <span className="text-slate-700 font-medium">
            {calendarStatus === "success"
              ? "캘린더 연동됨"
              : calendarStatus === "error"
              ? "캘린더 데이터 없음"
              : "캘린더 확인 중..."}
          </span>
        </div>
        {okrData && (
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-5 h-5 text-orange-500" />
            <span className="text-slate-700 font-medium">OKR 반영됨</span>
          </div>
        )}
        {persona && (
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-slate-700 font-medium">{persona.name} 페르소나</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-bold">AI가 주간 계획을 생성하고 있습니다...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-bold">{error}</p>
            <button
              onClick={generateWeeklyPlan}
              className="mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : weeklyPlan ? (
        <div className="space-y-6">
          {/* Weekly Theme */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-black uppercase tracking-wider">
                  이번 주 테마
                </p>
                <p className="text-xl text-slate-900 font-bold mt-1">{weeklyPlan.weeklyTheme}</p>
              </div>
            </div>
          </div>

          {/* Day tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(Object.keys(dayNames) as Array<keyof typeof dayNames>).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedDay === day
                    ? `bg-gradient-to-r ${dayColors[day]} text-white shadow-lg`
                    : "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300"
                }`}
              >
                {dayNames[day]}
              </button>
            ))}
          </div>

          {/* Selected day content */}
          {currentDayPlan && (
            <div className="space-y-4">
              {/* Day focus */}
              <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-orange-500" />
                  <span className="text-xs text-orange-600 font-black uppercase tracking-wider">
                    오늘의 포커스
                  </span>
                </div>
                <p className="text-lg text-slate-900 font-bold">{currentDayPlan.focus}</p>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {currentDayPlan.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-orange-300 transition-all group shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Clock className="w-6 h-6 text-slate-600" />
                        </div>
                        <span className="text-sm text-slate-900 mt-2 font-mono font-bold">
                          {task.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 font-bold text-lg group-hover:text-orange-600 transition-colors">
                          {task.task}
                        </p>
                        <span
                          className={`inline-block mt-3 px-3 py-1 rounded-lg text-xs font-bold border ${getCategoryColor(
                            task.category
                          )}`}
                        >
                          {task.category}
                        </span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Day tip */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs text-purple-600 font-black uppercase tracking-wider">
                      오늘의 팁
                    </span>
                    <p className="text-slate-700 font-medium mt-2">{currentDayPlan.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Insight */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs text-amber-400 font-black uppercase tracking-wider">
                  AI 인사이트
                </span>
                <p className="text-slate-200 font-medium mt-2 text-lg">{weeklyPlan.weeklyInsight}</p>
              </div>
            </div>
          </div>

          {/* Go to Feedback Button */}
          {onGoToFeedback && (
            <div className="flex justify-center pt-6">
              <button
                onClick={onGoToFeedback}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all"
              >
                <MessageSquare className="w-6 h-6" />
                피드백 남기기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">주간 계획을 생성하려면 새로고침을 클릭하세요</p>
          </div>
        </div>
      )}
    </section>
  );
}
