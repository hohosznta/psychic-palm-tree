"use client";

import { ChevronRight, RefreshCw, Check } from "lucide-react";

interface HeaderProps {
  currentStep: number;
  onReset: () => void;
}

export default function Header({ currentStep, onReset }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-10 shrink-0">
      <div className="flex items-center gap-6">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Current Process
        </span>
        <div className="flex items-center gap-4">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep > 1
                  ? "bg-[#F97316] text-white"
                  : currentStep === 1
                  ? "bg-[#F97316] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep >= 1 ? "text-slate-900" : "text-slate-400"
              }`}
            >
              Coaching
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-200" />

          {/* Step 2 */}
          <div
            className={`flex items-center gap-2 ${
              currentStep < 2 ? "opacity-30" : ""
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep > 2
                  ? "bg-[#F97316] text-white"
                  : currentStep === 2
                  ? "bg-[#F97316] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep >= 2 ? "text-slate-900" : "text-slate-400"
              }`}
            >
              Vision
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-200" />

          {/* Step 3 */}
          <div
            className={`flex items-center gap-2 ${
              currentStep < 4 ? "opacity-30" : ""
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep > 4
                  ? "bg-[#F97316] text-white"
                  : currentStep === 4
                  ? "bg-[#F97316] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep > 4 ? <Check className="w-3 h-3" /> : "3"}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep >= 4 ? "text-slate-900" : "text-slate-400"
              }`}
            >
              Outcome
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-200" />

          {/* Step 4 */}
          <div
            className={`flex items-center gap-2 ${
              currentStep < 5 ? "opacity-30" : ""
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 5
                  ? "bg-[#F97316] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {currentStep === 5 ? <Check className="w-3 h-3" /> : "4"}
            </div>
            <span
              className={`text-xs font-bold ${
                currentStep === 5 ? "text-slate-900" : "text-slate-400"
              }`}
            >
              Weekly
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-[#F97316] uppercase tracking-widest transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Reset System
      </button>
    </header>
  );
}
