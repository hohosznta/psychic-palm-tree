"use client";

export default function AnalysisSection() {
  return (
    <section className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-[#F97316] rounded-full animate-spin mb-6" />
      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
        Intelligence
      </h2>
      <p className="text-slate-400 font-bold mt-2">
        AI가 최적의 성장 경로를 분석 중입니다...
      </p>
    </section>
  );
}
