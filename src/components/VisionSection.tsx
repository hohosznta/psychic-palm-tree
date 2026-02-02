"use client";

import { useState } from "react";
import {
  Sparkles,
  Activity,
  Briefcase,
  User,
  Users,
  BookOpen,
  Heart,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { VisionData, LIFE_CHECKLIST } from "@/types";

interface VisionSectionProps {
  visionData: VisionData;
  onVisionChange: (
    category: keyof VisionData,
    field: string,
    value: string
  ) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const CATEGORY_ICONS = {
  career: Briefcase,
  personal: User,
  relationships: Users,
  learning: BookOpen,
  values: Heart,
};

const CATEGORIES = ["career", "personal", "relationships", "learning", "values"] as const;

export default function VisionSection({
  visionData,
  onVisionChange,
  onSubmit,
  isLoading,
}: VisionSectionProps) {
  const [currentCategory, setCurrentCategory] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const currentCategoryKey = CATEGORIES[currentCategory];
  const categoryData = LIFE_CHECKLIST[currentCategoryKey];
  const IconComponent = CATEGORY_ICONS[currentCategoryKey];

  const goNext = () => {
    if (currentCategory < CATEGORIES.length - 1) {
      setCurrentCategory(currentCategory + 1);
    }
  };

  const goPrev = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  const isLastCategory = currentCategory === CATEGORIES.length - 1;

  // Check if at least one field per category is filled
  const hasMinimumData = () => {
    return CATEGORIES.every((cat) => {
      const catData = visionData[cat];
      return Object.values(catData).some((val) => val.trim() !== "");
    });
  };

  return (
    <section className="max-w-2xl mx-auto animate-fade-in animate-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-[#F97316] mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          Life Checklist
        </h2>
        <p className="text-slate-400 font-bold text-sm mt-2">
          목표 달성 후의 당신의 삶을 구체화합니다.
        </p>
      </div>

      {/* Category Progress */}
      <div className="flex justify-center gap-2 mb-8">
        {CATEGORIES.map((cat, index) => {
          const CatIcon = CATEGORY_ICONS[cat];
          const isActive = index === currentCategory;
          const isPast = index < currentCategory;
          return (
            <button
              key={cat}
              onClick={() => setCurrentCategory(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#F97316] text-white"
                  : isPast
                  ? "bg-slate-200 text-slate-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <CatIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{LIFE_CHECKLIST[cat].label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Category Card */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-[#F97316]" />
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight">
                {categoryData.label}
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                {currentCategory + 1} / {CATEGORIES.length}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {categoryData.questions.map((q, index) => (
              <div key={q.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#F97316] rounded-full"></div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Q{index + 1}
                  </label>
                </div>
                <p className="text-sm font-bold text-slate-700">{q.question}</p>
                <textarea
                  value={
                    visionData[currentCategoryKey][
                      q.key as keyof (typeof visionData)[typeof currentCategoryKey]
                    ] || ""
                  }
                  onChange={(e) =>
                    onVisionChange(currentCategoryKey, q.key, e.target.value)
                  }
                  placeholder={q.placeholder}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#F97316] font-medium text-sm h-20 resize-none transition-colors"
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentCategory === 0}
            className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" /> 이전
          </button>

          {!isLastCategory ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 py-4 bg-[#0F172A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
            >
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !hasMinimumData()}
              className="flex-1 py-4 bg-[#F97316] text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#EA580C] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              Analyze & Outcome <Activity className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Skip to Submit */}
        {!isLastCategory && hasMinimumData() && (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-slate-400 font-bold text-sm hover:text-[#F97316] transition-colors"
          >
            건너뛰고 바로 분석하기 →
          </button>
        )}
      </form>
    </section>
  );
}
