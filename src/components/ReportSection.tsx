"use client";

import {
  Zap,
  Trophy,
  Target,
  CheckCircle2,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  Rocket,
  ArrowRightLeft,
  Minus,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FutureVision, OKRData } from "@/types";

interface ReportSectionProps {
  futureVision: FutureVision;
  okrData: OKRData;
  onGoToWeeklyPlan?: () => void;
}

interface ParsedVision {
  sixMonths: { work: string; growth: string; relationships: string };
  oneYear: { career: string; expertise: string; lifestyle: string };
  threeYears: { achievement: string; influence: string; life: string };
  exchange: { giveUp: string; invest: string; habits: string };
}

export default function ReportSection({
  futureVision,
  okrData,
  onGoToWeeklyPlan,
}: ReportSectionProps) {
  // Parse the vision text into structured sections
  const parseVision = (visionText: string): ParsedVision => {
    const defaultVision: ParsedVision = {
      sixMonths: { work: "", growth: "", relationships: "" },
      oneYear: { career: "", expertise: "", lifestyle: "" },
      threeYears: { achievement: "", influence: "", life: "" },
      exchange: { giveUp: "", invest: "", habits: "" },
    };

    if (!visionText) return defaultVision;

    const sections = visionText.split(/##\s+/);

    sections.forEach((section) => {
      const lines = section.trim().split("\n").filter(l => l.trim());

      if (section.includes("6개월")) {
        const bullets = lines.filter(l => l.startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
        defaultVision.sixMonths = {
          work: bullets[0] || extractBullet(section, "업무") || "목표 달성을 위한 기반 구축",
          growth: bullets[1] || extractBullet(section, "개인") || "핵심 역량 개발 시작",
          relationships: bullets[2] || extractBullet(section, "관계") || "협업 네트워크 확장",
        };
      } else if (section.includes("1년")) {
        const bullets = lines.filter(l => l.startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
        defaultVision.oneYear = {
          career: bullets[0] || extractBullet(section, "커리어") || "전문가로서의 입지 확립",
          expertise: bullets[1] || extractBullet(section, "전문") || "심화 전문성 확보",
          lifestyle: bullets[2] || extractBullet(section, "라이프") || "균형 잡힌 일상 실현",
        };
      } else if (section.includes("3년")) {
        const bullets = lines.filter(l => l.startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
        defaultVision.threeYears = {
          achievement: bullets[0] || extractBullet(section, "성취") || "업계 리더로 성장",
          influence: bullets[1] || extractBullet(section, "영향") || "조직 내 핵심 인재로 인정",
          life: bullets[2] || extractBullet(section, "삶") || "이상적인 삶의 실현",
        };
      } else if (section.includes("교환") || section.includes("Exchange")) {
        const bullets = lines.filter(l => l.startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
        defaultVision.exchange = {
          giveUp: bullets[0] || extractBullet(section, "포기") || "비효율적인 습관과 시간 낭비",
          invest: bullets[1] || extractBullet(section, "투자") || "학습과 네트워킹에 시간 투자",
          habits: bullets[2] || extractBullet(section, "습관") || "꾸준한 자기 개발 루틴",
        };
      }
    });

    return defaultVision;
  };

  const extractBullet = (text: string, keyword: string): string => {
    const lines = text.split("\n");
    for (const line of lines) {
      if (line.includes(keyword)) {
        return line.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim();
      }
    }
    return "";
  };

  // Parse action plan to extract tasks
  const parseActionTasks = (actionPlan: string | undefined) => {
    if (!actionPlan) {
      return [
        "핵심 데이터 수집 포인트 식별 및 정제 프로세스 수립",
        "주요 병목 구간 시뮬레이션 모델링 및 가설 검증",
        "전문가 그룹 거버넌스 및 기술 스택 최종 확정",
      ];
    }

    const tasks: string[] = [];
    const lines = actionPlan.split("\n");
    for (const line of lines) {
      const match = line.match(/\*\*Task\s*\d+[:\*]*\*?\*?\s*(.+)/i);
      if (match) {
        tasks.push(match[1].trim());
      }
    }

    return tasks.length > 0
      ? tasks.slice(0, 3)
      : [
          "핵심 데이터 수집 포인트 식별 및 정제 프로세스 수립",
          "주요 병목 구간 시뮬레이션 모델링 및 가설 검증",
          "전문가 그룹 거버넌스 및 기술 스택 최종 확정",
        ];
  };

  const parsedVision = parseVision(futureVision.vision);
  const actionTasks = parseActionTasks(futureVision.actionPlan);

  return (
    <section className="space-y-10 animate-fade-in animate-slide-up pb-20">
      {/* Header */}
      <div className="flex items-end justify-between border-b-2 border-slate-900 pb-8">
        <div>
          <span className="text-[10px] font-black text-[#F97316] uppercase tracking-[0.4em]">
            Strategic Success
          </span>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none mt-2">
            Vision Outcome
          </h2>
        </div>
        <button className="px-6 py-3 bg-[#F97316] text-white rounded-xl font-black text-xs flex items-center gap-2 hover:bg-[#EA580C] shadow-lg shadow-orange-500/30">
          <Zap className="w-4 h-4" /> DOWNLOAD PDF
        </button>
      </div>

      {/* Persona Card */}
      <div className="p-10 rounded-[2.5rem] border-2 border-slate-900 bg-orange-50 flex items-start gap-8 shadow-[10px_10px_0_0_#0F172A]">
        <div className="w-20 h-20 bg-white border-2 border-slate-900 rounded-3xl flex items-center justify-center shrink-0">
          <Trophy className="w-10 h-10 text-orange-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black italic uppercase tracking-tighter">
              {futureVision.persona.name.split(" ")[0]}
            </span>
            <span className="px-2 py-0.5 bg-[#0F172A] text-white rounded text-[8px] font-black uppercase">
              Core Profile
            </span>
          </div>
          <p className="text-lg font-bold text-orange-900 opacity-80 mb-4">
            {futureVision.persona.description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/50 rounded-xl border border-orange-100">
              <p className="text-[9px] font-black text-orange-400 uppercase mb-1">
                Traits
              </p>
              <p className="text-sm font-bold">
                {futureVision.persona.traits.slice(0, 2).join(", ")}
              </p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl border border-orange-100">
              <p className="text-[9px] font-black text-orange-400 uppercase mb-1">
                Focus
              </p>
              <p className="text-sm font-bold">
                {futureVision.persona.visionFocus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OKR Card */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-[#F97316]" />
          <h3 className="text-xl font-black italic uppercase tracking-tighter">
            Active OKR
          </h3>
        </div>
        <div className="p-5 bg-slate-950 text-white rounded-2xl mb-4">
          <p className="text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">
            Objective
          </p>
          <p className="font-bold text-lg">
            {okrData.objective || "AI Smart Factory Optimization"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {okrData.keyResults.slice(0, 3).map((kr, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm font-bold text-slate-600">{kr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Future Vision Timeline */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#F97316]" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">
            Future Timeline
          </h3>
        </div>

        {/* Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 6 Months */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-12 h-12 bg-blue-200/50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="mb-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                6 Months
              </span>
              <h4 className="text-xl font-black italic tracking-tight mt-1">
                단기 목표
              </h4>
            </div>
            <div className="space-y-3">
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">업무 성과</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.sixMonths.work}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">개인 성장</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.sixMonths.growth}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">주변 관계</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.sixMonths.relationships}</p>
              </div>
            </div>
          </div>

          {/* 1 Year */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-12 h-12 bg-purple-200/50 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
            <div className="mb-4">
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                1 Year
              </span>
              <h4 className="text-xl font-black italic tracking-tight mt-1">
                중기 목표
              </h4>
            </div>
            <div className="space-y-3">
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-purple-400 uppercase mb-1">커리어 발전</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.oneYear.career}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-purple-400 uppercase mb-1">전문성 향상</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.oneYear.expertise}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-purple-400 uppercase mb-1">라이프스타일</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.oneYear.lifestyle}</p>
              </div>
            </div>
          </div>

          {/* 3 Years */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-200/50 rounded-full flex items-center justify-center">
              <Rocket className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="mb-4">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                3 Years
              </span>
              <h4 className="text-xl font-black italic tracking-tight mt-1">
                장기 비전
              </h4>
            </div>
            <div className="space-y-3">
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">장기적 성취</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.threeYears.achievement}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">영향력과 위치</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.threeYears.influence}</p>
              </div>
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">삶의 변화</p>
                <p className="text-sm font-bold text-slate-700">{parsedVision.threeYears.life}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Section */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
        <div className="flex items-center gap-3 mb-6">
          <ArrowRightLeft className="w-6 h-6 text-[#F97316]" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">
            Strategic Exchange
          </h3>
        </div>
        <p className="text-slate-400 font-medium mb-6">
          목표 달성을 위해 필요한 전략적 교환
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Minus className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                포기할 것
              </span>
            </div>
            <p className="text-sm font-bold text-slate-300">{parsedVision.exchange.giveUp}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs font-black text-green-400 uppercase tracking-wider">
                투자할 것
              </span>
            </div>
            <p className="text-sm font-bold text-slate-300">{parsedVision.exchange.invest}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                새로운 습관
              </span>
            </div>
            <p className="text-sm font-bold text-slate-300">{parsedVision.exchange.habits}</p>
          </div>
        </div>
      </div>

      {/* Immediate Action Plan */}
      <div className="bg-[#0F172A] p-10 rounded-[3rem] text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <TrendingUp className="w-32 h-32" />
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
          <Activity className="text-[#F97316]" /> Immediate Action
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {actionTasks.map((task, index) => (
            <div
              key={index}
              className="p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              <span className="text-[10px] font-black text-[#F97316] block mb-2 tracking-widest uppercase italic">
                Task {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-sm font-bold text-slate-300">{task}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Go to Weekly Plan Button */}
      {onGoToWeeklyPlan && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onGoToWeeklyPlan}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all"
          >
            <Calendar className="w-6 h-6" />
            이번 주 업무 계획 보기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
}
