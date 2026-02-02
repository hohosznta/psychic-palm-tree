"use client";

import { MessageSquare, Sparkles, LayoutDashboard, User } from "lucide-react";

interface SidebarProps {
  currentStep: number;
  onNavClick: (step: number) => void;
}

export default function Sidebar({ currentStep, onNavClick }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 border-r border-slate-800">
      <div className="p-8">
        <div className="flex items-center gap-1 text-2xl font-black italic tracking-tighter uppercase">
          <span>Inter</span>
          <span className="text-[#F97316]">X</span>
        </div>
        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] mt-1">
          AI PLATFORM
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <div
          onClick={() => onNavClick(1)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
            currentStep === 1
              ? "bg-[#F97316] text-white"
              : "text-slate-400 hover:bg-slate-800"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-bold text-sm">OKR 코칭</span>
        </div>
        <div
          onClick={() => currentStep >= 2 && onNavClick(2)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
            currentStep === 2
              ? "bg-[#F97316] text-white"
              : currentStep > 2
              ? "text-slate-400 hover:bg-slate-800"
              : "text-slate-600 cursor-not-allowed"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-sm">미래 비전</span>
        </div>
        <div
          onClick={() => currentStep >= 4 && onNavClick(4)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
            currentStep === 4
              ? "bg-[#F97316] text-white"
              : "text-slate-600 cursor-not-allowed"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-bold text-sm">최종 리포트</span>
        </div>
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[#F97316]">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-200">Admin_User</p>
            <p className="text-slate-500 font-bold uppercase tracking-tighter text-[9px]">
              Premium Account
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
